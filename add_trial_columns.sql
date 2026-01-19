-- Adicionar colunas de trial e subscription na tabela merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_merchants_trial_end ON merchants(trial_end_date) WHERE subscription_status = 'trial';
CREATE INDEX IF NOT EXISTS idx_merchants_subscription_status ON merchants(subscription_status);

-- Comentários
COMMENT ON COLUMN merchants.subscription_status IS 'Status da assinatura: trial, active, expired, cancelled, past_due';
COMMENT ON COLUMN merchants.trial_start_date IS 'Data de início do trial (14 dias grátis)';
COMMENT ON COLUMN merchants.trial_end_date IS 'Data de fim do trial';
COMMENT ON COLUMN merchants.subscription_id IS 'ID da subscription no Stripe';
COMMENT ON COLUMN merchants.stripe_customer_id IS 'ID do customer no Stripe';

