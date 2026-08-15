'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotifications(limit = 20) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { notifications: [], unreadCount: 0 }

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      read,
      created_at,
      article_id,
      comment_id,
      actor:actor_id (
        id,
        username,
        full_name,
        avatar_url,
        badge
      ),
      articles:article_id (
        id,
        title,
        slug
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return { notifications: [], unreadCount: 0 }
  }

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  const normalizedNotifications = (data || []).map((item: any) => ({
    ...item,
    actor: Array.isArray(item.actor) ? item.actor[0] : item.actor,
    articles: Array.isArray(item.articles) ? item.articles[0] : item.articles,
  }))

  return {
    notifications: normalizedNotifications,
    unreadCount: count || 0,
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Harus login' }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/notifications')
  revalidatePath('/')
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Harus login' }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) return { error: error.message }

  revalidatePath('/notifications')
  revalidatePath('/')
  return { success: true }
}
