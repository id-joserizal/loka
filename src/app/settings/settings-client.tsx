'use client'

import { useState, useTransition, useRef } from 'react'
import { updateProfile, updateAvatar } from './actions'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, Check, AlertCircle, Save, User } from 'lucide-react'

interface SettingsClientProps {
  profile: {
    id: string
    username: string | null
    full_name: string | null
    bio: string | null
    avatar_url: string | null
  }
  userEmail: string
}

export function SettingsClient({ profile, userEmail }: SettingsClientProps) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [username, setUsername] = useState(profile.username || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayName = fullName || username || 'Penulis'

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran gambar maksimal 2MB.' })
      return
    }

    setUploadingAvatar(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `avatar-${profile.id}-${Date.now()}.${ext}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        setMessage({ type: 'error', text: uploadError.message })
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const res = await updateAvatar(publicUrl)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setAvatarUrl(publicUrl)
        setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal mengunggah gambar.' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData()
    formData.set('full_name', fullName)
    formData.set('username', username)
    formData.set('bio', bio)

    startTransition(async () => {
      const res = await updateProfile(formData)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Profil berhasil disimpan!' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 p-6 bg-white border border-zinc-200 rounded-3xl">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-2xl border-2 border-zinc-200">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition shadow-sm"
            title="Ganti foto profil"
          >
            {uploadingAvatar ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <h3 className="font-serif font-bold text-zinc-900">{displayName}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{userEmail}</p>
          <p className="text-[11px] text-zinc-400 mt-2">JPG, PNG, atau GIF. Maks 2MB.</p>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="space-y-5 bg-white border border-zinc-200 rounded-3xl p-6">
        <h2 className="font-serif font-bold text-zinc-900 text-base border-b border-zinc-100 pb-4">
          Informasi Profil
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="full_name" className="block text-xs font-semibold text-zinc-700">
            Nama Lengkap
          </label>
          <input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama Lengkapmu"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="username" className="block text-xs font-semibold text-zinc-700">
            Username <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username_kamu"
              required
              minLength={3}
              maxLength={30}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition"
            />
          </div>
          <p className="text-[11px] text-zinc-400">Hanya huruf kecil, angka, dan underscore. Min 3 karakter.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bio" className="block text-xs font-semibold text-zinc-700">
            Bio <span className="text-zinc-400 font-normal">(opsional)</span>
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ceritakan sedikit tentang dirimu..."
            maxLength={200}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition resize-none"
          />
          <p className="text-[11px] text-zinc-400 text-right">{bio.length}/200</p>
        </div>
      </div>

      {/* Account Info (read-only) */}
      <div className="space-y-4 bg-white border border-zinc-200 rounded-3xl p-6">
        <h2 className="font-serif font-bold text-zinc-900 text-base border-b border-zinc-100 pb-4">
          Informasi Akun
        </h2>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-700">Email</label>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-sm text-zinc-600">{userEmail}</span>
            <span className="ml-auto text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Tidak dapat diubah</span>
          </div>
        </div>
      </div>

      {/* Feedback message */}
      {message && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || uploadingAvatar}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition shadow-sm disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Simpan Perubahan</span>
        </button>
      </div>
    </form>
  )
}
