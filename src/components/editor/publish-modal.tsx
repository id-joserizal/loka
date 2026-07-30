'use client'

import { useState, useRef } from 'react'
import { X, Tag, Image as ImageIcon, Sparkles, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  onPublish: (data: { coverImageUrl: string; tags: string[]; excerpt: string }) => void
  isPublishing: boolean
  initialCoverUrl?: string
  initialTags?: string[]
  initialExcerpt?: string
}

export function PublishModal({
  isOpen,
  onClose,
  onPublish,
  isPublishing,
  initialCoverUrl = '',
  initialTags = [],
  initialExcerpt = '',
}: PublishModalProps) {
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverUrl)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialTags)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setCoverError('Ukuran gambar maksimal 5MB.')
      return
    }

    setCoverError(null)
    setUploadingCover(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `cover-${Date.now()}.${ext}`
      const filePath = `covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('article-covers')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        setCoverError(uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-covers')
        .getPublicUrl(filePath)

      setCoverImageUrl(publicUrl)
    } catch {
      setCoverError('Gagal mengunggah gambar.')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const cleaned = tagInput.trim().replace(/^#/, '')
      if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
        setTags([...tags, cleaned])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPublish({ coverImageUrl, tags, excerpt })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-900" />
            <h2 className="text-xl font-serif font-bold text-zinc-900">Publikasikan Artikel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gambar Cover</span>
            </label>

            {coverImageUrl ? (
              <div className="relative h-40 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 group">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-900 text-xs font-semibold shadow hover:bg-zinc-100 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Ganti Gambar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full h-32 rounded-xl border-2 border-dashed border-zinc-300 hover:border-zinc-500 bg-zinc-50 hover:bg-zinc-100 transition flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-700"
              >
                {uploadingCover ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-medium">Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-medium">Klik untuk unggah gambar cover</span>
                    <span className="text-[11px] text-zinc-400">JPG, PNG, WebP · Maks 5MB</span>
                  </>
                )}
              </button>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />

            {coverError && (
              <p className="text-xs text-red-500">{coverError}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Topik / Tags (Maksimal 5)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200 min-h-[46px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-300 ml-0.5"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  type="text"
                  placeholder="Ketik tag & tekan Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 bg-transparent px-2 py-1 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              Ringkasan Singkat (Excerpt)
            </label>
            <textarea
              rows={3}
              placeholder="Tulis ringkasan singkat artikel kamu untuk muncul di feed..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-xs font-semibold text-white shadow-md transition disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mempublikasikan...</span>
                </>
              ) : (
                <span>Publikasikan Sekarang</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
