'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/(auth)/actions'
import { SquarePen, LayoutDashboard, Settings, LogOut, User as UserIcon, Search, Bookmark, ShieldAlert, Bell } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { BadgeIcon } from '@/components/ui/badge-icon'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

interface NavbarProps {
  user: User | null
  profile?: {
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
    role?: string | null
    badge?: string | null
  } | null
}

export function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Penulis'
  const username = profile?.username || user?.email?.split('@')[0] || 'user'
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const badge = profile?.badge || null

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/90 bg-zinc-900/95 backdrop-blur-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Search */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-3xl font-serif font-black tracking-tight text-white group-hover:text-zinc-300 transition">
                LOKA
              </span>
            </Link>

            {/* Search bar desktop */}
            <form action="/search" method="GET" onSubmit={handleSearch} className="hidden md:flex items-center relative w-64 lg:w-80">
              <Search className="w-4 h-4 absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel, tag, atau penulis..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-sm text-white placeholder-zinc-400 focus:outline-none focus:bg-zinc-800 focus:border-zinc-500 transition"
              />
            </form>
          </div>

          {/* Right side actions — desktop */}
          <div className="hidden sm:flex items-center gap-5">
            {user ? (
              <>
                <Link
                  href="/write"
                  className="flex items-center gap-2 text-sm sm:text-base font-medium text-zinc-300 hover:text-white transition"
                >
                  <SquarePen className="w-5 h-5" />
                  <span>Tulis</span>
                </Link>

                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-zinc-600 transition relative"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover border border-zinc-700" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {badge && (
                      <span className="absolute -bottom-0.5 -right-0.5">
                        <BadgeIcon badge={badge} size="sm" />
                      </span>
                    )}
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-zinc-200 shadow-xl p-2 z-50 divide-y divide-zinc-100">
                        <div className="px-3.5 py-3">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-zinc-900 truncate">{displayName}</p>
                            <BadgeIcon badge={badge} size="sm" />
                          </div>
                          <p className="text-xs text-zinc-400 truncate">@{username}</p>
                        </div>

                        <div className="py-1.5 space-y-0.5">
                          <Link
                            href={`/profile/${username}`}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                          >
                            <UserIcon className="w-4 h-4 text-zinc-400" />
                            <span>Profil Saya</span>
                          </Link>

                          <Link
                            href="/bookmarks"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                          >
                            <Bookmark className="w-4 h-4 text-zinc-400" />
                            <span>Bookmark Saya</span>
                          </Link>

                          <Link
                            href="/notifications"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                          >
                            <Bell className="w-4 h-4 text-zinc-400" />
                            <span>Notifikasi</span>
                          </Link>

                          {profile?.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-amber-900 bg-amber-100/60 hover:bg-amber-100 rounded-xl transition border border-amber-200/80"
                            >
                              <ShieldAlert className="w-4 h-4 text-amber-700" />
                              <span>Portal Admin</span>
                            </Link>
                          )}

                          <Link
                            href="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                            <span>Dashboard Penulis</span>
                          </Link>

                          <Link
                            href="/settings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                          >
                            <Settings className="w-4 h-4 text-zinc-400" />
                            <span>Pengaturan</span>
                          </Link>
                        </div>

                        <div className="pt-1.5">
                          <form action={signOut}>
                            <button
                              type="submit"
                              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition text-left"
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
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm sm:text-base font-medium text-zinc-300 hover:text-white transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-sm font-medium text-zinc-900 shadow-sm transition duration-150"
                >
                  Mulai Menulis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right — small round profile photo with badge (or login link if guest) */}
          <div className="flex sm:hidden items-center gap-2">
            {user ? (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative p-0.5 rounded-full ring-1 ring-zinc-700 active:scale-95 transition"
                aria-label="Menu pengguna"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-xs border border-zinc-700">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                {badge && (
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <BadgeIcon badge={badge} size="sm" />
                  </span>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-full bg-white text-xs font-semibold text-zinc-900 shadow-xs hover:bg-zinc-100"
                >
                  Mulai
                </Link>
              </div>
            )}
          </div>
        </div>


        {/* Mobile menu dropdown drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-zinc-200 bg-white shadow-lg">
            {user ? (
              <div className="px-4 py-3 space-y-1">
                {/* User identity with badge */}
                <div className="flex items-center gap-3 py-2 border-b border-zinc-100">
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-zinc-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-sm text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {badge && (
                      <span className="absolute -bottom-0.5 -right-0.5">
                        <BadgeIcon badge={badge} size="sm" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-zinc-900 truncate">{displayName}</p>
                      <BadgeIcon badge={badge} size="sm" />
                    </div>
                    <p className="text-xs text-zinc-400 truncate">@{username}</p>
                  </div>
                </div>

                {/* Menu items */}
                <Link
                  href={`/profile/${username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                >
                  <UserIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Profil Saya</span>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Dashboard Penulis</span>
                </Link>

                <Link
                  href="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                >
                  <Bookmark className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Bookmark Saya</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-xl transition"
                >
                  <Settings className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Pengaturan</span>
                </Link>

                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Portal Admin</span>
                  </Link>
                )}

                <div className="pt-1 border-t border-zinc-100">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Keluar</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav user={user} />
    </>
  )
}

