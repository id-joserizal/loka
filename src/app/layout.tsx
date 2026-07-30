import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'LOKA — Dunia Untuk Semua Cerita',
    template: '%s | LOKA',
  },
  description:
    'Platform menulis dan membaca artikel bagi penulis independen, pemikir, dan pembaca di Indonesia untuk berbagi pandangan dan gagasan mendalam.',
  keywords: ['loka', 'artikel', 'menulis', 'membaca', 'blog', 'indonesia', 'medium indonesia', 'penulis'],
  authors: [{ name: 'LOKA Platform' }],
  creator: 'LOKA',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'LOKA',
    title: 'LOKA — Dunia Untuk Semua Cerita',
    description:
      'Platform menulis dan membaca artikel bagi penulis independen dan pembaca di Indonesia.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LOKA — Dunia Untuk Semua Cerita',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOKA — Dunia Untuk Semua Cerita',
    description:
      'Platform menulis dan membaca artikel bagi penulis independen dan pembaca di Indonesia.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  )
}
