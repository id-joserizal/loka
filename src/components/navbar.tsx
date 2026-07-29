'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/(auth)/actions'
import { PenSquare, LayoutDashboard, Settings, LogOut, User as UserIcon, Search, Menu, X } from 'lucide-react'

interface NavbarProps {
  user: User | null
  profile?: {
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
  } | null
}

export function Navbar({ user, profile }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Penulis'
  const username = profile?.username || user?.email?.split('@')[0] || 'user'
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Search */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-300 bg-clip-text text-transparent group-hover:opacity-90 transition">
              LOKA
            </span>
          </Link>

          {/* Search bar desktop */}
          <div className="hidden md:flex items-center relative w-64 lg:w-80">
            <Search className="w-4 h-4 absolute left-3 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari artikel, tag, atau penulis..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/write"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition duration-150"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Tulis Artikel</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-indigo-500/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-50 divide-y divide-zinc-800/60">
                      <div className="px-3 py-2.5">
                        <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-zinc-400 truncate">@{username}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href={`/profile/${username}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition"
                        >
                          <UserIcon className="w-4 h-4 text-zinc-400" />
                          <span>Profil Saya</span>
                        </Link>

                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                          <span>Dashboard Penulis</span>
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition"
                        >
                          <Settings className="w-4 h-4 text-zinc-400" />
                          <span>Pengaturan</span>
                        </Link>
                      </div>

                      <div className="pt-1">
                        <form action={signOut}>
                          <button
                            type="submit"
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition duration-150"
              >
                Mulai Menulis
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-zinc-800 bg-zinc-950 p-4 space-y-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari artikel, tag, atau penulis..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500"
            />
          </div>

          {user ? (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center font-bold text-xs text-indigo-300">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{displayName}</p>
                  <p className="text-[10px] text-zinc-400">@{username}</p>
                </div>
              </div>

              <Link
                href="/write"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-semibold text-indigo-400"
              >
                + Tulis Artikel Baru
              </Link>
              <Link
                href={`/profile/${username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs text-zinc-300"
              >
                Profil Saya
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs text-zinc-300"
              >
                Dashboard Penulis
              </Link>
              <form action={signOut}>
                <button type="submit" className="block w-full text-left py-2 text-xs text-red-400">
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-zinc-900 text-xs font-medium text-zinc-200"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white"
              >
                Daftar Akun
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
