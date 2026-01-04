-- ========================================
-- CORREÇÃO RÁPIDA: Adicionar colunas faltantes em marketing_spend
-- ========================================
-- INSTRUÇÕES:
-- 1. Copie TODO este arquivo
-- 2. Cole no SQL Editor do Supabase (https://supabase.com/dashboard)
-- 3. Clique em "RUN" ou pressione Ctrl+Enter
-- 4. Aguarde mensagem de sucesso
-- 5. Teste novamente no sistema
-- ========================================

-- Adicionar colunas faltantes (se não existirem)
ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS platform VARCHAR(50);

ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255);

ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adicionar comentários de documentação
COMMENT ON COLUMN marketing_spend.platform IS 'Plataforma de marketing utilizada (ex: Google Ads, Facebook, Instagram, manual)';
COMMENT ON COLUMN marketing_spend.campaign_name IS 'Nome da campanha de marketing';
COMMENT ON COLUMN marketing_spend.notes IS 'Notas e observações adicionais sobre o investimento';

-- Verificar se funcionou (deve mostrar todas as colunas incluindo as novas)
SELECT 
  column_name, 
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'marketing_spend'
ORDER BY ordinal_position;

-- ========================================
-- ✅ SE VER AS COLUNAS platform, campaign_name e notes NA LISTA ACIMA:
-- SUCESSO! Volte para o sistema e teste adicionar um investimento.
-- ========================================
