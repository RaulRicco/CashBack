-- ====================================
-- ADICIONAR SUPORTE A ONESIGNAL
-- ====================================

-- Adicionar coluna app_id para OneSignal (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'integration_configs' 
    AND column_name = 'app_id'
  ) THEN
    ALTER TABLE integration_configs 
    ADD COLUMN app_id TEXT;
    
    RAISE NOTICE '✅ Coluna app_id adicionada à tabela integration_configs';
  ELSE
    RAISE NOTICE '⚠️ Coluna app_id já existe';
  END IF;
END $$;

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'integration_configs'
ORDER BY ordinal_position;
