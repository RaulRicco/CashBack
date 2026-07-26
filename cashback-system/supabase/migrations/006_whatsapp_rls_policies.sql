-- RLS para as tabelas de WhatsApp.
-- Tabelas de negócio seguem o mesmo padrão permissivo já usado em
-- integration_configs/integration_sync_log ("validação feita na aplicação").
--
-- Exceção: whatsapp_configs guarda access_token (mais sensível que credenciais
-- de Mailchimp/RD Station — permite enviar mensagens em nome do lojista).
-- anon/authenticated podem ler a linha (RLS SELECT USING true), mas o GRANT
-- restringe as colunas legíveis para excluir access_token — nunca chega ao
-- frontend mesmo que a policy libere a linha. Escrita (INSERT/UPDATE/DELETE)
-- na tabela base não é concedida a anon/authenticated: só service_role
-- (usado pelas Edge Functions) pode gravar credenciais.

ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_templates_allow_all" ON public.whatsapp_templates
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "whatsapp_campaigns_allow_all" ON public.whatsapp_campaigns
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "whatsapp_campaign_recipients_allow_all" ON public.whatsapp_campaign_recipients
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "whatsapp_message_log_allow_all" ON public.whatsapp_message_log
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- whatsapp_configs: policy de SELECT liberada, mas GRANT restrito por coluna
-- (sem access_token). Sem policy de escrita para anon/authenticated.
CREATE POLICY "whatsapp_configs_select_anon_authenticated" ON public.whatsapp_configs
  FOR SELECT TO anon, authenticated
  USING (true);

REVOKE ALL ON public.whatsapp_configs FROM anon, authenticated;
GRANT SELECT (
  id,
  merchant_id,
  is_active,
  display_phone_number,
  verified_name,
  embedded_signup_completed_at,
  created_at,
  updated_at
) ON public.whatsapp_configs TO anon, authenticated;

-- View de conveniência para o frontend consumir com select('*').
-- security_invoker=true: roda com o privilégio de quem chama (respeitando a
-- policy de SELECT e o GRANT por coluna acima) — evita o padrão SECURITY DEFINER
-- (sinalizado como erro pelo linter do Supabase) que uma view comum teria aqui.
CREATE VIEW public.whatsapp_configs_public
WITH (security_invoker = true)
AS
SELECT
  id,
  merchant_id,
  is_active,
  display_phone_number,
  verified_name,
  embedded_signup_completed_at,
  created_at,
  updated_at
FROM public.whatsapp_configs;

GRANT SELECT ON public.whatsapp_configs_public TO anon, authenticated;
