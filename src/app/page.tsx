import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { ArticleCard } from '@/components/article/article-card'
import { TrendingBar } from '@/components/article/trending-bar'
import { ArrowRight, PenTool, Sparkles, Compass, TrendingUp, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface HomePageProps {
  searchParams: Promise<{ tab?: string }>
}

async function fetchArticlesWithStats(supabase: any, rawArticles: any[]) {
  if (!rawArticles || rawArticles.length === 0) return []

  const articleIds = rawArticles.map((a) => a.id)

  // Fetch votes (upvote = +1, downvote = -1)
  const { data: votesData } = await supabase
    .from('votes')
    .select('article_id, vote_type')
    .in('article_id', articleIds)

  const votesMap: Record<string, number> = {}
  votesData?.forEach((v: any) => {
    votesMap[v.article_id] = (votesMap[v.article_id] || 0) + v.vote_type
  })

  // Fetch comments count
  const { data: commentsData } = await supabase
    .from('comments')
    .select('article_id')
    .in('article_id', articleIds)

  const commentsMap: Record<string, number> = {}
  commentsData?.forEach((c: any) => {
    commentsMap[c.article_id] = (commentsMap[c.article_id] || 0) + 1
  })

  // Fetch views count
  let viewsMap: Record<string, number> = {}
  try {
    const { data: viewsData } = await supabase
      .from('page_views')
      .select('article_id')
      .in('article_id', articleIds)

    viewsData?.forEach((v: any) => {
      viewsMap[v.article_id] = (viewsMap[v.article_id] || 0) + 1
    })
  } catch {}

  return rawArticles.map((a) => {
    const netVotes = votesMap[a.id] || 0       // Upvote - Downvote
    const commentCount = commentsMap[a.id] || 0
    const viewCount = viewsMap[a.id] || 0

    // Trending Score = (Upvote - Downvote) + Views + Komentar
    const trendingScore = netVotes + viewCount + commentCount

    return {
      ...a,
      net_votes: netVotes,
      comment_count: commentCount,
      view_count: viewCount,
      trending_score: trendingScore,
    }
  })
}

export default async function HomePage(props: HomePageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {}
  const { tab = 'latest' } = resolvedSearchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // 1. Fetch raw published articles for computing Trending Bar top stories
  const { data: rawAllPublished } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      reading_time,
      published_at,
      created_at,
      status,
      profiles:author_id (
        username,
        full_name,
        avatar_url,
        badge
      ),
      article_tags (
        tags (
          name,
          slug
        )
      )
    `)
    .eq('status', 'published')
    .limit(50)

  const allPublishedWithStats = await fetchArticlesWithStats(supabase, rawAllPublished || [])

  // Sort by trending score for TrendingBar top section
  const trendingBarArticles = [...allPublishedWithStats].sort(
    (a, b) => b.trending_score - a.trending_score
  )

  // 2. Fetch feed articles based on selected tab
  let articles: any[] = []

  if (tab === 'following' && user) {
    const { data: followedIds } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    if (followedIds && followedIds.length > 0) {
      const ids = followedIds.map((f) => f.following_id)
      const { data } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          cover_image_url,
          reading_time,
          published_at,
          created_at,
          status,
          profiles:author_id (
            username,
            full_name,
            avatar_url,
            badge
          ),
          article_tags (
            tags (
              name,
              slug
            )
          )
        `)
        .eq('status', 'published')
        .in('author_id', ids)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(20)

      articles = await fetchArticlesWithStats(supabase, data || [])
    }
  } else if (tab === 'trending') {
    // Return feed articles sorted strictly by dynamic trending algorithm score
    articles = [...allPublishedWithStats].sort((a, b) => b.trending_score - a.trending_score)
  } else {
    // Latest (default)
    const { data } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image_url,
        reading_time,
        published_at,
        created_at,
        status,
        profiles:author_id (
          username,
          full_name,
          avatar_url,
          badge
        ),
        article_tags (
          tags (
            name,
            slug
          )
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(20)

    articles = await fetchArticlesWithStats(supabase, data || [])
  }

  // Fetch popular tags
  const { data: popularTags } = await supabase
    .from('tags')
    .select('name, slug')
    .limit(8)

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFEA] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Navbar user={user} profile={profile} />

      {/* Hero Banner for Guests */}
      {!user && (
        <section className="border-b border-zinc-900 bg-[#FAF9F5] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl space-y-5">
              <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-zinc-900 leading-[1.05]">
                Dunia Untuk Semua Cerita.
              </h1>
              <p className="text-lg sm:text-xl text-zinc-700 font-serif leading-relaxed">
                Tempat bagi penulis independen, pemikir, dan pembaca di Indonesia untuk berbagi pandangan dan gagasan mendalam.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-zinc-900 hover:bg-black text-sm font-medium text-white shadow-sm transition"
                >
                  <span>Mulai Menulis &amp; Membaca</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Feed Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Trending Article Bar at the Top of Home Feed */}
        {trendingBarArticles && trendingBarArticles.length > 0 && (
          <TrendingBar articles={trendingBarArticles} />
        )}

        {/* Topik Populer — visible di mobile & tablet, hidden di lg (tampil di sidebar) */}
        {popularTags && popularTags.length > 0 && (
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">Topik Populer</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
              {popularTags.map((t: any) => (
                <Link
                  key={t.slug}
                  href={`/tag/${t.slug}`}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-800 transition"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left / Main Articles Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Feed Tabs */}
            <div className="flex items-center gap-6 border-b border-zinc-200 pb-3">
              <Link
                href="/?tab=latest"
                className={`text-xs font-bold uppercase tracking-wider pb-3 -mb-3 transition ${
                  tab === 'latest'
                    ? 'border-b-2 border-zinc-900 text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Terbaru
              </Link>
              <Link
                href="/?tab=trending"
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider pb-3 -mb-3 transition ${
                  tab === 'trending'
                    ? 'border-b-2 border-zinc-900 text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </Link>
              {user && (
                <Link
                  href="/?tab=following"
                  className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider pb-3 -mb-3 transition ${
                    tab === 'following'
                      ? 'border-b-2 border-zinc-900 text-zinc-900'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>Mengikuti</span>
                </Link>
              )}
            </div>

            {/* Articles List */}
            {articles && articles.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {articles.map((art: any) => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  {tab === 'following' ? (
                    <>
                      <h3 className="text-lg font-serif font-bold text-zinc-900">Belum ada artikel dari yang kamu ikuti</h3>
                      <p className="text-xs text-zinc-500">Ikuti penulis lain untuk melihat artikel mereka di sini.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-serif font-bold text-zinc-900">Belum ada artikel dipublikasikan</h3>
                      <p className="text-xs text-zinc-500">Jadilah yang pertama menulis cerita di LOKA!</p>
                    </>
                  )}
                </div>
                {user && tab !== 'following' && (
                  <Link
                    href="/write"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Tulis Artikel Pertama</span>
                  </Link>
                )}
                {tab === 'following' && (
                  <Link
                    href="/?tab=latest"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold"
                  >
                    <span>Temukan Penulis di Feed</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Topics / Recommended — only on lg screens */}
          <aside className="hidden lg:block lg:col-span-4 space-y-8 lg:pl-6 lg:border-l lg:border-zinc-200">
            {/* Popular Topics */}
            {popularTags && popularTags.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Topik Populer</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((t: any) => (
                    <Link
                      key={t.slug}
                      href={`/tag/${t.slug}`}
                      className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-800 transition"
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links / Info */}
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <h4 className="text-sm font-serif font-bold text-zinc-900">Menulislah di LOKA</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Bagikan cerita, pemikiran teknis, atau artikel opini kamu kepada pembaca di seluruh Indonesia.
              </p>
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/write"
                    className="inline-block text-xs font-bold text-zinc-900 hover:underline"
                  >
                    Mulai menulis artikel &rarr;
                  </Link>
                  <Link
                    href="/bookmarks"
                    className="inline-block text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline transition"
                  >
                    Lihat bookmark saya &rarr;
                  </Link>
                </div>
              ) : (
                <Link
                  href="/register"
                  className="inline-block text-xs font-bold text-zinc-900 hover:underline"
                >
                  Daftar akun gratis &rarr;
                </Link>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-[#F4EFEA] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-zinc-900 text-sm">LOKA</span>
            <span>&copy; {new Date().getFullYear()} — Dunia Untuk Semua Cerita</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-zinc-900 transition">Tentang</Link>
            <Link href="/" className="hover:text-zinc-900 transition">Syarat &amp; Privasi</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
