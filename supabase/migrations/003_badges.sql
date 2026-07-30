-- ============================================================
-- LOKA - Migration 003: Verification Badges
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tambah kolom badge ke tabel profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT NULL
    CHECK (badge IN ('blue', 'gold', 'black'));

-- 2. Index untuk badge
CREATE INDEX IF NOT EXISTS idx_profiles_badge ON public.profiles(badge);

-- 3. Trigger: auto-set badge = 'black' saat role = 'admin'
--    dan hapus badge jika role kembali ke 'user'
CREATE OR REPLACE FUNCTION public.sync_admin_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Jika role berubah menjadi admin, otomatis set badge = 'black'
  IF NEW.role = 'admin' AND (OLD.role IS DISTINCT FROM 'admin') THEN
    NEW.badge := 'black';
  END IF;
  -- Jika role dikembalikan ke user, hapus badge black (badge lain tetap)
  IF NEW.role = 'user' AND OLD.role = 'admin' AND NEW.badge = 'black' THEN
    NEW.badge := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_role_change_sync_badge ON public.profiles;
CREATE TRIGGER on_role_change_sync_badge
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_admin_badge();

-- 4. Backfill: pastikan semua admin yang ada sudah punya badge black
UPDATE public.profiles
SET badge = 'black'
WHERE role = 'admin' AND (badge IS NULL OR badge != 'black');
