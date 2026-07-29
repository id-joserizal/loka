'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteArticle(articleId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login terlebih dahulu' }
  }

  // Delete tags first (cascade might handle this, but be explicit)
  await supabase.from('article_tags').delete().eq('article_id', articleId)

  // Delete comments
  await supabase.from('comments').delete().eq('article_id', articleId)

  // Delete claps
  await supabase.from('claps').delete().eq('article_id', articleId)

  // Delete bookmarks
  await supabase.from('bookmarks').delete().eq('article_id', articleId)

  // Delete article (only if owned by user)
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')

  return { success: true }
}

export async function togglePublishArticle(articleId: string, currentStatus: 'draft' | 'published') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login terlebih dahulu' }
  }

  const newStatus = currentStatus === 'published' ? 'draft' : 'published'

  const { error } = await supabase
    .from('articles')
    .update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', articleId)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')

  return { success: true, newStatus }
}
