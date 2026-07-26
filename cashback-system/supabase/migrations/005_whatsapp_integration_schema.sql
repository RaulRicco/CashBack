-- Integração WhatsApp Business API (Meta Cloud API) — modelo de dados
-- Segue o padrão de integration_configs/integration_sync_log já existente no projeto,
-- em tabelas dedicadas dado o volume maior de campos e a sensibilidade do access_token.

CREATE TABLE IF NOT EXISTS public.whatsapp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL UNIQUE REFERENCES public.merchants(id) ON DELETE CASCADE,
  waba_id TEXT,
  phone_number_id TEXT,
  business_account_id TEXT,
  display_phone_number TEXT,
  verified_name TEXT,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  embedded_signup_completed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,
  webhook_verify_token TEXT,
  default_country_code TEXT NOT NULL DEFAULT '55',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'MARKETING'
    CHECK (category = ANY (ARRAY['MARKETING', 'UTILITY', 'AUTHENTICATION'])),
  language TEXT NOT NULL DEFAULT 'pt_BR',
  body_text TEXT NOT NULL,
  variables_example JSONB DEFAULT '[]'::jsonb,
  header_type TEXT,
  header_content TEXT,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]'::jsonb,
  meta_template_id TEXT,
  meta_template_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (meta_template_status = ANY (ARRAY['pending', 'approved', 'rejected', 'paused', 'disabled'])),
  rejection_reason TEXT,
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  template_kind TEXT NOT NULL DEFAULT 'campaign'
    CHECK (template_kind = ANY (ARRAY['welcome', 'cashback_received', 'redemption_confirmed', 'campaign'])),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, name, language)
);

CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  whatsapp_template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  template_variables JSONB DEFAULT '{}'::jsonb,
  audience_filter JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status = ANY (ARRAY['draft', 'sending', 'completed', 'failed', 'canceled'])),
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  phone_e164 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status = ANY (ARRAY['pending', 'sent', 'delivered', 'read', 'failed'])),
  meta_message_id TEXT,
  error_message TEXT,
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.whatsapp_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  whatsapp_template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.whatsapp_campaigns(id) ON DELETE SET NULL,
  meta_message_id TEXT,
  direction TEXT NOT NULL DEFAULT 'outbound'
    CHECK (direction = ANY (ARRAY['outbound', 'inbound'])),
  event_type TEXT NOT NULL
    CHECK (event_type = ANY (ARRAY['signup', 'purchase', 'redemption', 'campaign', 'inbound'])),
  to_phone_e164 TEXT,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status = ANY (ARRAY['queued', 'sent', 'delivered', 'read', 'failed'])),
  error_code TEXT,
  error_message TEXT,
  request_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_merchant ON public.whatsapp_templates(merchant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_merchant ON public.whatsapp_campaigns(merchant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_recipients_campaign ON public.whatsapp_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_recipients_status ON public.whatsapp_campaign_recipients(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_log_merchant ON public.whatsapp_message_log(merchant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_log_meta_message_id ON public.whatsapp_message_log(meta_message_id);

-- Reaproveita a função de trigger já usada no restante do schema (update_updated_at_column)
CREATE TRIGGER trg_whatsapp_configs_updated_at
  BEFORE UPDATE ON public.whatsapp_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_whatsapp_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_whatsapp_message_log_updated_at
  BEFORE UPDATE ON public.whatsapp_message_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.whatsapp_configs IS 'Credenciais e status da conexão WhatsApp Business (Embedded Signup) por merchant. access_token só deve ser lido por service_role — frontend usa a view whatsapp_configs_public.';
COMMENT ON TABLE public.whatsapp_campaign_recipients IS 'Fila simples de disparo em lote de uma campanha — percorrida linha a linha pelo processo de envio, sem infraestrutura de filas externa.';
