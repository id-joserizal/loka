import Link from 'next/link'

export interface ResponseParentBannerProps {
  responseTo: {
    id?: string
    title: string
    slug: string
    profiles?: {
      username?: string | null
      full_name?: string | null
    } | null
    author?: {
      name?: string | null
      username?: string | null
      full_name?: string | null
    } | null
  } | null
}

export function ResponseParentBanner({ responseTo }: ResponseParentBannerProps) {
  if (!responseTo || !responseTo.title || !responseTo.slug) return null

  const profileObj = responseTo.profiles || responseTo.author || {}
  const authorName = (profileObj as any).full_name || (profileObj as any).name || (profileObj as any).username || 'Penulis'

  return (
    <div className="mb-4">
      <Link
        href={`/article/${responseTo.slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition group/parent flex-wrap"
      >
        <span className="text-zinc-400 font-serif text-sm">↳</span>
        <span className="text-zinc-500">Menanggapi:</span>
        <span className="font-semibold text-zinc-700 group-hover/parent:underline truncate max-w-sm sm:max-w-md">
          {responseTo.title}
        </span>
        <span className="text-zinc-400">oleh {authorName}</span>
      </Link>
    </div>
  )
}
