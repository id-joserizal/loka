'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  'use server'

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/'

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect(redirectTo)
}

export async function signup(formData: FormData) {
  'use server'

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/'

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If session is created (Confirm email is OFF in Supabase), user is logged in -> redirect
  if (data?.session) {
    redirect(redirectTo)
  }

  // If session is null (Confirm email is ON in Supabase), inform user
  return {
    successMessage:
      'Akun berhasil dibuat! Namun karena fitur "Confirm email" di Supabase Anda aktif, silakan matikan "Confirm email" di Supabase Dashboard -> Auth -> Email agar bisa langsung login.',
  }
}

export async function loginWithGoogle() {
  'use server'

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  'use server'

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
