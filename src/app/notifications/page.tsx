import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { getNotifications } from './actions'
import { NotificationsClient } from './notifications-client'

export const metadata: Metadata = {
  title: 'Notifikasi — LOKA',
  description: 'Lihat notifikasi upvote, komentar, dan pengikut baru di LOKA.',
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  const { notifications, unreadCount } = await getNotifications(50)

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col">
      <Navbar user={user} profile={profile} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 sm:py-16">
        <NotificationsClient initialNotifications={notifications} initialUnreadCount={unreadCount} />
      </main>

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
