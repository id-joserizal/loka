import { getAdminUsers } from '@/app/actions/admin'
import { UsersClient } from './users-client'
import { Users } from 'lucide-react'

export const revalidate = 0

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
            <Users className="w-3.5 h-3.5" /> Moderasi Pengguna
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-zinc-900 tracking-tight">
            Manajemen User
          </h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            Daftar seluruh akun terdaftar, status penangguhan, dan hak akses admin.
          </p>
        </div>
      </div>

      <UsersClient initialUsers={users} />
    </div>
  )
}
