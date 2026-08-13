import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: responses, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        cover_image_url,
        excerpt,
        reading_time,
        created_at,
        published_at,
        profiles:author_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('response_to_id', id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('[GET /api/articles/[id]/responses] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedResponses = (responses || []).map((item: any) => {
      const authorObj = item.profiles || {}
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        author: {
          name: authorObj.full_name || authorObj.username || 'Penulis',
          username: authorObj.username || '',
          avatar: authorObj.avatar_url || null,
        },
        cover: item.cover_image_url || null,
        excerpt: item.excerpt || '',
        created_at: item.published_at || item.created_at,
        reading_time: item.reading_time || 1,
      }
    })

    return NextResponse.json({ responses: formattedResponses })
  } catch (err: any) {
    console.error('[GET /api/articles/[id]/responses] Exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
