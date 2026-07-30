import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ArticleCard } from '@/components/article/article-card'
import { Tag } from 'lucide-react'

interface TagPageProps {
  params: Promise<{ slug: string }>
}

export default async function TagPage(props: TagPageProps) {
  const { slug } = await props.params
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

  // Fetch target tag
  const { data: tag } = await supabase
    .from('tags')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!tag) {
    notFound()
  }

  // Fetch articles associated with this tag
  const { data: articleTagRelations } = await supabase
    .from('article_tags')
    .select(`
      articles (
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
      )
    `)
    .eq('tag_id', tag.id)

  const articles = articleTagRelations
    ? articleTagRelations
        .map((r: any) => r.articles)
        .filter((a: any) => a && a.status === 'published')
    : []

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col">
      <Navbar user={user} profile={currentProfile} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        {/* Tag Header */}
        <div className="flex items-center gap-3 pb-8 border-b border-zinc-200 mb-8">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-zinc-900">
              #{tag.name}
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              {articles.length} artikel dengan topik ini
            </p>
          </div>
        </div>

        {/* Articles List */}
        {articles.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {articles.map((art: any) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <p className="text-zinc-500 font-serif">Belum ada artikel dipublikasikan di topik ini.</p>
          </div>
        )}
      </main>
    </div>
  )
}
