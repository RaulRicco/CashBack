-- Migração: Deixar apenas o Plano Lançamento, com tudo liberado e sem limites
-- Executar no Supabase SQL Editor

-- 1) Atualizar os DEFAULTs da tabela para novos merchants
ALTER TABLE merchants ALTER COLUMN subscription_plan SET DEFAULT 'launch';
ALTER TABLE merchants ALTER COLUMN customer_limit SET DEFAULT NULL;
ALTER TABLE merchants ALTER COLUMN employee_limit SET DEFAULT NULL;
ALTER TABLE merchants ALTER COLUMN features_enabled SET DEFAULT '{
  "dashboard_basic": true,
  "cashback_system": true,
  "customer_portal": true,
  "qr_code": true,
  "email_support": true,
  "dashboard_cac_ltv": true,
  "integrations": true,
  "push_notifications": true,
  "advanced_reports": true,
  "whitelabel": true,
  "custom_domain": true,
  "multiple_stores": true,
  "whatsapp_support": true,
  "dedicated_manager": true
}'::jsonb;

-- 2) Migrar merchants já cadastrados para o plano único, sem limites, com tudo liberado
UPDATE merchants
SET
  subscription_plan = 'launch',
  customer_limit = NULL,
  employee_limit = NULL,
  features_enabled = '{
    "dashboard_basic": true,
    "cashback_system": true,
    "customer_portal": true,
    "qr_code": true,
    "email_support": true,
    "dashboard_cac_ltv": true,
    "integrations": true,
    "push_notifications": true,
    "advanced_reports": true,
    "whitelabel": true,
    "custom_domain": true,
    "multiple_stores": true,
    "whatsapp_support": true,
    "dedicated_manager": true
  }'::jsonb
WHERE subscription_plan IS DISTINCT FROM 'launch'
   OR customer_limit IS NOT NULL
   OR employee_limit IS NOT NULL;

-- 3) Atualizar comentários das colunas para refletir o plano único
COMMENT ON COLUMN merchants.subscription_plan IS 'Plano atual: launch (plano único de lançamento, todos os merchants)';
COMMENT ON COLUMN merchants.customer_limit IS 'Limite de clientes cadastrados (sempre NULL = ilimitado no plano único)';
COMMENT ON COLUMN merchants.employee_limit IS 'Limite de funcionários (sempre NULL = ilimitado no plano único)';
COMMENT ON COLUMN merchants.features_enabled IS 'JSON com funcionalidades habilitadas — todas true no plano único';
