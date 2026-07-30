'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { ReportModal } from '@/components/report/report-modal'

interface ArticleReportButtonProps {
  articleId: string
  articleTitle: string
}

export function ArticleReportButton({ articleId, articleTitle }: ArticleReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-zinc-200/60 text-zinc-500 hover:text-red-600 transition"
        title="Laporkan Artikel"
      >
        <Flag className="w-4 h-4" />
      </button>

      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetType="article"
        articleId={articleId}
        itemTitle={articleTitle}
      />
    </>
  )
}
