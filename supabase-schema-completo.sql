-- ====================================
-- SISTEMA DE CASHBACK - SCHEMA COMPLETO
-- Execute este arquivo INTEIRO no SQL Editor do Supabase
-- ====================================

-- Limpar tabelas existentes (CUIDADO: Remove todos os dados)
DROP TABLE IF EXISTS integration_sync_log CASCADE;
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP TABLE IF EXISTS marketing_spend CASCADE;
DROP TABLE IF EXISTS redemptions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- ====================================
-- TABELAS PRINCIPAIS
-- ====================================

-- Tabela de Estabelecimentos (Merchants)
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cashback_percentage DECIMAL(5,2) DEFAULT 5.00,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Funcionários (Employees)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator',
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes (Customers)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  total_cashback DECIMAL(10,2) DEFAULT 0.00,
  available_cashback DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  first_purchase_at TIMESTAMP WITH TIME ZONE,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações (Transactions)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
  transaction_type VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  cashback_amount DECIMAL(10,2) NOT NULL,
  cashback_percentage DECIMAL(5,2) NOT NULL,
  qr_code_token VARCHAR(255) UNIQUE,
  qr_scanned BOOLEAN DEFAULT false,
  qr_scanned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Resgates (Redemptions)
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  qr_code_token VARCHAR(255) UNIQUE,
  qr_scanned BOOLEAN DEFAULT false,
  qr_scanned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Gastos com Marketing (Marketing Spend)
CREATE TABLE marketing_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(50),
  campaign_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- TABELAS DE INTEGRAÇÕES
-- ====================================

-- Tabela de Configurações de Integrações
CREATE TABLE integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  api_key TEXT,
  api_token TEXT,
  audience_id TEXT,
  sync_on_signup BOOLEAN DEFAULT true,
  sync_on_purchase BOOLEAN DEFAULT true,
  sync_on_redemption BOOLEAN DEFAULT false,
  default_tags JSONB DEFAULT '[]'::jsonb,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(merchant_id, provider)
);

-- Tabela de Log de Sincronizações
CREATE TABLE integration_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_config_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ÍNDICES
-- ====================================

CREATE INDEX idx_employees_merchant ON employees(merchant_id);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_redemptions_merchant ON redemptions(merchant_id);
CREATE INDEX idx_redemptions_customer ON redemptions(customer_id);
CREATE INDEX idx_marketing_spend_merchant ON marketing_spend(merchant_id);
CREATE INDEX idx_marketing_spend_date ON marketing_spend(date);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_transactions_qr ON transactions(qr_code_token);
CREATE INDEX idx_redemptions_qr ON redemptions(qr_code_token);
CREATE INDEX idx_integration_configs_merchant ON integration_configs(merchant_id);
CREATE INDEX idx_integration_configs_provider ON integration_configs(provider);
CREATE INDEX idx_integration_sync_log_config ON integration_sync_log(integration_config_id);
CREATE INDEX idx_integration_sync_log_customer ON integration_sync_log(customer_id);
CREATE INDEX idx_integration_sync_log_status ON integration_sync_log(status);

-- ====================================
-- FUNÇÕES E TRIGGERS
-- ====================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redemptions_updated_at BEFORE UPDATE ON redemptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_spend_updated_at BEFORE UPDATE ON marketing_spend
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar cashback do cliente após transação
CREATE OR REPLACE FUNCTION update_customer_cashback()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'cashback' AND NEW.status = 'completed' THEN
    UPDATE customers
    SET 
      total_cashback = total_cashback + NEW.cashback_amount,
      available_cashback = available_cashback + NEW.cashback_amount,
      total_spent = total_spent + NEW.amount,
      last_purchase_at = NOW(),
      first_purchase_at = COALESCE(first_purchase_at, NOW())
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cashback_trigger AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_customer_cashback();

-- Função para atualizar cashback do cliente após resgate
CREATE OR REPLACE FUNCTION update_customer_redemption()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE customers
    SET available_cashback = available_cashback - NEW.amount
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_redemption_trigger AFTER INSERT OR UPDATE ON redemptions
  FOR EACH ROW EXECUTE FUNCTION update_customer_redemption();

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_log ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento (ajuste em produção)
CREATE POLICY "Enable all for merchants" ON merchants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for redemptions" ON redemptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for marketing_spend" ON marketing_spend FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for integration_configs" ON integration_configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for integration_sync_log" ON integration_sync_log FOR ALL USING (true) WITH CHECK (true);

-- ====================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ====================================

-- Inserir um estabelecimento de teste
INSERT INTO merchants (name, email, phone, cashback_percentage)
VALUES ('Loja Demo', 'demo@cashback.com', '11999999999', 5.00)
ON CONFLICT (email) DO NOTHING;

-- Inserir um funcionário admin de teste
INSERT INTO employees (merchant_id, name, email, role, password_hash, is_active)
SELECT 
  id,
  'Administrador',
  'admin@cashback.com',
  'admin',
  'temp_password',
  true
FROM merchants
WHERE email = 'demo@cashback.com'
ON CONFLICT (email) DO NOTHING;

-- ====================================
-- VERIFICAÇÃO
-- ====================================

-- Liste todas as tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Schema criado com sucesso!';
  RAISE NOTICE '✅ 8 tabelas criadas';
  RAISE NOTICE '✅ Triggers configurados';
  RAISE NOTICE '✅ Índices criados';
  RAISE NOTICE '✅ RLS ativado';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Login de teste:';
  RAISE NOTICE '   Email: admin@cashback.com';
  RAISE NOTICE '   Senha: qualquer_coisa';
END $$;
