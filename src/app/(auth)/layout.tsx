import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F4EFEA] text-zinc-900">
      {/* Left Editorial Banner */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-amber-50/50 border-r border-zinc-200">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl font-serif font-bold tracking-tight text-zinc-900 group-hover:text-zinc-700 transition">
              LOKA
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <blockquote className="space-y-4">
            <p className="text-3xl font-serif leading-snug text-zinc-800">
              &ldquo;Setiap orang memiliki cerita. LOKA adalah ruang di mana pikiran mendalam dan tulisan bermakna menemukan pembacanya.&rdquo;
            </p>
            <footer className="text-sm font-medium text-zinc-500">
              — Komunitas Penulis LOKA
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} LOKA Platform. Hak cipta dilindungi.
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 bg-[#F4EFEA]">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-4">
            <Link href="/" className="text-3xl font-serif font-bold text-zinc-900">
              LOKA
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
