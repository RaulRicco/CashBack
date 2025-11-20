-- ============================================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA 406
-- ============================================================

-- 1. Listar TODAS as policies que ainda existem
SELECT 
    '🔴 POLICIES EXISTENTES' as status,
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. Verificar status de RLS em TODAS as tabelas
SELECT 
    '🔍 STATUS DE RLS' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Verificar especificamente as tabelas problemáticas
SELECT 
    '🎯 TABELAS CRÍTICAS' as status,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies 
     WHERE pg_policies.schemaname = 'public' 
     AND pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('merchants', 'customers', 'password_reset_tokens', 'email_verifications')
ORDER BY tablename;

-- 4. Verificar grants e permissões
SELECT 
    '🔐 PERMISSÕES' as status,
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('merchants', 'customers', 'password_reset_tokens')
AND grantee = 'anon'
ORDER BY table_name, privilege_type;
