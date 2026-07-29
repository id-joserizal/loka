-- ============================================================
-- LOKA - Initial Database Schema
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABEL: profiles
-- Dibuat otomatis saat user mendaftar via trigger
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABEL: articles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content         JSONB NOT NULL DEFAULT '{}',
  cover_image_url TEXT,
  excerpt         TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  reading_time    INTEGER,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABEL: tags
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  TEXT UNIQUE NOT NULL,
  slug  TEXT UNIQUE NOT NULL
);

-- ============================================================
-- TABEL: article_tags (relasi many-to-many articles <-> tags)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================================
-- TABEL: comments (dengan dukungan nested reply)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id        UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABEL: claps (mirip "clap" Medium, user bisa clap berkali-kali)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.claps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  count       INTEGER NOT NULL DEFAULT 1 CHECK (count >= 1 AND count <= 50),
  UNIQUE (article_id, user_id)
);

-- ============================================================
-- TABEL: follows
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================================
-- TABEL: bookmarks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- ============================================================
-- INDEX untuk performa query
-- ============================================================

-- articles: query by author, slug, status, tag
CREATE INDEX IF NOT EXISTS idx_articles_author_id   ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug        ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status      ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC) WHERE status = 'published';

-- article_tags: query artikel per tag
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id     ON public.article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON public.article_tags(article_id);

-- tags: query by slug
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- comments: query komentar per artikel
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id    ON public.comments(user_id);

-- claps: query clap per artikel
CREATE INDEX IF NOT EXISTS idx_claps_article_id ON public.claps(article_id);

-- follows: query follower/following
CREATE INDEX IF NOT EXISTS idx_follows_follower_id  ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- bookmarks: query bookmark per user
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- ============================================================
-- TRIGGER: auto-create profile saat user baru mendaftar
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    -- Buat username dari email (bagian sebelum @) + random suffix
    LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || SUBSTR(NEW.id::TEXT, 1, 6),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Pasang trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: auto-update updated_at pada articles
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_articles_updated_at ON public.articles;
CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Aktifkan RLS di semua tabel
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks   ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------
-- RLS: profiles
-- -----------------------------------------------
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- -----------------------------------------------
-- RLS: articles
-- -----------------------------------------------
CREATE POLICY "Published articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Authors can insert their own articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own articles"
  ON public.articles FOR DELETE
  USING (auth.uid() = author_id);

-- -----------------------------------------------
-- RLS: tags (public read, hanya admin yang bisa insert/update)
-- -----------------------------------------------
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- -----------------------------------------------
-- RLS: article_tags
-- -----------------------------------------------
CREATE POLICY "Article tags are viewable by everyone"
  ON public.article_tags FOR SELECT USING (true);

CREATE POLICY "Authors can manage their article tags"
  ON public.article_tags FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT author_id FROM public.articles WHERE id = article_id)
  );

CREATE POLICY "Authors can delete their article tags"
  ON public.article_tags FOR DELETE
  USING (
    auth.uid() = (SELECT author_id FROM public.articles WHERE id = article_id)
  );

-- -----------------------------------------------
-- RLS: comments
-- -----------------------------------------------
CREATE POLICY "Comments on published articles are viewable by everyone"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE id = article_id AND status = 'published'
    )
  );

CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- RLS: claps
-- -----------------------------------------------
CREATE POLICY "Claps are viewable by everyone"
  ON public.claps FOR SELECT USING (true);

CREATE POLICY "Authenticated users can clap"
  ON public.claps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claps"
  ON public.claps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own claps"
  ON public.claps FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- RLS: follows
-- -----------------------------------------------
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- -----------------------------------------------
-- RLS: bookmarks
-- -----------------------------------------------
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can bookmark"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS
-- Jalankan ini setelah tabel dibuat
-- ============================================================

-- Bucket untuk cover image artikel
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-covers', 'article-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket untuk avatar user
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy storage: siapapun bisa lihat gambar
CREATE POLICY "Article covers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-covers');

CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy storage: user hanya bisa upload ke folder miliknya
CREATE POLICY "Users can upload article covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'article-covers'
    AND auth.uid()::TEXT = (STORAGE.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (STORAGE.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (STORAGE.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    auth.uid()::TEXT = (STORAGE.foldername(name))[1]
  );
