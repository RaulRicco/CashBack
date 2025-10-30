-- =====================================================
-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS
-- Execute este script como SUPERUSER (postgres role)
-- =====================================================

-- 1. Remover TODAS as políticas antigas do bucket merchant-assets
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND (
            policyname LIKE '%merchant%' 
            OR policyname LIKE '%assets%'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- 2. Garantir que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Política MUITO PERMISSIVA para INSERT (authenticated users)
CREATE POLICY "merchant_assets_insert_permissive"
ON storage.objects
FOR INSERT
TO authenticated, anon
WITH CHECK (
    bucket_id = 'merchant-assets'
);

-- 4. Política para SELECT (público pode ler)
CREATE POLICY "merchant_assets_select_public"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'merchant-assets'
);

-- 5. Política para UPDATE (authenticated users)
CREATE POLICY "merchant_assets_update_permissive"
ON storage.objects
FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'merchant-assets')
WITH CHECK (bucket_id = 'merchant-assets');

-- 6. Política para DELETE (authenticated users)
CREATE POLICY "merchant_assets_delete_permissive"
ON storage.objects
FOR DELETE
TO authenticated, anon
USING (bucket_id = 'merchant-assets');

-- 7. Verificar políticas criadas
SELECT 
    '✅ POLÍTICAS CRIADAS' as status,
    policyname,
    cmd,
    roles::text as roles
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE 'merchant_assets%'
ORDER BY cmd;

-- 8. Verificar bucket
SELECT 
    '✅ BUCKET CONFIG' as status,
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE name = 'merchant-assets';
