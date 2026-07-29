import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loka.vercel.app'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ]

  try {
    const supabase = await createClient()

    // Articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(500)

    const articleUrls: MetadataRoute.Sitemap =
      articles?.map((art) => ({
        url: `${baseUrl}/article/${art.slug}`,
        lastModified: new Date(art.updated_at || art.published_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      })) || []

    // Tags
    const { data: tags } = await supabase.from('tags').select('slug').limit(100)
    const tagUrls: MetadataRoute.Sitemap =
      tags?.map((t) => ({
        url: `${baseUrl}/tag/${t.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })) || []

    return [...staticRoutes, ...articleUrls, ...tagUrls]
  } catch {
    return staticRoutes
  }
}
