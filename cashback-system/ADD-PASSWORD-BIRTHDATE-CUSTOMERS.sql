-- ====================================
-- ADICIONAR CAMPOS PASSWORD E BIRTHDATE NA TABELA CUSTOMERS
-- ====================================

-- Adicionar campo de data de nascimento
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS birthdate DATE;

-- [DEPRECATED] Evitar armazenar senhas em tabelas.
-- Use Supabase Auth para clientes e proprietários.
ALTER TABLE customers 
-- ADD COLUMN IF NOT EXISTS password_hash TEXT; -- não recomendado

-- [DEPRECATED]
-- CREATE INDEX IF NOT EXISTS idx_customers_password ON customers(password_hash);

-- Comentários nas colunas
COMMENT ON COLUMN customers.birthdate IS 'Data de nascimento do cliente';
-- COMMENT ON COLUMN customers.password_hash IS 'Hash da senha do cliente para proteger acesso ao perfil';
