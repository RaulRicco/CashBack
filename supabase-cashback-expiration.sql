-- ====================================
-- ADICIONAR CONFIGURAÇÕES DE EXPIRAÇÃO DE CASHBACK
-- ====================================

-- Adicionar novos campos à tabela merchants
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS cashback_program_name VARCHAR(255) DEFAULT 'Programa de Cashback',
ADD COLUMN IF NOT EXISTS cashback_expires BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cashback_expiration_days INTEGER DEFAULT 180,
ADD COLUMN IF NOT EXISTS cashback_available_immediately BOOLEAN DEFAULT true;

-- Comentários para documentação
COMMENT ON COLUMN merchants.cashback_program_name IS 'Nome personalizado do programa de cashback do estabelecimento';
COMMENT ON COLUMN merchants.cashback_expires IS 'Se o cashback tem data de expiração';
COMMENT ON COLUMN merchants.cashback_expiration_days IS 'Número de dias até o cashback expirar (padrão 180 dias = 6 meses)';
COMMENT ON COLUMN merchants.cashback_available_immediately IS 'Se o cashback fica disponível imediatamente ou tem período de espera';

-- Adicionar campo de expiração nas transações
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS available_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

COMMENT ON COLUMN transactions.expires_at IS 'Data de expiração do cashback desta transação';
COMMENT ON COLUMN transactions.available_at IS 'Data em que o cashback fica disponível';

-- Atualizar transações existentes para ficarem disponíveis imediatamente
UPDATE transactions 
SET available_at = created_at 
WHERE available_at IS NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_expires_at ON transactions(expires_at);
CREATE INDEX IF NOT EXISTS idx_transactions_available_at ON transactions(available_at);

-- Função para calcular data de expiração
CREATE OR REPLACE FUNCTION calculate_cashback_expiration(merchant_uuid UUID, transaction_date TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  expires BOOLEAN;
  expiration_days INTEGER;
BEGIN
  SELECT cashback_expires, cashback_expiration_days
  INTO expires, expiration_days
  FROM merchants
  WHERE id = merchant_uuid;
  
  IF expires THEN
    RETURN transaction_date + (expiration_days || ' days')::INTERVAL;
  ELSE
    RETURN NULL; -- Sem expiração
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir data de expiração automaticamente
CREATE OR REPLACE FUNCTION set_transaction_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Definir quando o cashback fica disponível
  IF NEW.available_at IS NULL THEN
    NEW.available_at := NEW.created_at;
  END IF;
  
  -- Calcular data de expiração
  NEW.expires_at := calculate_cashback_expiration(NEW.merchant_id, NEW.created_at);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_transaction_expiration ON transactions;
CREATE TRIGGER trigger_set_transaction_expiration
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_expiration();

-- View para cashback disponível (considerando expiração)
CREATE OR REPLACE VIEW customer_available_cashback AS
SELECT 
  t.customer_id,
  t.merchant_id,
  SUM(
    CASE 
      WHEN t.transaction_type = 'cashback' 
        AND t.status = 'completed'
        AND t.available_at <= NOW()
        AND (t.expires_at IS NULL OR t.expires_at > NOW())
      THEN t.cashback_amount
      WHEN t.transaction_type = 'redemption'
        AND t.status = 'completed'
      THEN -t.amount
      ELSE 0
    END
  ) as available_cashback,
  COUNT(CASE WHEN t.expires_at IS NOT NULL AND t.expires_at > NOW() AND t.expires_at < NOW() + INTERVAL '30 days' THEN 1 END) as expiring_soon_count
FROM transactions t
GROUP BY t.customer_id, t.merchant_id;

COMMENT ON VIEW customer_available_cashback IS 'Saldo de cashback disponível por cliente, considerando expiração';

-- Atualizar merchants existentes com valores padrão
UPDATE merchants
SET 
  cashback_program_name = COALESCE(cashback_program_name, name || ' - Cashback'),
  cashback_expires = COALESCE(cashback_expires, false),
  cashback_expiration_days = COALESCE(cashback_expiration_days, 180),
  cashback_available_immediately = COALESCE(cashback_available_immediately, true)
WHERE 
  cashback_program_name IS NULL 
  OR cashback_expires IS NULL 
  OR cashback_expiration_days IS NULL
  OR cashback_available_immediately IS NULL;
