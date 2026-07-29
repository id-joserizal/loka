import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditArticleClient } from './edit-client'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage(props: EditPageProps) {
  const { id } = await props.params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch article
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      article_tags (
        tags (
          name
        )
      )
    `)
    .eq('id', id)
    .eq('author_id', user.id)
    .single()

  if (error || !article) {
    notFound()
  }

  const existingTags = article.article_tags
    ? article.article_tags.map((at: any) => at.tags?.name).filter(Boolean)
    : []

  return (
    <EditArticleClient
      article={{
        id: article.id,
        title: article.title,
        content: article.content,
        coverImageUrl: article.cover_image_url || '',
        excerpt: article.excerpt || '',
        status: article.status as 'draft' | 'published',
        tags: existingTags,
      }}
    />
  )
}
