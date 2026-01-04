-- ====================================
-- ADICIONAR SUPORTE A PUSH NOTIFICATIONS
-- ====================================

-- 1. Adicionar colunas na tabela customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS push_enabled_at TIMESTAMP WITH TIME ZONE;

-- 2. Criar tabela para subscriptions (futuro)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_customers_push_enabled ON customers(push_enabled);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_customer ON push_subscriptions(customer_id);

-- 4. Comentários
COMMENT ON COLUMN customers.push_enabled IS 'Se o cliente habilitou notificações push';
COMMENT ON COLUMN customers.push_enabled_at IS 'Quando o cliente habilitou notificações';
COMMENT ON TABLE push_subscriptions IS 'Armazena subscriptions de push notifications';
