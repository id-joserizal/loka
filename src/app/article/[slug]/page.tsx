import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { ReadingProgressBar } from '@/components/article/reading-progress-bar'
import { TiptapRenderer } from '@/components/article/tiptap-renderer'
import { ArticleCard } from '@/components/article/article-card'
import { ClapButton } from '@/components/social/clap-button'
import { BookmarkButton } from '@/components/social/bookmark-button'
import { FollowButton } from '@/components/social/follow-button'
import { ShareButton } from '@/components/social/share-button'
import { CommentsSection } from '@/components/social/comments-section'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: ArticlePageProps): Promise<Metadata> {
  const { slug } = await props.params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image_url, profiles(full_name)')
    .eq('slug', slug)
    .single()

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan — LOKA',
    }
  }

  const authorName = (article.profiles as any)?.full_name || 'Penulis LOKA'

  return {
    title: `${article.title} — ${authorName} | LOKA`,
    description: article.excerpt || `Baca artikel "${article.title}" oleh ${authorName} di LOKA.`,
    openGraph: {
      title: article.title,
      description: article.excerpt || `Baca artikel "${article.title}" di LOKA.`,
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : [],
    },
  }
}

export default async function ArticleDetailPage(props: ArticlePageProps) {
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

  // Fetch article with profile & tags
  const { data: article } = await supabase
    .from('articles')
    .select(`
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url,
        bio
      ),
      article_tags (
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) {
    notFound()
  }

  const author = article.profiles as any
  const authorName = author?.full_name || author?.username || 'Penulis'
  const authorUsername = author?.username || 'user'
  const authorAvatar = author?.avatar_url
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const tags = article.article_tags
    ? article.article_tags.map((at: any) => at.tags).filter(Boolean)
    : []

  // Fetch claps data
  const { data: clapsData } = await supabase
    .from('claps')
    .select('count, user_id')
    .eq('article_id', article.id)

  const totalClaps = clapsData ? clapsData.reduce((acc, c) => acc + c.count, 0) : 0
  const userClapObj = user && clapsData ? clapsData.find((c) => c.user_id === user.id) : null
  const userClapCount = userClapObj ? userClapObj.count : 0

  // Fetch follow status
  let isFollowing = false
  if (user && user.id !== author.id) {
    const { data: follow } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', author.id)
      .single()
    isFollowing = !!follow
  }

  // Fetch bookmark status
  let isBookmarked = false
  if (user) {
    const { data: bm } = await supabase
      .from('bookmarks')
      .select('article_id')
      .eq('user_id', user.id)
      .eq('article_id', article.id)
      .single()
    isBookmarked = !!bm
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      parent_comment_id,
      user_id,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('article_id', article.id)
    .order('created_at', { ascending: false })

  // Fetch related articles
  const { data: relatedArticles } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      reading_time,
      published_at,
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
    `)
    .eq('status', 'published')
    .neq('id', article.id)
    .limit(3)

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <ReadingProgressBar />
      <Navbar user={user} profile={currentProfile} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 sm:py-16">
        {/* Article Title */}
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-zinc-900 leading-tight mb-6">
          {article.title}
        </h1>

        {/* Author Header */}
        <div className="flex items-center justify-between border-y border-zinc-200 py-4 my-8">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${authorUsername}`}>
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${authorUsername}`}
                  className="font-bold text-sm text-zinc-900 hover:underline"
                >
                  {authorName}
                </Link>

                {user && user.id !== author.id && (
                  <FollowButton followingId={author.id} initialIsFollowing={isFollowing} />
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {article.reading_time || 1} min baca • {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton title={article.title} />
            <BookmarkButton articleId={article.id} initialIsBookmarked={isBookmarked} />
          </div>
        </div>

        {/* Cover Image if available */}
        {article.cover_image_url && (
          <div className="my-8 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 max-h-[450px]">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <TiptapRenderer content={article.content} />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 my-10 pt-6 border-t border-zinc-200">
            {tags.map((tag: any) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-800 transition"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Interactive Social Stats Bar */}
        <div className="flex items-center justify-between border-y border-zinc-200 py-4 my-8">
          <div className="flex items-center gap-3">
            <ClapButton
              articleId={article.id}
              initialTotalClaps={totalClaps}
              initialUserClaps={userClapCount}
            />
          </div>

          <div className="flex items-center gap-2">
            <ShareButton title={article.title} />
            <BookmarkButton articleId={article.id} initialIsBookmarked={isBookmarked} />
          </div>
        </div>

        {/* Interactive Comments Section */}
        <CommentsSection
          articleId={article.id}
          currentUserId={user?.id}
          initialComments={comments as any || []}
        />

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-zinc-200 space-y-6">
            <h3 className="text-xl font-serif font-bold text-zinc-900">
              Rekomendasi Artikel Lainnya
            </h3>
            <div className="divide-y divide-zinc-100">
              {relatedArticles.map((rel: any) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
