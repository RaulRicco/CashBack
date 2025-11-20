-- ========================================
-- 🚨 SQL DE EMERGÊNCIA - COPIE E COLE AGORA
-- ========================================
-- 
-- INSTRUÇÕES:
-- 1. Vá em https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Menu lateral: SQL Editor
-- 4. Clique: New Query
-- 5. COLE TUDO DAQUI PRA BAIXO
-- 6. Clique: RUN (ou Ctrl+Enter)
-- 7. Aguarde 3 segundos
-- 8. Teste a URL da logo no navegador
--
-- TEMPO: 1 MINUTO
-- ========================================


-- PASSO 1: GARANTIR QUE O BUCKET É PÚBLICO
UPDATE storage.buckets 
SET public = true 
WHERE id = 'merchant-assets';


-- PASSO 2: REMOVER POLÍTICAS ANTIGAS (pode dar erro, é normal)
DROP POLICY IF EXISTS "Allow public read access to logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public read all" ON storage.objects;
DROP POLICY IF EXISTS "Allow all public read" ON storage.objects;


-- PASSO 3: CRIAR POLÍTICA SIMPLES DE LEITURA PÚBLICA
CREATE POLICY "Public can read merchant assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'merchant-assets');


-- PASSO 4: PERMITIR UPLOADS DE USUÁRIOS AUTENTICADOS
DROP POLICY IF EXISTS "Authenticated can upload" ON storage.objects;

CREATE POLICY "Authenticated can upload to merchant assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-assets');


-- PASSO 5: PERMITIR ATUALIZAÇÃO
DROP POLICY IF EXISTS "Authenticated can update" ON storage.objects;

CREATE POLICY "Authenticated can update merchant assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'merchant-assets')
WITH CHECK (bucket_id = 'merchant-assets');


-- PASSO 6: VERIFICAR SE FUNCIONOU
SELECT 
  '✅ Bucket configurado:' as status,
  id,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'merchant-assets';


-- PASSO 7: LISTAR POLÍTICAS CRIADAS
SELECT 
  '✅ Políticas ativas:' as status,
  policyname,
  cmd as operacao
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%merchant%'
ORDER BY policyname;


-- PASSO 8: VER ARQUIVOS NO STORAGE
SELECT 
  '📁 Arquivos no storage:' as status,
  name,
  created_at,
  metadata->>'size' as tamanho_bytes
FROM storage.objects
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 5;


-- ========================================
-- ✅ RESULTADOS ESPERADOS:
-- ========================================
--
-- Você deve ver 3 blocos de resultados:
--
-- 1. ✅ Bucket configurado:
--    - id: merchant-assets
--    - public: true
--    - file_size_limit: algum número
--
-- 2. ✅ Políticas ativas:
--    - Public can read merchant assets (SELECT)
--    - Authenticated can upload to merchant assets (INSERT)
--    - Authenticated can update merchant assets (UPDATE)
--
-- 3. 📁 Arquivos no storage:
--    - Lista de arquivos (se tiver algum)
--    - OU vazio (se nunca fez upload)
--
-- ========================================
-- 🧪 TESTE AGORA:
-- ========================================
--
-- Abra esta URL no navegador:
-- https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png
--
-- SE A IMAGEM APARECER: ✅ PROBLEMA RESOLVIDO!
-- SE DER ERRO 404: O arquivo não existe, tente fazer upload novamente
-- SE DER ERRO 403: Execute este SQL novamente ou me avise
--
-- ========================================
