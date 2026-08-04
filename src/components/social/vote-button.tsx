'use client'

import { useState, useTransition } from 'react'
import { voteArticle } from '@/app/article/[slug]/actions'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'

interface VoteButtonProps {
  articleId: string
  initialNetVotes: number
  initialUserVote: number // 1 for upvote, -1 for downvote, 0 for none
  size?: 'sm' | 'md'
}

export function VoteButton({
  articleId,
  initialNetVotes,
  initialUserVote,
  size = 'md',
}: VoteButtonProps) {
  const [netVotes, setNetVotes] = useState(initialNetVotes)
  const [userVote, setUserVote] = useState<number>(initialUserVote)
  const [isPending, startTransition] = useTransition()

  const handleVote = (targetVote: 1 | -1) => {
    const prevVote = userVote
    const prevNet = netVotes

    let newVote: number = targetVote
    let delta = 0

    if (prevVote === targetVote) {
      // Toggle off / Cancel vote
      newVote = 0
      delta = -targetVote
    } else if (prevVote === 0) {
      // Direct vote
      delta = targetVote
    } else {
      // Switch vote (e.g. +1 to -1 is -2, -1 to +1 is +2)
      delta = targetVote * 2
    }

    // Optimistic UI Update
    setUserVote(newVote)
    setNetVotes((prev) => prev + delta)

    startTransition(async () => {
      const res = await voteArticle(articleId, targetVote)
      if (res.error) {
        // Revert on error
        setUserVote(prevVote)
        setNetVotes(prevNet)
        alert(res.error)
      } else if (res.userVote !== undefined && res.netVotes !== undefined) {
        setUserVote(res.userVote)
        setNetVotes(res.netVotes)
      }
    })
  }

  const isSm = size === 'sm'

  return (
    <div
      className={`inline-flex items-center rounded-full border border-zinc-200 bg-white/80 backdrop-blur-sm p-0.5 shadow-sm ${
        isSm ? 'gap-0.5 text-xs' : 'gap-1 text-sm'
      }`}
    >
      {/* Upvote Button */}
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isPending}
        title="Upvote artikel ini"
        className={`flex items-center gap-1 rounded-full transition-all duration-150 font-semibold ${
          isSm ? 'px-2 py-1' : 'px-3 py-1.5'
        } ${
          userVote === 1
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-emerald-600'
        }`}
      >
        <ArrowBigUp
          className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
            userVote === 1 ? 'fill-white' : ''
          }`}
        />
        <span>Upvote</span>
      </button>

      {/* Net Score Badge */}
      <span
        className={`font-serif font-bold text-center px-1.5 transition-colors ${
          userVote === 1
            ? 'text-emerald-700 font-extrabold'
            : userVote === -1
            ? 'text-rose-700 font-extrabold'
            : 'text-zinc-800'
        } ${isSm ? 'text-xs min-w-[1.25rem]' : 'text-sm min-w-[1.5rem]'}`}
      >
        {netVotes > 0 ? `+${netVotes}` : netVotes}
      </span>

      {/* Downvote Button */}
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isPending}
        title="Downvote artikel ini"
        className={`flex items-center justify-center rounded-full transition-all duration-150 ${
          isSm ? 'p-1' : 'p-1.5'
        } ${
          userVote === -1
            ? 'bg-rose-600 text-white shadow-xs'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-rose-600'
        }`}
      >
        <ArrowBigDown
          className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
            userVote === -1 ? 'fill-white' : ''
          }`}
        />
      </button>
    </div>
  )
}
