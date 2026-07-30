'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Ban,
  Trash2,
  EyeOff,
  User as UserIcon,
  FileText,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import {
  resolveReport,
  unpublishArticleByAdmin,
  deleteArticleByAdmin,
  toggleUserSuspend,
} from '@/app/actions/admin'

interface ReportItem {
  id: string
  target_type: 'article' | 'comment' | 'user'
  reason: string
  details?: string | null
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned'
  created_at: string
  reporter: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  } | null
  article?: {
    id: string
    title: string
    slug: string
    status: string
    author_id: string
  } | null
  comment?: {
    id: string
    content: string
    user_id: string
  } | null
  reported_user?: {
    id: string
    username: string
    full_name: string | null
    status: string
  } | null
}

interface ReportsClientProps {
  initialReports: ReportItem[]
}

export function ReportsClient({ initialReports }: ReportsClientProps) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true
    return r.status === statusFilter
  })

  const handleResolve = async (reportId: string, actionStatus: 'actioned' | 'dismissed') => {
    setLoadingId(reportId)
    try {
      await resolveReport(reportId, actionStatus)
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: actionStatus } : r))
      )
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui laporan')
    } finally {
      setLoadingId(null)
    }
  }

  const handleUnpublishArticle = async (report: ReportItem) => {
    if (!report.article) return
    if (!confirm(`Unpublish artikel "${report.article.title}" dan selesaikan laporan ini?`)) return

    setLoadingId(report.id)
    try {
      await unpublishArticleByAdmin(report.article.id)
      await resolveReport(report.id, 'actioned')
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? { ...r, status: 'actioned', article: r.article ? { ...r.article, status: 'draft' } : null }
            : r
        )
      )
    } catch (err: any) {
      alert(err.message || 'Gagal unpublish artikel')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDeleteArticle = async (report: ReportItem) => {
    if (!report.article) return
    if (!confirm(`Hapus artikel "${report.article.title}" secara permanen dan selesaikan laporan ini?`)) return

    setLoadingId(report.id)
    try {
      await deleteArticleByAdmin(report.article.id)
      await resolveReport(report.id, 'actioned')
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: 'actioned', article: null } : r))
      )
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus artikel')
    } finally {
      setLoadingId(null)
    }
  }

  const handleSuspendUser = async (report: ReportItem, userId: string, username: string) => {
    if (!confirm(`Tangguhkan (suspend) akun @${username} dan selesaikan laporan ini?`)) return

    setLoadingId(report.id)
    try {
      await toggleUserSuspend(userId, 'active')
      await resolveReport(report.id, 'actioned')
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: 'actioned' } : r))
      )
    } catch (err: any) {
      alert(err.message || 'Gagal menangguhkan akun')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3 overflow-x-auto">
        {[
          { label: 'Menunggu Peninjauan (Pending)', value: 'pending' },
          { label: 'Ditindaklanjuti (Actioned)', value: 'actioned' },
          { label: 'Diabaikan (Dismissed)', value: 'dismissed' },
          { label: 'Semua Laporan', value: 'all' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
              statusFilter === tab.value
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white/60 text-zinc-600 hover:bg-white hover:text-zinc-900 border border-zinc-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200/80 p-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-zinc-900 text-base">Tidak ada laporan</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Tidak ada laporan dalam kategori ini saat ini. Komunitas aman dan terkendali.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isLoading = loadingId === report.id
            const reporter = report.reporter

            return (
              <div
                key={report.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-semibold uppercase tracking-wider text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-md">
                      {report.target_type}
                    </span>
                    <span>•</span>
                    <span>Pelapor:</span>
                    {reporter ? (
                      <Link
                        href={`/profile/${reporter.username}`}
                        className="font-bold text-zinc-900 hover:underline"
                      >
                        @{reporter.username}
                      </Link>
                    ) : (
                      <span>Pengguna</span>
                    )}
                    <span>•</span>
                    <span className="font-mono">
                      {new Date(report.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {report.status === 'pending' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Menunggu Review
                      </span>
                    )}
                    {report.status === 'actioned' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Selesai: Ditindaklanjuti
                      </span>
                    )}
                    {report.status === 'dismissed' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600">
                        Diabaikan
                      </span>
                    )}
                  </div>
                </div>

                {/* Reason & Details */}
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{report.reason}</h4>
                      {report.details && (
                        <p className="text-xs text-zinc-600 mt-1 italic bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/60">
                          "{report.details}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target Content Preview */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Konten Yang Dilaporkan
                  </span>

                  {report.target_type === 'article' && report.article && (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                        <div>
                          <Link
                            href={`/article/${report.article.slug}`}
                            target="_blank"
                            className="font-bold text-zinc-900 hover:underline text-sm line-clamp-1"
                          >
                            {report.article.title}
                          </Link>
                          <span className="text-xs text-zinc-400">
                            Status Artikel: {report.article.status}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/article/${report.article.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  )}

                  {report.target_type === 'comment' && report.comment && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-zinc-800 line-clamp-2">
                        "{report.comment.content}"
                      </p>
                    </div>
                  )}

                  {report.target_type === 'user' && report.reported_user && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                      <Link
                        href={`/profile/${report.reported_user.username}`}
                        className="font-bold text-zinc-900 hover:underline text-sm"
                      >
                        @{report.reported_user.username} ({report.reported_user.full_name})
                      </Link>
                    </div>
                  )}

                  {(!report.article && !report.comment && !report.reported_user) && (
                    <p className="text-xs text-zinc-400 italic">
                      Konten terkait telah dihapus sebelumnya.
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {/* Action buttons for target content */}
                  <div className="flex items-center gap-2">
                    {report.article && report.article.status === 'published' && (
                      <button
                        onClick={() => handleUnpublishArticle(report)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition flex items-center gap-1.5"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Unpublish Artikel</span>
                      </button>
                    )}

                    {report.article && (
                      <button
                        onClick={() => handleDeleteArticle(report)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-900 hover:bg-red-200 border border-red-300 transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Artikel</span>
                      </button>
                    )}

                    {report.article && report.article.author_id && (
                      <button
                        onClick={() =>
                          handleSuspendUser(report, report.article!.author_id, 'penulis')
                        }
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Suspend Penulis</span>
                      </button>
                    )}
                  </div>

                  {/* Resolve report status */}
                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleResolve(report.id, 'dismissed')}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition"
                      >
                        Abaikan
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'actioned')}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-xs font-semibold text-white transition"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Selesaikan (Tindak Lanjuti)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
