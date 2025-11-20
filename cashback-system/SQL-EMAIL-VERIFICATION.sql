-- ====================================
-- SISTEMA DE VERIFICAÇÃO DE EMAIL
-- ====================================

-- 1. Adicionar campo email_verified na tabela employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 2. Criar tabela para armazenar tokens de verificação
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_employee ON email_verifications(employee_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir criar tokens de verificação" ON email_verifications;
DROP POLICY IF EXISTS "Permitir consultar próprio token" ON email_verifications;
DROP POLICY IF EXISTS "Permitir atualizar próprio token" ON email_verifications;

-- 6. Criar políticas de segurança

-- Permitir que qualquer um crie tokens (para signup)
CREATE POLICY "Permitir criar tokens de verificação"
ON email_verifications 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Permitir que qualquer um consulte tokens para verificação
CREATE POLICY "Permitir consultar próprio token"
ON email_verifications 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Permitir atualizar o token quando verificar
CREATE POLICY "Permitir atualizar próprio token"
ON email_verifications 
FOR UPDATE 
TO anon, authenticated
USING (true);

-- 7. Comentários para documentação
COMMENT ON TABLE email_verifications IS 'Armazena tokens de verificação de email';
COMMENT ON COLUMN email_verifications.token IS 'Token único de 6 dígitos para verificação';
COMMENT ON COLUMN email_verifications.expires_at IS 'Token expira em 24 horas';
COMMENT ON COLUMN email_verifications.verified IS 'Se o email já foi verificado';
COMMENT ON COLUMN email_verifications.verified_at IS 'Quando o email foi verificado';

-- 8. Verificar estrutura criada
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('employees', 'email_verifications')
ORDER BY table_name, ordinal_position;

-- ====================================
-- FIM DO SCRIPT
-- ====================================
