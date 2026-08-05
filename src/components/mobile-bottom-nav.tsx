'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, SquarePen, Bell, Bookmark } from 'lucide-react'
import { getNotifications } from '@/app/notifications/actions'

interface MobileBottomNavProps {
  user: any
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const loadUnread = async () => {
      try {
        const res = await getNotifications(1)
        if (res && typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount)
        }
      } catch (err) {
        console.error('Error fetching unread count for bottom nav:', err)
      }
    }

    loadUnread()
    const interval = setInterval(loadUnread, 30000)
    return () => clearInterval(interval)
  }, [user])

  const isHomeActive = pathname === '/'
  const isSearchActive = pathname.startsWith('/search')
  const isWriteActive = pathname.startsWith('/write')
  const isNotifActive = pathname.startsWith('/notifications')
  const isBookmarkActive = pathname.startsWith('/bookmarks')

  return (
    <nav
      aria-label="Navigasi bawah mobile"
      className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto sm:hidden select-none"
    >
      {/* Container with SVG Notch Cutout Background */}
      <div className="relative w-full h-[62px] drop-shadow-2xl">
        {/* SVG Curved Dip Background */}
        <svg
          viewBox="0 0 375 62"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full text-zinc-900 fill-current drop-shadow-md"
        >
          <path d="M 24 0 H 135 C 150 0 156 26 187.5 26 C 219 26 225 0 240 0 H 351 Q 375 0 375 24 V 38 Q 375 62 351 62 H 24 Q 0 62 0 38 V 24 Q 0 0 24 0 Z" />
        </svg>

        {/* Center Floating Action Button (Tulis) inside Notch */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 z-20">
          <div className="p-1 rounded-full bg-[#F4EFEA]">
            <Link
              href="/write"
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                isWriteActive
                  ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                  : 'bg-zinc-900 hover:bg-black text-white border border-zinc-700/60'
              }`}
              title="Tulis Artikel"
            >
              <SquarePen className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* 5-Column Navigation Grid */}
        <div className="relative z-10 grid grid-cols-5 h-full items-center text-center px-1">
          {/* 1. Beranda */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              isHomeActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5px] text-amber-400' : 'stroke-[1.75px]'}`} />
            <span className={`text-[10px] font-medium ${isHomeActive ? 'text-amber-400 font-bold' : ''}`}>
              Beranda
            </span>
          </Link>

          {/* 2. Cari */}
          <Link
            href="/search"
            className={`flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              isSearchActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className={`w-5 h-5 ${isSearchActive ? 'stroke-[2.5px] text-amber-400' : 'stroke-[1.75px]'}`} />
            <span className={`text-[10px] font-medium ${isSearchActive ? 'text-amber-400 font-bold' : ''}`}>
              Cari
            </span>
          </Link>

          {/* 3. Empty Center Slot (For FAB) */}
          <div className="flex flex-col items-center justify-end pb-1.5">
            <span className={`text-[10px] font-semibold transition ${
              isWriteActive ? 'text-amber-400' : 'text-zinc-400'
            }`}>
              Tulis
            </span>
          </div>

          {/* 4. Notifikasi */}
          <Link
            href={user ? '/notifications' : '/login'}
            className={`relative flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              isNotifActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Bell className={`w-5 h-5 ${isNotifActive ? 'stroke-[2.5px] text-amber-400' : 'stroke-[1.75px]'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[1.125rem] h-4 px-1 rounded-full bg-red-600 text-white font-bold text-[9px] ring-2 ring-zinc-900">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isNotifActive ? 'text-amber-400 font-bold' : ''}`}>
              Notif
            </span>
          </Link>

          {/* 5. Bookmark */}
          <Link
            href={user ? '/bookmarks' : '/login'}
            className={`flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              isBookmarkActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarkActive ? 'stroke-[2.5px] text-amber-400' : 'stroke-[1.75px]'}`} />
            <span className={`text-[10px] font-medium ${isBookmarkActive ? 'text-amber-400 font-bold' : ''}`}>
              Bookmark
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
