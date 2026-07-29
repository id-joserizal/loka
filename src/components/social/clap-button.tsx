'use client'

import { useState, useTransition } from 'react'
import { toggleClap } from '@/app/article/[slug]/actions'
import { ThumbsUp } from 'lucide-react'

interface ClapButtonProps {
  articleId: string
  initialTotalClaps: number
  initialUserClaps: number
}

export function ClapButton({ articleId, initialTotalClaps, initialUserClaps }: ClapButtonProps) {
  const [totalClaps, setTotalClaps] = useState(initialTotalClaps)
  const [userClaps, setUserClaps] = useState(initialUserClaps)
  const [isPending, startTransition] = useTransition()

  const handleClap = () => {
    if (userClaps >= 50) return

    // Optimistic UI Update
    setTotalClaps((prev) => prev + 1)
    setUserClaps((prev) => prev + 1)

    startTransition(async () => {
      const res = await toggleClap(articleId)
      if (res.error) {
        // Revert if error
        setTotalClaps((prev) => prev - 1)
        setUserClaps((prev) => prev - 1)
        alert(res.error)
      } else if (res.userClapCount !== undefined) {
        setUserClaps(res.userClapCount)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClap}
      disabled={isPending || userClaps >= 50}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition duration-150 text-xs font-semibold ${
        userClaps > 0
          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
          : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
      }`}
      title={userClaps >= 50 ? 'Maksimal 50 clap tercapai' : 'Beri Clap pada artikel ini'}
    >
      <ThumbsUp className={`w-4 h-4 ${userClaps > 0 ? 'fill-white text-white' : 'text-zinc-600'}`} />
      <span>{totalClaps} Clap</span>
      {userClaps > 0 && <span className="text-[10px] text-zinc-400 font-normal">({userClaps})</span>}
    </button>
  )
}
