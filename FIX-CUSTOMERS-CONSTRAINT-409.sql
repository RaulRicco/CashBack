-- ============================================
-- FIX: Erro 409 (Conflict) na tabela CUSTOMERS
-- ============================================
-- Problema: Erro 409 ao cadastrar clientes
-- Causa: Constraint UNIQUE no campo phone bloqueando
-- Solução: Remover UNIQUE do phone, permitir duplicatas entre merchants
-- ============================================

-- 1. VERIFICAR CONSTRAINTS ATUAIS
-- Execute primeiro para ver o que existe:
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'customers'
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- ============================================
-- 2. REMOVER CONSTRAINT UNIQUE DO PHONE
-- ============================================

-- Encontrar o nome exato da constraint (pode variar)
-- Geralmente é algo como: customers_phone_key

-- OPÇÃO A: Se a constraint se chama 'customers_phone_key'
DROP INDEX IF EXISTS customers_phone_key CASCADE;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_key CASCADE;

-- OPÇÃO B: Outros nomes possíveis
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_unique CASCADE;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS unique_phone CASCADE;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_idx CASCADE;

-- Remover índice único do phone
DROP INDEX IF EXISTS idx_customers_phone CASCADE;
DROP INDEX IF EXISTS customers_phone_idx CASCADE;

-- ============================================
-- 3. CRIAR ÍNDICE COMPOSTO (phone + merchant_id)
-- ============================================

-- Este índice permite o mesmo phone em merchants diferentes
-- mas garante que não haja duplicatas dentro do mesmo merchant
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone_merchant
ON customers (phone, referred_by_merchant_id);

-- ============================================
-- 4. ADICIONAR CONSTRAINT COMPOSTA (OPCIONAL)
-- ============================================

-- Constraint composta: phone + merchant_id deve ser único
ALTER TABLE customers 
ADD CONSTRAINT customers_phone_merchant_unique 
UNIQUE (phone, referred_by_merchant_id);

-- ============================================
-- 5. VERIFICAR SE FUNCIONOU
-- ============================================

-- Ver constraints depois das mudanças
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'customers'
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Ver índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'customers'
AND schemaname = 'public';

-- ============================================
-- ALTERNATIVA RÁPIDA (Se der erro nas opções acima)
-- ============================================

-- Se você não sabe o nome exato da constraint, execute:
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'customers' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%phone%'
    LOOP
        EXECUTE 'ALTER TABLE customers DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name || ' CASCADE';
        RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
    END LOOP;
END $$;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- Erro 409 = Conflict = Duplicate Key Violation
-- 
-- O problema é que a tabela customers tinha:
--   - UNIQUE constraint no campo 'phone'
--   - Isso impede o mesmo telefone em merchants diferentes
-- 
-- A solução:
--   - Remove UNIQUE do phone sozinho
--   - Cria UNIQUE composto: (phone + merchant_id)
--   - Permite mesmo phone em merchants diferentes
--   - Mas impede duplicatas dentro do mesmo merchant
-- 
-- Depois de executar este SQL:
--   ✅ Cliente pode ter phone 11999999999 no Merchant A
--   ✅ Mesmo cliente pode ter phone 11999999999 no Merchant B
--   ❌ Cliente NÃO pode ter phone duplicado no mesmo Merchant A
-- 
-- ============================================
