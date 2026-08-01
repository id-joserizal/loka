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
  Eye,
  TrendingUp,
  BarChart3,
  UserPlus,
  Newspaper,
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
            Dashboard Statistik &amp; Moderasi
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
            {stats.newUsersThisWeek > 0 && (
              <p className="text-xs text-blue-600 font-semibold mt-0.5">
                +{stats.newUsersThisWeek} minggu ini
              </p>
            )}
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
            {stats.newArticlesThisWeek > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                +{stats.newArticlesThisWeek} tayang minggu ini
              </p>
            )}
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

      {/* Visitor Statistics Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-zinc-700" />
          <h2 className="text-lg font-serif font-bold text-zinc-900">Statistik Pengunjung</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Page Views */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                Total Kunjungan
              </span>
              <div className="p-2.5 rounded-xl bg-white/20">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold font-serif">
                {stats.totalPageViews.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-indigo-200 mt-1">Total page views sepanjang waktu</p>
            </div>
          </div>

          {/* Views This Week */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                Minggu Ini
              </span>
              <div className="p-2.5 rounded-xl bg-white/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold font-serif">
                {stats.viewsThisWeek.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-violet-200 mt-1">Kunjungan 7 hari terakhir</p>
            </div>
          </div>

          {/* Activity Highlights */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Aktivitas Minggu Ini
              </span>
              <div className="p-2.5 rounded-xl bg-zinc-50 text-zinc-600">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">
                    +{stats.newUsersThisWeek.toLocaleString('id-ID')} pengguna baru
                  </div>
                  <div className="text-xs text-zinc-500">Daftar 7 hari terakhir</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Newspaper className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">
                    +{stats.newArticlesThisWeek.toLocaleString('id-ID')} artikel tayang
                  </div>
                  <div className="text-xs text-zinc-500">Dipublikasi 7 hari terakhir</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Articles by Views */}
      {stats.topArticles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-zinc-700" />
            <h2 className="text-lg font-serif font-bold text-zinc-900">Artikel Paling Banyak Dikunjungi</h2>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="divide-y divide-zinc-100">
              {stats.topArticles.map((article, idx) => (
                <div key={article.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition">
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${
                      idx === 0
                        ? 'bg-amber-400 text-white'
                        : idx === 1
                        ? 'bg-zinc-400 text-white'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Cover thumbnail */}
                  {article.coverUrl ? (
                    <img
                      src={article.coverUrl}
                      alt={article.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 shrink-0 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}

                  {/* Article info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/articles/${article.slug}`}
                      target="_blank"
                      className="font-semibold text-sm text-zinc-900 hover:text-amber-700 transition line-clamp-1"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-0.5">oleh {article.authorName}</p>
                  </div>

                  {/* View count */}
                  <div className="flex items-center gap-1.5 shrink-0 text-indigo-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-bold">{article.views.toLocaleString('id-ID')}</span>
                    <span className="text-xs text-zinc-400">views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
