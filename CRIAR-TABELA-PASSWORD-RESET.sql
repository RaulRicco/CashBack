-- ============================================
-- 🔒 TABELA PARA RECUPERAÇÃO DE SENHA
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar tabela password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('merchant', 'customer')),
  user_id UUID,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_used ON password_reset_tokens(used);

-- 3. Ativar RLS (Row Level Security)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança

-- Permitir inserção pública (para criar tokens de reset)
CREATE POLICY "Permitir criar tokens de reset"
ON password_reset_tokens FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir leitura de tokens válidos (não usados e não expirados)
CREATE POLICY "Permitir ler tokens válidos"
ON password_reset_tokens FOR SELECT
TO anon, authenticated
USING (used = false AND expires_at > NOW());

-- Permitir atualização para marcar como usado
CREATE POLICY "Permitir marcar token como usado"
ON password_reset_tokens FOR UPDATE
TO anon, authenticated
USING (used = false AND expires_at > NOW())
WITH CHECK (used = true);

-- Permitir deleção de tokens expirados (para limpeza)
CREATE POLICY "Permitir deletar tokens expirados"
ON password_reset_tokens FOR DELETE
TO authenticated
USING (expires_at < NOW() OR used = true);

-- ============================================
-- ✅ VERIFICAÇÃO
-- ============================================

-- Verificar se a tabela foi criada
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'password_reset_tokens'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'password_reset_tokens';
