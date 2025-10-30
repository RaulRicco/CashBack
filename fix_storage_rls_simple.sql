-- ALTERNATIVE APPROACH: Very permissive policies for testing
-- Use this if the first script doesn't work

-- Disable RLS temporarily to clean up
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Create very permissive policy for ALL operations on merchant-assets bucket
CREATE POLICY "merchant_assets_all_operations"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'merchant-assets')
WITH CHECK (bucket_id = 'merchant-assets');

-- Verify
SELECT policyname, cmd, permissive, roles
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
