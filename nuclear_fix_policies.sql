-- ============================================================
-- NUCLEAR FIX: Remove ALL policies from ALL tables
-- ============================================================
-- This will forcefully remove every single policy that exists
-- ============================================================

-- Get all policies dynamically and drop them
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename
        );
        RAISE NOTICE 'Dropped policy % on table %.%',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename;
    END LOOP;
END $$;

-- Verify all policies are gone
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- If the above returns "No rows", SUCCESS! All policies removed.
