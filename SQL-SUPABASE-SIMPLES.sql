-- ============================================
-- 🔐 SQL CORRIGIDO - Recuperação de Senha
-- ============================================
-- Copie e cole TODO este código no Supabase SQL Editor

-- 1️⃣  ADICIONAR CAMPOS DE SENHA
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password TEXT;

-- 2️⃣  CRIAR TABELA DE TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('merchant', 'customer', 'employee')),
  user_id UUID,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3️⃣  CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- 4️⃣  ATIVAR RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 5️⃣  REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Permitir criar tokens de reset" ON password_reset_tokens;
DROP POLICY IF EXISTS "Permitir ler tokens válidos" ON password_reset_tokens;
DROP POLICY IF EXISTS "Permitir marcar token como usado" ON password_reset_tokens;
DROP POLICY IF EXISTS "Permitir deletar tokens expirados" ON password_reset_tokens;
DROP POLICY IF EXISTS "Permitir leitura publica validacao merchants" ON merchants;
DROP POLICY IF EXISTS "Permitir atualizar senha merchants" ON merchants;
DROP POLICY IF EXISTS "Permitir leitura publica validacao customers" ON customers;
DROP POLICY IF EXISTS "Permitir atualizar senha customers" ON customers;

-- 6️⃣  CRIAR POLÍTICAS NOVAS

-- Tokens: Permitir criar
CREATE POLICY "Permitir criar tokens de reset"
ON password_reset_tokens FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Tokens: Permitir ler válidos
CREATE POLICY "Permitir ler tokens válidos"
ON password_reset_tokens FOR SELECT TO anon, authenticated
USING (used = false AND expires_at > NOW());

-- Tokens: Permitir marcar como usado
CREATE POLICY "Permitir marcar token como usado"
ON password_reset_tokens FOR UPDATE TO anon, authenticated
USING (used = false AND expires_at > NOW()) WITH CHECK (used = true);

-- Tokens: Permitir deletar expirados
CREATE POLICY "Permitir deletar tokens expirados"
ON password_reset_tokens FOR DELETE TO authenticated
USING (expires_at < NOW() OR used = true);

-- Merchants: Permitir ler
CREATE POLICY "Permitir leitura publica validacao merchants"
ON merchants FOR SELECT TO anon, authenticated USING (true);

-- Merchants: Permitir atualizar senha
CREATE POLICY "Permitir atualizar senha merchants"
ON merchants FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Customers: Permitir ler
CREATE POLICY "Permitir leitura publica validacao customers"
ON customers FOR SELECT TO anon, authenticated USING (true);

-- Customers: Permitir atualizar senha
CREATE POLICY "Permitir atualizar senha customers"
ON customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ✅ VERIFICAR RESULTADO
SELECT table_name, column_name FROM information_schema.columns 
WHERE column_name = 'password' AND table_name IN ('merchants', 'customers');
