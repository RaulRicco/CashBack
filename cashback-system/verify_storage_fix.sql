-- ============================================
-- VERIFICAR SE O FIX DO STORAGE FUNCIONOU
-- ============================================
-- Execute este script APÓS fazer o re-upload do logo
-- ============================================

-- 1. Verificar configuração do bucket
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'merchant-assets';

-- ✅ ESPERADO:
-- public = true
-- allowed_mime_types = NULL ou array com tipos de imagem

-- ============================================

-- 2. Verificar políticas de acesso ao storage
SELECT 
    policyname,
    cmd as operation,
    roles,
    permissive
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%merchant-assets%';

-- ✅ ESPERADO:
-- 4 políticas (SELECT, INSERT, UPDATE, DELETE)
-- roles = {public}
-- permissive = PERMISSIVE

-- ============================================

-- 3. Verificar objetos armazenados (novos uploads)
SELECT 
    name,
    bucket_id,
    metadata->>'mimetype' as mime_type,
    metadata->>'size' as file_size_bytes,
    pg_size_pretty((metadata->>'size')::bigint) as file_size_readable,
    metadata->>'cacheControl' as cache_control,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 10;

-- ✅ ESPERADO:
-- mime_type = 'image/jpeg' ou 'image/png' (não 'multipart/form-data')
-- file_size: tamanho razoável para uma imagem (ex: 50KB-500KB)
-- created_at: data/hora recente do novo upload

-- ============================================

-- 4. Verificar URL do logo no merchant
SELECT 
    id,
    name,
    logo_url,
    created_at,
    updated_at
FROM merchants 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';

-- ✅ ESPERADO:
-- logo_url começa com: https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/logos/
-- logo_url termina com extensão de imagem (.jpg, .png, etc)

-- ============================================

-- 5. Contar total de objetos no bucket
SELECT 
    bucket_id,
    COUNT(*) as total_files,
    pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
GROUP BY bucket_id;

-- ============================================

-- 6. Ver detalhes completos do objeto mais recente
SELECT 
    name,
    bucket_id,
    owner,
    metadata,
    path_tokens,
    version,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 1;

-- ✅ VERIFICAR:
-- metadata deve conter chaves corretas: mimetype, size, cacheControl
-- path_tokens deve ser array correto: ["logos", "filename.jpg"]
-- version deve ser UUID válido

-- ============================================

-- 7. TESTE FINAL: Construir URL pública manualmente
-- Copie o 'name' do último SELECT e cole abaixo
-- Substitua 'SEU_FILENAME_AQUI' pelo nome retornado

SELECT 
    'https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/' || name as public_url
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 1;

-- ✅ TESTE:
-- Copie a URL retornada
-- Cole em uma aba ANÔNIMA do navegador (Ctrl+Shift+N)
-- Deve mostrar a IMAGEM, não texto "WebKitFormBoundary"

-- ============================================
-- RESUMO DOS RESULTADOS ESPERADOS
-- ============================================
-- ✅ Bucket público = true
-- ✅ 4 políticas de acesso criadas
-- ✅ Objetos com mime_type correto (image/jpeg, image/png)
-- ✅ Merchant com logo_url válida
-- ✅ URL pública acessível mostrando imagem real
-- ============================================
