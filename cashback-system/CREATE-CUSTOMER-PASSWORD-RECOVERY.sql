-- =====================================================
-- TABELA DE TOKENS DE RECUPERAÇÃO DE SENHA - CLIENTES
-- =====================================================

-- Criar tabela para tokens de recuperação de senha de clientes
CREATE TABLE IF NOT EXISTS customer_password_recovery_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  
  -- Índices para performance
  CONSTRAINT unique_unused_token UNIQUE (customer_id, token, used)
);

-- Criar índice para busca rápida por customer_id e token
CREATE INDEX IF NOT EXISTS idx_customer_password_recovery_tokens_customer_id 
  ON customer_password_recovery_tokens(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_password_recovery_tokens_token 
  ON customer_password_recovery_tokens(token);

CREATE INDEX IF NOT EXISTS idx_customer_password_recovery_tokens_expires_at 
  ON customer_password_recovery_tokens(expires_at);

-- Política RLS: Permitir acesso público (necessário para recuperação)
ALTER TABLE customer_password_recovery_tokens ENABLE ROW LEVEL SECURITY;

-- Permitir inserção pública (para gerar tokens)
CREATE POLICY "Permitir inserção pública de tokens"
  ON customer_password_recovery_tokens
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permitir leitura pública (para validar tokens)
CREATE POLICY "Permitir leitura pública de tokens"
  ON customer_password_recovery_tokens
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Permitir atualização pública (para marcar token como usado)
CREATE POLICY "Permitir atualização pública de tokens"
  ON customer_password_recovery_tokens
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- LIMPEZA AUTOMÁTICA DE TOKENS EXPIRADOS (OPCIONAL)
-- =====================================================

-- Função para deletar tokens expirados há mais de 24 horas
CREATE OR REPLACE FUNCTION delete_expired_customer_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM customer_password_recovery_tokens
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Comentário para referência (executar manualmente ou via cron job)
COMMENT ON FUNCTION delete_expired_customer_tokens() IS 
  'Deleta tokens de recuperação de senha expirados há mais de 24 horas. 
   Execute manualmente: SELECT delete_expired_customer_tokens();
   Ou configure um cron job no Supabase.';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se a tabela foi criada
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'customer_password_recovery_tokens';

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'customer_password_recovery_tokens';

-- =====================================================
-- EXEMPLO DE USO
-- =====================================================

/*
-- 1. Gerar token para cliente (exemplo: customer_id = '123...')
INSERT INTO customer_password_recovery_tokens (customer_id, token, expires_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '123456',
  NOW() + INTERVAL '30 minutes'
);

-- 2. Buscar token válido
SELECT * FROM customer_password_recovery_tokens
WHERE customer_id = '123e4567-e89b-12d3-a456-426614174000'
  AND token = '123456'
  AND used = false
  AND expires_at > NOW();

-- 3. Marcar token como usado
UPDATE customer_password_recovery_tokens
SET used = true, used_at = NOW()
WHERE customer_id = '123e4567-e89b-12d3-a456-426614174000'
  AND token = '123456';

-- 4. Limpar tokens expirados (executar periodicamente)
SELECT delete_expired_customer_tokens();
*/
