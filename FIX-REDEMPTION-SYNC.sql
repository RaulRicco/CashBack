-- Script SQL para habilitar sync_on_redemption em todas as integrações existentes
-- Execute este script no Supabase SQL Editor

-- Ver configurações atuais (antes da mudança)
SELECT 
    id,
    provider,
    sync_on_signup,
    sync_on_purchase,
    sync_on_redemption,
    is_active
FROM integration_configs;

-- Atualizar todas as configurações para habilitar sync_on_redemption
UPDATE integration_configs
SET sync_on_redemption = true
WHERE sync_on_redemption = false;

-- Verificar resultado (depois da mudança)
SELECT 
    id,
    provider,
    sync_on_signup,
    sync_on_purchase,
    sync_on_redemption,
    is_active
FROM integration_configs;

-- Verificar quantas foram atualizadas
SELECT 
    COUNT(*) as total_configs,
    SUM(CASE WHEN sync_on_redemption = true THEN 1 ELSE 0 END) as com_redemption_habilitado
FROM integration_configs;
