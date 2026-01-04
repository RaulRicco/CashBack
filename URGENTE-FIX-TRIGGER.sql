-- ============================================
-- FIX URGENTE: Criar trigger para atualizar saldo de cashback
-- ============================================
-- Este SQL cria o trigger que automaticamente atualiza o saldo
-- do cliente quando uma transação de cashback é completada.
--
-- COMO EXECUTAR:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este código e execute
-- ============================================

-- Criar ou substituir a função que atualiza o cashback do cliente
CREATE OR REPLACE FUNCTION update_customer_cashback()
RETURNS TRIGGER AS $$
BEGIN
  -- Só atualiza se for transação de cashback E status completed
  IF NEW.transaction_type = 'cashback' AND NEW.status = 'completed' THEN
    UPDATE customers
    SET 
      total_cashback = total_cashback + NEW.cashback_amount,
      available_cashback = available_cashback + NEW.cashback_amount,
      total_spent = total_spent + NEW.amount,
      last_purchase_at = NOW(),
      first_purchase_at = COALESCE(first_purchase_at, NOW())
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_cashback_trigger ON transactions;

-- Criar trigger que executa APÓS inserção OU atualização
CREATE TRIGGER update_cashback_trigger 
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW 
  EXECUTE FUNCTION update_customer_cashback();

-- Comentário explicativo
COMMENT ON FUNCTION update_customer_cashback() IS 
  'Atualiza automaticamente o saldo de cashback do cliente quando uma transação é completada';

-- ============================================
-- ATUALIZAR TRANSAÇÕES EXISTENTES
-- ============================================
-- As transações que já foram criadas com status='completed'
-- mas não creditaram cashback precisam ser processadas.
--
-- Este UPDATE vai "forçar" o trigger a executar para transações antigas.
-- ============================================

-- Pegar todas as transações completed que não creditaram cashback ainda
UPDATE customers c
SET 
  total_cashback = (
    SELECT COALESCE(SUM(t.cashback_amount), 0)
    FROM transactions t
    WHERE t.customer_id = c.id
      AND t.transaction_type = 'cashback'
      AND t.status = 'completed'
  ),
  available_cashback = (
    SELECT COALESCE(SUM(t.cashback_amount), 0)
    FROM transactions t
    WHERE t.customer_id = c.id
      AND t.transaction_type = 'cashback'
      AND t.status = 'completed'
  ) - (
    -- Subtrair resgates
    SELECT COALESCE(SUM(r.amount), 0)
    FROM redemptions r
    WHERE r.customer_id = c.id
      AND r.status = 'completed'
  ),
  total_spent = (
    SELECT COALESCE(SUM(t.amount), 0)
    FROM transactions t
    WHERE t.customer_id = c.id
      AND t.transaction_type = 'cashback'
      AND t.status = 'completed'
  );

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se funcionou:
--
-- Ver clientes com cashback:
-- SELECT phone, available_cashback, total_cashback, total_spent 
-- FROM customers 
-- WHERE available_cashback > 0;
--
-- Ver transações completed:
-- SELECT t.created_at, c.phone, t.amount, t.cashback_amount, t.status
-- FROM transactions t
-- JOIN customers c ON c.id = t.customer_id
-- WHERE t.transaction_type = 'cashback'
-- ORDER BY t.created_at DESC
-- LIMIT 10;
-- ============================================
