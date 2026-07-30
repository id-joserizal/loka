import { getAdminArticles } from '@/app/actions/admin'
import { ArticlesClient } from './articles-client'
import { FileText } from 'lucide-react'

export const revalidate = 0

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
            <FileText className="w-3.5 h-3.5" /> Moderasi Konten
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-zinc-900 tracking-tight">
            Manajemen Artikel
          </h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            Kelola publikasi seluruh artikel di platform LOKA, unpublish, atau hapus konten yang melanggar.
          </p>
        </div>
      </div>

      <ArticlesClient initialArticles={articles} />
    </div>
  )
}
