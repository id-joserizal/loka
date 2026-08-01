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

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: totalArticles },
    { count: publishedArticles },
    { count: draftArticles },
    { count: totalComments },
    { count: totalClaps },
    { count: pendingReports },
    { count: newUsersThisWeek },
    { count: newArticlesThisWeek },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('claps').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', oneWeekAgo),
  ])

  // Try fetching page views stats (fallback gracefully if table page_views does not exist yet)
  let totalPageViews = 0
  let viewsThisWeek = 0
  let topArticles: Array<{
    id: string
    title: string
    slug: string
    views: number
    authorName: string
    coverUrl?: string | null
  }> = []

  try {
    const [{ count: pageViewsCount }, { count: weekViewsCount }] = await Promise.all([
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('visited_at', oneWeekAgo),
    ])
    totalPageViews = pageViewsCount || 0
    viewsThisWeek = weekViewsCount || 0

    // Fetch top 5 articles with most page views
    const { data: viewsData } = await supabase
      .from('page_views')
      .select('article_id')
      .not('article_id', 'is', null)

    if (viewsData && viewsData.length > 0) {
      // Aggregate view counts per article_id
      const countsMap: Record<string, number> = {}
      for (const row of viewsData) {
        if (row.article_id) {
          countsMap[row.article_id] = (countsMap[row.article_id] || 0) + 1
        }
      }

      // Sort article IDs by views count descending
      const sortedArticleIds = Object.keys(countsMap)
        .sort((a, b) => countsMap[b] - countsMap[a])
        .slice(0, 5)

      if (sortedArticleIds.length > 0) {
        const { data: topArticlesData } = await supabase
          .from('articles')
          .select(`
            id,
            title,
            slug,
            cover_image_url,
            profiles:author_id (
              full_name,
              username
            )
          `)
          .in('id', sortedArticleIds)

        if (topArticlesData) {
          topArticles = topArticlesData
            .map((art: any) => {
              const prof = Array.isArray(art.profiles) ? art.profiles[0] : art.profiles
              return {
                id: art.id,
                title: art.title,
                slug: art.slug,
                views: countsMap[art.id] || 0,
                authorName: prof?.full_name || prof?.username || 'Penulis',
                coverUrl: art.cover_image_url || null,
              }
            })
            .sort((a, b) => b.views - a.views)
        }
      }
    }
  } catch (err) {
    console.warn('page_views query failed or table not yet created:', err)
  }

  return {
    totalUsers: totalUsers || 0,
    totalArticles: totalArticles || 0,
    publishedArticles: publishedArticles || 0,
    draftArticles: draftArticles || 0,
    totalComments: totalComments || 0,
    totalClaps: totalClaps || 0,
    pendingReports: pendingReports || 0,
    newUsersThisWeek: newUsersThisWeek || 0,
    newArticlesThisWeek: newArticlesThisWeek || 0,
    totalPageViews,
    viewsThisWeek,
    topArticles,
  }
}

// -------------------------------------------------------------
// 2. MANAJEMEN USER
// -------------------------------------------------------------
export async function getAdminUsers(searchQuery?: string, statusFilter?: string) {
  const { supabase } = await getAdminSupabaseClient()

  // Function to query profiles with fallback for missing columns
  const fetchProfiles = async (withBadge: boolean, withRoleStatus: boolean) => {
    let selectFields = 'id, username, full_name, avatar_url, created_at'
    if (withRoleStatus) selectFields += ', role, status, suspended_at'
    if (withBadge) selectFields += ', badge'

    let q = supabase
      .from('profiles')
      .select(selectFields)
      .order('created_at', { ascending: false })

    if (withRoleStatus && statusFilter && statusFilter !== 'all') {
      q = q.eq('status', statusFilter)
    }

    if (searchQuery && searchQuery.trim() !== '') {
      q = q.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
    }

    return q
  }

  // 1. Try fetching with all fields (badge, role, status)
  let { data: profiles, error } = await fetchProfiles(true, true)

  // 2. If badge column doesn't exist yet, retry without badge
  if (error) {
    console.warn('getAdminUsers: retry without badge column:', error.message)
    ;({ data: profiles, error } = await fetchProfiles(false, true))
  }

  // 3. If role/status columns also don't exist yet, retry minimal profiles query
  if (error) {
    console.warn('getAdminUsers: retry minimal query:', error.message)
    ;({ data: profiles, error } = await fetchProfiles(false, false))
  }

  if (error) {
    console.error('getAdminUsers fatal error:', error)
    throw new Error(`Gagal memuat data pengguna: ${error.message}`)
  }

  const userList = profiles || []

  // Fetch article counts separately to avoid any PostgREST relationship embedding issues
  const userIds = userList.map((u: any) => u.id)
  const countMap: Record<string, number> = {}

  if (userIds.length > 0) {
    const { data: articles } = await supabase
      .from('articles')
      .select('author_id')
      .in('author_id', userIds)

    if (articles) {
      for (const a of articles) {
        if (a.author_id) {
          countMap[a.author_id] = (countMap[a.author_id] || 0) + 1
        }
      }
    }
  }

  return userList.map((user: any) => ({
    id: user.id,
    username: user.username,
    full_name: user.full_name ?? null,
    avatar_url: user.avatar_url ?? null,
    role: user.role ?? 'user',
    status: user.status ?? 'active',
    badge: user.badge ?? (user.role === 'admin' ? 'black' : null),
    created_at: user.created_at,
    articleCount: countMap[user.id] || 0,
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

export async function updateUserBadge(userId: string, badge: 'blue' | 'gold' | 'black' | null) {
  const { supabase } = await getAdminSupabaseClient()

  const { error } = await supabase
    .from('profiles')
    .update({ badge })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update user badge: ${error.message}`)
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
