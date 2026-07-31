import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { DashboardClient, type DashboardArticle } from './dashboard-client'
import { SquarePen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard Penulis',
  description: 'Kelola artikel, lihat statistik, dan kelola kontenmu di LOKA.',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch all articles by this author with stat counts
  const { data: rawArticles } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      status,
      published_at,
      created_at,
      reading_time
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  if (!rawArticles || rawArticles.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col">
        <Navbar user={user} profile={profile} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 sm:py-16">
          <DashboardHeader profile={profile} />
          <DashboardClient articles={[]} totalClaps={0} totalComments={0} />
        </main>
      </div>
    )
  }

  const articleIds = rawArticles.map((a) => a.id)

  // Fetch clap totals per article
  const { data: clapsData } = await supabase
    .from('claps')
    .select('article_id, count')
    .in('article_id', articleIds)

  // Aggregate clap counts per article
  const clapsByArticle: Record<string, number> = {}
  clapsData?.forEach((c) => {
    clapsByArticle[c.article_id] = (clapsByArticle[c.article_id] || 0) + c.count
  })

  // Fetch comment counts per article
  const { data: commentsData } = await supabase
    .from('comments')
    .select('article_id')
    .in('article_id', articleIds)

  const commentsByArticle: Record<string, number> = {}
  commentsData?.forEach((c) => {
    commentsByArticle[c.article_id] = (commentsByArticle[c.article_id] || 0) + 1
  })

  // Combine into DashboardArticle shape
  const articles: DashboardArticle[] = rawArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status as 'draft' | 'published',
    published_at: a.published_at,
    created_at: a.created_at,
    reading_time: a.reading_time,
    clap_count: clapsByArticle[a.id] || 0,
    comment_count: commentsByArticle[a.id] || 0,
  }))

  const totalClaps = Object.values(clapsByArticle).reduce((a, b) => a + b, 0)
  const totalComments = Object.values(commentsByArticle).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col">
      <Navbar user={user} profile={profile} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 sm:py-16">
        <DashboardHeader profile={profile} />
        <DashboardClient
          articles={articles}
          totalClaps={totalClaps}
          totalComments={totalComments}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-[#F4EFEA] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-zinc-900 text-sm">LOKA</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <Link href="/" className="hover:text-zinc-900 transition">Kembali ke Beranda</Link>
        </div>
      </footer>
    </div>
  )
}

function DashboardHeader({ profile }: { profile: any }) {
  const displayName = profile?.full_name || profile?.username || 'Penulis'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
          Dashboard Penulis
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Selamat datang, <strong className="text-zinc-700">{displayName}</strong>
        </p>
      </div>
      <Link
        href="/write"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition shadow-sm self-start sm:self-auto"
      >
        <SquarePen className="w-4 h-4" />
        <span>Tulis Artikel Baru</span>
      </Link>
    </div>
  )
}
