-- ============================================================
-- FIX SUPABASE STORAGE BUCKET - merchant-assets
-- ============================================================
-- Execute este SQL no Supabase SQL Editor para corrigir
-- o problema de visualização das imagens
-- ============================================================

-- 1. Tornar o bucket público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'merchant-assets';

-- 2. Limpar políticas antigas do storage (se existirem)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for merchant-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public insert for merchant-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public update for merchant-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public delete for merchant-assets" ON storage.objects;

-- 3. Criar políticas de acesso público para o bucket merchant-assets
CREATE POLICY "Public read access for merchant-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'merchant-assets');

CREATE POLICY "Public insert for merchant-assets"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'merchant-assets');

CREATE POLICY "Public update for merchant-assets"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'merchant-assets')
WITH CHECK (bucket_id = 'merchant-assets');

CREATE POLICY "Public delete for merchant-assets"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'merchant-assets');

-- 4. Verificar se funcionou
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'merchant-assets';

-- ============================================================
-- RESULTADO ESPERADO:
-- A query acima deve retornar:
-- id: merchant-assets
-- name: merchant-assets
-- public: true  <-- DEVE SER TRUE!
-- ============================================================
