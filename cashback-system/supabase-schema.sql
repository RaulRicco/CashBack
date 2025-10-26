-- ====================================
-- SISTEMA DE CASHBACK - SCHEMA SUPABASE
-- ====================================

-- Tabela de Estabelecimentos (Merchants)
CREATE TABLE IF NOT EXISTS merchants (
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
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator', -- operator, manager, admin
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes (Customers)
CREATE TABLE IF NOT EXISTS customers (
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
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'cashback' ou 'redemption'
  amount DECIMAL(10,2) NOT NULL,
  cashback_amount DECIMAL(10,2) NOT NULL,
  cashback_percentage DECIMAL(5,2) NOT NULL,
  qr_code_token VARCHAR(255) UNIQUE,
  qr_scanned BOOLEAN DEFAULT false,
  qr_scanned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Resgates (Redemptions)
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  qr_code_token VARCHAR(255) UNIQUE,
  qr_scanned BOOLEAN DEFAULT false,
  qr_scanned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Gastos com Marketing (Marketing Spend)
CREATE TABLE IF NOT EXISTS marketing_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(50), -- 'meta', 'google', 'tiktok', etc
  campaign_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_employees_merchant ON employees(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_redemptions_merchant ON redemptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_customer ON redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_marketing_spend_merchant ON marketing_spend(merchant_id);
CREATE INDEX IF NOT EXISTS idx_marketing_spend_date ON marketing_spend(date);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_transactions_qr ON transactions(qr_code_token);
CREATE INDEX IF NOT EXISTS idx_redemptions_qr ON redemptions(qr_code_token);

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

-- RLS (Row Level Security) Policies
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_spend ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (você pode ajustar conforme necessário)
-- Por enquanto, permitindo acesso público para facilitar o desenvolvimento
CREATE POLICY "Enable read access for all users" ON merchants FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON merchants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON merchants FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON employees FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON employees FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON transactions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON redemptions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON redemptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON redemptions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON marketing_spend FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON marketing_spend FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON marketing_spend FOR UPDATE USING (true);

-- Dados de exemplo para testes (OPCIONAL - remova se não quiser)
-- Inserir um estabelecimento de exemplo
INSERT INTO merchants (name, email, phone, cashback_percentage)
VALUES ('Loja Exemplo', 'contato@lojaexemplo.com', '11999999999', 5.00)
ON CONFLICT DO NOTHING;
