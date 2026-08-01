'use client'

import { useState } from 'react'
import { Share2, Check, Link as LinkIcon, X, FileText, Users } from 'lucide-react'
import { BadgeIcon } from '@/components/ui/badge-icon'

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export interface ProfileShareModalProps {
  isOpen: boolean
  onClose: () => void
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

export function ProfileShareModal({ isOpen, onClose, profile }: ProfileShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const displayName = profile.full_name || profile.username
  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profile/${profile.username}` 
    : `/profile/${profile.username}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      alert('Gagal menyalin tautan')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} (@${profile.username}) di LOKA`,
          text: profile.bio || `Lihat profil ${displayName} di LOKA`,
          url: profileUrl,
        })
      } catch {
        // User cancelled native share
      }
    }
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Lihat profil *${displayName}* (@${profile.username}) di LOKA:\n`)
    window.open(`https://wa.me/?text=${text}${encodeURIComponent(profileUrl)}`, '_blank')
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Lihat profil ${displayName} (@${profile.username}) di LOKA:`)
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${text}`, '_blank')
  }

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank')
  }

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank')
  }

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="h-24 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition backdrop-blur-md"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Preview */}
        <div className="px-6 pb-6 pt-0 relative -mt-12 text-center">
          {/* Avatar (Focus of Profile Share) */}
          <div className="inline-block relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md mx-auto">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1">
            <h3 className="text-xl font-serif font-bold text-zinc-900 flex items-center justify-center gap-1.5">
              <span>{displayName}</span>
              <BadgeIcon badge={profile.badge} size="md" />
            </h3>
            <p className="text-xs text-zinc-500 font-medium">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="text-xs text-zinc-600 mt-2.5 max-w-xs mx-auto line-clamp-2 italic leading-relaxed">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}

          {/* Stats Badges */}
          <div className="flex items-center justify-center gap-4 mt-4 py-2 px-4 bg-zinc-50 rounded-2xl border border-zinc-100 max-w-xs mx-auto text-xs text-zinc-600">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span><strong className="text-zinc-900">{profile.articlesCount ?? 0}</strong> Artikel</span>
            </div>
            <div className="w-px h-3.5 bg-zinc-200" />
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span><strong className="text-zinc-900">{profile.followersCount ?? 0}</strong> Pengikut</span>
            </div>
          </div>

          {/* Share Actions Grid */}
          <div className="mt-6 space-y-3">
            <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
              Bagikan Profil Ke
            </p>

            {/* Social Share Buttons Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              <button
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">WhatsApp</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  <XTwitterIcon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium">X/Twitter</span>
              </button>

              <button
                onClick={handleShareFacebook}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  <FacebookIcon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Facebook</span>
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100/80 text-sky-700 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  <LinkedInIcon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">LinkedIn</span>
              </button>
            </div>

            {/* Direct Link Copy Bar */}
            <div className="pt-2">
              <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200">
                <div className="flex-1 truncate px-3 text-xs text-zinc-600 font-mono">
                  {profileUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Native Web Share API Button if available */}
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                <Share2 className="w-4 h-4 text-zinc-500" />
                <span>Opsi Berbagi Lainnya (Otomatis Perangkat)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
