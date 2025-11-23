-- ============================================================
-- FIX: Customer Balance Calculation
-- ============================================================
-- Problema: available_cashback e total_cashback não estão sendo 
-- calculados corretamente quando há transações e resgates
-- ============================================================

-- PARTE 1: Verificar dados atuais do cliente
-- ============================================================
SELECT 
  'DADOS ATUAIS DO CLIENTE' as info,
  c.id,
  c.phone,
  c.name,
  c.available_cashback as disponivel_atual,
  c.total_cashback as total_atual,
  c.total_spent
FROM customers c
WHERE c.phone = '6111111111'
ORDER BY c.created_at DESC
LIMIT 1;

-- PARTE 2: Calcular o que DEVERIA ser
-- ============================================================
WITH customer_data AS (
  SELECT id FROM customers WHERE phone = '6111111111' ORDER BY created_at DESC LIMIT 1
),
cashback_earned AS (
  SELECT 
    COALESCE(SUM(t.cashback_amount), 0) as total_cashback_ganho
  FROM transactions t
  WHERE t.customer_id = (SELECT id FROM customer_data)
    AND t.transaction_type = 'cashback'
    AND t.status = 'completed'
),
cashback_redeemed AS (
  SELECT 
    COALESCE(SUM(r.amount), 0) as total_cashback_resgatado
  FROM redemptions r
  WHERE r.customer_id = (SELECT id FROM customer_data)
    AND r.status = 'completed'
)
SELECT 
  'VALORES QUE DEVERIAM SER' as info,
  ce.total_cashback_ganho as total_acumulado_correto,
  cr.total_cashback_resgatado as total_resgatado_correto,
  (ce.total_cashback_ganho - cr.total_cashback_resgatado) as disponivel_correto
FROM cashback_earned ce, cashback_redeemed cr;

-- PARTE 3: Detalhes das transações (entradas)
-- ============================================================
SELECT 
  'TRANSAÇÕES (ENTRADAS)' as info,
  t.id,
  t.amount as valor_compra,
  t.cashback_amount as cashback_ganho,
  t.cashback_percentage,
  t.status,
  t.created_at
FROM transactions t
WHERE t.customer_id = (SELECT id FROM customers WHERE phone = '6111111111' ORDER BY created_at DESC LIMIT 1)
  AND t.transaction_type = 'cashback'
ORDER BY t.created_at DESC;

-- PARTE 4: Detalhes dos resgates (saídas)
-- ============================================================
SELECT 
  'RESGATES (SAÍDAS)' as info,
  r.id,
  r.amount as valor_resgatado,
  r.status,
  r.created_at
FROM redemptions r
WHERE r.customer_id = (SELECT id FROM customers WHERE phone = '6111111111' ORDER BY created_at DESC LIMIT 1)
ORDER BY r.created_at DESC;

-- ============================================================
-- PARTE 5: CRIAR/SUBSTITUIR A FUNÇÃO DE ATUALIZAÇÃO DE SALDO
-- ============================================================

CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
  v_total_cashback DECIMAL(10,2);
  v_total_redeemed DECIMAL(10,2);
  v_available_cashback DECIMAL(10,2);
BEGIN
  -- Determinar o customer_id dependendo da tabela
  IF TG_TABLE_NAME = 'transactions' THEN
    v_customer_id := COALESCE(NEW.customer_id, OLD.customer_id);
  ELSIF TG_TABLE_NAME = 'redemptions' THEN
    v_customer_id := COALESCE(NEW.customer_id, OLD.customer_id);
  END IF;

  -- Calcular total de cashback ganho (completed transactions)
  SELECT COALESCE(SUM(cashback_amount), 0)
  INTO v_total_cashback
  FROM transactions
  WHERE customer_id = v_customer_id
    AND transaction_type = 'cashback'
    AND status = 'completed';

  -- Calcular total resgatado (completed redemptions)
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_redeemed
  FROM redemptions
  WHERE customer_id = v_customer_id
    AND status = 'completed';

  -- Calcular disponível (total ganho - total resgatado)
  v_available_cashback := v_total_cashback - v_total_redeemed;

  -- Atualizar customer
  UPDATE customers
  SET 
    total_cashback = v_total_cashback,
    available_cashback = v_available_cashback,
    updated_at = NOW()
  WHERE id = v_customer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PARTE 6: RECRIAR OS TRIGGERS
-- ============================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_customer_balance ON transactions;
DROP TRIGGER IF EXISTS trigger_update_customer_balance_redemption ON redemptions;

-- Trigger para transações (INSERT, UPDATE, DELETE)
CREATE TRIGGER trigger_update_customer_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_customer_balance();

-- Trigger para redemptions (INSERT, UPDATE, DELETE)
CREATE TRIGGER trigger_update_customer_balance_redemption
AFTER INSERT OR UPDATE OR DELETE ON redemptions
FOR EACH ROW
EXECUTE FUNCTION update_customer_balance();

-- ============================================================
-- PARTE 7: RECALCULAR TODOS OS CLIENTES EXISTENTES
-- ============================================================

DO $$
DECLARE
  customer_record RECORD;
  v_total_cashback DECIMAL(10,2);
  v_total_redeemed DECIMAL(10,2);
  v_available_cashback DECIMAL(10,2);
BEGIN
  FOR customer_record IN SELECT id FROM customers LOOP
    -- Calcular total de cashback ganho
    SELECT COALESCE(SUM(cashback_amount), 0)
    INTO v_total_cashback
    FROM transactions
    WHERE customer_id = customer_record.id
      AND transaction_type = 'cashback'
      AND status = 'completed';

    -- Calcular total resgatado
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_redeemed
    FROM redemptions
    WHERE customer_id = customer_record.id
      AND status = 'completed';

    -- Calcular disponível
    v_available_cashback := v_total_cashback - v_total_redeemed;

    -- Atualizar customer
    UPDATE customers
    SET 
      total_cashback = v_total_cashback,
      available_cashback = v_available_cashback,
      updated_at = NOW()
    WHERE id = customer_record.id;

    RAISE NOTICE 'Cliente % atualizado: Total=% Disponível=%', 
      customer_record.id, v_total_cashback, v_available_cashback;
  END LOOP;
END $$;

-- ============================================================
-- PARTE 8: VERIFICAR RESULTADO FINAL
-- ============================================================
SELECT 
  'RESULTADO FINAL' as info,
  c.id,
  c.phone,
  c.name,
  c.available_cashback as disponivel_final,
  c.total_cashback as total_final,
  c.total_spent
FROM customers c
WHERE c.phone = '6111111111'
ORDER BY c.created_at DESC
LIMIT 1;
