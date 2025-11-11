-- ============================================================
-- DEBUG SUPABASE STORAGE
-- ============================================================

-- 1. Verificar o bucket
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'merchant-assets';

-- 2. Verificar as políticas do storage.objects
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 3. Verificar os arquivos no bucket
SELECT 
    id,
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se há algum objeto com problemas de metadata
SELECT 
    name,
    bucket_id,
    metadata->>'mimetype' as mime_type,
    metadata->>'size' as file_size,
    metadata->>'cacheControl' as cache_control
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
AND name LIKE '%10bce3c4-6637-4e56-8792-8d815d8763da%'
ORDER BY created_at DESC;
