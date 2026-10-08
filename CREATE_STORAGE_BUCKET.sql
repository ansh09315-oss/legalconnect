-- ═══════════════════════════════════════════════════════════════════════════
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- ═══════════════════════════════════════════════════════════════════════════
-- URL: https://dimpexgzgsjbxiisavmk.supabase.co → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'lawyer-photos',
    'lawyer-photos',
    true,
    5242880,  -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id)
DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Step 2: Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access to Lawyer Photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload lawyer photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update lawyer photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete their photos" ON storage.objects;

-- Step 4: Create policy for PUBLIC READ access (anyone can view photos)
CREATE POLICY "Public Access to Lawyer Photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'lawyer-photos');

-- Step 5: Create policy for PUBLIC UPLOAD (anyone can upload)
CREATE POLICY "Anyone can upload lawyer photos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'lawyer-photos');

-- Step 6: Create policy for UPDATE (optional - for future use)
CREATE POLICY "Anyone can update lawyer photos"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'lawyer-photos')
WITH CHECK (bucket_id = 'lawyer-photos');

-- Step 7: Create policy for DELETE (optional - for admin use)
CREATE POLICY "Anyone can delete their photos"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'lawyer-photos');

-- Step 8: Verify the bucket was created
SELECT
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id = 'lawyer-photos';

-- ═══════════════════════════════════════════════════════════════════════════
-- EXPECTED OUTPUT:
-- ═══════════════════════════════════════════════════════════════════════════
-- You should see one row showing:
--   id: lawyer-photos
--   name: lawyer-photos
--   public: true
--   file_size_limit: 5242880
--   allowed_mime_types: {image/png, image/jpeg, image/jpg, image/webp}
--   created_at: [timestamp]
-- ═══════════════════════════════════════════════════════════════════════════

-- ✅ DONE!
-- Now lawyers can upload profile photos during registration.
-- The photos will be publicly viewable and stored in the lawyer-photos bucket.
