-- DIAGNOSTIC SCRIPT TO CHECK STORAGE CONFIGURATION

-- 1. Check if bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'merchant-assets';

-- 2. Check RLS status on storage.objects
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- 3. List ALL policies on storage.objects
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_clause,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 4. Check if there are any objects in the bucket
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    metadata->>'size' as size_bytes
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Test what the authenticated role can do
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'storage'
AND table_name = 'objects';
