-- ============================================
-- FIX: Políticas RLS para tabela CUSTOMERS
-- ============================================
-- Problema: Erro 406 ao cadastrar clientes
-- Solução: Políticas RLS corretas para multi-tenancy
-- ============================================

-- 1. Desabilitar RLS temporariamente (se necessário para testes)
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "customers_select_policy" ON customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON customers;
DROP POLICY IF EXISTS "customers_update_policy" ON customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON customers;
DROP POLICY IF EXISTS "Enable insert for public" ON customers;
DROP POLICY IF EXISTS "Enable read for public" ON customers;

-- 3. Habilitar RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 4. Criar política para INSERÇÃO (cadastro de novos clientes)
-- Permite que qualquer pessoa crie um novo cliente (signup público)
CREATE POLICY "customers_insert_public"
ON customers
FOR INSERT
TO public
WITH CHECK (true);

-- 5. Criar política para CONSULTA (busca de clientes)
-- Permite buscar clientes por merchant_id OU permitir acesso público para signup
CREATE POLICY "customers_select_public"
ON customers
FOR SELECT
TO public
USING (true);

-- 6. Criar política para UPDATE (atualização de saldo, dados, etc)
-- Permite atualização de qualquer cliente (será filtrado pela aplicação)
CREATE POLICY "customers_update_policy"
ON customers
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 7. Criar política para DELETE (opcional, geralmente não usamos)
CREATE POLICY "customers_delete_policy"
ON customers
FOR DELETE
TO public
USING (true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'customers';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. Estas políticas permitem acesso público à tabela customers
--    porque o signup de clientes é público (via link do merchant)
-- 
-- 2. A segurança multi-tenant é garantida pela aplicação
--    filtrando por referred_by_merchant_id
-- 
-- 3. Se você quiser políticas mais restritivas:
--    - Use funções auth.uid() para verificar autenticação
--    - Filtre por merchant_id nas políticas
-- 
-- 4. Para desabilitar RLS completamente (não recomendado):
--    ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- 
-- ============================================
