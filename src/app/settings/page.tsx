import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { SettingsClient } from './settings-client'

export const metadata: Metadata = {
  title: 'Pengaturan Akun',
  description: 'Edit profil, username, bio, dan foto avatar akun LOKA kamu.',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col">
      <Navbar user={user} profile={profile} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 sm:py-16">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
            Pengaturan Akun
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Kelola informasi profil dan pengaturan akun kamu
          </p>
        </div>

        <SettingsClient
          profile={profile}
          userEmail={user.email ?? ''}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-[#F4EFEA] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-zinc-900 text-sm">LOKA</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <Link href="/" className="hover:text-zinc-900 transition">Kembali ke Beranda</Link>
        </div>
      </footer>
    </div>
  )
}
