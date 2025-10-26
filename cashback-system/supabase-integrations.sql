-- ====================================
-- INTEGRAÇÕES EMAIL MARKETING - SCHEMA
-- ====================================

-- Tabela de Configurações de Integrações
CREATE TABLE IF NOT EXISTS integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'mailchimp' ou 'rdstation'
  is_active BOOLEAN DEFAULT false,
  
  -- Credenciais (criptografadas)
  api_key TEXT,
  api_token TEXT,
  audience_id TEXT, -- Para Mailchimp (List ID)
  
  -- Configurações
  sync_on_signup BOOLEAN DEFAULT true, -- Sincronizar ao cadastrar cliente
  sync_on_purchase BOOLEAN DEFAULT true, -- Sincronizar ao fazer compra
  sync_on_redemption BOOLEAN DEFAULT false, -- Sincronizar ao resgatar
  
  -- Tags automáticas
  default_tags JSONB DEFAULT '[]'::jsonb,
  
  -- Metadados
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(merchant_id, provider)
);

-- Tabela de Log de Sincronizações
CREATE TABLE IF NOT EXISTS integration_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_config_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'tag'
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'pending'
  
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_integration_configs_merchant ON integration_configs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_integration_configs_provider ON integration_configs(provider);
CREATE INDEX IF NOT EXISTS idx_integration_sync_log_config ON integration_sync_log(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_log_customer ON integration_sync_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_log_status ON integration_sync_log(status);

-- Trigger para updated_at
CREATE TRIGGER update_integration_configs_updated_at 
BEFORE UPDATE ON integration_configs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON integration_configs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON integration_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON integration_configs FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON integration_sync_log FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON integration_sync_log FOR INSERT WITH CHECK (true);
