'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ArticleViewTrackerProps {
  articleId: string
  userId?: string | null
}

export function ArticleViewTracker({ articleId, userId }: ArticleViewTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    // Only track once per page load
    if (tracked.current) return
    tracked.current = true

    const trackView = async () => {
      try {
        const supabase = createClient()
        await supabase.from('page_views').insert({
          article_id: articleId,
          user_id: userId ?? null,
        })
      } catch {
        // Silently fail — tracking should never break the page
      }
    }

    // Small delay to avoid counting bots that bounce immediately
    const timer = setTimeout(trackView, 3000)
    return () => clearTimeout(timer)
  }, [articleId, userId])

  return null
}
