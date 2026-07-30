'use server'

import { createClient } from '@/lib/supabase/server'
import { slugify, calculateReadingTime, extractExcerpt } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export interface SaveArticleInput {
  id?: string
  title: string
  content: any
  coverImageUrl?: string
  excerpt?: string
  status: 'draft' | 'published'
  tags?: string[]
}

// Normalize slug: no random suffix, just clean slug from text
function makeSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'artikel'
}

// Ensure unique slug by appending counter if needed
async function ensureUniqueSlug(
  supabase: any,
  base: string,
  excludeId?: string
): Promise<string> {
  let candidate = base
  let attempt = 0
  while (true) {
    let query = supabase
      .from('articles')
      .select('id')
      .eq('slug', candidate)
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    const { data } = await query.maybeSingle()
    if (!data) return candidate // slug is free
    attempt++
    candidate = `${base}-${attempt}`
  }
}

export async function saveArticle(input: SaveArticleInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login terlebih dahulu' }
  }

  const title = input.title?.trim() || 'Tanpa Judul'
  // Normalize content — never pass null to a NOT NULL JSONB column
  const content = input.content ?? { type: 'doc', content: [] }
  const readingTime = calculateReadingTime(content)
  const excerpt = input.excerpt?.trim() || extractExcerpt(content)

  let articleId = input.id

  if (articleId) {
    // Fetch existing article
    const { data: existing, error: fetchError } = await supabase
      .from('articles')
      .select('id, published_at, status, slug')
      .eq('id', articleId)
      .eq('author_id', user.id)
      .single()

    if (fetchError || !existing) {
      console.error('[saveArticle] Article not found or not owned by user:', fetchError)
      return { error: 'Artikel tidak ditemukan' }
    }

    // Preserve published_at — only set it on first publish
    let publishedAt = existing.published_at
    if (input.status === 'published' && !publishedAt) {
      publishedAt = new Date().toISOString()
    } else if (input.status === 'draft') {
      publishedAt = null
    }

    // Only update slug if it doesn't exist yet, or article was never published
    let slug = existing.slug
    if (!slug || existing.status === 'draft' && input.status === 'published') {
      const baseSlug = makeSlug(title)
      slug = await ensureUniqueSlug(supabase, baseSlug, articleId)
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title,
        slug,
        content,
        cover_image_url: input.coverImageUrl || null,
        excerpt,
        status: input.status,
        reading_time: readingTime,
        published_at: publishedAt,
      })
      .eq('id', articleId)
      .eq('author_id', user.id)

    if (updateError) {
      console.error('[saveArticle] UPDATE error:', updateError)
      return { error: updateError.message }
    }
  } else {
    // Create new article
    const baseSlug = makeSlug(title)
    const slug = await ensureUniqueSlug(supabase, baseSlug)

    const { data: newArticle, error: insertError } = await supabase
      .from('articles')
      .insert({
        author_id: user.id,
        title,
        slug,
        content,
        cover_image_url: input.coverImageUrl || null,
        excerpt,
        status: input.status,
        reading_time: readingTime,
        published_at: input.status === 'published' ? new Date().toISOString() : null,
      })
      .select('id, slug')
      .single()

    if (insertError || !newArticle) {
      console.error('[saveArticle] INSERT error:', insertError)
      return { error: insertError?.message ?? 'Gagal membuat artikel' }
    }

    articleId = newArticle.id
  }

  // Handle Tags — lookup by name (not slug) to avoid random-suffix collisions
  if (input.tags && input.tags.length > 0 && articleId) {
    // Remove old tags for this article
    await supabase.from('article_tags').delete().eq('article_id', articleId)

    for (const rawTagName of input.tags.slice(0, 5)) {
      const tagName = rawTagName.trim()
      if (!tagName) continue
      const tagSlug = makeSlug(tagName)

      // Lookup by name first (stable identifier, unlike random slug)
      let { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', tagName)
        .maybeSingle()

      if (!existingTag) {
        // Create tag — handle potential race condition with upsert
        const { data: createdTag, error: tagError } = await supabase
          .from('tags')
          .upsert({ name: tagName, slug: tagSlug }, { onConflict: 'name', ignoreDuplicates: false })
          .select('id')
          .single()

        if (tagError) {
          console.error('[saveArticle] Tag upsert error:', tagError)
          // Try to look up again in case it was created by a concurrent request
          const { data: retryTag } = await supabase
            .from('tags')
            .select('id')
            .ilike('name', tagName)
            .maybeSingle()
          existingTag = retryTag
        } else {
          existingTag = createdTag
        }
      }

      if (existingTag) {
        const { error: atError } = await supabase.from('article_tags').insert({
          article_id: articleId,
          tag_id: existingTag.id,
        })
        if (atError) {
          console.error('[saveArticle] article_tags insert error:', atError)
        }
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  revalidatePath('/')

  return { success: true, articleId }
}
