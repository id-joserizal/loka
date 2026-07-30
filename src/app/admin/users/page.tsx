import { getAdminUsers } from '@/app/actions/admin'
import { UsersClient } from './users-client'
import { Users, AlertTriangle } from 'lucide-react'

export const revalidate = 0

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof getAdminUsers>> = []
  let errorMessage: string | null = null

  try {
    users = await getAdminUsers()
  } catch (err: any) {
    errorMessage = err.message || 'Terjadi kesalahan saat memuat data pengguna.'
  }

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

      {errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold text-sm">Gagal memuat data pengguna</p>
            <p className="text-xs text-red-700 font-mono break-all">{errorMessage}</p>
            <div className="mt-3 p-3 bg-red-100/60 rounded-xl text-xs text-red-800 space-y-1">
              <p className="font-semibold">💡 Kemungkinan penyebab:</p>
              <p>Kolom <code className="bg-red-200 px-1 rounded">role</code>, <code className="bg-red-200 px-1 rounded">status</code>, atau <code className="bg-red-200 px-1 rounded">badge</code> belum ada di database.</p>
              <p className="mt-1 font-semibold">Solusi: Jalankan migration SQL berikut di Supabase Dashboard → SQL Editor:</p>
              <ul className="list-disc list-inside space-y-0.5 mt-1">
                <li><code className="bg-red-200 px-1 rounded">supabase/migrations/002_admin_and_reports.sql</code></li>
                <li><code className="bg-red-200 px-1 rounded">supabase/migrations/003_badges.sql</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <UsersClient initialUsers={users} />
    </div>
  )
}
