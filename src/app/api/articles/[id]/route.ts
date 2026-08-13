import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: article, error } = await supabase
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
        response_to:response_to_id (
          id,
          title,
          slug,
          profiles:author_id (
            username,
            full_name,
            avatar_url
          )
        ),
        article_tags (
          tags (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    let responseToPayload = null
    if (article.response_to) {
      const parentObj = article.response_to as any
      const parentAuthor = parentObj.profiles || {}
      responseToPayload = {
        title: parentObj.title,
        slug: parentObj.slug,
        author: {
          name: parentAuthor.full_name || parentAuthor.username || 'Penulis',
          username: parentAuthor.username || '',
          avatar: parentAuthor.avatar_url || null,
        },
      }
    }

    return NextResponse.json({
      ...article,
      response_to: responseToPayload,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
