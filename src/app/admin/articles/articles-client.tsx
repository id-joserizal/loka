'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  FileText,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  FileEdit,
} from 'lucide-react'
import { unpublishArticleByAdmin, deleteArticleByAdmin } from '@/app/actions/admin'

interface ArticleItem {
  id: string
  title: string
  slug: string
  status: 'published' | 'draft'
  created_at: string
  published_at?: string | null
  reading_time?: number | null
  cover_image_url?: string | null
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface ArticlesClientProps {
  initialArticles: ArticleItem[]
}

export function ArticlesClient({ initialArticles }: ArticlesClientProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filteredArticles = articles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUnpublish = async (article: ArticleItem) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin meng-unpublish artikel "${article.title}"? Artikel akan diubah menjadi Draft.`
      )
    )
      return

    setLoadingId(article.id)
    try {
      await unpublishArticleByAdmin(article.id)
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: 'draft' } : a))
      )
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status artikel')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (article: ArticleItem) => {
    if (
      !confirm(
        `PERINGATAN: Menghapus artikel "${article.title}" bersifat permanen dan tidak dapat dibatalkan!`
      )
    )
      return

    setLoadingId(article.id)
    try {
      await deleteArticleByAdmin(article.id)
      setArticles((prev) => prev.filter((a) => a.id !== article.id))
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus artikel')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">Semua Status</option>
            <option value="published">Dipublikasikan (Published)</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3.5 px-4">Artikel</th>
                <th className="py-3.5 px-4">Penulis</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 text-sm">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 text-xs">
                    Tidak ada artikel yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => {
                  const isLoading = loadingId === article.id
                  const author = article.profiles
                  return (
                    <tr key={article.id} className="hover:bg-zinc-50/60 transition">
                      {/* Article Details */}
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-start gap-3">
                          {article.cover_image_url ? (
                            <img
                              src={article.cover_image_url}
                              alt={article.title}
                              className="w-14 h-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-400">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/article/${article.slug}`}
                              target="_blank"
                              className="font-bold text-zinc-900 hover:underline line-clamp-1 block"
                            >
                              {article.title}
                            </Link>
                            <span className="text-xs text-zinc-400 font-mono line-clamp-1">
                              /article/{article.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author Info */}
                      <td className="py-4 px-4">
                        {author ? (
                          <div className="flex items-center gap-2">
                            {author.avatar_url ? (
                              <img
                                src={author.avatar_url}
                                alt={author.username}
                                className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[10px] font-bold">
                                {(author.full_name || author.username).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <Link
                              href={`/profile/${author.username}`}
                              className="text-xs font-semibold text-zinc-800 hover:underline"
                            >
                              {author.full_name || author.username}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">Anonim</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {article.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Publik
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600">
                            <FileEdit className="w-3 h-3 text-zinc-400" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-zinc-500 font-mono">
                        {new Date(article.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                          ) : (
                            <>
                              {/* Open link */}
                              <Link
                                href={`/article/${article.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition"
                                title="Lihat Halaman Artikel"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              {/* Unpublish */}
                              {article.status === 'published' && (
                                <button
                                  onClick={() => handleUnpublish(article)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition flex items-center gap-1"
                                  title="Jadikan Draft (Unpublish)"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Unpublish</span>
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(article)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Hapus Artikel"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
