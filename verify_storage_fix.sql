-- SCRIPT DE VERIFICAÇÃO - Execute APÓS aplicar a correção
-- Este script verifica se tudo está configurado corretamente

-- ==========================================
-- 1. VERIFICAR BUCKET
-- ==========================================
SELECT 
    '1. BUCKET STATUS' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'merchant-assets') 
        THEN '✅ Bucket merchant-assets existe'
        ELSE '❌ Bucket merchant-assets NÃO existe - CRIAR!'
    END as status;

SELECT 
    '   Detalhes do bucket' as info,
    name,
    public as is_public,
    COALESCE(file_size_limit::text, 'sem limite') as size_limit,
    COALESCE(allowed_mime_types::text, 'todos') as mime_types
FROM storage.buckets 
WHERE name = 'merchant-assets';

-- ==========================================
-- 2. VERIFICAR RLS
-- ==========================================
SELECT 
    '2. RLS STATUS' as check_item,
    CASE 
        WHEN rowsecurity = true 
        THEN '✅ RLS está habilitado'
        ELSE '⚠️ RLS está DESABILITADO - pode ser inseguro!'
    END as status
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- ==========================================
-- 3. VERIFICAR POLÍTICAS
-- ==========================================
SELECT 
    '3. POLICIES COUNT' as check_item,
    CASE 
        WHEN COUNT(*) >= 4 
        THEN '✅ ' || COUNT(*) || ' políticas encontradas (esperado: 4+)'
        WHEN COUNT(*) > 0
        THEN '⚠️ ' || COUNT(*) || ' políticas encontradas (esperado: 4)'
        ELSE '❌ NENHUMA política encontrada - CRIAR!'
    END as status
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE 'merchant_assets%';

-- Listar políticas em detalhes
SELECT 
    '   Políticas configuradas' as info,
    policyname as policy_name,
    cmd as operation,
    COALESCE(roles::text, 'all') as allowed_roles,
    CASE 
        WHEN cmd = 'INSERT' THEN '✅'
        WHEN cmd = 'SELECT' THEN '✅'
        WHEN cmd = 'UPDATE' THEN '✅'
        WHEN cmd = 'DELETE' THEN '✅'
        WHEN cmd = '*' THEN '✅ ALL'
        ELSE '❓'
    END as check_mark
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (policyname LIKE 'merchant_assets%' OR policyname LIKE '%merchant%')
ORDER BY cmd;

-- ==========================================
-- 4. VERIFICAR AUTENTICAÇÃO ATUAL
-- ==========================================
SELECT 
    '4. USER AUTH' as check_item,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        THEN '✅ Usuário autenticado: ' || auth.uid()::text
        ELSE '❌ NÃO autenticado - faça login!'
    END as status;

-- ==========================================
-- 5. VERIFICAR ARQUIVOS EXISTENTES
-- ==========================================
SELECT 
    '5. FILES IN BUCKET' as check_item,
    CASE 
        WHEN COUNT(*) > 0 
        THEN '✅ ' || COUNT(*) || ' arquivo(s) no bucket'
        ELSE 'ℹ️ Nenhum arquivo ainda (normal se primeiro upload)'
    END as status
FROM storage.objects 
WHERE bucket_id = 'merchant-assets';

-- Listar últimos arquivos
SELECT 
    '   Últimos uploads' as info,
    name as file_name,
    SUBSTRING(name FROM 1 FOR 50) as short_name,
    created_at,
    (metadata->>'size')::bigint / 1024 as size_kb
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 5;

-- ==========================================
-- 6. TESTE DE PERMISSÕES
-- ==========================================
SELECT 
    '6. PERMISSION TEST' as check_item,
    '✅ Se você vê esta mensagem, o SELECT funciona!' as status;

-- ==========================================
-- RESUMO FINAL
-- ==========================================
SELECT 
    '========================================' as separator,
    'RESUMO DA CONFIGURAÇÃO' as title;

SELECT 
    CASE 
        WHEN (
            -- Bucket existe
            EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'merchant-assets')
            AND
            -- RLS habilitado
            EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects' AND rowsecurity = true)
            AND
            -- Pelo menos 1 política
            EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'merchant_assets%')
        )
        THEN '✅ CONFIGURAÇÃO PARECE BOA - TESTE O UPLOAD!'
        ELSE '❌ AINDA HÁ PROBLEMAS - Veja os checks acima'
    END as final_status;

-- ==========================================
-- PRÓXIMO PASSO
-- ==========================================
SELECT 
    'PRÓXIMO PASSO' as action,
    'Vá para /whitelabel e tente fazer upload de uma imagem' as instruction;
