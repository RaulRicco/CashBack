-- ========================================
-- 🚨 FIX EMERGENCIAL - LOGO UPLOAD
-- ========================================
-- Execute este SQL no Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Cole e Execute)

-- PASSO 1: GARANTIR QUE O BUCKET EXISTE E É PÚBLICO
-- ========================================
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
WHERE id = 'merchant-assets';

-- Verificar se atualizou
SELECT id, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'merchant-assets';


-- PASSO 2: REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ========================================
DROP POLICY IF EXISTS "Allow public read access to logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can delete logos" ON storage.objects;


-- PASSO 3: CRIAR POLÍTICAS CORRETAS
-- ========================================

-- 3.1: LEITURA PÚBLICA (QUALQUER UM PODE VER AS LOGOS)
CREATE POLICY "Public can read all merchant assets"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'merchant-assets'
);

-- 3.2: MERCHANTS PODEM FAZER UPLOAD DE SUAS LOGOS
CREATE POLICY "Merchants can upload their logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'merchant-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 3.3: MERCHANTS PODEM ATUALIZAR SUAS LOGOS
CREATE POLICY "Merchants can update their logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'merchant-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.foldername(name))[2]
)
WITH CHECK (
  bucket_id = 'merchant-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 3.4: MERCHANTS PODEM DELETAR SUAS LOGOS
CREATE POLICY "Merchants can delete their logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'merchant-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);


-- PASSO 4: VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;


-- PASSO 5: TESTAR ACESSO PÚBLICO
-- ========================================
-- Execute esta query para ver se o arquivo existe:
SELECT 
  id,
  name,
  bucket_id,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'merchant-assets'
  AND name LIKE '%1762951941910%'
ORDER BY created_at DESC
LIMIT 5;


-- PASSO 6: SE O ARQUIVO NÃO EXISTIR, VERIFICAR UPLOADS RECENTES
-- ========================================
SELECT 
  id,
  name,
  bucket_id,
  created_at,
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 10;


-- ========================================
-- 🎯 RESULTADOS ESPERADOS:
-- ========================================
-- 
-- 1. UPDATE storage.buckets → Deve retornar "UPDATE 1"
-- 2. SELECT storage.buckets → Deve mostrar public = true
-- 3. DROP POLICY → Pode dar erro "não existe" (tudo bem)
-- 4. CREATE POLICY → Deve retornar "CREATE POLICY" para cada uma
-- 5. SELECT pg_policies → Deve listar 4 políticas criadas
-- 6. SELECT storage.objects → Deve mostrar seu arquivo OU vazio
--
-- ========================================
-- 📋 O QUE FAZER DEPOIS:
-- ========================================
--
-- SE O ARQUIVO EXISTIR (PASSO 5 retornar algo):
--   → O problema é só de política/permissão
--   → Teste a URL no navegador novamente
--   → Deve funcionar agora!
--
-- SE O ARQUIVO NÃO EXISTIR (PASSO 5 retornar vazio):
--   → O upload está falhando silenciosamente
--   → Precisamos ver o código JavaScript
--   → Execute o script diagnostico-logo-upload.sh
--
-- ========================================
