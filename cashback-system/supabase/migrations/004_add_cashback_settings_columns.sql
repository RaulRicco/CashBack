-- ============================================================
-- 🔧 ADICIONAR COLUNAS DE CONFIGURAÇÃO DE CASHBACK
-- ============================================================
-- Adiciona colunas para configuração de expiração de cashback
-- ============================================================

-- Verificar se as colunas já existem antes de adicionar
DO $$ 
BEGIN
    -- cashback_program_name: Nome personalizado do programa
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'merchants' 
        AND column_name = 'cashback_program_name'
    ) THEN
        ALTER TABLE public.merchants 
        ADD COLUMN cashback_program_name TEXT DEFAULT 'Programa de Cashback';
        RAISE NOTICE '✅ Coluna cashback_program_name adicionada';
    ELSE
        RAISE NOTICE '⚠️  Coluna cashback_program_name já existe';
    END IF;

    -- cashback_expires: Se o cashback expira ou não
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'merchants' 
        AND column_name = 'cashback_expires'
    ) THEN
        ALTER TABLE public.merchants 
        ADD COLUMN cashback_expires BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna cashback_expires adicionada';
    ELSE
        RAISE NOTICE '⚠️  Coluna cashback_expires já existe';
    END IF;

    -- cashback_expiration_days: Quantos dias até expirar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'merchants' 
        AND column_name = 'cashback_expiration_days'
    ) THEN
        ALTER TABLE public.merchants 
        ADD COLUMN cashback_expiration_days INTEGER DEFAULT 365;
        RAISE NOTICE '✅ Coluna cashback_expiration_days adicionada';
    ELSE
        RAISE NOTICE '⚠️  Coluna cashback_expiration_days já existe';
    END IF;

    -- cashback_available_immediately: Se o cashback fica disponível imediatamente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'merchants' 
        AND column_name = 'cashback_available_immediately'
    ) THEN
        ALTER TABLE public.merchants 
        ADD COLUMN cashback_available_immediately BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ Coluna cashback_available_immediately adicionada';
    ELSE
        RAISE NOTICE '⚠️  Coluna cashback_available_immediately já existe';
    END IF;

END $$;

-- Adicionar comentários às colunas
COMMENT ON COLUMN public.merchants.cashback_program_name IS 
'Nome personalizado do programa de cashback';

COMMENT ON COLUMN public.merchants.cashback_expires IS 
'Define se o cashback tem data de expiração';

COMMENT ON COLUMN public.merchants.cashback_expiration_days IS 
'Número de dias até o cashback expirar (se cashback_expires = true)';

COMMENT ON COLUMN public.merchants.cashback_available_immediately IS 
'Define se o cashback fica disponível para uso imediatamente após ganho';

-- Verificação final
SELECT 
    '✅ COLUNAS ADICIONADAS' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'merchants'
AND column_name IN (
    'cashback_program_name',
    'cashback_expires',
    'cashback_expiration_days',
    'cashback_available_immediately'
)
ORDER BY column_name;

-- ============================================================
-- MENSAGEM FINAL
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║  ✅ COLUNAS DE CONFIGURAÇÃO ADICIONADAS!                 ║
╠══════════════════════════════════════════════════════════╣
║  ✅ cashback_program_name (TEXT)                         ║
║  ✅ cashback_expires (BOOLEAN)                           ║
║  ✅ cashback_expiration_days (INTEGER)                   ║
║  ✅ cashback_available_immediately (BOOLEAN)             ║
║                                                          ║
║  🎯 AGORA O ERRO 400 DEVE SUMIR!                         ║
╚══════════════════════════════════════════════════════════╝';
END $$;
