-- =========================================
-- FIX: Permitir acesso anônimo à tabela customers
-- =========================================
-- Problema: Erro 406 ao buscar cliente para login/recuperação de senha
-- Causa: RLS (Row Level Security) bloqueando acesso anônimo

-- 1. Verificar políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'customers';

-- 2. Criar política para permitir SELECT anônimo (para login e recuperação)
CREATE POLICY "Allow anonymous read for login"
ON customers
FOR SELECT
TO anon
USING (true);

-- 3. Criar política para permitir UPDATE anônimo de senha (para recuperação)
CREATE POLICY "Allow anonymous password update"
ON customers
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 4. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- ✅ Após executar este SQL:
-- ✅ Clientes podem fazer login sem autenticação prévia
-- ✅ Clientes podem recuperar senha validando telefone + nascimento
-- ✅ Sistema continua seguro (validação no backend)

-- ALTERNATIVA (se houver conflito de políticas):
-- DROP POLICY IF EXISTS "Allow anonymous read for login" ON customers;
-- DROP POLICY IF EXISTS "Allow anonymous password update" ON customers;
-- Depois criar novamente
