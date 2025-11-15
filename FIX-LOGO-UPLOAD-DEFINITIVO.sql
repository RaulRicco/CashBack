-- =====================================================
-- FIX DEFINITIVO - LOGO UPLOAD NO PERFIL DO ESTABELECIMENTO
-- =====================================================
-- Erro: ❌ Erro ao carregar logo: https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/...
-- Causa: Bucket merchant-assets não está público ou políticas RLS bloqueando acesso
-- Solução: Tornar bucket público + criar políticas RLS corretas
-- =====================================================

-- ==========================================
-- 1. VERIFICAR SE BUCKET EXISTE
-- ==========================================
DO $$ 
BEGIN
    -- Se não existe, criar bucket público
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'merchant-assets') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'merchant-assets',
            'merchant-assets',
            true, -- PÚBLICO!
            2097152, -- 2MB em bytes
            ARRAY['image/png', 'image/jpeg', 'image/jpg']::text[]
        );
        RAISE NOTICE '✅ Bucket merchant-assets criado com sucesso!';
    ELSE
        -- Se já existe, atualizar para público
        UPDATE storage.buckets 
        SET 
            public = true,
            file_size_limit = 2097152,
            allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg']::text[]
        WHERE name = 'merchant-assets';
        RAISE NOTICE '✅ Bucket merchant-assets atualizado para público!';
    END IF;
END $$;

-- ==========================================
-- 2. LIMPAR POLÍTICAS ANTIGAS
-- ==========================================
DROP POLICY IF EXISTS "merchant_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "merchant_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "merchant_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "merchant_assets_delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- ==========================================
-- 3. HABILITAR RLS
-- ==========================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. CRIAR POLÍTICAS RLS CORRETAS
-- ==========================================

-- 4.1. SELECT (LEITURA PÚBLICA) - QUALQUER UM PODE VER AS LOGOS
CREATE POLICY "merchant_assets_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'merchant-assets');

-- 4.2. INSERT (UPLOAD) - APENAS USUÁRIOS AUTENTICADOS
CREATE POLICY "merchant_assets_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-assets');

-- 4.3. UPDATE (ATUALIZAÇÃO) - APENAS USUÁRIOS AUTENTICADOS
CREATE POLICY "merchant_assets_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'merchant-assets')
WITH CHECK (bucket_id = 'merchant-assets');

-- 4.4. DELETE (EXCLUSÃO) - APENAS USUÁRIOS AUTENTICADOS
CREATE POLICY "merchant_assets_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'merchant-assets');

-- ==========================================
-- 5. VERIFICAÇÃO FINAL
-- ==========================================

-- Verificar bucket
SELECT 
    '✅ BUCKET CONFIGURADO' as status,
    name,
    public as is_public,
    file_size_limit / 1024 / 1024 || ' MB' as max_size,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'merchant-assets';

-- Verificar políticas
SELECT 
    '✅ POLÍTICAS CRIADAS' as status,
    policyname,
    cmd as operation,
    roles::text as allowed_roles
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE 'merchant_assets%'
ORDER BY cmd;

-- Verificar RLS
SELECT 
    '✅ RLS STATUS' as status,
    CASE 
        WHEN rowsecurity = true THEN 'Habilitado ✓'
        ELSE 'Desabilitado ✗'
    END as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- ==========================================
-- 6. TESTAR ACESSO (OPCIONAL)
-- ==========================================

-- Listar arquivos já enviados (se houver)
SELECT 
    'ℹ️ ARQUIVOS NO BUCKET' as info,
    name as file_name,
    created_at,
    (metadata->>'size')::bigint / 1024 as size_kb
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 5;

-- ==========================================
-- PRÓXIMOS PASSOS
-- ==========================================
SELECT '🎯 PRÓXIMO PASSO' as action, 
       'Teste fazer upload de uma logo em /whitelabel' as instruction;

-- ==========================================
-- IMPORTANTE
-- ==========================================
-- Após executar este script:
-- 1. Vá até a página "Meu CashBack" (White Label)
-- 2. Faça upload de uma nova logo
-- 3. Clique em "Salvar Configurações"
-- 4. A logo deve aparecer corretamente
-- 
-- Se o erro persistir, execute: verify_storage_fix.sql
-- ==========================================
