-- Verificar estrutura da tabela employees
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- Verificar employees existentes
SELECT id, name, email, role, is_active, merchant_id, created_at
FROM employees
ORDER BY created_at DESC
LIMIT 10;
