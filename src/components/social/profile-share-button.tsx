'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { ProfileShareModal } from './profile-share-modal'

interface ProfileShareButtonProps {
  profile: {
    username: string
    full_name?: string | null
    bio?: string | null
    avatar_url?: string | null
    badge?: string | null
    articlesCount?: number
    followersCount?: number
  }
}

export function ProfileShareButton({ profile }: ProfileShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-1.5 rounded-full border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition flex items-center gap-1.5 shadow-sm"
        title="Bagikan Profil"
      >
        <Share2 className="w-3.5 h-3.5 text-zinc-500" />
        <span>Bagikan Profil</span>
      </button>

      <ProfileShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        profile={profile}
      />
    </>
  )
}
