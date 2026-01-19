-- ========================================
-- VERIFICAÇÃO E CORREÇÃO DA TABELA marketing_spend
-- ========================================
-- Este script verifica a estrutura atual e adiciona colunas faltantes
-- Execute este script no Supabase SQL Editor

-- PASSO 1: Verificar estrutura atual
-- Execute esta query primeiro para ver o que está faltando:
SELECT 
  column_name, 
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'marketing_spend'
ORDER BY ordinal_position;

-- ========================================
-- PASSO 2: Adicionar colunas faltantes (se necessário)
-- ========================================

-- Adicionar coluna platform (VARCHAR 50)
ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS platform VARCHAR(50);

-- Adicionar coluna campaign_name (VARCHAR 255)
ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255);

-- Adicionar coluna notes (TEXT)
ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN marketing_spend.platform IS 'Plataforma de marketing utilizada (ex: Google Ads, Facebook, Instagram)';
COMMENT ON COLUMN marketing_spend.campaign_name IS 'Nome da campanha de marketing';
COMMENT ON COLUMN marketing_spend.notes IS 'Notas adicionais sobre o investimento';

-- ========================================
-- PASSO 3: Verificar se as colunas foram criadas
-- ========================================

-- Execute novamente para confirmar que todas as colunas existem:
SELECT 
  column_name, 
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'marketing_spend'
ORDER BY ordinal_position;

-- ========================================
-- ESTRUTURA ESPERADA FINAL:
-- ========================================
-- id                | uuid                      | PK
-- merchant_id       | uuid                      | FK -> merchants
-- amount            | numeric(10,2)             | NOT NULL
-- date              | date                      | NOT NULL
-- platform          | character varying(50)     | NULL
-- campaign_name     | character varying(255)    | NULL
-- notes             | text                      | NULL
-- created_at        | timestamp with time zone  | DEFAULT NOW()
-- updated_at        | timestamp with time zone  | DEFAULT NOW()

-- ========================================
-- VERIFICAÇÃO DE DADOS EXISTENTES
-- ========================================

-- Ver registros atuais na tabela
SELECT 
  id,
  merchant_id,
  amount,
  date,
  platform,
  campaign_name,
  created_at
FROM marketing_spend
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- TESTES
-- ========================================

-- Teste de inserção (REMOVA O COMENTÁRIO ABAIXO PARA TESTAR)
-- Substitua 'seu-merchant-id-aqui' pelo ID real do merchant

/*
INSERT INTO marketing_spend (
  merchant_id,
  amount,
  date,
  platform,
  campaign_name,
  notes
) VALUES (
  'seu-merchant-id-aqui',
  100.00,
  CURRENT_DATE,
  'manual',
  'Teste de Investimento',
  'Teste do sistema de tracking de marketing'
);
*/

-- Verificar se a inserção funcionou
-- SELECT * FROM marketing_spend WHERE platform = 'manual' ORDER BY created_at DESC LIMIT 5;
