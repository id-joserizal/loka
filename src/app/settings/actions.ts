'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login terlebih dahulu' }
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  const username = (formData.get('username') as string)?.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  const bio = (formData.get('bio') as string)?.trim()

  if (!username || username.length < 3) {
    return { error: 'Username harus minimal 3 karakter (huruf kecil, angka, underscore)' }
  }

  // Check username uniqueness (excluding current user)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single()

  if (existing) {
    return { error: 'Username sudah digunakan. Pilih username lain.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      username,
      bio,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath(`/profile/${username}`)
  revalidatePath('/dashboard')

  return { success: true, username }
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kamu harus login terlebih dahulu' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}
