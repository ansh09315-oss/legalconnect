-- ════════════════════════════════════════════════════════════════════════════
-- Legal Connect - Supabase Database Schema Setup
-- ════════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor if tables don't exist
-- URL: https://dimpexgzgsjbxiisavmk.supabase.co
-- ════════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- 1. CLIENTS TABLE (Main table for client accounts)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,  -- Stored as plain text or bcrypt hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);

-- ──────────────────────────────────────────────────────────────────────────
-- 2. LAWYERS TABLE (Main table for lawyer/advocate accounts)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lawyers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    court TEXT NOT NULL,
    bar_no TEXT NOT NULL,
    aor_no TEXT,
    spec TEXT NOT NULL,  -- Specialization
    areas TEXT[],  -- Array of practice areas
    address TEXT NOT NULL,
    password TEXT NOT NULL,  -- Stored as plain text or bcrypt hash
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_lawyers_email ON public.lawyers(email);
CREATE INDEX IF NOT EXISTS idx_lawyers_phone ON public.lawyers(phone);
CREATE INDEX IF NOT EXISTS idx_lawyers_status ON public.lawyers(status);

-- ──────────────────────────────────────────────────────────────────────────
-- 3. STORAGE BUCKET for Lawyer Photos
-- ──────────────────────────────────────────────────────────────────────────
-- Create storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lawyer-photos', 'lawyer-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies to allow public read
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'lawyer-photos');

-- Allow authenticated uploads
CREATE POLICY IF NOT EXISTS "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lawyer-photos');

-- ──────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ──────────────────────────────────────────────────────────────────────────

-- Enable RLS on tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

-- Clients Table Policies
-- Allow anyone to insert (for registration)
CREATE POLICY IF NOT EXISTS "Enable insert for registration"
ON public.clients FOR INSERT
WITH CHECK (true);

-- Allow select for authentication (read by email/phone only)
CREATE POLICY IF NOT EXISTS "Enable select for authentication"
ON public.clients FOR SELECT
USING (true);

-- Lawyers Table Policies
-- Allow anyone to insert (for registration)
CREATE POLICY IF NOT EXISTS "Enable insert for lawyer registration"
ON public.lawyers FOR INSERT
WITH CHECK (true);

-- Allow select for authentication and public viewing of approved lawyers
CREATE POLICY IF NOT EXISTS "Enable select for lawyers"
ON public.lawyers FOR SELECT
USING (true);

-- Allow update for approved lawyers (self-update their profile)
CREATE POLICY IF NOT EXISTS "Enable update for lawyers"
ON public.lawyers FOR UPDATE
USING (true);

-- ──────────────────────────────────────────────────────────────────────────
-- 5. HELPER FUNCTIONS
-- ──────────────────────────────────────────────────────────────────────────

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lawyers_updated_at ON public.lawyers;
CREATE TRIGGER update_lawyers_updated_at
    BEFORE UPDATE ON public.lawyers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────────────────────
-- 6. VERIFICATION QUERIES
-- ──────────────────────────────────────────────────────────────────────────

-- Check if tables exist and their row counts
SELECT
    'clients' as table_name,
    COUNT(*) as row_count
FROM public.clients
UNION ALL
SELECT
    'lawyers' as table_name,
    COUNT(*) as row_count
FROM public.lawyers;

-- Check approved lawyers
SELECT
    id, name, email, phone, court, spec, status, created_at
FROM public.lawyers
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 10;

-- ══════════════════════════════════════════════════════════════════════════
-- NOTES FOR DEPLOYMENT
-- ══════════════════════════════════════════════════════════════════════════
--
-- 1. Run this script in Supabase SQL Editor:
--    Dashboard → SQL Editor → New Query → Paste & Run
--
-- 2. Verify tables created:
--    Dashboard → Table Editor → Check for 'clients' and 'lawyers' tables
--
-- 3. Test RLS policies:
--    Try inserting test data to ensure policies work
--
-- 4. Storage bucket:
--    Dashboard → Storage → Verify 'lawyer-photos' bucket exists
--
-- 5. Environment variables in Netlify:
--    - VITE_SUPABASE_URL=https://dimpexgzgsjbxiisavmk.supabase.co
--    - VITE_SUPABASE_ANON_KEY=sb_publishable_A20nzTMuNVOaK2CasmR7YQ_sATKQ5CI
--    - ADMIN_USERNAME=admin
--    - ADMIN_PASSWORD=Ansh2015
--    - JWT_SECRET=089e675445adbb3429b0cdd26f4953dbaa4c599ae574a0d80e114da15701c323
--
-- ══════════════════════════════════════════════════════════════════════════
