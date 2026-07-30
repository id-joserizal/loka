'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  User,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  FileText,
} from 'lucide-react'
import { toggleUserSuspend, updateUserRole, deleteUserByAdmin } from '@/app/actions/admin'

interface UserItem {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  status: 'active' | 'suspended'
  created_at: string
  articleCount: number
}

interface UsersClientProps {
  initialUsers: UserItem[]
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleToggleSuspend = async (user: UserItem) => {
    const actionLabel = user.status === 'suspended' ? 'mengaktifkan kembali' : 'menangguhkan'
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} akun @${user.username}?`)) return

    setLoadingId(user.id)
    try {
      const res = await toggleUserSuspend(user.id, user.status)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: res.newStatus as 'active' | 'suspended' } : u
        )
      )
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status user')
    } finally {
      setLoadingId(null)
    }
  }

  const handleToggleRole = async (user: UserItem) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Apakah Anda yakin ingin mengubah role @${user.username} menjadi ${newRole}?`))
      return

    setLoadingId(user.id)
    try {
      await updateUserRole(user.id, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      )
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah role user')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDeleteUser = async (user: UserItem) => {
    if (
      !confirm(
        `PERINGATAN: Menghapus user @${user.username} akan menghapus seluruh data dan artikel pengguna ini secara permanen!`
      )
    )
      return

    setLoadingId(user.id)
    try {
      await deleteUserByAdmin(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus user')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau @username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Ditangguhkan</option>
          </select>
        </div>
      </div>

      {/* Users List / Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Peran (Role)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Artikel</th>
                <th className="py-3.5 px-4">Bergabung</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs">
                    Tidak ada pengguna yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isLoading = loadingId === user.id
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/60 transition">
                      {/* User Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/profile/${user.username}`}>
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                                {(user.full_name || user.username).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </Link>
                          <div>
                            <Link
                              href={`/profile/${user.username}`}
                              className="font-bold text-zinc-900 hover:underline block leading-snug"
                            >
                              {user.full_name || user.username}
                            </Link>
                            <span className="text-xs text-zinc-400 font-mono">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300/80">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                            User
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {user.status === 'suspended' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <Ban className="w-3 h-3 text-red-600" />
                            Ditangguhkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Aktif
                          </span>
                        )}
                      </td>

                      {/* Article Count */}
                      <td className="py-4 px-4 text-xs font-medium text-zinc-700">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{user.articleCount} artikel</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-xs text-zinc-500 font-mono">
                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                          ) : (
                            <>
                              {/* Suspend / Unsuspend */}
                              <button
                                onClick={() => handleToggleSuspend(user)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                                  user.status === 'suspended'
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                }`}
                                title={
                                  user.status === 'suspended' ? 'Aktifkan Akun' : 'Tangguhkan Akun'
                                }
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>
                                  {user.status === 'suspended' ? 'Aktifkan' : 'Suspend'}
                                </span>
                              </button>

                              {/* Toggle Role */}
                              <button
                                onClick={() => handleToggleRole(user)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition"
                                title={
                                  user.role === 'admin'
                                    ? 'Ubah ke Role User'
                                    : 'Jadikan Admin'
                                }
                              >
                                <Shield className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Hapus User Permanen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
