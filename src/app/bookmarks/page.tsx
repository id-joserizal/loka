import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { ArticleCard } from '@/components/article/article-card'
import { Bookmark, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bookmark Saya | LOKA',
  description: 'Daftar artikel yang kamu simpan di LOKA.',
}

export default async function BookmarksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let currentProfile = null
  const { data } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()
  currentProfile = data

  // Fetch bookmarked articles
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(`
      created_at,
      articles (
        id,
        title,
        slug,
        excerpt,
        cover_image_url,
        reading_time,
        published_at,
        status,
        profiles (
          username,
          full_name,
          avatar_url
        ),
        article_tags (
          tags (
            name,
            slug
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Filter out articles that no longer exist or are unpublished
  const savedArticles = bookmarks
    ?.map((b: any) => b.articles)
    .filter((a: any) => a && a.status === 'published') ?? []

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Navbar user={user} profile={currentProfile} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-200">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-zinc-900">Bookmark Saya</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {savedArticles.length} artikel tersimpan
            </p>
          </div>
        </div>

        {/* Bookmarked Articles */}
        {savedArticles.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {savedArticles.map((art: any) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 text-zinc-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-serif font-bold text-zinc-900">
                Belum ada artikel yang disimpan
              </h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Ketuk ikon <strong>bookmark</strong> di artikel mana pun untuk menyimpannya di sini dan dibaca nanti.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition"
            >
              Temukan Artikel Menarik
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-zinc-900 text-sm">LOKA</span>
            <span>&copy; {new Date().getFullYear()} — Dunia Untuk Semua Cerita</span>
          </div>
          <Link href="/" className="hover:text-zinc-900 transition">
            Kembali ke Beranda
          </Link>
        </div>
      </footer>
    </div>
  )
}
