-- ═══════════════════════════════════════════════
--  कर्तृत्ववान शेतकरी — Supabase SQL Fix
--  Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Step 1: Drop existing table if broken
DROP TABLE IF EXISTS public.newspapers CASCADE;
DROP TABLE IF EXISTS public.user_logins CASCADE;

-- Step 2: Create newspapers table
CREATE TABLE public.newspapers (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  date_text   TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  pdf_url     TEXT DEFAULT '',
  thumb_url   TEXT DEFAULT '',
  uploaded_by TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create user_logins table
CREATE TABLE public.user_logins (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  name       TEXT DEFAULT '',
  role       TEXT DEFAULT 'viewer',
  logged_at  TIMESTAMPTZ DEFAULT NOW(),
  device     TEXT DEFAULT '',
  user_agent TEXT DEFAULT ''
);

-- Step 4: Enable RLS
ALTER TABLE public.newspapers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop old policies
DROP POLICY IF EXISTS "Public read newspapers"   ON public.newspapers;
DROP POLICY IF EXISTS "Anon insert newspapers"   ON public.newspapers;
DROP POLICY IF EXISTS "Anon delete newspapers"   ON public.newspapers;
DROP POLICY IF EXISTS "Anyone can read newspapers"  ON public.newspapers;
DROP POLICY IF EXISTS "Anyone can insert newspapers" ON public.newspapers;
DROP POLICY IF EXISTS "Anyone can delete newspapers" ON public.newspapers;
DROP POLICY IF EXISTS "Anon insert logins"       ON public.user_logins;
DROP POLICY IF EXISTS "Public read logins"       ON public.user_logins;
DROP POLICY IF EXISTS "Anyone can insert logins" ON public.user_logins;
DROP POLICY IF EXISTS "Anyone can read logins"   ON public.user_logins;

-- Step 6: Create policies
CREATE POLICY "read_newspapers"   ON public.newspapers FOR SELECT USING (true);
CREATE POLICY "insert_newspapers" ON public.newspapers FOR INSERT WITH CHECK (true);
CREATE POLICY "delete_newspapers" ON public.newspapers FOR DELETE USING (true);
CREATE POLICY "insert_logins"     ON public.user_logins FOR INSERT WITH CHECK (true);
CREATE POLICY "read_logins"       ON public.user_logins FOR SELECT USING (true);

-- Step 7: Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.newspapers;

-- Step 8: Storage bucket + policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('newspapers-pdfs', 'newspapers-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "storage_read"   ON storage.objects;
DROP POLICY IF EXISTS "storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read storage"   ON storage.objects;
DROP POLICY IF EXISTS "Public upload storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete storage" ON storage.objects;

CREATE POLICY "storage_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'newspapers-pdfs');
CREATE POLICY "storage_insert"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'newspapers-pdfs');
CREATE POLICY "storage_delete"
  ON storage.objects FOR DELETE USING (bucket_id = 'newspapers-pdfs');

-- Verify tables
SELECT 'newspapers table' AS check, count(*) AS rows FROM public.newspapers;
SELECT 'user_logins table' AS check, count(*) AS rows FROM public.user_logins;
