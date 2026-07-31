import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { ArticleCard } from '@/components/article/article-card'
import { Search, User as UserIcon, Tag as TagIcon, Flame, Sparkles } from 'lucide-react'
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

  // Fetch popular tags for search suggestions
  const { data: popularTags } = await supabase
    .from('tags')
    .select('id, name, slug')
    .limit(10)

  // Fetch recommended authors for suggestions
  const { data: suggestedAuthors } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, badge, bio')
    .neq('id', user?.id || '')
    .limit(4)

  let articles: any[] = []
  let matchedProfiles: any[] = []
  let matchedTags: any[] = []
  let followedUserIds = new Set<string>()

  if (query) {
    // 1. Clean query & prepare multi-term keywords for maximum sensitivity
    const cleanQuery = query.replace(/^[@#]/, '').trim()
    const rawKeywords = [query, cleanQuery, ...cleanQuery.split(/\s+/)]
    const keywords = Array.from(new Set(rawKeywords))
      .map((k) => k.trim())
      .filter((k) => k.length >= 1)

    // 2. Fetch matching profiles (authors) sensitive to @username and full_name
    const profileMap = new Map<string, any>()
    for (const kw of keywords) {
      const { data: pList } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, badge')
        .or(`username.ilike.%${kw}%,full_name.ilike.%${kw}%`)
        .limit(8)

      if (pList) {
        pList.forEach((p) => profileMap.set(p.id, p))
      }
    }
    matchedProfiles = Array.from(profileMap.values())

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

    // 3. Fetch matching tags
    const tagMap = new Map<string, any>()
    for (const kw of keywords) {
      const { data: tList } = await supabase
        .from('tags')
        .select('id, name, slug')
        .or(`name.ilike.%${kw}%,slug.ilike.%${kw}%`)

      if (tList) {
        tList.forEach((t) => tagMap.set(t.id, t))
      }
    }
    matchedTags = Array.from(tagMap.values())

    // 4. Collect article IDs matching title, content, author, or tags
    const matchingArticleIds = new Set<string>()

    // Source A: Title or excerpt match
    for (const kw of keywords) {
      const { data: titleArticles } = await supabase
        .from('articles')
        .select('id')
        .eq('status', 'published')
        .or(`title.ilike.%${kw}%,excerpt.ilike.%${kw}%`)

      titleArticles?.forEach((a) => matchingArticleIds.add(a.id))
    }

    // Source B: Matched authors
    if (matchedProfiles.length > 0) {
      const authorIds = matchedProfiles.map((p) => p.id)
      const { data: authorArticles } = await supabase
        .from('articles')
        .select('id')
        .eq('status', 'published')
        .in('author_id', authorIds)

      authorArticles?.forEach((a) => matchingArticleIds.add(a.id))
    }

    // Source C: Matched tags
    if (matchedTags.length > 0) {
      const tagIds = matchedTags.map((t) => t.id)
      const { data: articleTags } = await supabase
        .from('article_tags')
        .select('article_id')
        .in('tag_id', tagIds)

      articleTags?.forEach((at) => matchingArticleIds.add(at.article_id))
    }

    // 5. Fetch full article details
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
        <form action="/search" method="GET" className="mb-6">
          <div className="relative">
            <Search className="w-6 h-6 absolute left-4 top-4 text-zinc-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari artikel, @penulis, atau #topik..."
              className="w-full pl-14 pr-12 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition shadow-sm font-serif"
            />
            {query && (
              <Link
                href="/search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-700 bg-zinc-200/60 hover:bg-zinc-200 rounded-full px-2.5 py-1 transition"
              >
                Hapus
              </Link>
            )}
          </div>
        </form>

        {/* Quick Suggestions / Popular Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-zinc-200">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Saran Topik:
          </span>
          {popularTags && popularTags.length > 0 ? (
            popularTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/search?q=${encodeURIComponent(tag.name)}`}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  query.toLowerCase() === tag.name.toLowerCase()
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                #{tag.name}
              </Link>
            ))
          ) : (
            ['teknologi', 'desain', 'kehidupan', 'opini', 'buku', 'bisnis', 'cerita'].map((name) => (
              <Link
                key={name}
                href={`/search?q=${encodeURIComponent(name)}`}
                className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-700 transition"
              >
                #{name}
              </Link>
            ))
          )}
        </div>

        {/* Results Info */}
        {query ? (
          <div className="pb-4 border-b border-zinc-200 mb-8 flex items-center justify-between">
            <h1 className="text-xl font-serif font-bold text-zinc-900">
              Hasil Pencarian: &ldquo;{query}&rdquo;
            </h1>
            <span className="text-xs font-semibold text-zinc-500">
              {matchedProfiles.length > 0 && `${matchedProfiles.length} penulis • `}
              {matchedTags.length > 0 && `${matchedTags.length} topik • `}
              {articles.length} artikel
            </span>
          </div>
        ) : null}

        {/* Matched Tags Section */}
        {matchedTags.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Topik Terkait ({matchedTags.length})</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {matchedTags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tag/${t.slug}`}
                  className="px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 text-xs font-semibold text-zinc-900 transition flex items-center gap-1.5 shadow-sm"
                >
                  <TagIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>#{t.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Matched Penulis Section */}
        {matchedProfiles.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Penulis Terkait ({matchedProfiles.length})</span>
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
          {(matchedProfiles.length > 0 || matchedTags.length > 0) && articles.length > 0 && (
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
              Artikel ({articles.length})
            </h2>
          )}

          {articles.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {articles.map((art: any) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          ) : matchedProfiles.length === 0 && matchedTags.length === 0 && query ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-base font-serif font-bold text-zinc-900">
                Tidak ada hasil untuk &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Coba gunakan kata kunci tanpa simbol (`@` atau `#`), atau pilih topik populer di atas.
              </p>
            </div>
          ) : !query ? (
            <div className="space-y-12 py-4">
              {/* Recommended Penulis when search is empty */}
              {suggestedAuthors && suggestedAuthors.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Rekomendasi Penulis</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suggestedAuthors.map((p) => {
                      const displayName = p.full_name || p.username
                      return (
                        <Link
                          key={p.id}
                          href={`/profile/${p.username}`}
                          className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition shadow-sm flex items-center gap-3 group"
                        >
                          {p.avatar_url ? (
                            <img
                              src={p.avatar_url}
                              alt={displayName}
                              className="w-11 h-11 rounded-full object-cover border border-zinc-200 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-serif font-bold text-zinc-900 text-sm group-hover:underline flex items-center gap-1 truncate">
                              {displayName}
                              <BadgeIcon badge={p.badge} size="sm" />
                            </h3>
                            <p className="text-xs text-zinc-400 truncate">@{p.username}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}
