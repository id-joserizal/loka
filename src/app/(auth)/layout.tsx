import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-zinc-950 text-zinc-100">
      {/* Left Banner */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-zinc-900 to-black border-r border-zinc-800/80 overflow-hidden">
        {/* Glow Ambient background */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-300 bg-clip-text text-transparent">
              LOKA
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Cerita Untuk Semua
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <blockquote className="space-y-3">
            <p className="text-2xl font-serif italic text-zinc-200 leading-relaxed">
              &ldquo;Kata-kata memiliki kekuatan untuk menggerakkan pikiran, menginspirasi perubahan, dan membuka dunia baru.&rdquo;
            </p>
            <footer className="text-sm font-medium text-indigo-400">
              — Komunitas Penulis LOKA
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} LOKA Platform. Hak cipta dilindungi.
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-6">
            <Link href="/" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              LOKA
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
