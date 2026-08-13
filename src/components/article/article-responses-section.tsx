'use client'

import { useState, useEffect } from 'react'
import { ArticleCard } from '@/components/article/article-card'

export interface ResponseItem {
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
  net_votes?: number
}

interface ArticleResponsesSectionProps {
  articleId: string
  initialResponses?: ResponseItem[]
  responseCount?: number
}

export function ArticleResponsesSkeleton() {
  return (
    <div className="mt-12 pt-8 border-t border-zinc-200/80 space-y-4 animate-pulse">
      <div className="w-36 h-6 bg-zinc-200 rounded-md mb-6" />
      {[1, 2].map((i) => (
        <div key={i} className="py-6 border-b border-zinc-200/80 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-zinc-200 rounded-full" />
              <div className="w-24 h-4 bg-zinc-200 rounded" />
            </div>
            <div className="w-3/4 h-6 bg-zinc-200 rounded-md" />
            <div className="w-full h-4 bg-zinc-100 rounded" />
          </div>
          <div className="w-full sm:w-40 h-28 bg-zinc-200 rounded-2xl flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function ArticleResponsesSection({
  articleId,
  initialResponses,
  responseCount = 0,
}: ArticleResponsesSectionProps) {
  const [responses, setResponses] = useState<ResponseItem[] | null>(initialResponses || null)
  const [isLoading, setIsLoading] = useState(!initialResponses && responseCount > 0)

  useEffect(() => {
    if (initialResponses) return
    if (responseCount === 0) {
      setResponses([])
      setIsLoading(false)
      return
    }

    let isMounted = true
    const fetchResponses = async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}/responses`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setResponses(data.responses || [])
          }
        }
      } catch (err) {
        console.error('Error loading responses:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchResponses()
    return () => {
      isMounted = false
    }
  }, [articleId, initialResponses, responseCount])

  if (isLoading) {
    return <ArticleResponsesSkeleton />
  }

  if (!responses || responses.length === 0) {
    return null
  }

  const countText = `${responses.length} Tanggapan`

  return (
    <section className="mt-12 pt-8 border-t border-zinc-200/80 space-y-4">
      <h3 className="text-xl font-serif font-bold text-zinc-900">
        {countText}
      </h3>
      <div className="divide-y divide-zinc-100">
        {responses.map((resp) => (
          <ArticleCard key={resp.id} article={resp} />
        ))}
      </div>
    </section>
  )
}
