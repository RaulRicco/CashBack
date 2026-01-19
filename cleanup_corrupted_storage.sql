-- ============================================
-- CLEANUP CORRUPTED STORAGE OBJECTS
-- ============================================
-- Este script remove objetos corrompidos do storage
-- e limpa a referência do logo no banco de dados
-- ============================================

-- 1. Ver todos os objetos corrompidos antes de deletar
SELECT 
    name,
    bucket_id,
    metadata->>'mimetype' as mime_type,
    pg_size_pretty((metadata->>'size')::bigint) as file_size,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC;

-- 2. Deletar TODOS os objetos no bucket merchant-assets (apenas logos corrompidas)
-- ATENÇÃO: Isto vai deletar todas as imagens. Execute apenas se tiver certeza!
DELETE FROM storage.objects 
WHERE bucket_id = 'merchant-assets';

-- 3. Limpar a referência de logo_url do merchant
UPDATE merchants 
SET logo_url = NULL 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';

-- 4. Verificar se limpou tudo
SELECT 
    id,
    name,
    logo_url
FROM merchants 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';

-- 5. Confirmar que o bucket está vazio
SELECT COUNT(*) as total_objects
FROM storage.objects 
WHERE bucket_id = 'merchant-assets';

-- ============================================
-- RESULTADO ESPERADO:
-- - total_objects = 0
-- - logo_url = NULL no merchant
-- ============================================
