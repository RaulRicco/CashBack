-- ============================================
-- 🔥 EXECUTAR ESTE SQL AGORA NO SUPABASE
-- ============================================

-- 1. DELETAR todos os arquivos corrompidos
DELETE FROM storage.objects WHERE bucket_id = 'merchant-assets';

-- 2. LIMPAR logo_url do merchant
UPDATE merchants SET logo_url = NULL 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';

-- 3. VERIFICAR limpeza (DEVE retornar 0 em ambos)
SELECT 'Storage limpo?' as verificacao, COUNT(*) as total
FROM storage.objects WHERE bucket_id = 'merchant-assets'
UNION ALL
SELECT 'Logo removido?' as verificacao, COUNT(*) as total
FROM merchants 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da' AND logo_url IS NOT NULL;

-- ============================================
-- ✅ RESULTADO ESPERADO:
-- Storage limpo?  | 0
-- Logo removido?  | 0
-- ============================================

-- DEPOIS DE EXECUTAR ESTE SQL:
-- 1. Execute: ./VERIFICAR_CODIGO_ATUALIZADO.sh
-- 2. Inicie: npm run dev
-- 3. Abra ABA ANÔNIMA: Ctrl+Shift+N
-- 4. Acesse: http://localhost:5173/dashboard/white-label
-- 5. Faça upload do logo
-- ============================================
