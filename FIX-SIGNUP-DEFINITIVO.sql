-- ==========================================
-- FIX DEFINITIVO - SIGNUP COMPLETO + PASSWORD RECOVERY
-- ==========================================
-- Execute este SQL no Supabase SQL Editor
-- Depois: Pause/Resume o projeto para limpar cache
-- ==========================================

-- ==========================================
-- PARTE 1: CORRIGIR MERCHANTS
-- ==========================================

-- Adicionar coluna 'address' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' AND column_name = 'address'
    ) THEN
        ALTER TABLE merchants ADD COLUMN address TEXT;
    END IF;
END $$;

-- Adicionar coluna 'email' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' AND column_name = 'email'
    ) THEN
        ALTER TABLE merchants ADD COLUMN email TEXT;
    END IF;
END $$;

-- Tornar email nullable (não obrigatório)
ALTER TABLE merchants ALTER COLUMN email DROP NOT NULL;

-- ==========================================
-- PARTE 2: CORRIGIR EMPLOYEES
-- ==========================================

-- Adicionar coluna 'password' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'password'
    ) THEN
        ALTER TABLE employees ADD COLUMN password TEXT;
    END IF;
END $$;

-- Se existir password_hash, tornar nullable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE employees ALTER COLUMN password_hash DROP NOT NULL;
    END IF;
END $$;

-- ==========================================
-- PARTE 3: CRIAR TABELA DE PASSWORD RECOVERY
-- ==========================================

-- Tabela para tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_recovery_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_recovery_token ON password_recovery_tokens(token);
CREATE INDEX IF NOT EXISTS idx_recovery_employee ON password_recovery_tokens(employee_id);
CREATE INDEX IF NOT EXISTS idx_recovery_expires ON password_recovery_tokens(expires_at);

-- ==========================================
-- PARTE 4: RLS (Row Level Security)
-- ==========================================

-- Desabilitar RLS temporariamente
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_recovery_tokens DISABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas
DROP POLICY IF EXISTS "Allow all for merchants" ON merchants;
DROP POLICY IF EXISTS "Allow all for employees" ON employees;
DROP POLICY IF EXISTS "Allow all for recovery tokens" ON password_recovery_tokens;

-- Criar políticas permissivas
CREATE POLICY "Allow all for merchants"
ON merchants FOR ALL
TO anon, authenticated, service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for employees"
ON employees FOR ALL
TO anon, authenticated, service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for recovery tokens"
ON password_recovery_tokens FOR ALL
TO anon, authenticated, service_role
USING (true) WITH CHECK (true);

-- Reabilitar RLS
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_recovery_tokens ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PARTE 5: FORÇAR RELOAD DO SCHEMA CACHE
-- ==========================================

-- Notificar PostgREST para recarregar
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Terminar conexões antigas
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE usename = 'authenticator' AND state = 'idle';

-- Forçar reload novamente
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- PARTE 6: VERIFICAÇÃO FINAL
-- ==========================================

-- Verificar estrutura MERCHANTS
SELECT 'MERCHANTS' as tabela, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'merchants'
AND column_name IN ('id', 'name', 'email', 'phone', 'address', 'cashback_percentage')
ORDER BY column_name;

-- Verificar estrutura EMPLOYEES
SELECT 'EMPLOYEES' as tabela, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
AND column_name IN ('id', 'merchant_id', 'name', 'email', 'password', 'password_hash', 'role')
ORDER BY column_name;

-- Verificar estrutura PASSWORD_RECOVERY_TOKENS
SELECT 'PASSWORD_RECOVERY_TOKENS' as tabela, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'password_recovery_tokens'
ORDER BY column_name;

-- ==========================================
-- ✅ CONCLUSÃO
-- ==========================================
-- Após executar este SQL:
-- 1. Pause o projeto Supabase (Settings > General > Pause)
-- 2. Aguarde 20 segundos
-- 3. Resume o projeto (aguarde 1-2 minutos)
-- 4. Teste o signup em: https://localcashback.com.br/signup
-- ==========================================
