import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { AvatarUpload } from '@/components/upload/AvatarUpload'
import { ArticleCard } from '@/components/article/article-card'
import { FollowButton } from '@/components/social/follow-button'
import { Users, FileText, BookOpen } from 'lucide-react'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata(props: ProfilePageProps): Promise<Metadata> {
  const { username } = await props.params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    return { title: 'Profil Tidak Ditemukan — LOKA' }
  }

  return {
    title: `${profile.full_name || username} (@${username}) | LOKA`,
    description: profile.bio || `Baca artikel dari ${profile.full_name || username} di LOKA.`,
    openGraph: {
      title: `${profile.full_name || username} di LOKA`,
      description: profile.bio || `Penulis di platform LOKA`,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
    },
  }
}

export default async function ProfilePage(props: ProfilePageProps) {
  const { username } = await props.params
  const supabase = await createClient()

  // Current logged-in user
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

  // Fetch profile being viewed
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_url, created_at')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch published articles by this author
  const { data: articles } = await supabase
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
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Follower / Following counts
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id)

  // Check if current user follows this profile
  let isFollowing = false
  if (user && user.id !== profile.id) {
    const { data: followRow } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single()
    isFollowing = !!followRow
  }

  const isOwnProfile = user?.id === profile.id
  const displayName = profile.full_name || profile.username
  const joinedDate = new Date(profile.created_at).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const totalClaps = 0 // Could be computed later

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Navbar user={user} profile={currentProfile} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 sm:py-16">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-10 border-b border-zinc-200">
          {/* Avatar */}
          <div className="shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover border-2 border-zinc-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-3xl shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                {displayName}
              </h1>
              {!isOwnProfile && user && (
                <FollowButton followingId={profile.id} initialIsFollowing={isFollowing} />
              )}
              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="px-3.5 py-1.5 rounded-full border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
                >
                  Edit Profil
                </Link>
              )}
            </div>
            <p className="text-sm text-zinc-500">@{profile.username}</p>

            {profile.bio && (
              <p className="text-sm text-zinc-700 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  <strong className="text-zinc-900">{articles?.length ?? 0}</strong> artikel
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  <strong className="text-zinc-900">{followerCount ?? 0}</strong> pengikut
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  Mengikuti <strong className="text-zinc-900">{followingCount ?? 0}</strong>
                </span>
              </div>
              <div className="text-xs text-zinc-400">
                Bergabung {joinedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <section className="mt-10">
          <h2 className="text-lg font-serif font-bold text-zinc-900 mb-6">
            Artikel yang Diterbitkan
          </h2>
          {articles && articles.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {articles.map((art: any) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500 font-serif">
                {isOwnProfile
                  ? 'Kamu belum memiliki artikel yang dipublikasikan.'
                  : `${displayName} belum memiliki artikel yang dipublikasikan.`}
              </p>
              {isOwnProfile && (
                <Link
                  href="/write"
                  className="inline-block mt-2 px-5 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition"
                >
                  Tulis Artikel Pertama
                </Link>
              )}
            </div>
          )}
        </section>
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
