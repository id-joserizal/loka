'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6 bg-white border border-zinc-200 p-8 rounded-3xl shadow-xl">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-zinc-900">
            Terjadi Kesalahan
          </h1>
          <p className="text-xs text-zinc-600 font-serif leading-relaxed">
            Maaf, kami mengalami kendala saat memproses halaman ini. Silakan coba lagi atau kembali ke beranda.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
