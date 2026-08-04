'use client'

import { VoteButton } from './vote-button'

interface ClapButtonProps {
  articleId: string
  initialTotalClaps: number
  initialUserClaps: number
}

export function ClapButton({ articleId, initialTotalClaps, initialUserClaps }: ClapButtonProps) {
  return (
    <VoteButton
      articleId={articleId}
      initialNetVotes={initialTotalClaps}
      initialUserVote={initialUserClaps > 0 ? 1 : 0}
    />
  )
}
