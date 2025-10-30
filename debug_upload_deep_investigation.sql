-- =====================================================
-- INVESTIGAÇÃO PROFUNDA DO ERRO DE UPLOAD
-- =====================================================

-- 1. VERIFICAR USUÁRIO ATUAL E SESSÃO
SELECT 
    '=== 1. AUTENTICAÇÃO ===' as section,
    auth.uid() as user_id,
    auth.email() as user_email,
    auth.role() as user_role,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ NÃO AUTENTICADO'
        ELSE '✅ AUTENTICADO'
    END as status;

-- 2. VERIFICAR BUCKET MERCHANT-ASSETS
SELECT 
    '=== 2. BUCKET CONFIG ===' as section,
    id,
    name,
    owner,
    public as is_public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types,
    CASE 
        WHEN public = true THEN '✅ Público'
        ELSE '⚠️ Privado'
    END as public_status
FROM storage.buckets 
WHERE name = 'merchant-assets';

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
    '=== 3. RLS STATUS ===' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- 4. LISTAR TODAS AS POLÍTICAS (NÃO SÓ merchant-assets)
SELECT 
    '=== 4. TODAS AS POLÍTICAS ===' as section,
    policyname,
    cmd as operation,
    permissive,
    roles::text as allowed_roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname, cmd;

-- 5. VERIFICAR SE HÁ OBJETOS NO BUCKET
SELECT 
    '=== 5. OBJETOS NO BUCKET ===' as section,
    COUNT(*) as total_objects,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Bucket tem ' || COUNT(*) || ' objetos'
        ELSE 'ℹ️ Bucket vazio (normal se é primeira vez)'
    END as status
FROM storage.objects 
WHERE bucket_id = 'merchant-assets';

-- 6. LISTAR ÚLTIMOS OBJETOS (se existirem)
SELECT 
    '=== 6. ÚLTIMOS UPLOADS ===' as section,
    name as file_name,
    owner as uploaded_by,
    created_at,
    updated_at,
    (metadata->>'size')::bigint as size_bytes,
    (metadata->>'mimetype') as mime_type
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 5;

-- 7. VERIFICAR ROLES DO USUÁRIO ATUAL
SELECT 
    '=== 7. ROLES DO USUÁRIO ===' as section,
    rolname,
    rolsuper as is_superuser,
    rolinherit,
    rolcreatedb,
    rolcreaterole
FROM pg_roles 
WHERE rolname IN ('authenticated', 'anon', 'postgres', auth.role()::text);

-- 8. TESTAR SE CONSEGUE INSERIR (SIMULAÇÃO)
SELECT 
    '=== 8. TESTE DE PERMISSÃO ===' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects'
            AND cmd = 'INSERT'
            AND (roles::text LIKE '%authenticated%' OR roles::text LIKE '%anon%' OR roles::text = '{public}')
        )
        THEN '✅ Existe política de INSERT para usuários autenticados'
        ELSE '❌ NÃO existe política de INSERT adequada'
    END as insert_policy_status;

-- 9. VERIFICAR PERMISSÕES DA TABELA storage.objects
SELECT 
    '=== 9. PERMISSÕES DA TABELA ===' as section,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'storage'
AND table_name = 'objects'
AND grantee IN ('authenticated', 'anon', 'public')
ORDER BY grantee, privilege_type;

-- 10. RESUMO E DIAGNÓSTICO
SELECT 
    '=== 10. DIAGNÓSTICO FINAL ===' as section,
    CASE 
        -- Usuário autenticado?
        WHEN auth.uid() IS NULL THEN '❌ PROBLEMA: Usuário não está autenticado'
        
        -- Bucket existe?
        WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'merchant-assets') 
        THEN '❌ PROBLEMA: Bucket merchant-assets não existe'
        
        -- RLS habilitado?
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects' AND rowsecurity = true)
        THEN '⚠️ AVISO: RLS está desabilitado'
        
        -- Tem política de INSERT?
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects'
            AND cmd = 'INSERT'
            AND bucket_id = 'merchant-assets'
        )
        THEN '❌ PROBLEMA: Não há política de INSERT para merchant-assets'
        
        -- Tudo OK
        ELSE '✅ CONFIGURAÇÃO PARECE CORRETA - O problema pode ser outro'
    END as diagnostic,
    
    -- Sugestão
    CASE 
        WHEN auth.uid() IS NULL THEN 'AÇÃO: Faça logout e login novamente no sistema'
        
        WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'merchant-assets')
        THEN 'AÇÃO: Criar bucket merchant-assets via Dashboard do Supabase'
        
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects'
            AND cmd = 'INSERT'
        )
        THEN 'AÇÃO: Criar políticas RLS via interface do Storage (não SQL Editor)'
        
        ELSE 'AÇÃO: Tentar upload novamente ou desabilitar RLS temporariamente'
    END as suggested_action;

