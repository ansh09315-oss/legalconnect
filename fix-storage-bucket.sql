-- ═══════════════════════════════════════════════════════════════════════════
-- QUICK FIX: Create Missing Storage Bucket
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this immediately in Supabase SQL Editor

-- 1. Create the lawyer-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lawyer-photos', 'lawyer-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public read access (view photos)
CREATE POLICY IF NOT EXISTS "Public Access to Lawyer Photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lawyer-photos');

-- 3. Allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Authenticated Upload Lawyer Photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'lawyer-photos');

-- 4. Allow users to update their own photos
CREATE POLICY IF NOT EXISTS "Users can update own photos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'lawyer-photos');

-- 5. Verify bucket created
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id = 'lawyer-photos';
