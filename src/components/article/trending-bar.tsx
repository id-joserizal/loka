import Link from 'next/link'
import { TrendingUp, ArrowBigUp, Flame } from 'lucide-react'
import { BadgeIcon } from '@/components/ui/badge-icon'

export interface TrendingArticleItem {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  cover_image_url?: string | null
  reading_time?: number | null
  published_at?: string | null
  profiles?: {
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
    badge?: string | null
  } | null
  net_votes?: number
  trending_score?: number
}

interface TrendingBarProps {
  articles: TrendingArticleItem[]
}

export function TrendingBar({ articles }: TrendingBarProps) {
  if (!articles || articles.length === 0) return null

  // Take top 6 trending articles
  const topArticles = articles.slice(0, 6)

  return (
    <div className="w-full bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-xs mb-8">
      {/* Header title */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-900 flex items-center gap-2">
              <span>Trending Minggu Ini</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Artikel paling populer berdasarkan interaksi dan perhatian pembaca.
            </p>
          </div>
        </div>

        <Link
          href="/?tab=trending"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-900 hover:text-zinc-600 transition"
        >
          <span>Lihat Semua</span>
          <TrendingUp className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Trending items with ranking numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topArticles.map((art, index) => {
          const rank = (index + 1).toString().padStart(2, '0')
          const profileObj = Array.isArray(art.profiles) ? art.profiles[0] : art.profiles
          const authorName = profileObj?.full_name || profileObj?.username || 'Penulis'
          const authorUsername = profileObj?.username || 'user'
          const authorAvatar = profileObj?.avatar_url

          return (
            <div key={art.id} className="group flex items-start gap-4 p-2 rounded-2xl transition hover:bg-zinc-50/80">
              {/* Rank Badge */}
              <span className="font-serif font-extrabold text-2xl sm:text-3xl text-zinc-300 group-hover:text-zinc-900 transition shrink-0 select-none">
                {rank}
              </span>

              <div className="space-y-2 flex-1 min-w-0">
                {/* Author info */}
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${authorUsername}`} className="flex items-center gap-1.5 group/author shrink-0">
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-zinc-200"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[9px]">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-zinc-900 group-hover/author:underline truncate max-w-[120px]">
                      {authorName}
                    </span>
                    <BadgeIcon badge={profileObj?.badge} size="sm" />
                  </Link>
                </div>

                {/* Article title */}
                <Link href={`/article/${art.slug}`} className="block group/title">
                  <h3 className="font-serif font-bold text-sm text-zinc-900 group-hover/title:text-zinc-700 transition leading-snug line-clamp-2">
                    {art.title}
                  </h3>
                </Link>

                {/* Article meta info */}
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span>{art.reading_time || 1} min baca</span>
                  {art.net_votes !== undefined && art.net_votes !== 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-zinc-700 font-semibold">
                        <ArrowBigUp className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>{art.net_votes > 0 ? `+${art.net_votes}` : art.net_votes}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
