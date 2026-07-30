'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react'

interface AdminSidebarProps {
  pendingReportsCount?: number
}

export function AdminSidebar({ pendingReportsCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Ringkasan & Statistik',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Manajemen User',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'Manajemen Artikel',
      href: '/admin/articles',
      icon: FileText,
    },
    {
      name: 'Antrian Laporan',
      href: '/admin/reports',
      icon: Flag,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
    },
  ]

  return (
    <aside className="w-full md:w-64 bg-[#F4EFEA] border-b md:border-b-0 md:border-r border-zinc-200/80 p-4 sm:p-6 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold font-serif text-sm">
              L
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg text-zinc-900 tracking-tight block leading-none">
                LOKA
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1 mt-0.5">
                <ShieldAlert className="w-3 h-3 text-amber-600" /> Admin Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive
                        ? 'bg-amber-400 text-zinc-950'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Back Link */}
      <div className="pt-6 border-t border-zinc-200/80 mt-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition px-2 py-1.5 rounded-lg hover:bg-zinc-200/50"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
          <span>Kembali ke Situs Utama</span>
        </Link>
      </div>
    </aside>
  )
}
