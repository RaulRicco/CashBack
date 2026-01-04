-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'promotion', 'announcement', 'alert'
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  image TEXT,
  url TEXT,
  target VARCHAR(50) DEFAULT 'all', -- 'all', 'merchant_customers', 'customer_id'
  target_id UUID, -- ID do merchant ou customer específico
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by VARCHAR(100), -- ID ou email do admin que enviou
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar campo push_enabled na tabela customers (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'push_enabled'
  ) THEN
    ALTER TABLE customers 
    ADD COLUMN push_enabled BOOLEAN DEFAULT false,
    ADD COLUMN push_enabled_at TIMESTAMPTZ;
  END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target);
CREATE INDEX IF NOT EXISTS idx_customers_push_enabled ON customers(push_enabled);

-- Comentários
COMMENT ON TABLE notifications IS 'Histórico de notificações push enviadas';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificação: promotion, announcement, alert';
COMMENT ON COLUMN notifications.target IS 'Público alvo: all, merchant_customers, customer_id';
COMMENT ON COLUMN notifications.target_id IS 'ID específico do merchant ou customer (quando target não é all)';
COMMENT ON COLUMN customers.push_enabled IS 'Cliente habilitou notificações push';
COMMENT ON COLUMN customers.push_enabled_at IS 'Data/hora em que habilitou notificações';
