-- Remove ALL remaining policies from tables with RLS disabled

-- Remove policies from custom_domains
DROP POLICY IF EXISTS "Merchants can create own domains" ON custom_domains CASCADE;
DROP POLICY IF EXISTS "Merchants can delete own domains" ON custom_domains CASCADE;
DROP POLICY IF EXISTS "Merchants can update own domains" ON custom_domains CASCADE;
DROP POLICY IF EXISTS "Merchants can view own domains" ON custom_domains CASCADE;
DROP POLICY IF EXISTS "Service role has full access" ON custom_domains CASCADE;

-- Remove policies from email_verifications
DROP POLICY IF EXISTS "Allow insert for email verifications" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Allow select own email verification" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Allow update for verification" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Permitir atualizar próprio token" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Permitir consultar próprio token" ON email_verifications CASCADE;
DROP POLICY IF EXISTS "Permitir criar tokens de verificação" ON email_verifications CASCADE;

-- Remove policies from integration_configs
DROP POLICY IF EXISTS "Allow delete integration_configs" ON integration_configs CASCADE;
DROP POLICY IF EXISTS "Allow insert integration_configs" ON integration_configs CASCADE;
DROP POLICY IF EXISTS "Allow select integration_configs" ON integration_configs CASCADE;
DROP POLICY IF EXISTS "Allow update integration_configs" ON integration_configs CASCADE;

-- Remove policies from integration_sync_log
DROP POLICY IF EXISTS "Enable all for integration_sync_log" ON integration_sync_log CASCADE;

-- Remove policies from password_recovery_tokens
DROP POLICY IF EXISTS "Allow all for recovery tokens" ON password_recovery_tokens CASCADE;

-- Verify all policies are removed
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('custom_domains', 'email_verifications', 'integration_configs', 'integration_sync_log', 'password_recovery_tokens')
ORDER BY tablename, policyname;
