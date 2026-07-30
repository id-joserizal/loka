import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { ArticleCard } from '@/components/article/article-card'
import { Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage(props: SearchPageProps) {
  const { q = '' } = await props.searchParams
  const query = q.trim()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentProfile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    currentProfile = data
  }

  let articles: any[] = []

  if (query) {
    const { data } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image_url,
        reading_time,
        published_at,
        status,
        profiles:author_id (
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
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('published_at', { ascending: false })

    articles = data || []
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Navbar user={user} profile={currentProfile} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        {/* Search Bar Input */}
        <form action="/search" method="GET" className="mb-10">
          <div className="relative">
            <Search className="w-6 h-6 absolute left-4 top-4 text-zinc-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari artikel berdasarkan judul, topik, atau isi..."
              className="w-full pl-14 pr-4 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition shadow-sm font-serif"
            />
          </div>
        </form>

        {/* Results Info */}
        <div className="pb-4 border-b border-zinc-200 mb-6 flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold text-zinc-900">
            {query ? `Hasil Pencarian: "${query}"` : 'Pencarian Artikel'}
          </h1>
          <span className="text-xs font-semibold text-zinc-500">
            {articles.length} hasil ditemukan
          </span>
        </div>

        {/* Results List */}
        {articles.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {articles.map((art: any) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-base font-serif font-bold text-zinc-900">Tidak ada artikel ditemukan</p>
            <p className="text-xs text-zinc-500">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="text-center py-16 text-xs text-zinc-400">
            Ketik kata kunci di atas untuk mencari artikel.
          </div>
        )}
      </main>
    </div>
  )
}
