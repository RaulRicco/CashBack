-- ====================================
-- CRIAR TABELA DE INTEGRAÇÕES
-- Execute no Supabase SQL Editor
-- ====================================

-- Verificar se existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'integration_configs';

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Credenciais
  api_key TEXT,
  api_token TEXT,
  audience_id TEXT,
  
  -- Configurações
  sync_on_signup BOOLEAN DEFAULT true,
  sync_on_purchase BOOLEAN DEFAULT true,
  sync_on_redemption BOOLEAN DEFAULT false,
  
  -- Tags automáticas
  default_tags JSONB DEFAULT '[]'::jsonb,
  
  -- Metadados
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(merchant_id, provider)
);

-- Tabela de Log
CREATE TABLE IF NOT EXISTS integration_sync_log (
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

-- Políticas RLS (IMPORTANTE!)
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_log ENABLE ROW LEVEL SECURITY;

-- Permitir todas operações (temporário para teste)
DROP POLICY IF EXISTS "Enable all for integration_configs" ON integration_configs;
CREATE POLICY "Enable all for integration_configs" ON integration_configs 
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for integration_sync_log" ON integration_sync_log;
CREATE POLICY "Enable all for integration_sync_log" ON integration_sync_log 
FOR ALL USING (true) WITH CHECK (true);

-- Verificar se criou
SELECT 
    table_name,
    (SELECT COUNT(*) FROM integration_configs) as config_count,
    (SELECT COUNT(*) FROM integration_sync_log) as log_count
FROM information_schema.tables 
WHERE table_name IN ('integration_configs', 'integration_sync_log');
