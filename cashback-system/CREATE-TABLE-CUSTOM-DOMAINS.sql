-- Tabela para armazenar domínios personalizados dos merchants
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  ssl_status VARCHAR(50) DEFAULT 'pending',
  dns_verified BOOLEAN DEFAULT FALSE,
  dns_verification_date TIMESTAMP WITH TIME ZONE,
  ssl_generated_date TIMESTAMP WITH TIME ZONE,
  ssl_expires_date TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_custom_domains_merchant_id ON custom_domains(merchant_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_status ON custom_domains(status);

-- RLS (Row Level Security) para segurança
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Merchants podem ver apenas seus próprios domínios
CREATE POLICY "Merchants can view own domains"
  ON custom_domains
  FOR SELECT
  USING (merchant_id = auth.uid());

-- Merchants podem criar domínios para si mesmos
CREATE POLICY "Merchants can create own domains"
  ON custom_domains
  FOR INSERT
  WITH CHECK (merchant_id = auth.uid());

-- Merchants podem atualizar seus próprios domínios
CREATE POLICY "Merchants can update own domains"
  ON custom_domains
  FOR UPDATE
  USING (merchant_id = auth.uid());

-- Merchants podem deletar seus próprios domínios
CREATE POLICY "Merchants can delete own domains"
  ON custom_domains
  FOR DELETE
  USING (merchant_id = auth.uid());

-- Service role tem acesso total (para backend)
CREATE POLICY "Service role has full access"
  ON custom_domains
  FOR ALL
  USING (auth.role() = 'service_role');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_custom_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_custom_domains_updated_at_trigger
  BEFORE UPDATE ON custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_domains_updated_at();

-- Comentários para documentação
COMMENT ON TABLE custom_domains IS 'Armazena domínios personalizados configurados por merchants';
COMMENT ON COLUMN custom_domains.status IS 'Status do domínio: pending, processing, active, error, inactive';
COMMENT ON COLUMN custom_domains.ssl_status IS 'Status do SSL: pending, generating, active, expired, error';
COMMENT ON COLUMN custom_domains.dns_verified IS 'Se o DNS foi verificado e está apontando corretamente';
COMMENT ON COLUMN custom_domains.error_message IS 'Mensagem de erro caso a configuração falhe';

-- Inserir domínio de exemplo (apenas para teste, remover em produção)
-- INSERT INTO custom_domains (merchant_id, domain, status, ssl_status, dns_verified)
-- VALUES (
--   (SELECT id FROM merchants LIMIT 1),
--   'cashback.exemplo.com.br',
--   'pending',
--   'pending',
--   false
-- );
