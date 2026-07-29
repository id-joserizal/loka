import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { ArrowRight, BookOpen, PenTool, Users, Sparkles } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Navbar user={user} profile={profile} />

      {/* Medium-style Editorial Hero Section */}
      <main className="flex-1">
        <section className="border-b border-zinc-900 bg-[#FAF9F5] py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-normal tracking-tight text-zinc-900 leading-[1.02]">
                Dunia Untuk Semua Cerita.
              </h1>

              <p className="text-xl sm:text-2xl text-zinc-700 font-serif leading-relaxed">
                Tempat bagi penulis independen, pemikir, dan pembaca di Indonesia untuk berbagi pandangan dan gagasan mendalam.
              </p>

              <div className="pt-4">
                {user ? (
                  <Link
                    href="/write"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-zinc-900 hover:bg-black text-base font-medium text-white shadow-sm transition duration-150"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Mulai Menulis</span>
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-zinc-900 hover:bg-black text-base font-medium text-white shadow-sm transition duration-150"
                  >
                    <span>Mulai Membaca & Menulis</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Minimalist Graphic Illustration */}
            <div className="hidden lg:flex items-center justify-center w-80 h-80 rounded-full border border-zinc-300 bg-white/60 p-8 text-center">
              <div className="space-y-4">
                <span className="text-6xl font-serif font-bold text-zinc-900">M</span>
                <p className="text-xs font-serif italic text-zinc-500">
                  &ldquo;Tulisan yang baik menemukan jalannya sendiri.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trending / Features Grid Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-10 pb-4 border-b border-zinc-200">
            <Sparkles className="w-4 h-4 text-zinc-900" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
              Mengapa LOKA?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <div className="text-2xl font-serif font-bold text-zinc-400">01</div>
              <h3 className="text-xl font-bold font-serif text-zinc-900">Editor Berbasis Blok</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Tulis artikel dengan kenyamanan maksimal menggunakan rich-text editor intuitif yang mendukung heading, gambar, quote, dan code blocks.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-2xl font-serif font-bold text-zinc-400">02</div>
              <h3 className="text-xl font-bold font-serif text-zinc-900">Fokus Pada Konten</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Tampilan baca yang bersih tanpa gangguan iklan, dilengkapi estimasi waktu baca otomatis dan indikator progres membaca.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-2xl font-serif font-bold text-zinc-400">03</div>
              <h3 className="text-xl font-bold font-serif text-zinc-900">Interaksi Komunitas</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Apresiasi tulisan favorit dengan fitur Clap berkali-kali, ikuti penulis pilihan, serta simpan ke daftar bookmark.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-zinc-900 text-sm">LOKA</span>
            <span>&copy; {new Date().getFullYear()} — Platform Menulis & Membaca</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-zinc-900 transition">Tentang</Link>
            <Link href="/" className="hover:text-zinc-900 transition">Bantuan</Link>
            <Link href="/" className="hover:text-zinc-900 transition">Syarat & Privasi</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
