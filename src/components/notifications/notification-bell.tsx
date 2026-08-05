'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  Bell,
  Check,
  ArrowBigUp,
  MessageSquare,
  UserPlus,
  CornerDownRight,
  ExternalLink,
} from 'lucide-react'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/app/notifications/actions'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPending, startTransition] = useTransition()

  const loadNotifications = async () => {
    const res = await getNotifications(7)
    setNotifications(res.notifications)
    setUnreadCount(res.unreadCount)
  }

  useEffect(() => {
    loadNotifications()
    // Poll every 30 seconds for unread notifications
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    })
  }

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    })
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case 'upvote':
        return <ArrowBigUp className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
      case 'reply':
        return <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-amber-600" />
      default:
        return <Bell className="w-3.5 h-3.5 text-zinc-500" />
    }
  }

  const renderMessage = (item: any) => {
    const actorName = item.actor?.full_name || item.actor?.username || 'Seseorang'
    const articleTitle = item.articles?.title

    switch (item.type) {
      case 'upvote':
        return (
          <>
            <strong className="text-zinc-900 font-semibold">{actorName}</strong> meng-upvote artikel Anda{' '}
            {articleTitle && <span className="font-serif italic text-zinc-700">"{articleTitle}"</span>}
          </>
        )
      case 'comment':
        return (
          <>
            <strong className="text-zinc-900 font-semibold">{actorName}</strong> mengomentari artikel Anda{' '}
            {articleTitle && <span className="font-serif italic text-zinc-700">"{articleTitle}"</span>}
          </>
        )
      case 'reply':
        return (
          <>
            <strong className="text-zinc-900 font-semibold">{actorName}</strong> membalas komentar Anda di{' '}
            {articleTitle && <span className="font-serif italic text-zinc-700">"{articleTitle}"</span>}
          </>
        )
      case 'follow':
        return (
          <>
            <strong className="text-zinc-900 font-semibold">{actorName}</strong> mulai mengikuti Anda.
          </>
        )
      default:
        return <span>Notifikasi baru</span>
    }
  }

  const getTargetUrl = (item: any) => {
    if (item.articles?.slug) {
      return `/article/${item.articles.slug}`
    }
    if (item.actor?.username) {
      return `/profile/${item.actor.username}`
    }
    return '/notifications'
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open)
          if (!open) loadNotifications()
        }}
        className="relative p-2 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1.125rem] h-4 px-1 rounded-full bg-red-600 text-white font-bold text-[10px] ring-2 ring-zinc-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] rounded-2xl bg-white border border-zinc-200 shadow-xl z-50 overflow-hidden divide-y divide-zinc-100">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-zinc-900">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    {unreadCount} baru
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tandai dibaca</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
              {notifications && notifications.length > 0 ? (
                notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={getTargetUrl(item)}
                    onClick={() => {
                      if (!item.read) markNotificationAsRead(item.id)
                      setOpen(false)
                    }}
                    className={`flex items-start gap-3 p-3.5 transition text-xs hover:bg-zinc-50/80 ${
                      !item.read ? 'bg-amber-50/40 font-normal' : ''
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      {item.actor?.avatar_url ? (
                        <img
                          src={item.actor.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                          {(item.actor?.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white shadow-xs border border-zinc-200">
                        {renderIcon(item.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-zinc-700 leading-snug line-clamp-2">
                        {renderMessage(item)}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        className="shrink-0 p-1 text-zinc-300 hover:text-zinc-600 rounded-full"
                        title="Tandai dibaca"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      </button>
                    )}
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400 space-y-1">
                  <p className="font-serif">Belum ada notifikasi baru.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 text-center bg-zinc-50/50">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-800 hover:text-zinc-900 hover:underline"
              >
                <span>Lihat Semua Notifikasi</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
