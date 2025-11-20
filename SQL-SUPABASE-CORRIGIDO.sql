-- ============================================
-- 🔐 PREPARAR BANCO PARA RECUPERAÇÃO DE SENHA
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- PASSO 1: Adicionar campo password
-- ============================================
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password TEXT;

-- PASSO 2: Criar tabela de tokens
-- ============================================
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

-- PASSO 3: Criar índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_used ON password_reset_tokens(used);

-- PASSO 4: Ativar RLS
-- ============================================
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Remover políticas antigas (se existirem)
-- ============================================
DROP POLICY IF EXISTS "Permitir criar tokens de reset" ON password_reset_tokens;
DROP POLICY IF EXISTS "Permitir ler tokens válidos" ON password_reset_tokens;
DROP POLICY IF EXISTS "Permitir marcar token como usado" ON password_reset_tokens;
DROP POLICY IF EXISTS "Permitir deletar tokens expirados" ON password_reset_tokens;
DROP POLICY IF EXISTS "Permitir leitura pública para validação" ON merchants;
DROP POLICY IF EXISTS "Permitir atualizar própria senha" ON merchants;
DROP POLICY IF EXISTS "Permitir leitura pública para validação" ON customers;
DROP POLICY IF EXISTS "Permitir atualizar própria senha" ON customers;

-- PASSO 6: Criar políticas de segurança
-- ============================================

-- Password reset tokens - Permitir criar
CREATE POLICY "Permitir criar tokens de reset"
ON password_reset_tokens FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Password reset tokens - Permitir ler válidos
CREATE POLICY "Permitir ler tokens válidos"
ON password_reset_tokens FOR SELECT 
TO anon, authenticated
USING (used = false AND expires_at > NOW());

-- Password reset tokens - Permitir marcar como usado
CREATE POLICY "Permitir marcar token como usado"
ON password_reset_tokens FOR UPDATE 
TO anon, authenticated
USING (used = false AND expires_at > NOW()) 
WITH CHECK (used = true);

-- Password reset tokens - Permitir deletar expirados
CREATE POLICY "Permitir deletar tokens expirados"
ON password_reset_tokens FOR DELETE 
TO authenticated
USING (expires_at < NOW() OR used = true);

-- Merchants - Permitir leitura para validação
CREATE POLICY "Permitir leitura publica validacao merchants"
ON merchants FOR SELECT 
TO anon, authenticated 
USING (true);

-- Merchants - Permitir atualizar senha
CREATE POLICY "Permitir atualizar senha merchants"
ON merchants FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- Customers - Permitir leitura para validação
CREATE POLICY "Permitir leitura publica validacao customers"
ON customers FOR SELECT 
TO anon, authenticated 
USING (true);

-- Customers - Permitir atualizar senha
CREATE POLICY "Permitir atualizar senha customers"
ON customers FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- ============================================
-- ✅ VERIFICAÇÃO
-- ============================================

-- Verificar se campo password foi adicionado
SELECT 
  table_name, 
  column_name,
  data_type
FROM information_schema.columns 
WHERE column_name = 'password' 
  AND table_name IN ('merchants', 'customers')
ORDER BY table_name;

-- Verificar tabela password_reset_tokens
SELECT 
  table_name, 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'password_reset_tokens'
ORDER BY ordinal_position;

-- Verificar políticas criadas
SELECT 
  schemaname, 
  tablename, 
  policyname
FROM pg_policies 
WHERE tablename IN ('merchants', 'customers', 'password_reset_tokens')
ORDER BY tablename, policyname;

-- ============================================
-- 📊 RESULTADO ESPERADO
-- ============================================
-- 
-- Campos password:
--   merchants   | password | text
--   customers   | password | text
--
-- Políticas (deve ter 8 políticas):
--   - 4 para password_reset_tokens
--   - 2 para merchants
--   - 2 para customers
--
-- ============================================
