'use client'

import Link from 'next/link'
import { MessageSquarePlus } from 'lucide-react'

interface WriteResponseButtonProps {
  articleId: string
}

export function WriteResponseButton({ articleId }: WriteResponseButtonProps) {
  return (
    <Link
      href={`/write?response_to=${articleId}`}
      className="p-2 rounded-full border bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition duration-150 inline-flex items-center justify-center"
      title="Tulis Tanggapan"
    >
      <MessageSquarePlus className="w-4 h-4" />
    </Link>
  )
}
