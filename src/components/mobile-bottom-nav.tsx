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

  // Don't hide bottom nav even for guests, but adjust write/notif links or behavior
  const navItems = [
    {
      label: 'Beranda',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Cari',
      href: '/search',
      icon: Search,
      isActive: pathname.startsWith('/search'),
    },
    {
      label: 'Tulis',
      href: '/write',
      icon: SquarePen,
      isActive: pathname.startsWith('/write'),
      isHighlight: true,
    },
    {
      label: 'Notifikasi',
      href: user ? '/notifications' : '/login',
      icon: Bell,
      isActive: pathname.startsWith('/notifications'),
      badge: unreadCount,
    },
    {
      label: 'Bookmark',
      href: user ? '/bookmarks' : '/login',
      icon: Bookmark,
      isActive: pathname.startsWith('/bookmarks'),
    },
  ]

  return (
    <nav aria-label="Navigasi bawah mobile" className="fixed bottom-0 left-0 right-0 z-40 bg-[#F4EFEA]/95 backdrop-blur-md border-t border-zinc-200/90 sm:hidden shadow-lg">
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          if (item.isHighlight) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center group"
              >
                <div className={`p-2 rounded-full transition-transform active:scale-95 ${
                  active ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-900 text-white hover:bg-black'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition active:scale-95 ${
                active ? 'text-zinc-900 font-bold' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[1.125rem] h-4 px-1 rounded-full bg-red-600 text-white font-bold text-[9px] ring-2 ring-[#F4EFEA]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
