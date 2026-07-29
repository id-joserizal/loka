'use client'

import { useState, useTransition } from 'react'
import { toggleFollow } from '@/app/article/[slug]/actions'

interface FollowButtonProps {
  followingId: string
  initialIsFollowing: boolean
}

export function FollowButton({ followingId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const nextState = !isFollowing
    setIsFollowing(nextState)

    startTransition(async () => {
      const res = await toggleFollow(followingId)
      if (res.error) {
        setIsFollowing(!nextState)
        alert(res.error)
      } else if (res.isFollowing !== undefined) {
        setIsFollowing(res.isFollowing)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
        isFollowing
          ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-300'
          : 'bg-zinc-900 text-white hover:bg-black'
      }`}
    >
      {isFollowing ? 'Mengikuti' : '+ Ikuti'}
    </button>
  )
}
