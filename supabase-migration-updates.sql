-- ====================================
-- ATUALIZAÇÕES DO SCHEMA - NOVAS FUNCIONALIDADES
-- Execute este arquivo no SQL Editor do Supabase
-- ====================================

-- 1. Adicionar campos ao merchants para domínio personalizado e configurações de marketing
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255),
ADD COLUMN IF NOT EXISTS gtm_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS meta_pixel_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS signup_link_slug VARCHAR(100) UNIQUE;

-- 2. Criar índice para o slug de cadastro
CREATE INDEX IF NOT EXISTS idx_merchants_signup_slug ON merchants(signup_link_slug);

-- 3. Adicionar campo de referência do merchant aos customers
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS referred_by_merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL;

-- 4. Criar função para gerar slug único automaticamente
CREATE OR REPLACE FUNCTION generate_unique_slug(merchant_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Criar slug base a partir do nome
  base_slug := lower(regexp_replace(merchant_name, '[^a-zA-Z0-9]', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Garantir que o slug seja único
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM merchants WHERE signup_link_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 5. Atualizar merchants existentes com slugs únicos
DO $$
DECLARE
  merchant RECORD;
BEGIN
  FOR merchant IN SELECT id, name FROM merchants WHERE signup_link_slug IS NULL
  LOOP
    UPDATE merchants 
    SET signup_link_slug = generate_unique_slug(merchant.name)
    WHERE id = merchant.id;
  END LOOP;
END $$;

-- 6. Criar trigger para gerar slug automaticamente em novos merchants
CREATE OR REPLACE FUNCTION set_merchant_signup_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.signup_link_slug IS NULL THEN
    NEW.signup_link_slug := generate_unique_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_merchant_signup_slug
BEFORE INSERT ON merchants
FOR EACH ROW
EXECUTE FUNCTION set_merchant_signup_slug();

-- 7. Comentários para documentação
COMMENT ON COLUMN merchants.custom_domain IS 'Domínio personalizado do merchant (ex: cashback.minhaloja.com)';
COMMENT ON COLUMN merchants.gtm_id IS 'ID do Google Tag Manager (ex: GTM-XXXXXXX)';
COMMENT ON COLUMN merchants.meta_pixel_id IS 'ID do Meta Pixel / Facebook Pixel';
COMMENT ON COLUMN merchants.signup_link_slug IS 'Slug único para link de cadastro de clientes';
COMMENT ON COLUMN customers.referred_by_merchant_id IS 'Merchant que referenciou o cliente através do link de cadastro';
