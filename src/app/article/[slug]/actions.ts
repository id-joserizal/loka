'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleClap(articleId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login untuk memberikan clap' }
  }

  // Check if user already clapped
  const { data: existingClap } = await supabase
    .from('claps')
    .select('id, count')
    .eq('article_id', articleId)
    .eq('user_id', user.id)
    .single()

  if (existingClap) {
    const newCount = Math.min(50, existingClap.count + 1)
    const { error } = await supabase
      .from('claps')
      .update({ count: newCount })
      .eq('id', existingClap.id)

    if (error) return { error: error.message }
    return { success: true, userClapCount: newCount }
  } else {
    const { error } = await supabase.from('claps').insert({
      article_id: articleId,
      user_id: user.id,
      count: 1,
    })

    if (error) return { error: error.message }
    return { success: true, userClapCount: 1 }
  }
}

export async function toggleFollow(followingId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login untuk mengikuti penulis' }
  }

  if (user.id === followingId) {
    return { error: 'Kamu tidak bisa mengikuti diri sendiri' }
  }

  // Check if already following
  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    if (error) return { error: error.message }
    return { isFollowing: false }
  } else {
    const { error } = await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: followingId,
    })

    if (error) return { error: error.message }
    return { isFollowing: true }
  }
}

export async function toggleBookmark(articleId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login untuk menyimpan bookmark' }
  }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('article_id')
    .eq('user_id', user.id)
    .eq('article_id', articleId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId)

    if (error) return { error: error.message }
    return { isBookmarked: false }
  } else {
    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      article_id: articleId,
    })

    if (error) return { error: error.message }
    return { isBookmarked: true }
  }
}

export async function addComment(articleId: string, content: string, parentCommentId?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login untuk menulis komentar' }
  }

  if (!content.trim()) {
    return { error: 'Komentar tidak boleh kosong' }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      user_id: user.id,
      content: content.trim(),
      parent_comment_id: parentCommentId || null,
    })
    .select(`
      id,
      content,
      created_at,
      parent_comment_id,
      user_id,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) return { error: error.message }
  return { success: true, comment: data }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu tidak memiliki akses' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
