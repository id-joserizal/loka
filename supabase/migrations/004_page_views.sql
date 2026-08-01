-- ============================================================
-- LOKA - Migration: Page Views Tracking
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabel untuk mencatat kunjungan halaman artikel
CREATE TABLE IF NOT EXISTS public.page_views (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  visited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query performa
CREATE INDEX IF NOT EXISTS idx_page_views_article_id ON public.page_views(article_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON public.page_views(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id    ON public.page_views(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Siapapun (termasuk anonim) bisa insert page view
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- Hanya admin yang bisa SELECT (lewat admin actions dengan service key atau anon dengan direct count)
-- Untuk simplisitas, kita allow authenticated read agar admin bisa query
DROP POLICY IF EXISTS "Authenticated users can read page views" ON public.page_views;
CREATE POLICY "Authenticated users can read page views"
  ON public.page_views FOR SELECT
  USING (auth.role() = 'authenticated');
