import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { BadgeIcon } from '@/components/ui/badge-icon'

export interface ArticleCardProps {
  article: {
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
    article_tags?: Array<{
      tags: {
        name: string
        slug: string
      } | null
    }>
    claps_count?: number
  }
}

export function ArticleCard({ article }: ArticleCardProps) {
  const profileObj = Array.isArray(article.profiles) ? article.profiles[0] : article.profiles
  const authorName = profileObj?.full_name || profileObj?.username || 'Penulis'
  const authorUsername = profileObj?.username || 'user'
  const authorAvatar = profileObj?.avatar_url

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  const tags = article.article_tags
    ? article.article_tags.map((at) => at.tags).filter(Boolean)
    : []

  return (
    <article className="group py-8 border-b border-zinc-200/80 flex flex-col sm:flex-row items-start justify-between gap-6">
      <div className="flex-1 space-y-3">
        {/* Author info */}
        <div className="flex items-center gap-2.5">
          <Link href={`/profile/${authorUsername}`} className="flex items-center gap-2 group/author">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-6 h-6 rounded-full object-cover border border-zinc-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex items-center gap-1 text-xs font-semibold text-zinc-900 group-hover/author:underline">
              {authorName}
              <BadgeIcon badge={profileObj?.badge} size="sm" />
            </span>
          </Link>
          <span className="text-zinc-300">•</span>
          <span className="text-xs text-zinc-500">{formattedDate}</span>
        </div>

        {/* Title & Excerpt */}
        <Link href={`/article/${article.slug}`} className="block space-y-1.5 group/title">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 group-hover/title:text-zinc-700 transition leading-snug">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-sm text-zinc-600 line-clamp-2 font-serif leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </Link>

        {/* Footer meta (tags, reading time, claps) */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 flex-wrap">
            {tags.slice(0, 2).map(
              (tag) =>
                tag && (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-medium hover:bg-zinc-200 transition"
                  >
                    {tag.name}
                  </Link>
                )
            )}
            <span className="text-xs text-zinc-400">
              {article.reading_time || 1} min baca
            </span>
          </div>

          <button
            type="button"
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-zinc-100 transition"
            title="Simpan Bookmark"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Thumbnail Image */}
      {article.cover_image_url && (
        <Link href={`/article/${article.slug}`} className="w-full sm:w-40 sm:h-28 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </Link>
      )}
    </article>
  )
}
