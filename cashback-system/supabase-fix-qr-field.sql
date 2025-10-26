-- ====================================
-- CORREÇÃO: Adicionar campo qr_scanned_at
-- Execute este SQL no Supabase
-- ====================================

-- Adicionar campo qr_scanned_at na tabela transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS qr_scanned_at TIMESTAMP WITH TIME ZONE;

-- Comentário para documentação
COMMENT ON COLUMN transactions.qr_scanned_at IS 'Data e hora em que o QR code foi escaneado pelo cliente';
