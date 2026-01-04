-- ============================================
-- FIX CORRIGIDO: Trigger sem o campo first_purchase_at
-- ============================================
-- O trigger anterior tentava atualizar o campo first_purchase_at
-- que não existe na tabela customers.
-- Esta versão corrigida remove essa referência.
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
      last_purchase_at = NOW()
      -- REMOVIDO: first_purchase_at (campo não existe)
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentário explicativo
COMMENT ON FUNCTION update_customer_cashback() IS 
  'Atualiza automaticamente o saldo de cashback do cliente quando uma transação é completada (versão corrigida)';

-- ============================================
-- PRONTO! Agora o sistema deve funcionar.
-- O trigger já existe, só substituímos a função.
-- ============================================
