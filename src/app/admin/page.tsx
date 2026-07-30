import { getAdminStats } from '@/app/actions/admin'
import Link from 'next/link'
import {
  Users,
  FileText,
  MessageSquare,
  ThumbsUp,
  Flag,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full w-fit mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Moderation Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-zinc-900 tracking-tight">
            Dashboard Statistik & Moderasi
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Ringkasan data pengguna, konten artikel, aktivitas sosial, dan status laporan komunitas.
          </p>
        </div>
      </div>

      {/* Pending Reports Alert if any */}
      {stats.pendingReports > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-base">
                {stats.pendingReports} Laporan Perlu Ditinjau
              </h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                Ada laporan pengguna yang membutuhkan perhatian admin.
              </p>
            </div>
          </div>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-xs font-semibold text-white transition shrink-0"
          >
            <span>Tinjau Laporan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Primary Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Users */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Pengguna
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-serif text-zinc-900">
              {stats.totalUsers.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Akun terdaftar di platform</p>
          </div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 pt-2"
          >
            <span>Kelola Pengguna</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Articles */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Artikel
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-serif text-zinc-900">
              {stats.totalArticles.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
              <span className="text-emerald-700 font-semibold">{stats.publishedArticles} Publik</span>
              <span>•</span>
              <span>{stats.draftArticles} Draft</span>
            </div>
          </div>
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 pt-2"
          >
            <span>Kelola Artikel</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Comments */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Komentar
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-serif text-zinc-900">
              {stats.totalComments.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Interaksi di artikel</p>
          </div>
        </div>

        {/* Total Claps */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Apresiasi / Claps
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-serif text-zinc-900">
              {stats.totalClaps.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Total tepukan apresiasi</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link
          href="/admin/users"
          className="group p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:shadow-md transition space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-xl text-zinc-900 group-hover:text-amber-700 transition">
            Manajemen User
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Lihat daftar seluruh pengguna terdaftar, tangguhkan (suspend) akun yang melanggar, ubah role admin, atau hapus profil.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 pt-2 group-hover:translate-x-1 transition">
            <span>Buka Manajemen User</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/articles"
          className="group p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:shadow-md transition space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-xl text-zinc-900 group-hover:text-amber-700 transition">
            Manajemen Artikel
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Moderasi publikasi artikel platform, unpublish artikel dari halaman publik, atau hapus artikel yang melanggar pedoman.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 pt-2 group-hover:translate-x-1 transition">
            <span>Buka Manajemen Artikel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="group p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:shadow-md transition space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
            <Flag className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-xl text-zinc-900 group-hover:text-amber-700 transition">
            Antrian Laporan
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Tinjau laporan spam, ujaran kebencian, atau konten yang tidak layak yang dilaporkan oleh sesama pengguna platform.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 pt-2 group-hover:translate-x-1 transition">
            <span>Buka Antrian Laporan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  )
}
