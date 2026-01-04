-- ============================================
-- TRIGGER MÍNIMO - SÓ CAMPOS QUE EXISTEM
-- ============================================
-- Remove TODOS os campos que não existem:
-- - first_purchase_at (não existe)
-- - last_purchase_at (não existe)
--
-- Atualiza APENAS:
-- - total_cashback
-- - available_cashback  
-- - total_spent
-- ============================================

CREATE OR REPLACE FUNCTION update_customer_cashback()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'cashback' AND NEW.status = 'completed' THEN
    UPDATE customers
    SET 
      total_cashback = total_cashback + NEW.cashback_amount,
      available_cashback = available_cashback + NEW.cashback_amount,
      total_spent = total_spent + NEW.amount
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PRONTO! Execute este SQL e teste novamente.
-- ============================================
