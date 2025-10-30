-- =====================================================
-- CORRIGIR UPLOAD DE LOGO - MEU CASHBACK
-- Execute no Supabase SQL Editor
-- =====================================================

-- 1. Tornar bucket público
UPDATE storage.buckets 
SET public = true
WHERE name = 'merchant-assets';

-- 2. Verificar se funcionou
SELECT 
    name,
    public,
    CASE 
        WHEN public = true THEN '✅ PÚBLICO - Upload vai funcionar!'
        ELSE '❌ PRIVADO - Ainda tem problema'
    END as status
FROM storage.buckets 
WHERE name = 'merchant-assets';
