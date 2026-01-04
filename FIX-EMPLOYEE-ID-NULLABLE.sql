-- =========================================
-- FIX: Tornar employee_id NULLABLE
-- =========================================
-- Problema: employee_id é NOT NULL mas deveria ser NULL quando merchant opera diretamente
-- Erro: 23503 - foreign key constraint violation

-- 1. Remover constraint NOT NULL de employee_id
ALTER TABLE transactions 
  ALTER COLUMN employee_id DROP NOT NULL;

-- 2. Remover constraint NOT NULL de redemptions (mesma tabela)
ALTER TABLE redemptions 
  ALTER COLUMN employee_id DROP NOT NULL;

-- 3. Verificar mudanças
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND column_name = 'employee_id';

SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'redemptions' 
  AND column_name = 'employee_id';

-- ✅ Após executar este SQL, employee_id pode ser NULL
-- ✅ Permitindo que merchants operem sem employee vinculado
