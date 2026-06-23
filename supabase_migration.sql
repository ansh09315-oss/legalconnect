-- ============================================================
-- LegalConnect — Separate Profile Tables Migration
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dimpexgzgsjbxiisavmk/sql
-- ============================================================

-- ── 1. CREATE client_profiles (new canonical client table) ──
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) DEFAULT NULL,
  phone       VARCHAR(50)  NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT timezone('utc', now())
);

-- ── 2. CREATE lawyer_profiles (new canonical lawyer table) ──
CREATE TABLE IF NOT EXISTS public.lawyer_profiles (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)  NOT NULL,
  password    VARCHAR(255) NOT NULL,
  court       VARCHAR(255) NOT NULL,
  bar_no      VARCHAR(100) NOT NULL,
  aor_no      VARCHAR(100) DEFAULT NULL,
  spec        VARCHAR(255) NOT NULL,
  areas       TEXT[]       NOT NULL DEFAULT '{}'::text[],
  address     TEXT         NOT NULL DEFAULT '',
  rating      NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  status      VARCHAR(50)  NOT NULL DEFAULT 'pending',
  photo_url   TEXT         DEFAULT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT timezone('utc', now())
);

-- ── 3. MIGRATE existing data ──
-- Copy existing clients into client_profiles (skip duplicates)
INSERT INTO public.client_profiles (id, name, email, phone, password, created_at)
SELECT id, name, email, phone, password, created_at
FROM   public.clients
ON CONFLICT (id) DO NOTHING;

-- Copy existing lawyers into lawyer_profiles (skip duplicates)
INSERT INTO public.lawyer_profiles
  (id, name, email, phone, password, court, bar_no, aor_no, spec, areas, address, rating, status, photo_url, created_at)
SELECT
  id, name, email, phone, password,
  COALESCE(court, 'N/A'),
  COALESCE(bar_no, 'N/A'),
  aor_no,
  COALESCE(spec, 'General'),
  COALESCE(areas, '{}'::text[]),
  COALESCE(address, ''),
  COALESCE(rating, 5.00),
  COALESCE(status, 'pending'),
  photo_url,
  created_at
FROM   public.lawyers
ON CONFLICT (id) DO NOTHING;

-- ── 4. ENABLE Row Level Security (RLS) ──
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;

-- ── 5. POLICIES — Allow service role full access (anon key read-only via server) ──
-- Allow all reads and writes for the service role (backend / Netlify functions)
CREATE POLICY IF NOT EXISTS "Allow full access via service role"
  ON public.client_profiles FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow full access via service role"
  ON public.lawyer_profiles FOR ALL
  USING (true) WITH CHECK (true);

-- ── 6. INDEXES for faster login lookups ──
CREATE INDEX IF NOT EXISTS idx_client_profiles_email ON public.client_profiles (lower(email));
CREATE INDEX IF NOT EXISTS idx_client_profiles_phone ON public.client_profiles (phone);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_email ON public.lawyer_profiles (lower(email));
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_phone ON public.lawyer_profiles (phone);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_status ON public.lawyer_profiles (status);

-- ── Done! ──
-- After running this, both tables will be populated with your existing data.
-- New registrations will write to both the new table AND the legacy table.
