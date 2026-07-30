'use client'

import { useState } from 'react'
import { X, Flag, Loader2, CheckCircle2 } from 'lucide-react'
import { submitReport } from '@/app/actions/report'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: 'article' | 'comment' | 'user'
  articleId?: string
  commentId?: string
  reportedUserId?: string
  itemTitle?: string
}

const REASON_OPTIONS = [
  'Spam atau iklan tidak diinginkan',
  'Ujaran kebencian atau pelecehan',
  'Informasi palsu / disinformasi',
  'Pelanggaran hak cipta',
  'Konten pornografi atau kekerasan',
  'Lainnya',
]

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  articleId,
  commentId,
  reportedUserId,
  itemTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0])
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      await submitReport({
        targetType,
        articleId,
        commentId,
        reportedUserId,
        reason: selectedReason,
        details: details.trim() || undefined,
      })

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 1800)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim laporan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTitle = () => {
    switch (targetType) {
      case 'article':
        return 'Laporkan Artikel'
      case 'comment':
        return 'Laporkan Komentar'
      case 'user':
        return 'Laporkan Pengguna'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#F4EFEA] border border-zinc-200 shadow-2xl p-6 relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-zinc-900 leading-none">
                {getTitle()}
              </h3>
              {itemTitle && (
                <p className="text-xs text-zinc-500 line-clamp-1 mt-1 font-sans">
                  "{itemTitle}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200/60 text-zinc-500 hover:text-zinc-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-lg text-zinc-900">Laporan Terkirim</h4>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              Terima kasih atas bantuan Anda menjaga komunitas LOKA tetap aman dan nyaman.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2">
                Alasan Pelaporan
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {REASON_OPTIONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition ${
                      selectedReason === reason
                        ? 'border-zinc-900 bg-zinc-900 text-white font-medium'
                        : 'border-zinc-200/80 bg-white/60 text-zinc-800 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="sr-only"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
                Detail Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Berikan konteks atau alasan spesifik..."
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-full border border-zinc-300 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Laporan</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
