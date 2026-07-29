'use client'

import { useState, useTransition, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login, loginWithGoogle } from '../actions'
import { LogIn, ArrowRight, Loader2 } from 'lucide-react'

type SearchParams = Promise<{ redirectTo?: string; error?: string }>

export default function LoginPage(props: { searchParams: SearchParams }) {
  const searchParams = use(props.searchParams)
  const [errorMessage, setErrorMessage] = useState<string | null>(searchParams.error || null)
  const [isPending, startTransition] = useTransition()
  const [isGooglePending, startGoogleTransition] = useTransition()
  const router = useRouter()

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await login(formData)
      if (res?.error) {
        setErrorMessage(res.error)
      } else {
        router.refresh()
      }
    })
  }

  const handleGoogleLogin = () => {
    setErrorMessage(null)
    startGoogleTransition(async () => {
      const res = await loginWithGoogle()
      if (res?.error) {
        setErrorMessage(res.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-white">Selamat Datang Kembali</h1>
        <p className="text-sm text-zinc-400">
          Masuk ke akun LOKA kamu untuk melanjutkan membaca dan menulis.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGooglePending || isPending}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-sm font-medium text-zinc-200 hover:text-white transition duration-200 disabled:opacity-50"
      >
        {isGooglePending ? (
          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Lanjutkan dengan Google</span>
      </button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-zinc-800 w-full" />
        <span className="bg-zinc-950 px-3 text-xs uppercase tracking-wider text-zinc-500 font-medium">atau</span>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input type="hidden" name="redirectTo" value={searchParams.redirectTo || '/'} />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="nama@email.com"
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300">Password</label>
          </div>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || isGooglePending}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-400">
        Belum punya akun?{' '}
        <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
          Daftar sekarang
        </Link>
      </p>
    </div>
  )
}
