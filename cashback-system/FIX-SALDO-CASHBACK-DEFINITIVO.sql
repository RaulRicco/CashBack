-- ============================================================
-- FIX DEFINITIVO: Cálculo correto do saldo de cashback
-- ============================================================
-- PROBLEMA IDENTIFICADO:
--   1. Trigger update_customer_cashback() dispara em QUALQUER
--      UPDATE de transação com status='completed', sem verificar
--      se o status JÁ ERA 'completed' antes. Isso causa adição
--      DUPLA do cashback quando a transação é atualizada por
--      qualquer motivo.
--   2. Trigger update_customer_redemption() similar — pode
--      descontar DUAS vezes se registros atualizados novamente.
--
-- SOLUÇÃO:
--   A. Corrigir ambos os triggers para só atuar quando o status
--      está MUDANDO para 'completed' (não quando já era).
--   B. Recalcular TODOS os saldos do zero para corrigir dados
--      históricos corrompidos.
--
-- COMO EXECUTAR:
--   1. Acesse o Supabase Dashboard > SQL Editor
--   2. Cole TODO este conteúdo e clique em "Run"
-- ============================================================


-- ============================================================
-- PARTE 1: CORRIGIR TRIGGER DE GANHO DE CASHBACK
-- ============================================================

CREATE OR REPLACE FUNCTION update_customer_cashback()
RETURNS TRIGGER AS $$
BEGIN
  -- ✅ Só atua se:
  --    - É transação de cashback E está completada
  --    - E é INSERT (novo registro) OU estava com status diferente antes
  IF NEW.transaction_type = 'cashback'
     AND NEW.status = 'completed'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed')
  THEN
    UPDATE customers
    SET
      total_cashback    = total_cashback    + NEW.cashback_amount,
      available_cashback = available_cashback + NEW.cashback_amount,
      total_spent       = total_spent       + NEW.amount,
      last_purchase_at  = NOW()
    WHERE id = NEW.customer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
DROP TRIGGER IF EXISTS update_cashback_trigger ON transactions;
CREATE TRIGGER update_cashback_trigger
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_cashback();

COMMENT ON FUNCTION update_customer_cashback() IS
  'Adiciona cashback ao cliente somente na PRIMEIRA vez que a transação fica completed (guard OLD.status)';


-- ============================================================
-- PARTE 2: CORRIGIR TRIGGER DE RESGATE (REDEMPTION)
-- ============================================================

CREATE OR REPLACE FUNCTION update_customer_redemption()
RETURNS TRIGGER AS $$
BEGIN
  -- ✅ Só desconta se o status ESTÁ MUDANDO para 'completed'
  IF NEW.status = 'completed'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed')
  THEN
    UPDATE customers
    SET available_cashback = available_cashback - NEW.amount
    WHERE id = NEW.customer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
DROP TRIGGER IF EXISTS update_redemption_trigger ON redemptions;
CREATE TRIGGER update_redemption_trigger
  AFTER INSERT OR UPDATE ON redemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_redemption();

COMMENT ON FUNCTION update_customer_redemption() IS
  'Desconta cashback do cliente somente na PRIMEIRA vez que o resgate fica completed (guard OLD.status)';


-- ============================================================
-- PARTE 3: RECALCULAR TODOS OS SALDOS DO ZERO
-- ============================================================
-- Corrige qualquer saldo que foi corrompido pelos triggers antigos.
-- Fórmula: available = SUM(cashback ganho) - SUM(resgate completado)
-- ============================================================

UPDATE customers c
SET
  total_cashback = COALESCE((
    SELECT SUM(t.cashback_amount)
    FROM transactions t
    WHERE t.customer_id = c.id
      AND t.transaction_type = 'cashback'
      AND t.status = 'completed'
  ), 0),

  available_cashback = GREATEST(0, (
    COALESCE((
      SELECT SUM(t.cashback_amount)
      FROM transactions t
      WHERE t.customer_id = c.id
        AND t.transaction_type = 'cashback'
        AND t.status = 'completed'
    ), 0)
    -
    COALESCE((
      SELECT SUM(r.amount)
      FROM redemptions r
      WHERE r.customer_id = c.id
        AND r.status = 'completed'
    ), 0)
  )),

  total_spent = COALESCE((
    SELECT SUM(t.amount)
    FROM transactions t
    WHERE t.customer_id = c.id
      AND t.transaction_type = 'cashback'
      AND t.status = 'completed'
  ), 0);


-- ============================================================
-- PARTE 4: VERIFICAÇÃO — EXECUTE APÓS O SCRIPT
-- ============================================================
-- Ver clientes com saldo após correção:
/*
SELECT
  id,
  phone,
  name,
  total_cashback,
  available_cashback,
  total_spent
FROM customers
ORDER BY available_cashback DESC
LIMIT 20;
*/

-- Ver transações de cashback por cliente:
/*
SELECT
  c.phone,
  COUNT(t.id)               AS total_transacoes,
  SUM(t.cashback_amount)    AS total_cashback_ganho,
  COALESCE((
    SELECT SUM(r.amount)
    FROM redemptions r
    WHERE r.customer_id = c.id AND r.status = 'completed'
  ), 0)                     AS total_resgatado,
  c.available_cashback      AS saldo_disponivel
FROM customers c
JOIN transactions t ON t.customer_id = c.id
  AND t.transaction_type = 'cashback'
  AND t.status = 'completed'
GROUP BY c.id, c.phone, c.available_cashback
ORDER BY total_cashback_ganho DESC
LIMIT 20;
*/

-- ============================================================
-- PRONTO! Os triggers agora são idempotentes e os saldos
-- foram recalculados corretamente.
-- ============================================================
