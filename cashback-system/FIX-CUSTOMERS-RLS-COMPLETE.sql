-- =========================================
-- FIX COMPLETO: RLS da tabela customers
-- =========================================

-- 1. Verificar RLS atual
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'customers';

-- 3. REMOVER todas as políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Allow anonymous read for login" ON customers;
DROP POLICY IF EXISTS "Allow anonymous password update" ON customers;
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for anon users" ON customers;
DROP POLICY IF EXISTS "Enable select for anon users" ON customers;
DROP POLICY IF EXISTS "Enable update for anon users" ON customers;

-- 4. Criar política PERMISSIVA para SELECT (login e busca de dados)
CREATE POLICY "customers_select_anon"
ON customers
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Criar política PERMISSIVA para UPDATE (recuperação de senha e atualização de saldo)
CREATE POLICY "customers_update_anon"
ON customers
AS PERMISSIVE
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Criar política para INSERT (cadastro de novos clientes)
CREATE POLICY "customers_insert_anon"
ON customers
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 7. Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- 8. GARANTIR que RLS está habilitado (mas com políticas permissivas)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

-- 9. Testar SELECT (deve retornar resultados)
SELECT id, phone, name FROM customers LIMIT 1;

-- ✅ RESULTADO ESPERADO:
-- ✅ 3 políticas criadas: customers_select_anon, customers_update_anon, customers_insert_anon
-- ✅ Todas AS PERMISSIVE (não restritivas)
-- ✅ Acesso anon e authenticated
-- ✅ USING (true) = sempre permite

-- 🔍 SE AINDA HOUVER ERRO 406:
-- Execute: ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- (mas não é recomendado em produção)
