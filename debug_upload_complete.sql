-- ========================================
-- DEBUG COMPLETO DO UPLOAD
-- ========================================

-- 1. Verificar sessão autenticada
SELECT 
    '1. SESSÃO AUTENTICADA' as check_name,
    auth.uid() as user_id,
    auth.email() as email,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        THEN '✅ LOGADO'
        ELSE '❌ NÃO LOGADO - FAÇA LOGIN!'
    END as status;

-- 2. Verificar bucket
SELECT 
    '2. BUCKET CONFIG' as check_name,
    id,
    name,
    public as is_public,
    CASE 
        WHEN public = true 
        THEN '✅ Público'
        ELSE '❌ NÃO público - CORRIGIR!'
    END as status,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'merchant-assets';

-- 3. Verificar RLS
SELECT 
    '3. RLS STATUS' as check_name,
    tablename,
    CASE 
        WHEN rowsecurity = true 
        THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- 4. Listar TODAS as políticas
SELECT 
    '4. POLÍTICAS' as check_name,
    policyname,
    cmd as operation,
    roles,
    permissive as is_permissive,
    with_check,
    qual as using_clause
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY cmd, policyname;

-- 5. Contar políticas
SELECT 
    '5. TOTAL DE POLÍTICAS' as check_name,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) >= 4 
        THEN '✅ ' || COUNT(*) || ' políticas (bom!)'
        WHEN COUNT(*) >= 1
        THEN '⚠️ ' || COUNT(*) || ' política(s) (esperado: 4)'
        ELSE '❌ NENHUMA política!'
    END as status
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- 6. Verificar merchant atual
SELECT 
    '6. MERCHANT ATUAL' as check_name,
    m.id,
    m.name,
    m.business_name,
    m.user_id,
    CASE 
        WHEN m.user_id = auth.uid() 
        THEN '✅ Merchant é do usuário logado'
        ELSE '❌ Merchant NÃO é do usuário logado'
    END as ownership_status
FROM merchants m
WHERE m.user_id = auth.uid();

-- 7. Testar permissões no bucket
SELECT 
    '7. TEST PERMISSIONS' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.objects 
            WHERE bucket_id = 'merchant-assets' 
            LIMIT 1
        )
        THEN '✅ Pode ler objects'
        ELSE 'ℹ️ Nenhum object ainda ou sem permissão de leitura'
    END as read_status;

-- 8. RESUMO FINAL
SELECT 
    '8. RESUMO FINAL' as check_name,
    CASE 
        WHEN auth.uid() IS NULL 
        THEN '❌ ERRO: Você NÃO está logado!'
        WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'merchant-assets' AND public = true)
        THEN '❌ ERRO: Bucket não existe ou não é público'
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') = 0
        THEN '❌ ERRO: Nenhuma política RLS configurada'
        ELSE '✅ CONFIGURAÇÃO OK - Teste o upload!'
    END as final_status;
