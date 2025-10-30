-- =====================================================
-- CORREÇÃO VIA PERMISSÕES DO BUCKET
-- Não mexe em storage.objects, só no bucket
-- =====================================================

-- 1. Verificar bucket atual
SELECT 
    'ANTES' as momento,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'merchant-assets';

-- 2. Atualizar bucket para ser PÚBLICO
UPDATE storage.buckets 
SET public = true
WHERE name = 'merchant-assets';

-- 3. Verificar depois
SELECT 
    'DEPOIS' as momento,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'merchant-assets';

-- 4. Confirmar mudança
SELECT 
    CASE 
        WHEN public = true THEN '✅ Bucket agora é PÚBLICO - upload deve funcionar!'
        ELSE '❌ Bucket ainda está privado'
    END as status
FROM storage.buckets 
WHERE name = 'merchant-assets';
