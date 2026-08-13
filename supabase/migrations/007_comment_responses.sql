-- ============================================================
-- LOKA - Migration 007: Response to Specific Comment
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tambahkan kolom response_to_comment_id (foreign key ke comments.id, ON DELETE SET NULL)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS response_to_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL;

-- 2. Buat Index pada response_to_comment_id untuk mempercepat query
CREATE INDEX IF NOT EXISTS idx_articles_response_to_comment_id ON public.articles(response_to_comment_id);
