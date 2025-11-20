-- ============================================
-- SOLUÇÃO DEFINITIVA DO PROBLEMA DE LOGO
-- ============================================
-- PROBLEMA IDENTIFICADO:
-- - mime_type = 'application/json' (ERRADO - deveria ser 'image/jpeg')
-- - cache_control = 'no-cache' (ERRADO - deveria ser '3600')
-- - Código estava faltando contentType: file.type no upload
-- ============================================

-- PASSO 1: Deletar TODOS os arquivos corrompidos
DELETE FROM storage.objects 
WHERE bucket_id = 'merchant-assets';

-- PASSO 2: Limpar logo_url do merchant
UPDATE merchants 
SET logo_url = NULL 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';

-- PASSO 3: Verificar limpeza
SELECT 
    'Objetos no storage' as tipo,
    COUNT(*) as total
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'

UNION ALL

SELECT 
    'Logo URL no merchant' as tipo,
    COUNT(*) as total
FROM merchants 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da'
  AND logo_url IS NOT NULL;

-- ============================================
-- RESULTADO ESPERADO:
-- Objetos no storage: 0
-- Logo URL no merchant: 0
-- ============================================

-- PASSO 4: Confirmar bucket está público
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'merchant-assets';

-- ============================================
-- RESULTADO ESPERADO:
-- public = true
-- allowed_mime_types = NULL (aceita todos) ou ['image/*']
-- ============================================

-- PASSO 5: Verificar políticas de acesso
SELECT 
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%merchant-assets%'
ORDER BY cmd;

-- ============================================
-- RESULTADO ESPERADO:
-- 4 políticas (DELETE, INSERT, SELECT, UPDATE)
-- Todas com roles = {public}
-- ============================================

-- ============================================
-- AGORA EXECUTE OS SEGUINTES PASSOS:
-- ============================================
-- 1. Execute este SQL completo no Supabase SQL Editor
-- 2. Confirme que tudo foi limpo (queries de verificação acima)
-- 3. Recarregue a página do Dashboard (Ctrl+Shift+R)
-- 4. Faça NOVO UPLOAD do logo
-- 5. Execute a query de verificação abaixo APÓS o upload
-- ============================================

-- PASSO 6: Query de verificação APÓS novo upload
-- Execute isto DEPOIS de fazer o novo upload:
/*
SELECT 
    name,
    bucket_id,
    metadata->>'mimetype' as mime_type,
    metadata->>'size' as file_size_bytes,
    pg_size_pretty((metadata->>'size')::bigint) as file_size_readable,
    metadata->>'cacheControl' as cache_control,
    created_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 1;
*/

-- ============================================
-- RESULTADO ESPERADO APÓS UPLOAD:
-- mime_type = 'image/jpeg' ou 'image/png' (NÃO 'application/json')
-- cache_control = '3600' (NÃO 'no-cache')
-- file_size: tamanho razoável (50KB-500KB para logo)
-- ============================================

-- PASSO 7: Testar URL pública APÓS upload
-- Execute isto DEPOIS de fazer o novo upload:
/*
SELECT 
    'https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/' || name as public_url
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 1;
*/

-- Copie a URL e abra em uma aba ANÔNIMA
-- Deve mostrar a IMAGEM, não JSON ou texto "WebKitFormBoundary"
