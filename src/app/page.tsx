import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Sparkles, ArrowRight, BookOpen, PenTool, Users, ShieldCheck } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 border-b border-zinc-800/60">
          {/* Background Ambient Glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Platform Menulis & Membaca Artikel Generasi Baru</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Dunia Untuk Semua <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Cerita dan Gagasan.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              Tempat bagi penulis independen, pemikir, dan pembaca di Indonesia untuk berbagi pandangan, cerita mendalam, dan wawasan yang menginspirasi.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {user ? (
                <Link
                  href="/write"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition duration-200"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Mulai Tulis Artikel</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition duration-200"
                  >
                    <span>Mulai Menulis Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm font-medium text-zinc-300 transition duration-200"
                  >
                    <span>Masuk ke Akun</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Block-Based Editor</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tulis artikel dengan mudah menggunakan rich-text editor berbasis blok yang intuitif, mendukung gambar, quote, dan code blocks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Pengalaman Membaca Maksimal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Antarmuka bersih, estimasi waktu baca otomatis, reading progress bar, dan fitur bookmark untuk kenyamanan pembaca.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-950 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Interaksi Komunitas</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Berikan apresiasi lewat fitur Clap berkali-kali, ikuti penulis favorit, dan diskusikan artikel melalui kolom komentar.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} LOKA. Dunia Untuk Semua Cerita.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-zinc-300 transition">Tentang</Link>
            <Link href="/" className="hover:text-zinc-300 transition">Syarat & Ketentuan</Link>
            <Link href="/" className="hover:text-zinc-300 transition">Privasi</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
