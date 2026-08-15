-- ============================================================
-- LOKA - Migration 008: Trigger Notifikasi Tanggapan Artikel & Komentar
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_article_response_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_parent_author_id UUID;
  v_comment_author_id UUID;
BEGIN
  -- Hanya proses ketika artikel berstatus 'published'
  IF NEW.status = 'published' THEN
    -- Jika publikasi baru atau perubahan status menjadi 'published'
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM 'published')) THEN

      -- 1. Notifikasi Tanggapan atas Komentar Spesifik
      IF NEW.response_to_comment_id IS NOT NULL THEN
        SELECT user_id INTO v_comment_author_id
        FROM public.comments
        WHERE id = NEW.response_to_comment_id;

        -- Jangan kirim notifikasi ke diri sendiri
        IF v_comment_author_id IS NOT NULL AND v_comment_author_id != NEW.author_id THEN
          IF NOT EXISTS (
            SELECT 1 FROM public.notifications
            WHERE user_id = v_comment_author_id
              AND actor_id = NEW.author_id
              AND type = 'response'
              AND article_id = NEW.id
              AND comment_id = NEW.response_to_comment_id
          ) THEN
            INSERT INTO public.notifications (user_id, actor_id, type, article_id, comment_id)
            VALUES (v_comment_author_id, NEW.author_id, 'response', NEW.id, NEW.response_to_comment_id);
          END IF;
        END IF;
      END IF;

      -- 2. Notifikasi Tanggapan atas Artikel Utama (Parent Article)
      IF NEW.response_to_id IS NOT NULL THEN
        SELECT author_id INTO v_parent_author_id
        FROM public.articles
        WHERE id = NEW.response_to_id;

        -- Jangan kirim notifikasi ke diri sendiri & cegah notifikasi ganda jika penulis artikel = penulis komentar
        IF v_parent_author_id IS NOT NULL 
           AND v_parent_author_id != NEW.author_id 
           AND (v_comment_author_id IS NULL OR v_parent_author_id != v_comment_author_id) THEN
          IF NOT EXISTS (
            SELECT 1 FROM public.notifications
            WHERE user_id = v_parent_author_id
              AND actor_id = NEW.author_id
              AND type = 'response'
              AND article_id = NEW.id
              AND comment_id IS NULL
          ) THEN
            INSERT INTO public.notifications (user_id, actor_id, type, article_id)
            VALUES (v_parent_author_id, NEW.author_id, 'response', NEW.id);
          END IF;
        END IF;
      END IF;

    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_article_response_published ON public.articles;
CREATE TRIGGER on_article_response_published
  AFTER INSERT OR UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_article_response_notification();
