# 🔍 DIAGNÓSTICO - ERRO AO SALVAR INTEGRAÇÕES

## 🚨 Problema Atual
Ao tentar salvar configurações de RD Station ou Mailchimp, aparece "Erro ao salvar configuração".

## ✅ PASSO A PASSO PARA RESOLVER

### 1️⃣ VERIFICAR SE A TABELA EXISTE NO SUPABASE

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute este comando:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'integration_configs';
```

**Resultado esperado:** Deve retornar uma linha com `integration_configs`

**Se retornar vazio:** A tabela não existe! Execute o script completo em `CRIAR-TABELA-INTEGRACOES.sql`

---

### 2️⃣ VERIFICAR POLÍTICAS RLS (Row Level Security)

Execute no SQL Editor:

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'integration_configs';
```

**Resultado esperado:** Deve mostrar a política "Enable all for integration_configs"

**Se estiver vazio ou bloqueado:** Execute as políticas do arquivo `CRIAR-TABELA-INTEGRACOES.sql`

---

### 3️⃣ TESTAR INSERT MANUAL NO SUPABASE

Execute no SQL Editor (substitua `SEU_MERCHANT_ID` pelo ID real):

```sql
-- Verificar seu merchant_id
SELECT id, name, email FROM merchants LIMIT 1;

-- Testar insert (use o ID do merchant acima)
INSERT INTO integration_configs (
    merchant_id,
    provider,
    api_token,
    sync_on_signup,
    sync_on_purchase
) VALUES (
    'SEU_MERCHANT_ID',  -- Substituir pelo ID real
    'rdstation',
    'teste123',
    true,
    true
) RETURNING *;
```

**Se der erro aqui:** Anote a mensagem de erro completa e envie para análise.

---

### 4️⃣ VERIFICAR CONSOLE DO NAVEGADOR

Depois de fazer o deploy das novas mudanças:

1. Abra o sistema no navegador
2. Pressione **F12** para abrir DevTools
3. Vá na aba **Console**
4. Tente salvar uma integração (RD Station ou Mailchimp)
5. **Anote TODAS as mensagens que aparecerem**, especialmente:
   - `🔧 saveIntegrationConfig iniciado`
   - `🔍 Verificando se configuração já existe`
   - `📊 Resultado da busca`
   - `📦 Dados a serem salvos`
   - `📤 Resultado final do Supabase`
   - `❌ Erro ao salvar configuração` (se houver)

---

### 5️⃣ VERIFICAR ESTRUTURA DA TABELA

Execute no SQL Editor:

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'integration_configs'
ORDER BY ordinal_position;
```

**Resultado esperado:**
```
id              | uuid         | NO  | gen_random_uuid()
merchant_id     | uuid         | NO  |
provider        | varchar(50)  | NO  |
is_active       | boolean      | YES | false
api_key         | text         | YES |
api_token       | text         | YES |
audience_id     | text         | YES |
sync_on_signup  | boolean      | YES | true
sync_on_purchase| boolean      | YES | true
sync_on_redemption | boolean   | YES | false
default_tags    | jsonb        | YES | '[]'::jsonb
last_sync_at    | timestamptz  | YES |
sync_count      | integer      | YES | 0
created_at      | timestamptz  | YES | now()
updated_at      | timestamptz  | YES | now()
```

---

## 🔧 COMANDOS PARA LIMPAR E RECRIAR (SE NECESSÁRIO)

**⚠️ ATENÇÃO: Isso apagará dados existentes!**

```sql
-- Desabilitar RLS
ALTER TABLE IF EXISTS integration_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS integration_sync_log DISABLE ROW LEVEL SECURITY;

-- Deletar tabelas
DROP TABLE IF EXISTS integration_sync_log CASCADE;
DROP TABLE IF EXISTS integration_configs CASCADE;

-- Agora execute o script completo em CRIAR-TABELA-INTEGRACOES.sql
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Tabela `integration_configs` existe no Supabase
- [ ] Tabela `integration_sync_log` existe no Supabase
- [ ] Políticas RLS estão ativas e permissivas
- [ ] Insert manual funciona no SQL Editor
- [ ] Console do navegador mostra logs detalhados
- [ ] Nenhum erro de constraint (unique, foreign key, etc)

---

## 🆘 SE AINDA NÃO FUNCIONAR

Envie estas informações:

1. **Screenshot do console do navegador** mostrando todos os logs com emojis
2. **Resultado da query de verificação de tabela** (passo 1)
3. **Resultado da query de políticas RLS** (passo 2)
4. **Mensagem de erro do insert manual** (passo 3)
5. **Resultado da query de estrutura da tabela** (passo 5)

Com essas informações, será possível identificar o problema exato!

---

## 🎯 CAUSAS MAIS COMUNS

1. **Tabela não existe** → Execute `CRIAR-TABELA-INTEGRACOES.sql`
2. **RLS muito restritivo** → Execute as políticas permissivas do script
3. **Constraint unique violada** → Tente deletar configuração antiga primeiro
4. **Merchant ID inválido** → Verifique se o merchant existe na tabela `merchants`
5. **Foreign key quebrada** → Verifique se a referência `merchants(id)` está correta
