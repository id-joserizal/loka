import { getAdminReports } from '@/app/actions/admin'
import { ReportsClient } from './reports-client'
import { Flag } from 'lucide-react'

export const revalidate = 0

export default async function AdminReportsPage() {
  const reports = await getAdminReports()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
            <Flag className="w-3.5 h-3.5" /> Antrian Moderasi Komunitas
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-zinc-900 tracking-tight">
            Antrian Laporan
          </h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            Tinjau dan proses laporan pengguna terhadap artikel, komentar, atau pengguna yang melanggar ketentuan.
          </p>
        </div>
      </div>

      <ReportsClient initialReports={reports} />
    </div>
  )
}
