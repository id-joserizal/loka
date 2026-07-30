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

export async function saveArticle(input: SaveArticleInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login terlebih dahulu' }
  }

  const title = input.title.trim() || 'Tanpa Judul'
  const readingTime = calculateReadingTime(input.content)
  const excerpt = input.excerpt || extractExcerpt(input.content)

  let articleId = input.id

  if (articleId) {
    // Get existing article to check published_at and slug
    const { data: existing } = await supabase
      .from('articles')
      .select('published_at, status, slug')
      .eq('id', articleId)
      .single()

    // Determine published_at timestamp
    let publishedAt = existing?.published_at
    if (input.status === 'published' && !publishedAt) {
      publishedAt = new Date().toISOString()
    } else if (input.status === 'draft') {
      publishedAt = null
    }

    // Update slug if it was a draft placeholder or title changed
    let slug = existing?.slug
    if (!slug || slug.startsWith('draft-tanpa-judul') || input.status === 'published') {
      slug = slugify(title)
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title,
        slug,
        content: input.content,
        cover_image_url: input.coverImageUrl,
        excerpt,
        status: input.status,
        reading_time: readingTime,
        published_at: publishedAt,
      })
      .eq('id', articleId)
      .eq('author_id', user.id)

    if (updateError) {
      return { error: updateError.message }
    }
  } else {
    // Create new article
    const slug = slugify(title)

    const { data: newArticle, error: insertError } = await supabase
      .from('articles')
      .insert({
        author_id: user.id,
        title,
        slug,
        content: input.content,
        cover_image_url: input.coverImageUrl,
        excerpt,
        status: input.status,
        reading_time: readingTime,
        published_at: input.status === 'published' ? new Date().toISOString() : null,
      })
      .select('id, slug')
      .single()

    if (insertError) {
      return { error: insertError.message }
    }

    articleId = newArticle.id
  }

  // Handle Tags if provided
  if (input.tags && input.tags.length > 0 && articleId) {
    // Clean old tags for this article
    await supabase.from('article_tags').delete().eq('article_id', articleId)

    for (const tagName of input.tags.slice(0, 5)) {
      const tagSlug = slugify(tagName)

      // Get or create tag
      let { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tagSlug)
        .single()

      if (!existingTag) {
        const { data: createdTag } = await supabase
          .from('tags')
          .insert({ name: tagName.trim(), slug: tagSlug })
          .select('id')
          .single()
        existingTag = createdTag
      }

      if (existingTag) {
        await supabase.from('article_tags').insert({
          article_id: articleId,
          tag_id: existingTag.id,
        })
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  revalidatePath('/')

  return { success: true, articleId }
}
