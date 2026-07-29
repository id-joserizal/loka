import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'
import { FileQuestion, ArrowLeft, Home, Search } from 'lucide-react'

export default async function NotFound() {
  let user = null
  let profile = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()
      profile = prof
    }
  } catch {
    // Fallback if supabase fails
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900 flex flex-col">
      <Navbar user={user} profile={profile} />

      <main className="flex-1 flex items-center justify-center max-w-xl w-full mx-auto px-4 py-16 text-center">
        <div className="space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-md">
            <FileQuestion className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Error 404
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-sm text-zinc-600 font-serif max-w-md mx-auto leading-relaxed">
              Maaf, halaman atau artikel yang kamu cari mungkin telah dihapus, diubah namanya, atau belum pernah ada.
            </p>
          </div>

          {/* Quick Search Redirect */}
          <form action="/search" method="GET" className="max-w-md mx-auto relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              name="q"
              placeholder="Cari artikel lain di LOKA..."
              className="w-full pl-10 pr-24 py-3 rounded-full bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition"
            >
              Cari
            </button>
          </form>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-400">
        LOKA — Dunia Untuk Semua Cerita &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
