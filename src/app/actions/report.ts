'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface SubmitReportInput {
  targetType: 'article' | 'comment' | 'user'
  articleId?: string
  commentId?: string
  reportedUserId?: string
  reason: string
  details?: string
}

export async function submitReport(input: SubmitReportInput) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Anda harus login untuk mengirim laporan.')
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: input.targetType,
    article_id: input.articleId || null,
    comment_id: input.commentId || null,
    reported_user_id: input.reportedUserId || null,
    reason: input.reason,
    details: input.details || null,
    status: 'pending',
  })

  if (error) {
    console.error('Error submitting report:', error)
    throw new Error(`Gagal mengirim laporan: ${error.message}`)
  }

  return { success: true }
}
