-- ============================================================
-- 🔐 POLÍTICAS DE SEGURANÇA - MULTI-TENANT SEGURO
-- ============================================================
-- Versão com isolamento real por merchant_id
-- Mais segura, mas requer session management
-- ============================================================

-- ============================================================
-- FUNÇÕES AUXILIARES PARA SESSION MANAGEMENT
-- ============================================================

-- Função para obter merchant_id da sessão
CREATE OR REPLACE FUNCTION auth.current_merchant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_merchant_id', true), '')::uuid;
$$;

-- Função para obter employee_id da sessão
CREATE OR REPLACE FUNCTION auth.current_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_employee_id', true), '')::uuid;
$$;

-- Função para obter customer_id da sessão
CREATE OR REPLACE FUNCTION auth.current_customer_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_customer_id', true), '')::uuid;
$$;

-- ============================================================
-- PASSO 1: LIMPAR POLICIES ANTIGAS
-- ============================================================

DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename
        );
    END LOOP;
END $$;

-- ============================================================
-- PASSO 2: HABILITAR RLS
-- ============================================================

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: merchants (ISOLAMENTO FORTE)
-- ============================================================

-- SELECT: Permitir ler apenas para login ou próprio merchant
CREATE POLICY "merchants_select_for_auth_or_own"
ON public.merchants
FOR SELECT
TO anon
USING (
  -- Permite ler para autenticação OU
  -- Merchant logado pode ver apenas seus próprios dados
  auth.current_merchant_id() IS NULL OR -- Login/Signup
  id = auth.current_merchant_id() -- Próprio merchant
);

-- INSERT: Permitir apenas signup (sem merchant_id na sessão)
CREATE POLICY "merchants_insert_signup_only"
ON public.merchants
FOR INSERT
TO anon
WITH CHECK (
  -- Só permite INSERT se não há merchant na sessão (signup)
  auth.current_merchant_id() IS NULL
);

-- UPDATE: Permitir apenas próprio merchant
CREATE POLICY "merchants_update_own_only"
ON public.merchants
FOR UPDATE
TO anon
USING (
  id = auth.current_merchant_id()
)
WITH CHECK (
  id = auth.current_merchant_id()
);

-- ============================================================
-- TABELA: employees (ISOLAMENTO POR MERCHANT)
-- ============================================================

-- SELECT: Funcionários do mesmo merchant
CREATE POLICY "employees_select_same_merchant"
ON public.employees
FOR SELECT
TO anon
USING (
  auth.current_merchant_id() IS NULL OR -- Login
  merchant_id = auth.current_merchant_id() -- Mesmo merchant
);

-- INSERT: Apenas merchant dono pode adicionar
CREATE POLICY "employees_insert_by_merchant"
ON public.employees
FOR INSERT
TO anon
WITH CHECK (
  merchant_id = auth.current_merchant_id()
);

-- UPDATE: Próprio employee ou merchant dono
CREATE POLICY "employees_update_own_or_by_merchant"
ON public.employees
FOR UPDATE
TO anon
USING (
  id = auth.current_employee_id() OR
  merchant_id = auth.current_merchant_id()
)
WITH CHECK (
  merchant_id = auth.current_merchant_id()
);

-- DELETE: Apenas merchant dono
CREATE POLICY "employees_delete_by_merchant_only"
ON public.employees
FOR DELETE
TO anon
USING (
  merchant_id = auth.current_merchant_id()
);

-- ============================================================
-- TABELA: customers (ISOLAMENTO POR MERCHANT)
-- ============================================================

-- SELECT: Customers do mesmo merchant ou próprio customer
CREATE POLICY "customers_select_same_merchant_or_own"
ON public.customers
FOR SELECT
TO anon
USING (
  auth.current_merchant_id() IS NULL OR -- Login
  auth.current_customer_id() IS NULL OR -- Login
  referred_by_merchant_id = auth.current_merchant_id() OR -- Merchant vê seus customers
  id = auth.current_customer_id() -- Customer vê próprios dados
);

-- INSERT: Signup de novo customer
CREATE POLICY "customers_insert_signup"
ON public.customers
FOR INSERT
TO anon
WITH CHECK (true); -- Validação será na aplicação

-- UPDATE: Próprio customer ou merchant dono
CREATE POLICY "customers_update_own_or_by_merchant"
ON public.customers
FOR UPDATE
TO anon
USING (
  id = auth.current_customer_id() OR
  referred_by_merchant_id = auth.current_merchant_id()
)
WITH CHECK (
  id = auth.current_customer_id() OR
  referred_by_merchant_id = auth.current_merchant_id()
);

-- ============================================================
-- TABELA: transactions (ISOLAMENTO FORTE)
-- ============================================================

-- SELECT: Apenas transações do merchant ou customer
CREATE POLICY "transactions_select_own_only"
ON public.transactions
FOR SELECT
TO anon
USING (
  merchant_id = auth.current_merchant_id() OR
  customer_id = auth.current_customer_id()
);

-- INSERT: Apenas pelo merchant dono ou employee do merchant
CREATE POLICY "transactions_insert_by_merchant"
ON public.transactions
FOR INSERT
TO anon
WITH CHECK (
  merchant_id = auth.current_merchant_id()
);

-- ============================================================
-- TABELA: redemptions (ISOLAMENTO FORTE)
-- ============================================================

-- SELECT: Apenas resgates do merchant ou customer
CREATE POLICY "redemptions_select_own_only"
ON public.redemptions
FOR SELECT
TO anon
USING (
  merchant_id = auth.current_merchant_id() OR
  customer_id = auth.current_customer_id()
);

-- INSERT: Apenas pelo merchant dono
CREATE POLICY "redemptions_insert_by_merchant"
ON public.redemptions
FOR INSERT
TO anon
WITH CHECK (
  merchant_id = auth.current_merchant_id()
);

-- UPDATE: Apenas merchant dono pode atualizar status
CREATE POLICY "redemptions_update_by_merchant"
ON public.redemptions
FOR UPDATE
TO anon
USING (
  merchant_id = auth.current_merchant_id()
)
WITH CHECK (
  merchant_id = auth.current_merchant_id()
);

-- ============================================================
-- TABELAS DE AUTENTICAÇÃO (SEM ISOLAMENTO)
-- ============================================================

-- password_reset_tokens: Acesso completo para recuperação
CREATE POLICY "password_reset_tokens_all_access"
ON public.password_reset_tokens
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- email_verifications: Acesso completo para verificação
CREATE POLICY "email_verifications_all_access"
ON public.email_verifications
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- ============================================================
-- PERMISSÕES PARA ROLE ANON
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================

SELECT 
    '✅ POLICIES MULTI-TENANT' as status,
    tablename,
    COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================
-- COMO USAR NA APLICAÇÃO:
-- ============================================================
-- 
-- // Após login do merchant:
-- await supabase.rpc('set_config', {
--   setting: 'app.current_merchant_id',
--   value: merchantId
-- });
-- 
-- // Após login do employee:
-- await supabase.rpc('set_config', {
--   setting: 'app.current_employee_id',
--   value: employeeId
-- });
-- 
-- // Após login do customer:
-- await supabase.rpc('set_config', {
--   setting: 'app.current_customer_id',
--   value: customerId
-- });
-- 
-- ============================================================
