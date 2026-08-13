-- ============================================================
-- LOKA - Migration 006: Feature Tulis Tanggapan (Article Responses)
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tambahkan kolom response_to_id (foreign key ke articles.id, ON DELETE SET NULL)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS response_to_id UUID REFERENCES public.articles(id) ON DELETE SET NULL;

-- 2. Tambahkan kolom response_count (INTEGER, default 0, NOT NULL)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS response_count INTEGER NOT NULL DEFAULT 0;

-- 3. Buat Index pada response_to_id untuk mempercepat query tanggapan artikel
CREATE INDEX IF NOT EXISTS idx_articles_response_to_id ON public.articles(response_to_id);

-- 4. Trigger otomatis untuk memperbarui response_count pada artikel utama (parent)
CREATE OR REPLACE FUNCTION public.update_article_response_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.response_to_id IS NOT NULL AND NEW.status = 'published' THEN
      UPDATE public.articles
      SET response_count = response_count + 1
      WHERE id = NEW.response_to_id;
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.response_to_id IS DISTINCT FROM NEW.response_to_id OR OLD.status IS DISTINCT FROM NEW.status THEN
      -- Kurangi counter pada parent lama jika sebelumnya terpublikasi
      IF OLD.response_to_id IS NOT NULL AND OLD.status = 'published' THEN
        UPDATE public.articles
        SET response_count = GREATEST(0, response_count - 1)
        WHERE id = OLD.response_to_id;
      END IF;
      -- Tambah counter pada parent baru jika berstatus terpublikasi
      IF NEW.response_to_id IS NOT NULL AND NEW.status = 'published' THEN
        UPDATE public.articles
        SET response_count = response_count + 1
        WHERE id = NEW.response_to_id;
      END IF;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.response_to_id IS NOT NULL AND OLD.status = 'published' THEN
      UPDATE public.articles
      SET response_count = GREATEST(0, response_count - 1)
      WHERE id = OLD.response_to_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_article_response_change ON public.articles;
CREATE TRIGGER on_article_response_change
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_article_response_count();

-- 5. Perbarui constraint type pada notifications agar menerima 'response'
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('upvote', 'downvote', 'comment', 'reply', 'follow', 'response'));
