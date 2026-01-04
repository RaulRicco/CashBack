-- ========================================
-- CRIAR TABELA: email_verifications
-- ========================================
-- Problema: Erro 404 ao tentar enviar código de verificação
-- Solução: Criar tabela email_verifications com políticas RLS
-- Data: 2025-11-23

-- 1. CRIAR TABELA
-- ========================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_email_verifications_employee_id 
ON email_verifications(employee_id);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email 
ON email_verifications(email);

CREATE INDEX IF NOT EXISTS idx_email_verifications_code 
ON email_verifications(code);

CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at 
ON email_verifications(expires_at);

-- 3. ATIVAR RLS
-- ========================================
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS RLS - Permitir acesso anônimo
-- ========================================

-- Permitir INSERT anônimo (criar código de verificação)
DROP POLICY IF EXISTS "Enable insert for anon" ON email_verifications;
CREATE POLICY "Enable insert for anon" 
ON email_verifications 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Permitir SELECT anônimo (verificar código)
DROP POLICY IF EXISTS "Enable select for anon" ON email_verifications;
CREATE POLICY "Enable select for anon" 
ON email_verifications 
FOR SELECT 
TO anon 
USING (true);

-- Permitir UPDATE anônimo (marcar como verificado)
DROP POLICY IF EXISTS "Enable update for anon" ON email_verifications;
CREATE POLICY "Enable update for anon" 
ON email_verifications 
FOR UPDATE 
TO anon 
USING (true)
WITH CHECK (true);

-- Permitir DELETE para autenticados (limpar códigos expirados)
DROP POLICY IF EXISTS "Enable delete for authenticated" ON email_verifications;
CREATE POLICY "Enable delete for authenticated" 
ON email_verifications 
FOR DELETE 
TO authenticated 
USING (true);

-- Permitir acesso total para autenticados
DROP POLICY IF EXISTS "Enable all for authenticated users" ON email_verifications;
CREATE POLICY "Enable all for authenticated users" 
ON email_verifications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. FUNÇÃO PARA LIMPAR CÓDIGOS EXPIRADOS
-- ========================================
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications 
  WHERE expires_at < NOW() 
  AND verified = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TRIGGER PARA ATUALIZAR updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_email_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_email_verifications_updated_at 
ON email_verifications;

CREATE TRIGGER trigger_update_email_verifications_updated_at
  BEFORE UPDATE ON email_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_email_verifications_updated_at();

-- ========================================
-- VERIFICAÇÃO
-- ========================================
-- Para verificar se a tabela foi criada:
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'email_verifications'
ORDER BY ordinal_position;

-- Verificar políticas:
SELECT 
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'email_verifications'
ORDER BY policyname;

-- ========================================
-- LIMPEZA DE TESTES (OPCIONAL)
-- ========================================
-- Se quiser limpar dados de teste duplicados:

-- Ver emails duplicados
SELECT email, COUNT(*) as count
FROM merchants
GROUP BY email
HAVING COUNT(*) > 1;

-- Deletar estabelecimento específico por email
-- DELETE FROM employees WHERE email = 'pprih.24@gmail.com';
-- DELETE FROM merchants WHERE email = 'pprih.24@gmail.com';

-- Ou deletar todos os de hoje (CUIDADO!)
-- DELETE FROM employees WHERE DATE(created_at) = CURRENT_DATE;
-- DELETE FROM merchants WHERE DATE(created_at) = CURRENT_DATE;

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- Tabela email_verifications criada com:
-- ✅ Campos: id, employee_id, email, code, expires_at, verified, created_at, updated_at
-- ✅ Índices para performance
-- ✅ RLS ativado
-- ✅ Políticas permitindo acesso anônimo para signup
-- ✅ Função de limpeza automática
-- ✅ Trigger para updated_at
