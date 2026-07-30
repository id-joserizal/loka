'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getAdminSupabaseClient() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized: User not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Admin privilege required')
  }

  return { supabase, adminUser: user }
}

// -------------------------------------------------------------
// 1. STATISTIK DASHBOARD ADMIN
// -------------------------------------------------------------
export async function getAdminStats() {
  const { supabase } = await getAdminSupabaseClient()

  const [
    { count: totalUsers },
    { count: totalArticles },
    { count: publishedArticles },
    { count: draftArticles },
    { count: totalComments },
    { count: totalClaps },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('claps').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    totalUsers: totalUsers || 0,
    totalArticles: totalArticles || 0,
    publishedArticles: publishedArticles || 0,
    draftArticles: draftArticles || 0,
    totalComments: totalComments || 0,
    totalClaps: totalClaps || 0,
    pendingReports: pendingReports || 0,
  }
}

// -------------------------------------------------------------
// 2. MANAJEMEN USER
// -------------------------------------------------------------
export async function getAdminUsers(searchQuery?: string, statusFilter?: string) {
  const { supabase } = await getAdminSupabaseClient()

  let query = supabase
    .from('profiles')
    .select(`
      id,
      username,
      full_name,
      avatar_url,
      role,
      status,
      suspended_at,
      created_at,
      articles (id)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  if (searchQuery && searchQuery.trim() !== '') {
    query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching admin users:', error)
    return []
  }

  return (data || []).map((user: any) => ({
    ...user,
    articleCount: Array.isArray(user.articles) ? user.articles.length : 0,
  }))
}

export async function toggleUserSuspend(userId: string, currentStatus: string) {
  const { supabase } = await getAdminSupabaseClient()

  const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
  const suspendedAt = newStatus === 'suspended' ? new Date().toISOString() : null

  const { error } = await supabase
    .from('profiles')
    .update({
      status: newStatus,
      suspended_at: suspendedAt,
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update user status: ${error.message}`)
  }

  revalidatePath('/admin/users')
  return { success: true, newStatus }
}

export async function updateUserRole(userId: string, newRole: 'user' | 'admin') {
  const { supabase } = await getAdminSupabaseClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`)
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUserByAdmin(userId: string) {
  const { supabase } = await getAdminSupabaseClient()

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`)
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// -------------------------------------------------------------
// 3. MANAJEMEN ARTIKEL
// -------------------------------------------------------------
export async function getAdminArticles(searchQuery?: string, statusFilter?: string) {
  const { supabase } = await getAdminSupabaseClient()

  let query = supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      status,
      created_at,
      published_at,
      reading_time,
      cover_image_url,
      profiles:author_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  if (searchQuery && searchQuery.trim() !== '') {
    query = query.ilike('title', `%${searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching admin articles:', error)
    return []
  }

  return (data || []).map((article: any) => ({
    ...article,
    profiles: Array.isArray(article.profiles)
      ? article.profiles[0] || null
      : article.profiles || null,
  }))
}

export async function unpublishArticleByAdmin(articleId: string) {
  const { supabase } = await getAdminSupabaseClient()

  const { error } = await supabase
    .from('articles')
    .update({ status: 'draft' })
    .eq('id', articleId)

  if (error) {
    throw new Error(`Failed to unpublish article: ${error.message}`)
  }

  revalidatePath('/admin/articles')
  revalidatePath('/')
  return { success: true }
}

export async function deleteArticleByAdmin(articleId: string) {
  const { supabase } = await getAdminSupabaseClient()

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId)

  if (error) {
    throw new Error(`Failed to delete article: ${error.message}`)
  }

  revalidatePath('/admin/articles')
  revalidatePath('/')
  return { success: true }
}

// -------------------------------------------------------------
// 4. ANTRIAN LAPORAN (REPORTS QUEUE)
// -------------------------------------------------------------
export async function getAdminReports(statusFilter?: string) {
  const { supabase } = await getAdminSupabaseClient()

  let query = supabase
    .from('reports')
    .select(`
      id,
      target_type,
      reason,
      details,
      status,
      created_at,
      resolved_at,
      reporter:reporter_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      article:article_id (
        id,
        title,
        slug,
        status,
        author_id
      ),
      comment:comment_id (
        id,
        content,
        user_id
      ),
      reported_user:reported_user_id (
        id,
        username,
        full_name,
        status
      )
    `)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching admin reports:', error)
    return []
  }

  return (data || []).map((report: any) => ({
    ...report,
    reporter: Array.isArray(report.reporter) ? report.reporter[0] || null : report.reporter || null,
    article: Array.isArray(report.article) ? report.article[0] || null : report.article || null,
    comment: Array.isArray(report.comment) ? report.comment[0] || null : report.comment || null,
    reported_user: Array.isArray(report.reported_user)
      ? report.reported_user[0] || null
      : report.reported_user || null,
  }))
}

export async function resolveReport(
  reportId: string,
  actionStatus: 'actioned' | 'dismissed'
) {
  const { supabase, adminUser } = await getAdminSupabaseClient()

  const { error } = await supabase
    .from('reports')
    .update({
      status: actionStatus,
      resolved_at: new Date().toISOString(),
      resolved_by: adminUser.id,
    })
    .eq('id', reportId)

  if (error) {
    throw new Error(`Failed to resolve report: ${error.message}`)
  }

  revalidatePath('/admin/reports')
  return { success: true }
}
