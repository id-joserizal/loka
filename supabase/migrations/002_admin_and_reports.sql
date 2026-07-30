-- ============================================================
-- LOKA - Migration 002: Admin Role, User Suspension & Reports Queue
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tambah kolom role, status, dan suspended_at ke tabel profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Index untuk mempercepat query role dan status
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 2. Buat tabel reports untuk antrian moderasis/laporan
CREATE TABLE IF NOT EXISTS public.reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type       TEXT NOT NULL CHECK (target_type IN ('article', 'comment', 'user')),
  article_id        UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  comment_id        UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reported_user_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason            TEXT NOT NULL,
  details           TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ,
  resolved_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Index untuk tabel reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_article_id ON public.reports(article_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Enable RLS di tabel reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy reports: Admin bisa melihat semua laporan
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR auth.uid() = reporter_id
  );

-- Policy reports: User terautentikasi bisa membuat laporan
DROP POLICY IF EXISTS "Authenticated users can submit reports" ON public.reports;
CREATE POLICY "Authenticated users can submit reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Policy reports: Admin bisa memperbarui/menyelesaikan laporan
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy Admin: Admin dapat memperbarui semua profile (suspend, change role)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy Admin: Admin dapat menghapus sebarang profile
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy Admin: Admin dapat memperbarui sebarang artikel (unpublish dll)
DROP POLICY IF EXISTS "Admins can update any article" ON public.articles;
CREATE POLICY "Admins can update any article"
  ON public.articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy Admin: Admin dapat menghapus sebarang artikel
DROP POLICY IF EXISTS "Admins can delete any article" ON public.articles;
CREATE POLICY "Admins can delete any article"
  ON public.articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
