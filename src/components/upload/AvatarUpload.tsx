import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploadProps {
  avatarUrl?: string | null
  userId: string | undefined
}

export function AvatarUpload({ avatarUrl, userId }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const supabase = createClient()
    const filePath = `${userId}/${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })
    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }
    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    const publicUrl = publicData.publicUrl
    // Update profile row
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)
    if (updateError) {
      console.error('Profile update error:', updateError)
    } else {
      setPreview(publicUrl)
    }
    setUploading(false)
  }

  return (
    <div className="shrink-0">
      {preview ? (
        <img
          src={preview}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-zinc-200 shadow-sm"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-3xl shadow-sm">
          ?
        </div>
      )}
      <label className="mt-2 block text-xs text-zinc-600 cursor-pointer hover:underline">
        {uploading ? 'Mengunggah...' : 'Ganti Avatar'}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  )
}
