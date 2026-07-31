import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { ArticleCard } from '@/components/article/article-card'
import { Search, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { BadgeIcon } from '@/components/ui/badge-icon'
import { FollowButton } from '@/components/social/follow-button'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage(props: SearchPageProps) {
  const { q = '' } = await props.searchParams
  const query = q.trim()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentProfile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    currentProfile = data
  }

  let articles: any[] = []
  let matchedProfiles: any[] = []
  let followedUserIds = new Set<string>()

  if (query) {
    // 1. Fetch matching profiles (authors)
    const { data: profileList } = await supabase
      .from('profiles')
      .select('id, username, full_name, bio, avatar_url, badge')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(6)

    matchedProfiles = profileList || []

    // Fetch follow status for current logged-in user
    if (user && matchedProfiles.length > 0) {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .in(
          'following_id',
          matchedProfiles.map((p) => p.id)
        )

      if (follows) {
        follows.forEach((f) => followedUserIds.add(f.following_id))
      }
    }

    // 2. Collect article IDs from multiple sources
    const matchingArticleIds = new Set<string>()

    // Source A: Articles matching title or excerpt
    const { data: titleArticles } = await supabase
      .from('articles')
      .select('id')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)

    titleArticles?.forEach((a) => matchingArticleIds.add(a.id))

    // Source B: Articles by matching authors
    if (matchedProfiles.length > 0) {
      const authorIds = matchedProfiles.map((p) => p.id)
      const { data: authorArticles } = await supabase
        .from('articles')
        .select('id')
        .eq('status', 'published')
        .in('author_id', authorIds)

      authorArticles?.forEach((a) => matchingArticleIds.add(a.id))
    }

    // Source C: Articles matching tag name
    const { data: tags } = await supabase
      .from('tags')
      .select('id')
      .ilike('name', `%${query}%`)

    if (tags && tags.length > 0) {
      const tagIds = tags.map((t) => t.id)
      const { data: articleTags } = await supabase
        .from('article_tags')
        .select('article_id')
        .in('tag_id', tagIds)

      articleTags?.forEach((at) => matchingArticleIds.add(at.article_id))
    }

    // 3. Fetch full details for all matched article IDs
    if (matchingArticleIds.size > 0) {
      const { data: fullArticles } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          cover_image_url,
          reading_time,
          published_at,
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
        .in('id', Array.from(matchingArticleIds))
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      articles = fullArticles || []
    }
  }

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col">
      <Navbar user={user} profile={currentProfile} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        {/* Search Bar Input */}
        <form action="/search" method="GET" className="mb-10">
          <div className="relative">
            <Search className="w-6 h-6 absolute left-4 top-4 text-zinc-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari artikel, tag, atau penulis..."
              className="w-full pl-14 pr-4 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition shadow-sm font-serif"
            />
          </div>
        </form>

        {/* Results Info */}
        <div className="pb-4 border-b border-zinc-200 mb-8 flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold text-zinc-900">
            {query ? `Hasil Pencarian: "${query}"` : 'Pencarian LOKA'}
          </h1>
          <span className="text-xs font-semibold text-zinc-500">
            {matchedProfiles.length > 0 && `${matchedProfiles.length} penulis • `}
            {articles.length} artikel
          </span>
        </div>

        {/* Matched Penulis Section */}
        {matchedProfiles.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-zinc-400" />
              <span>Penulis ({matchedProfiles.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedProfiles.map((p) => {
                const displayName = p.full_name || p.username
                const isOwnProfile = user?.id === p.id
                const isFollowing = followedUserIds.has(p.id)

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition shadow-sm flex items-start justify-between gap-3"
                  >
                    <Link
                      href={`/profile/${p.username}`}
                      className="flex items-start gap-3 flex-1 min-w-0 group"
                    >
                      {p.avatar_url ? (
                        <img
                          src={p.avatar_url}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover border border-zinc-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-base shrink-0">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif font-bold text-zinc-900 text-base group-hover:underline flex items-center gap-1.5 truncate">
                          {displayName}
                          <BadgeIcon badge={p.badge} size="sm" />
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">@{p.username}</p>
                        {p.bio && (
                          <p className="text-xs text-zinc-600 line-clamp-2 mt-1 leading-relaxed">
                            {p.bio}
                          </p>
                        )}
                      </div>
                    </Link>

                    {!isOwnProfile && user && (
                      <div className="shrink-0 pt-1">
                        <FollowButton
                          followingId={p.id}
                          initialIsFollowing={isFollowing}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Results List */}
        <section>
          {matchedProfiles.length > 0 && articles.length > 0 && (
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Artikel ({articles.length})
            </h2>
          )}

          {articles.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {articles.map((art: any) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          ) : matchedProfiles.length === 0 && query ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-base font-serif font-bold text-zinc-900">
                Tidak ada hasil ditemukan
              </p>
              <p className="text-xs text-zinc-500">
                Coba gunakan kata kunci pencarian yang lain.
              </p>
            </div>
          ) : !query ? (
            <div className="text-center py-16 text-xs text-zinc-400">
              Ketik kata kunci di atas untuk mencari artikel, penulis, atau topik.
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}
