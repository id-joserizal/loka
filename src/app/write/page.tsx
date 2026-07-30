'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { PublishModal } from '@/components/editor/publish-modal'
import { saveArticle } from './actions'
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react'

export default function WritePage() {
  const router = useRouter()
  const [articleId, setArticleId] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<any>(null)

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Track changes for auto-save
  const isFirstRender = useRef(true)

  // Auto-save draft every 5 seconds
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!title && !content) return

    const timer = setTimeout(() => {
      handleAutoSaveDraft()
    }, 5000)

    return () => clearTimeout(timer)
  }, [title, content])

  const handleAutoSaveDraft = async () => {
    if (!title.trim() && !content) return

    setSaveStatus('saving')
    const res = await saveArticle({
      id: articleId,
      title: title || 'Draft Tanpa Judul',
      content: content ?? { type: 'doc', content: [] },
      status: 'draft',
    })

    if (res.success && res.articleId) {
      setArticleId(res.articleId)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('idle')
    }
  }

  const handleFinalPublish = (metadata: { coverImageUrl: string; tags: string[]; excerpt: string }) => {
    if (!title.trim()) {
      alert('Judul artikel tidak boleh kosong!')
      return
    }

    setIsPublishing(true)
    startTransition(async () => {
      const res = await saveArticle({
        id: articleId,
        title,
        content: content ?? { type: 'doc', content: [] },
        coverImageUrl: metadata.coverImageUrl,
        tags: metadata.tags,
        excerpt: metadata.excerpt,
        status: 'published',
      })

      setIsPublishing(false)
      if (res.success) {
        setIsPublishModalOpen(false)
        router.refresh()
        router.push('/dashboard')
      } else {
        alert(res.error || 'Gagal mempublikasikan artikel')
      }
    })
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-serif font-bold text-xl tracking-tight text-zinc-900">LOKA</span>

            {/* Auto-save Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-medium ml-2">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                  <span>Menyimpan draft...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-zinc-600">Draft tersimpan</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAutoSaveDraft}
              className="px-4 py-1.5 rounded-full border border-zinc-300 hover:border-zinc-400 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition"
            >
              Simpan Draft
            </button>

            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-xs font-semibold text-white shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Publikasikan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editor Main Canvas */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Title Input */}
        <textarea
          rows={1}
          placeholder="Judul Artikel..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = `${e.target.scrollHeight}px`
          }}
          className="w-full text-4xl sm:text-5xl font-serif font-bold tracking-tight text-zinc-900 placeholder-zinc-300 border-none outline-none resize-none bg-transparent mb-6 leading-tight"
        />

        {/* Tiptap Block Editor */}
        <TiptapEditor
          content={content}
          onChange={(json) => setContent(json)}
          placeholder="Mulai tulis ceritamu..."
        />
      </main>

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handleFinalPublish}
        isPublishing={isPublishing || isPending}
      />
    </div>
  )
}
