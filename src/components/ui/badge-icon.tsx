// BadgeIcon component — shows colored verification checkmark
// badge: 'blue' | 'gold' | 'black' | null | undefined

interface BadgeIconProps {
  badge?: 'blue' | 'gold' | 'black' | string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4.5 h-4.5',
  lg: 'w-6 h-6',
}

const PIXEL_SIZE = {
  sm: 14,
  md: 18,
  lg: 24,
}

export function BadgeIcon({ badge, size = 'md', className = '' }: BadgeIconProps) {
  if (!badge) return null

  const px = PIXEL_SIZE[size] || 18
  const cls = `${SIZE[size] || SIZE.md} inline-block shrink-0 ${className}`

  if (badge === 'blue') {
    return (
      <span title="Pengguna Terverifikasi" className="inline-flex items-center">
        <svg
          className={cls}
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          aria-label="Terverifikasi"
        >
          <circle cx="12" cy="12" r="12" fill="#1DA1F2" />
          <path
            d="M7 12.5l3.5 3.5 6.5-7"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }

  if (badge === 'gold') {
    return (
      <span title="Pengguna Premium" className="inline-flex items-center">
        <svg
          className={cls}
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          aria-label="Pengguna Premium"
        >
          <circle cx="12" cy="12" r="12" fill="#F59E0B" />
          <path
            d="M7 12.5l3.5 3.5 6.5-7"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }

  if (badge === 'black') {
    return (
      <span title="Administrator Platform" className="inline-flex items-center">
        <svg
          className={cls}
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          aria-label="Admin Platform"
        >
          <circle cx="12" cy="12" r="12" fill="#18181B" />
          <path
            d="M7 12.5l3.5 3.5 6.5-7"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }

  return null
}
