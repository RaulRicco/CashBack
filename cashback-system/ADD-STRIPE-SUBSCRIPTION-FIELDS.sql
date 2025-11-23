-- Migração: Adicionar campos de assinatura Stripe na tabela merchants
-- Executar no Supabase SQL Editor

DO $$ 
BEGIN
  -- stripe_customer_id: ID do cliente no Stripe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE merchants ADD COLUMN stripe_customer_id TEXT;
    RAISE NOTICE '✅ Coluna stripe_customer_id adicionada';
  END IF;

  -- stripe_subscription_id: ID da assinatura ativa no Stripe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE merchants ADD COLUMN stripe_subscription_id TEXT;
    RAISE NOTICE '✅ Coluna stripe_subscription_id adicionada';
  END IF;

  -- subscription_status: Status da assinatura (active, past_due, canceled, etc)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE merchants ADD COLUMN subscription_status TEXT DEFAULT 'trial';
    RAISE NOTICE '✅ Coluna subscription_status adicionada';
  END IF;

  -- subscription_plan: Plano atual (starter, business, premium)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE merchants ADD COLUMN subscription_plan TEXT DEFAULT 'starter';
    RAISE NOTICE '✅ Coluna subscription_plan adicionada';
  END IF;

  -- customer_limit: Limite de clientes baseado no plano
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'customer_limit'
  ) THEN
    ALTER TABLE merchants ADD COLUMN customer_limit INTEGER DEFAULT 2000;
    RAISE NOTICE '✅ Coluna customer_limit adicionada';
  END IF;

  -- employee_limit: Limite de funcionários baseado no plano
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'employee_limit'
  ) THEN
    ALTER TABLE merchants ADD COLUMN employee_limit INTEGER DEFAULT 1;
    RAISE NOTICE '✅ Coluna employee_limit adicionada';
  END IF;

  -- trial_ends_at: Data de fim do período de teste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE merchants ADD COLUMN trial_ends_at TIMESTAMPTZ;
    RAISE NOTICE '✅ Coluna trial_ends_at adicionada';
  END IF;

  -- subscription_ends_at: Data de vencimento da assinatura
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE merchants ADD COLUMN subscription_ends_at TIMESTAMPTZ;
    RAISE NOTICE '✅ Coluna subscription_ends_at adicionada';
  END IF;

  -- features_enabled: JSON com funcionalidades habilitadas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'merchants' 
    AND column_name = 'features_enabled'
  ) THEN
    ALTER TABLE merchants ADD COLUMN features_enabled JSONB DEFAULT '{
      "dashboard_cac_ltv": false,
      "integrations": false,
      "push_notifications": true,
      "advanced_reports": false,
      "whitelabel": false,
      "custom_domain": false,
      "multiple_stores": false
    }'::jsonb;
    RAISE NOTICE '✅ Coluna features_enabled adicionada';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎉 Migração concluída com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Próximos passos:';
  RAISE NOTICE '1. Verificar se todas as colunas foram criadas';
  RAISE NOTICE '2. Testar criar assinatura no Stripe';
  RAISE NOTICE '3. Implementar webhook para sincronizar status';
  
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_merchants_stripe_customer_id ON merchants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_merchants_subscription_status ON merchants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_merchants_subscription_plan ON merchants(subscription_plan);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN merchants.stripe_customer_id IS 'ID do cliente no Stripe (cus_...)';
COMMENT ON COLUMN merchants.stripe_subscription_id IS 'ID da assinatura ativa no Stripe (sub_...)';
COMMENT ON COLUMN merchants.subscription_status IS 'Status da assinatura: trial, active, past_due, canceled, incomplete';
COMMENT ON COLUMN merchants.subscription_plan IS 'Plano atual: starter, business, premium';
COMMENT ON COLUMN merchants.customer_limit IS 'Limite de clientes cadastrados (2000, 10000, NULL=ilimitado)';
COMMENT ON COLUMN merchants.employee_limit IS 'Limite de funcionários (1, 5, NULL=ilimitado)';
COMMENT ON COLUMN merchants.trial_ends_at IS 'Data de término do período de teste gratuito';
COMMENT ON COLUMN merchants.subscription_ends_at IS 'Data de vencimento da assinatura (para controle)';
COMMENT ON COLUMN merchants.features_enabled IS 'JSON com funcionalidades habilitadas no plano atual';
