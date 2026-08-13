'use client'

import { X, CornerUpRight, MessageSquareQuote } from 'lucide-react'

export interface ParentArticleRef {
  id: string
  title: string
  coverImageUrl?: string | null
  authorName: string
  authorAvatar?: string | null
}

export interface ParentCommentRef {
  id: string
  content: string
  authorName: string
  authorAvatar?: string | null
  /** Judul artikel tempat komentar berada */
  articleTitle: string
}

interface ResponseBannerProps {
  article: ParentArticleRef
  parentComment?: ParentCommentRef | null
  onCancel: () => void
}

/** Truncate comment text to a readable excerpt */
function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
}

export function ResponseBanner({ article, parentComment, onCancel }: ResponseBannerProps) {
  // Tampilan mode tanggapan komentar spesifik
  if (parentComment) {
    return (
      <div className="mb-6 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-200/60 border border-zinc-300/60 transition">
        <div className="flex items-center gap-3 min-w-0">
          {parentComment.authorAvatar ? (
            <img
              src={parentComment.authorAvatar}
              alt={parentComment.authorName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-zinc-200/80"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-300 flex items-center justify-center flex-shrink-0 text-zinc-600 font-bold text-xs">
              {parentComment.authorName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <MessageSquareQuote className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Menanggapi Komentar
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-700 truncate max-w-sm sm:max-w-md leading-snug italic">
              "{truncate(parentComment.content)}"
            </p>
            <p className="text-[10px] text-zinc-500 truncate">
              oleh {parentComment.authorName} · di <span className="font-medium">{parentComment.articleTitle}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-300/60 transition flex-shrink-0"
          title="Batalkan Tanggapan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Tampilan mode tanggapan artikel (mode sebelumnya)
  return (
    <div className="mb-6 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-200/60 border border-zinc-300/60 transition">
      <div className="flex items-center gap-3 min-w-0">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-10 h-10 rounded-md object-cover flex-shrink-0 border border-zinc-200/80"
          />
        ) : article.authorAvatar ? (
          <img
            src={article.authorAvatar}
            alt={article.authorName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-zinc-200/80"
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-zinc-300 flex items-center justify-center flex-shrink-0 text-zinc-600 font-bold text-xs">
            {article.authorName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <CornerUpRight className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Menanggapi
            </span>
          </div>
          <h4 className="text-sm font-semibold text-zinc-900 truncate max-w-sm sm:max-w-md leading-tight">
            {article.title}
          </h4>
          <p className="text-xs text-zinc-500 truncate">
            oleh {article.authorName}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-300/60 transition flex-shrink-0"
        title="Batalkan Tanggapan"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
