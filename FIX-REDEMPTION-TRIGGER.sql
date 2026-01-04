-- ============================================
-- FIX: Trigger para atualizar saldo quando resgate é completado
-- ============================================

-- Função que atualiza o saldo do cliente após resgate
CREATE OR REPLACE FUNCTION update_customer_redemption()
RETURNS TRIGGER AS $$
BEGIN
  -- Só atualiza se o resgate for completado
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE customers
    SET 
      available_cashback = available_cashback - NEW.amount
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_redemption_trigger ON redemptions;

-- Criar trigger para redemptions
CREATE TRIGGER update_redemption_trigger 
  AFTER INSERT OR UPDATE ON redemptions
  FOR EACH ROW 
  EXECUTE FUNCTION update_customer_redemption();

-- Comentário
COMMENT ON FUNCTION update_customer_redemption() IS 
  'Deduz o valor do cashback disponível quando um resgate é completado';

-- ============================================
-- PRONTO! Execute este SQL no Supabase
-- ============================================
