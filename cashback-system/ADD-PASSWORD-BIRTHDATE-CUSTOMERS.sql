-- ====================================
-- ADICIONAR CAMPOS PASSWORD E BIRTHDATE NA TABELA CUSTOMERS
-- ====================================

-- Adicionar campo de data de nascimento
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS birthdate DATE;

-- Adicionar campo de senha hash
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Criar índice no campo de senha para melhor performance
CREATE INDEX IF NOT EXISTS idx_customers_password ON customers(password_hash);

-- Comentários nas colunas
COMMENT ON COLUMN customers.birthdate IS 'Data de nascimento do cliente';
COMMENT ON COLUMN customers.password_hash IS 'Hash da senha do cliente para proteger acesso ao perfil';
