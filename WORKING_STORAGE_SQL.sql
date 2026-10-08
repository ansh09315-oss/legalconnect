-- ════════════════════════════════════════════════════════════════════════════
-- CORRECTED SQL - Copy and paste this ENTIRE block
-- ════════════════════════════════════════════════════════════════════════════

-- Step 1: Drop existing policies (if any)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;

-- Step 2: Create read policy
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'lawyer-photos');

-- Step 3: Create upload policy
CREATE POLICY "Public upload access"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'lawyer-photos');

-- Step 4: Verify policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%lawyer%';

-- ════════════════════════════════════════════════════════════════════════════
-- Expected output: 2 rows showing the policies created
-- ════════════════════════════════════════════════════════════════════════════
