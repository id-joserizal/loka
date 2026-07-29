'use client'

import { useState, useTransition } from 'react'
import { toggleBookmark } from '@/app/article/[slug]/actions'
import { Bookmark } from 'lucide-react'

interface BookmarkButtonProps {
  articleId: string
  initialIsBookmarked: boolean
}

export function BookmarkButton({ articleId, initialIsBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const nextState = !isBookmarked
    setIsBookmarked(nextState)

    startTransition(async () => {
      const res = await toggleBookmark(articleId)
      if (res.error) {
        setIsBookmarked(!nextState)
        alert(res.error)
      } else if (res.isBookmarked !== undefined) {
        setIsBookmarked(res.isBookmarked)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-full border transition duration-150 text-xs font-medium ${
        isBookmarked
          ? 'bg-zinc-900 text-white border-zinc-900'
          : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
      }`}
      title={isBookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}
    >
      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
    </button>
  )
}
