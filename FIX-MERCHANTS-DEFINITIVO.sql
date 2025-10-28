-- ==========================================
-- FIX DEFINITIVO - MERCHANTS TABLE
-- ==========================================
-- Este script garante que a tabela merchants
-- tenha TODAS as colunas necessárias
-- ==========================================

-- 1. Verificar estrutura atual
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'merchants'
ORDER BY ordinal_position;

-- 2. Adicionar coluna ADDRESS se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE merchants ADD COLUMN address TEXT;
        RAISE NOTICE 'Coluna address adicionada!';
    ELSE
        RAISE NOTICE 'Coluna address já existe!';
    END IF;
END $$;

-- 3. Garantir que coluna EMAIL existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE merchants ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Coluna email adicionada!';
    ELSE
        RAISE NOTICE 'Coluna email já existe!';
    END IF;
END $$;

-- 4. Garantir que coluna IS_ACTIVE existe (não active)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE merchants ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Coluna is_active adicionada!';
    ELSE
        RAISE NOTICE 'Coluna is_active já existe!';
    END IF;
END $$;

-- 5. Se houver coluna ACTIVE (duplicada), remover dados nulos
UPDATE merchants SET active = true WHERE active IS NULL AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' AND column_name = 'active'
);

-- 6. DESABILITAR RLS temporariamente para testes
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;

-- 7. Ou criar política permissiva
DROP POLICY IF EXISTS "Allow all for merchants" ON merchants;

CREATE POLICY "Allow all for merchants"
ON merchants
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- 8. Reabilitar RLS
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- 9. FORÇAR RELOAD DO SCHEMA (CRÍTICO!)
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 10. Terminar conexões antigas do PostgREST
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE usename = 'authenticator' 
AND state = 'idle';

-- 11. Forçar reload novamente
NOTIFY pgrst, 'reload schema';

-- 12. Verificar resultado final
SELECT 
    'merchants' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'merchants'
AND column_name IN ('id', 'name', 'email', 'phone', 'address', 'cashback_percentage', 'is_active', 'active')
ORDER BY column_name;

-- 13. Mostrar políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'merchants';
