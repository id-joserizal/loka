'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteArticle, togglePublishArticle } from './actions'
import {
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  FileText,
  Globe,
  Clock,
  ThumbsUp,
  MessageCircle,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react'

export interface DashboardArticle {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  reading_time: number | null
  clap_count: number
  comment_count: number
}

interface ArticleRowProps {
  article: DashboardArticle
  onDeleted: (id: string) => void
  onStatusToggled: (id: string, newStatus: 'draft' | 'published') => void
}

function ArticleRow({ article, onDeleted, onStatusToggled }: ArticleRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isPublished = article.status === 'published'
  const date = article.published_at || article.created_at
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteArticle(article.id)
      if (res.error) {
        alert(res.error)
      } else {
        onDeleted(article.id)
      }
      setShowDeleteConfirm(false)
    })
  }

  const handleTogglePublish = () => {
    setMenuOpen(false)
    startTransition(async () => {
      const res = await togglePublishArticle(article.id, article.status)
      if (res.error) {
        alert(res.error)
      } else if (res.newStatus) {
        onStatusToggled(article.id, res.newStatus as 'draft' | 'published')
      }
    })
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full space-y-5 border border-zinc-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-zinc-900 text-base">Hapus Artikel?</h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Artikel <strong className="text-zinc-800">"{article.title}"</strong> akan dihapus permanen beserta komentar dan statistiknya. Tindakan ini tidak bisa dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-full border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-60"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Hapus Selamanya
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="group flex items-start gap-4 py-5 border-b border-zinc-100 last:border-0">
        {/* Status Indicator */}
        <div className="mt-1 shrink-0">
          {isPublished ? (
            <div className="w-2 h-2 rounded-full bg-green-500" title="Dipublikasikan" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-amber-400" title="Draft" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif font-bold text-zinc-900 text-sm leading-snug line-clamp-2">
              {article.title || 'Tanpa Judul'}
            </h3>

            {/* Actions Menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition opacity-0 group-hover:opacity-100"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-52 rounded-2xl bg-white border border-zinc-200 shadow-xl p-1.5 z-40 space-y-0.5">
                    <Link
                      href={`/edit/${article.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit Artikel</span>
                    </Link>

                    {isPublished && (
                      <Link
                        href={`/article/${article.slug}`}
                        target="_blank"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Lihat Artikel</span>
                      </Link>
                    )}

                    <button
                      onClick={handleTogglePublish}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 rounded-xl transition text-left"
                    >
                      {isPublished ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Jadikan Draft</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Publikasikan</span>
                        </>
                      )}
                    </button>

                    <div className="my-1 border-t border-zinc-100" />

                    <button
                      onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Artikel</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400">
            <span className={`inline-flex items-center gap-1 font-medium ${isPublished ? 'text-green-600' : 'text-amber-500'}`}>
              {isPublished ? <Globe className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {isPublished ? 'Dipublikasikan' : 'Draft'}
            </span>
            <span>{formattedDate}</span>
            {article.reading_time && (
              <span>{article.reading_time} min baca</span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {article.clap_count} clap
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {article.comment_count} komentar
            </span>
          </div>
        </div>

        {/* Quick edit link always visible on mobile */}
        <Link
          href={`/edit/${article.id}`}
          className="sm:hidden shrink-0 p-2 text-zinc-400 hover:text-zinc-700"
        >
          <Edit3 className="w-4 h-4" />
        </Link>
      </div>
    </>
  )
}

interface DashboardClientProps {
  articles: DashboardArticle[]
  totalClaps: number
  totalComments: number
}

export function DashboardClient({ articles: initialArticles, totalClaps, totalComments }: DashboardClientProps) {
  const [articles, setArticles] = useState<DashboardArticle[]>(initialArticles)
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all')

  const handleDeleted = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

  const handleStatusToggled = (id: string, newStatus: 'draft' | 'published') => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }
          : a
      )
    )
  }

  const filtered = articles.filter((a) => {
    if (activeTab === 'published') return a.status === 'published'
    if (activeTab === 'draft') return a.status === 'draft'
    return true
  })

  const publishedCount = articles.filter((a) => a.status === 'published').length
  const draftCount = articles.filter((a) => a.status === 'draft').length

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <FileText className="w-3.5 h-3.5" />
            <span>Total Artikel</span>
          </div>
          <p className="text-3xl font-serif font-bold">{articles.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-1">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Globe className="w-3.5 h-3.5" />
            <span>Dipublikasikan</span>
          </div>
          <p className="text-3xl font-serif font-bold text-zinc-900">{publishedCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-1">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Total Clap</span>
          </div>
          <p className="text-3xl font-serif font-bold text-zinc-900">{totalClaps}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-1">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Komentar</span>
          </div>
          <p className="text-3xl font-serif font-bold text-zinc-900">{totalComments}</p>
        </div>
      </div>

      {/* Article List */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden">
        {/* Tab Header */}
        <div className="flex items-center gap-1 px-6 pt-5 pb-0 border-b border-zinc-100">
          {([['all', 'Semua', articles.length], ['published', 'Terbit', publishedCount], ['draft', 'Draft', draftCount]] as const).map(
            ([tab, label, count]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {label}
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  activeTab === tab ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          )}
        </div>

        {/* Article rows */}
        <div className="px-6">
          {filtered.length > 0 ? (
            filtered.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onDeleted={handleDeleted}
                onStatusToggled={handleStatusToggled}
              />
            ))
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500 font-serif">
                {activeTab === 'draft'
                  ? 'Tidak ada draft.'
                  : activeTab === 'published'
                  ? 'Belum ada artikel yang dipublikasikan.'
                  : 'Kamu belum menulis artikel apapun.'}
              </p>
              {activeTab !== 'published' && (
                <Link
                  href="/write"
                  className="inline-block mt-1 text-xs font-bold text-zinc-900 hover:underline"
                >
                  Mulai menulis sekarang →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
