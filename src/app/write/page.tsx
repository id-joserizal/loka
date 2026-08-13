'use client'

import { useState, useEffect, useRef, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { PublishModal } from '@/components/editor/publish-modal'
import { ResponseBanner, ParentArticleRef, ParentCommentRef } from '@/components/editor/response-banner'
import { saveArticle } from './actions'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react'

function WriteEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialResponseToId = searchParams.get('response_to') || undefined
  const initialResponseToCommentId = searchParams.get('response_to_comment') || undefined

  const [articleId, setArticleId] = useState<string | undefined>(undefined)
  const [responseToId, setResponseToId] = useState<string | undefined>(initialResponseToId)
  const [responseToCommentId, setResponseToCommentId] = useState<string | undefined>(initialResponseToCommentId)
  const [parentArticleRef, setParentArticleRef] = useState<ParentArticleRef | null>(null)
  const [parentCommentRef, setParentCommentRef] = useState<ParentCommentRef | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState<any>(null)

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Fetch parent article reference (for both article and comment response modes)
  useEffect(() => {
    if (!responseToId) {
      setParentArticleRef(null)
      return
    }

    let isMounted = true
    const fetchParentArticle = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('articles')
          .select(`
            id,
            title,
            cover_image_url,
            profiles:author_id (
              full_name,
              username,
              avatar_url
            )
          `)
          .eq('id', responseToId)
          .single()

        if (data && isMounted) {
          const authorObj = (data.profiles as any) || {}
          setParentArticleRef({
            id: data.id,
            title: data.title,
            coverImageUrl: data.cover_image_url,
            authorName: authorObj.full_name || authorObj.username || 'Penulis',
            authorAvatar: authorObj.avatar_url,
          })
        }
      } catch (err) {
        console.error('Error fetching response parent article:', err)
      }
    }

    fetchParentArticle()
    return () => {
      isMounted = false
    }
  }, [responseToId])

  // Fetch parent comment reference when response_to_comment is provided
  useEffect(() => {
    if (!responseToCommentId || !responseToId) {
      setParentCommentRef(null)
      return
    }

    let isMounted = true
    const fetchParentComment = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            profiles:user_id (
              full_name,
              username,
              avatar_url
            ),
            articles:article_id (
              id,
              title,
              slug
            )
          `)
          .eq('id', responseToCommentId)
          .single()

        if (data && isMounted) {
          const authorObj = (data.profiles as any) || {}
          const articleObj = (data.articles as any) || {}
          setParentCommentRef({
            id: data.id,
            content: data.content,
            authorName: authorObj.full_name || authorObj.username || 'Penulis',
            authorAvatar: authorObj.avatar_url || null,
            articleTitle: articleObj.title || '',
          })
        }
      } catch (err) {
        console.error('Error fetching parent comment:', err)
      }
    }

    fetchParentComment()
    return () => {
      isMounted = false
    }
  }, [responseToCommentId, responseToId])

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
  }, [title, content, responseToId, responseToCommentId])

  const handleAutoSaveDraft = async () => {
    if (!title.trim() && !content) return

    setSaveStatus('saving')
    const res = await saveArticle({
      id: articleId,
      title: title || 'Draft Tanpa Judul',
      content: content ?? { type: 'doc', content: [] },
      status: 'draft',
      responseToId: responseToId,
      responseToCommentId: responseToCommentId,
    })

    if (res.success && res.articleId) {
      setArticleId(res.articleId)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('idle')
    }
  }

  const handleCancelResponse = () => {
    setResponseToId(undefined)
    setResponseToCommentId(undefined)
    setParentArticleRef(null)
    setParentCommentRef(null)
    router.replace('/write')
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
        responseToId: responseToId,
        responseToCommentId: responseToCommentId,
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
    <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-[#F4EFEA]/90 backdrop-blur-md">
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
      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 py-8 sm:py-12">
        {/* Response Reference Banner — diprioritaskan tampilkan banner komentar jika ada */}
        {(parentArticleRef || parentCommentRef) && (
          <ResponseBanner
            article={parentArticleRef ?? { id: '', title: '', authorName: '' }}
            parentComment={parentCommentRef}
            onCancel={handleCancelResponse}
          />
        )}

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
          className="w-full text-4xl sm:text-5xl md:text-[48px] font-serif font-extrabold tracking-tight text-zinc-900 placeholder-zinc-300 border-none outline-none resize-none bg-transparent mb-6 leading-[1.12]"
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

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4EFEA] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
        </div>
      }
    >
      <WriteEditorContent />
    </Suspense>
  )
}
