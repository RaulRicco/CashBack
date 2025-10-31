# ⚡ QUICK FIX - Erro de Integração

## 🎯 OBJETIVO
Descobrir POR QUE o erro "Erro ao salvar configuração" está acontecendo.

## 🚀 COMANDOS RÁPIDOS

### 1. Deploy no Servidor
```bash
ssh root@31.97.167.88
cd /var/www/cashback/cashback-system
git pull origin main
npm run build
systemctl reload nginx
exit
```

### 2. SQL no Supabase

**Copie e cole no Supabase → SQL Editor:**

```sql
-- Criar tabelas
CREATE TABLE IF NOT EXISTS integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  api_key TEXT,
  api_token TEXT,
  audience_id TEXT,
  sync_on_signup BOOLEAN DEFAULT true,
  sync_on_purchase BOOLEAN DEFAULT true,
  sync_on_redemption BOOLEAN DEFAULT false,
  default_tags JSONB DEFAULT '[]'::jsonb,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(merchant_id, provider)
);

CREATE TABLE IF NOT EXISTS integration_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_config_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_log ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (temporário)
DROP POLICY IF EXISTS "Enable all for integration_configs" ON integration_configs;
CREATE POLICY "Enable all for integration_configs" ON integration_configs 
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for integration_sync_log" ON integration_sync_log;
CREATE POLICY "Enable all for integration_sync_log" ON integration_sync_log 
FOR ALL USING (true) WITH CHECK (true);

-- Verificar
SELECT 'Tabelas criadas!' as status;
```

### 3. Testar no Navegador

1. Abra o sistema
2. Pressione **F12**
3. Clique na aba **Console**
4. Vá em **Integrações**
5. Preencha os campos
6. Clique em **Salvar**
7. **TIRE PRINT DO CONSOLE**

## 📸 O QUE PROCURAR NO CONSOLE

Você verá algo como:

```
🚀 Salvando RD Station: ...
🔧 saveIntegrationConfig iniciado: ...
🔍 Verificando se configuração já existe...
📊 Resultado da busca: ...
📦 Dados a serem salvos: ...
📤 Resultado final do Supabase: ...
```

### ✅ Se funcionar:
```
✅ Configuração salva com sucesso!
```

### ❌ Se der erro:
```
❌ Erro ao salvar: [mensagem de erro]
💥 Erro detalhado completo: { error: "...", code: "...", ... }
```

**TIRE PRINT DESSE ERRO E ENVIE!**

## 🔥 ERRO MAIS COMUM

```
relation "integration_configs" does not exist
```

**Solução:** Execute o SQL do passo 2 acima.

---

## ⏱️ TEMPO TOTAL: 5 MINUTOS

- Deploy: 2 min
- SQL: 1 min
- Teste: 2 min

---

## 📞 ENVIAR PARA ANÁLISE

Se ainda der erro, envie:
1. **Print do console** com todos os emojis
2. **Mensagem de erro** exata
3. **Código do erro** (se houver)

Com isso, consigo corrigir em minutos! 🎯
