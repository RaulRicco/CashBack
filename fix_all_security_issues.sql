-- ============================================================
-- CRITICAL FIX: Remove ALL policies to resolve 406 errors
-- ============================================================
-- This SQL removes all RLS policies from tables that have
-- policies defined but RLS disabled (causing PostgREST 406)
-- ============================================================

-- 1. Remove policies from custom_domains
DROP POLICY IF EXISTS "Merchants can create own domains" ON custom_domains CASCADE;
DROP POLICY IF EXISTS "Merchants can delete own domains" ON custom_domains CASCADE;
DROP POLICY IF EXISTS "Merchants can update own domains" ON custom_domains CASCADE;
DROP POLICY IF EXISTS "Merchants can view own domains" ON custom_domains CASCADE;
DROP POLICY IF EXISTS "Service role has full access" ON custom_domains CASCADE;

-- 2. Remove policies from email_verifications
DROP POLICY IF EXISTS "Allow insert for email verifications" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Allow select own email verification" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Allow update for verification" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Permitir atualizar próprio token" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Permitir consultar próprio token" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Permitir criar tokens de verificação" ON email_verifications CASCADE;

-- 3. Remove policies from integration_configs
DROP POLICY IF EXISTS "Allow delete integration_configs" ON integration_configs CASCADE;
DROP POLICY IF EXISTS "Allow insert integration_configs" ON integration_configs CASCADE;
DROP POLICY IF EXISTS "Allow select integration_configs" ON integration_configs CASCADE;
DROP POLICY IF EXISTS "Allow update integration_configs" ON integration_configs CASCADE;

-- 4. Remove policies from integration_sync_log
DROP POLICY IF EXISTS "Enable all for integration_sync_log" ON integration_sync_log CASCADE;

-- 5. Remove policies from password_recovery_tokens
DROP POLICY IF EXISTS "Allow all for recovery tokens" ON password_recovery_tokens CASCADE;

-- ============================================================
-- VERIFICATION: Check if any policies still exist
-- ============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- SUMMARY: Show RLS status for all tables
-- ============================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) 
     FROM pg_policies 
     WHERE pg_policies.schemaname = pg_tables.schemaname 
     AND pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
