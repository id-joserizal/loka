-- ============================================================
-- LOKA - Migration 005: Upvote/Downvote, Notifications & Trending Algorithm
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABEL: votes (Pengganti claps untuk upvote/downvote)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type   INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (article_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_article_id ON public.votes(article_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id    ON public.votes(user_id);

-- Migrasi data claps ke votes (jika tabel claps ada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'public' AND table_name = 'claps') THEN
    INSERT INTO public.votes (article_id, user_id, vote_type)
    SELECT article_id, user_id, 1
    FROM public.claps
    ON CONFLICT (article_id, user_id) DO NOTHING;
  END IF;
END $$;

-- Enable RLS di tabel votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Votes are viewable by everyone" ON public.votes;
CREATE POLICY "Votes are viewable by everyone"
  ON public.votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.votes;
CREATE POLICY "Authenticated users can vote"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vote" ON public.votes;
CREATE POLICY "Users can update their own vote"
  ON public.votes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vote" ON public.votes;
CREATE POLICY "Users can delete their own vote"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 2. TABEL: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- penerima
  actor_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- pemicu
  type        TEXT NOT NULL CHECK (type IN ('upvote', 'downvote', 'comment', 'reply', 'follow')),
  article_id  UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  comment_id  UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread     ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS di tabel notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users can update read status of their notifications" ON public.notifications;
CREATE POLICY "Users can update read status of their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their notifications" ON public.notifications;
CREATE POLICY "Users can delete their notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 3. TRIGGERS UNTUK MEMBUAT NOTIFIKASI OTOMATIS
-- ============================================================

-- Trigger: Notifikasi saat ada Vote (Upvote)
CREATE OR REPLACE FUNCTION public.handle_vote_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Hanya buat notifikasi untuk upvote (vote_type = 1)
  IF NEW.vote_type = 1 THEN
    SELECT author_id INTO v_author_id FROM public.articles WHERE id = NEW.article_id;
    -- Jangan kirim notifikasi ke diri sendiri
    IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, actor_id, type, article_id)
      VALUES (v_author_id, NEW.user_id, 'upvote', NEW.article_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_vote_created ON public.votes;
CREATE TRIGGER on_vote_created
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_vote_notification();


-- Trigger: Notifikasi saat ada Komentar / Reply Komentar
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_author_id UUID;
  v_parent_user_id UUID;
BEGIN
  -- Jika komentar adalah balasan ke komentar lain (nested reply)
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_user_id FROM public.comments WHERE id = NEW.parent_comment_id;
    IF v_parent_user_id IS NOT NULL AND v_parent_user_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, actor_id, type, article_id, comment_id)
      VALUES (v_parent_user_id, NEW.user_id, 'reply', NEW.article_id, NEW.id);
    END IF;
  ELSE
    -- Komentar langsung pada artikel
    SELECT author_id INTO v_author_id FROM public.articles WHERE id = NEW.article_id;
    IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, actor_id, type, article_id, comment_id)
      VALUES (v_author_id, NEW.user_id, 'comment', NEW.article_id, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();


-- Trigger: Notifikasi saat ada Follow
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.following_id != NEW.follower_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type)
    VALUES (NEW.following_id, NEW.follower_id, 'follow');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();


-- ============================================================
-- 4. FUNCTION: Algoritma Artikel Trending Dinamis
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_trending_articles(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  reading_time INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  status TEXT,
  trending_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.author_id,
    a.title,
    a.slug,
    a.excerpt,
    a.cover_image_url,
    a.reading_time,
    a.published_at,
    a.created_at,
    a.status,
    CAST(
      (
        (COALESCE(v.upvotes, 0) - COALESCE(v.downvotes, 0)) * 3 + 
        COALESCE(c.comment_count, 0) * 2 + 
        COALESCE(pv.view_count, 0) * 0.2 + 1
      ) / POWER(
        GREATEST(EXTRACT(EPOCH FROM (NOW() - COALESCE(a.published_at, a.created_at))) / 3600.0, 0) + 2, 
        1.5
      ) AS NUMERIC
    ) AS trending_score
  FROM public.articles a
  LEFT JOIN (
    SELECT 
      article_id,
      COUNT(*) FILTER (WHERE vote_type = 1) AS upvotes,
      COUNT(*) FILTER (WHERE vote_type = -1) AS downvotes
    FROM public.votes
    GROUP BY article_id
  ) v ON v.article_id = a.id
  LEFT JOIN (
    SELECT article_id, COUNT(*) AS comment_count
    FROM public.comments
    GROUP BY article_id
  ) c ON c.article_id = a.id
  LEFT JOIN (
    SELECT article_id, COUNT(*) AS view_count
    FROM public.page_views
    GROUP BY article_id
  ) pv ON pv.article_id = a.id
  WHERE a.status = 'published'
  ORDER BY trending_score DESC, a.published_at DESC
  LIMIT p_limit;
END;
$$;
