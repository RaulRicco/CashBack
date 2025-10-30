-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Drop all existing policies for merchant-assets to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to upload merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their merchant assets" ON storage.objects;

-- Enable RLS if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a permissive INSERT policy for authenticated users
CREATE POLICY "merchant_assets_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-assets');

-- Create public SELECT policy (read access)
CREATE POLICY "merchant_assets_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'merchant-assets');

-- Create UPDATE policy for authenticated users
CREATE POLICY "merchant_assets_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'merchant-assets')
WITH CHECK (bucket_id = 'merchant-assets');

-- Create DELETE policy for authenticated users
CREATE POLICY "merchant_assets_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'merchant-assets');

-- Verify the new policies
SELECT policyname, cmd, roles, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE 'merchant_assets%';
