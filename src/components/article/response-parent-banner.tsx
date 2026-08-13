import Link from 'next/link'
import { MessageSquareQuote } from 'lucide-react'

export interface ResponseParentBannerProps {
  responseTo: {
    id?: string
    title: string
    slug: string
    profiles?: {
      username?: string | null
      full_name?: string | null
    } | null
    author?: {
      name?: string | null
      username?: string | null
      full_name?: string | null
    } | null
  } | null
  responseToComment?: {
    id: string
    content: string
    author: {
      name?: string | null
      username?: string | null
    }
  } | null
  /** Slug artikel tempat komentar berada (= artikel ini jika yg ditanggapi adalah komentar di artikel ini) */
  responseToCommentArticleSlug?: string | null
}

function truncate(text: string, max = 100): string {
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
}

export function ResponseParentBanner({ responseTo, responseToComment, responseToCommentArticleSlug }: ResponseParentBannerProps) {
  // Mode 1: Menanggapi komentar spesifik
  if (responseToComment) {
    const commentAuthorName = responseToComment.author?.name || responseToComment.author?.username || 'Penulis'
    // Link ke artikel asal + anchor ke komentar
    const commentHref = responseToCommentArticleSlug
      ? `/article/${responseToCommentArticleSlug}#comment-${responseToComment.id}`
      : null

    return (
      <div className="mb-4">
        {commentHref ? (
          <Link
            href={commentHref}
            className="inline-flex items-start gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition group/parent"
          >
            <MessageSquareQuote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-zinc-400" />
            <span>
              <span className="text-zinc-500">Menanggapi komentar dari </span>
              <span className="font-semibold text-zinc-700 group-hover/parent:underline">{commentAuthorName}</span>
              <span className="text-zinc-400">:</span>
              {' '}
              <span className="italic text-zinc-600 group-hover/parent:underline">
                "{truncate(responseToComment.content)}"
              </span>
            </span>
          </Link>
        ) : (
          <div className="inline-flex items-start gap-1.5 text-xs font-medium text-zinc-500">
            <MessageSquareQuote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-zinc-400" />
            <span>
              <span className="text-zinc-500">Menanggapi komentar dari </span>
              <span className="font-semibold text-zinc-700">{commentAuthorName}</span>
              <span className="text-zinc-400">:</span>
              {' '}
              <span className="italic text-zinc-600">"{truncate(responseToComment.content)}"</span>
            </span>
          </div>
        )}
      </div>
    )
  }

  // Mode 2: Menanggapi artikel (existing behavior)
  if (!responseTo || !responseTo.title || !responseTo.slug) return null

  const profileObj = responseTo.profiles || responseTo.author || {}
  const authorName = (profileObj as any).full_name || (profileObj as any).name || (profileObj as any).username || 'Penulis'

  return (
    <div className="mb-4">
      <Link
        href={`/article/${responseTo.slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition group/parent flex-wrap"
      >
        <span className="text-zinc-400 font-serif text-sm">↳</span>
        <span className="text-zinc-500">Menanggapi:</span>
        <span className="font-semibold text-zinc-700 group-hover/parent:underline truncate max-w-sm sm:max-w-md">
          {responseTo.title}
        </span>
        <span className="text-zinc-400">oleh {authorName}</span>
      </Link>
    </div>
  )
}
