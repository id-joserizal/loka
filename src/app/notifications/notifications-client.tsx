'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Bell,
  Check,
  ArrowBigUp,
  MessageSquare,
  UserPlus,
  CornerDownRight,
  CornerUpRight,
  Inbox,
} from 'lucide-react'
import { markNotificationAsRead, markAllNotificationsAsRead } from './actions'

interface NotificationsClientProps {
  initialNotifications: any[]
  initialUnreadCount: number
}

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isPending, startTransition] = useTransition()

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

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    return true
  })

  const renderIcon = (type: string) => {
    switch (type) {
      case 'upvote':
        return <ArrowBigUp className="w-4 h-4 text-emerald-600 fill-emerald-600" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-600" />
      case 'reply':
        return <CornerDownRight className="w-4 h-4 text-indigo-600" />
      case 'response':
        return <CornerUpRight className="w-4 h-4 text-purple-600" />
      case 'follow':
        return <UserPlus className="w-4 h-4 text-amber-600" />
      default:
        return <Bell className="w-4 h-4 text-zinc-500" />
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
            {articleTitle && <span className="font-serif italic text-zinc-800 font-medium">"{articleTitle}"</span>}
          </>
        )
      case 'comment':
        return (
          <>
            <strong className="text-zinc-900 font-semibold">{actorName}</strong> mengomentari artikel Anda{' '}
            {articleTitle && <span className="font-serif italic text-zinc-800 font-medium">"{articleTitle}"</span>}
          </>
        )
      case 'reply':
        return (
          <>
            <strong className="text-zinc-900 font-semibold">{actorName}</strong> membalas komentar Anda pada{' '}
            {articleTitle && <span className="font-serif italic text-zinc-800 font-medium">"{articleTitle}"</span>}
          </>
        )
      case 'response':
        return (
          <>
            <strong className="text-zinc-900 font-semibold">{actorName}</strong> menanggapi {item.comment_id ? 'komentar' : 'tulisan'} Anda dengan artikel:{' '}
            {articleTitle && <span className="font-serif italic text-zinc-800 font-medium">"{articleTitle}"</span>}
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
    return '#'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
            Notifikasi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Aktivitas terbaru pembaca dan penulis yang berinteraksi dengan cerita kamu.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-xs self-start sm:self-auto"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-zinc-900 text-white'
              : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'unread'
              ? 'bg-zinc-900 text-white'
              : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Belum Dibaca ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden divide-y divide-zinc-100 shadow-sm">
        {filtered && filtered.length > 0 ? (
          filtered.map((item) => (
            <Link
              key={item.id}
              href={getTargetUrl(item)}
              onClick={() => {
                if (!item.read) markNotificationAsRead(item.id)
              }}
              className={`flex items-start gap-4 p-5 transition text-sm hover:bg-zinc-50/80 ${
                !item.read ? 'bg-amber-50/30' : ''
              }`}
            >
              <div className="relative shrink-0">
                {item.actor?.avatar_url ? (
                  <img
                    src={item.actor.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                    {(item.actor?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-xs border border-zinc-200">
                  {renderIcon(item.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-zinc-800 leading-snug">{renderMessage(item)}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {!item.read && (
                <button
                  type="button"
                  onClick={(e) => handleMarkAsRead(item.id, e)}
                  className="shrink-0 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
                  title="Tandai dibaca"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                </button>
              )}
            </Link>
          ))
        ) : (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-zinc-900 text-base">Tidak ada notifikasi</h3>
            <p className="text-xs text-zinc-500">
              {filter === 'unread'
                ? 'Semua notifikasi kamu sudah dibaca.'
                : 'Belum ada notifikasi aktivitas terbaru.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
