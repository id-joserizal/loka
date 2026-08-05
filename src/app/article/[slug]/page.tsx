import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { ReadingProgressBar } from '@/components/article/reading-progress-bar'
import { TiptapRenderer } from '@/components/article/tiptap-renderer'
import { ArticleCard } from '@/components/article/article-card'
import { VoteButton } from '@/components/social/vote-button'
import { BookmarkButton } from '@/components/social/bookmark-button'
import { FollowButton } from '@/components/social/follow-button'
import { ShareButton } from '@/components/social/share-button'
import { CommentsSection } from '@/components/social/comments-section'
import { ArticleReportButton } from '@/components/article/article-report-button'
import { BadgeIcon } from '@/components/ui/badge-icon'
import { ArticleViewTracker } from '@/components/article/article-view-tracker'
import { Eye } from 'lucide-react'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: ArticlePageProps): Promise<Metadata> {
  const { slug } = await props.params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image_url, profiles:author_id(full_name)')
    .eq('slug', slug)
    .single()

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan',
    }
  }

  const authorName = (article.profiles as any)?.full_name || 'Penulis LOKA'

  return {
    title: `${article.title} — ${authorName}`,
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
      profiles:author_id (
        id,
        username,
        full_name,
        avatar_url,
        badge,
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
  const authorBadge = author?.badge || null
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

  // Fetch votes data
  let totalNetVotes = 0
  let userVoteType = 0

  try {
    const { data: votesData } = await supabase
      .from('votes')
      .select('vote_type, user_id')
      .eq('article_id', article.id)

    if (votesData) {
      totalNetVotes = votesData.reduce((acc, v) => acc + v.vote_type, 0)
      if (user) {
        const found = votesData.find((v) => v.user_id === user.id)
        if (found) userVoteType = found.vote_type
      }
    }
  } catch (err) {
    console.error('Error fetching votes data:', err)
  }

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

  // Fetch page view count (graceful fallback if table not yet created)
  let totalViews = 0
  try {
    const { count } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', article.id)
    totalViews = count || 0
  } catch {
    // table may not exist yet
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
    .neq('id', article.id)
    .limit(3)

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col">
      <ArticleViewTracker articleId={article.id} userId={user?.id ?? null} />
      <ReadingProgressBar />
      <Navbar user={user} profile={currentProfile} />

      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 py-10 sm:py-16">
        {/* Article Title */}
        <h1 className="text-4xl sm:text-5xl md:text-[52px] font-serif font-extrabold text-zinc-900 leading-[1.12] tracking-tight mb-8">
          {article.title}
        </h1>

        {/* Author Header */}
        <div className="flex flex-wrap items-center justify-between border-y border-zinc-200/80 py-4 my-8 gap-y-3">
          <div className="flex items-center gap-3.5">
            <Link href={`/profile/${authorUsername}`}>
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover border border-zinc-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-base">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${authorUsername}`}
                  className="flex items-center gap-1.5 font-semibold text-base text-zinc-900 hover:underline"
                >
                  {authorName}
                  <BadgeIcon badge={authorBadge} size="md" />
                </Link>

                {user && user.id !== author.id && (
                  <FollowButton followingId={author.id} initialIsFollowing={isFollowing} />
                )}
              </div>
              <p className="text-sm text-zinc-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{article.reading_time || 1} min baca</span>
                <span>•</span>
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {totalViews.toLocaleString('id-ID')} pembaca
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton
              title={article.title}
              coverImageUrl={article.cover_image_url}
              authorName={authorName}
              excerpt={article.excerpt}
            />
            <BookmarkButton articleId={article.id} initialIsBookmarked={isBookmarked} />
            {user && <ArticleReportButton articleId={article.id} articleTitle={article.title} />}
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
        <div className="flex flex-wrap items-center justify-between border-y border-zinc-200 py-4 my-8 gap-y-3">
          <div className="flex items-center gap-4">
            <VoteButton
              articleId={article.id}
              initialNetVotes={totalNetVotes}
              initialUserVote={userVoteType}
            />
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Eye className="w-4 h-4" />
              <span className="font-medium text-zinc-700">{totalViews.toLocaleString('id-ID')}</span>
              <span>pembaca</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton
              title={article.title}
              coverImageUrl={article.cover_image_url}
              authorName={authorName}
              excerpt={article.excerpt}
            />
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
          <section className="mt-16 pt-10 border-t border-zinc-200/80 space-y-6">
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
