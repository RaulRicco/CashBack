# 🔧 Solução: Erro no Calculador de CAC/LTV

## 🚨 Problema Identificado

O erro **"Could not find the 'platform' column of 'marketing_spend' in the schema cache"** ocorre porque a tabela `marketing_spend` no seu banco de dados Supabase está **incompleta**.

## 📋 Causa Raiz

A tabela foi criada sem todas as colunas necessárias. Faltam:
- ✅ `platform` (VARCHAR 50)
- ✅ `campaign_name` (VARCHAR 255) 
- ✅ `notes` (TEXT)

## ✅ Solução Passo a Passo

### **Passo 1: Acessar o Supabase SQL Editor**

1. Abra seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"New query"** para criar uma nova consulta

---

### **Passo 2: Executar Script de Verificação**

Cole e execute este código para ver a estrutura atual:

```sql
SELECT 
  column_name, 
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'marketing_spend'
ORDER BY ordinal_position;
```

**O que você deve ver:**
- Se aparecer apenas `id`, `merchant_id`, `amount`, `date`, `created_at`, `updated_at` → Faltam as colunas
- Se aparecer também `platform`, `campaign_name`, `notes` → Tabela está OK

---

### **Passo 3: Adicionar Colunas Faltantes**

Cole e execute este código:

```sql
-- Adicionar coluna platform
ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS platform VARCHAR(50);

-- Adicionar coluna campaign_name
ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255);

-- Adicionar coluna notes
ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adicionar comentários (opcional, mas recomendado)
COMMENT ON COLUMN marketing_spend.platform IS 'Plataforma de marketing (Google Ads, Facebook, Instagram, etc)';
COMMENT ON COLUMN marketing_spend.campaign_name IS 'Nome da campanha';
COMMENT ON COLUMN marketing_spend.notes IS 'Observações adicionais';
```

**Resultado esperado:** ✅ "Success. No rows returned"

---

### **Passo 4: Verificar Correção**

Execute novamente a query do Passo 2 para confirmar que as colunas foram criadas:

```sql
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'marketing_spend'
ORDER BY ordinal_position;
```

**Agora você deve ver:**
1. id
2. merchant_id
3. amount
4. date
5. **platform** ← Nova!
6. **campaign_name** ← Nova!
7. **notes** ← Nova!
8. created_at
9. updated_at

---

### **Passo 5: Testar no Sistema**

1. Volte para a aba **Relatórios** no seu sistema
2. Na seção **"Calculadora de CAC e LTV"**
3. Digite um valor no campo **"Adicionar Investimento em Tráfego"**
4. Clique em **"Adicionar Investimento"**

**✅ Resultado esperado:** "Investimento adicionado com sucesso!"

---

## 🎯 Solução Alternativa (Script Completo)

Se preferir, você pode usar o script completo que já está no projeto:

**Arquivo:** `supabase-verify-and-fix-marketing-spend.sql`

1. Abra o arquivo no editor
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Execute seção por seção (há comentários explicativos)

---

## 🔍 Verificação Final

Para confirmar que está tudo funcionando:

```sql
-- Ver investimentos registrados
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
```

---

## ❓ Perguntas Frequentes

### **P: Vou perder dados ao executar o ALTER TABLE?**
**R:** Não! O comando `ALTER TABLE ... ADD COLUMN` adiciona colunas sem apagar dados existentes.

### **P: E se eu executar o script duas vezes?**
**R:** Sem problema! O `IF NOT EXISTS` garante que não haverá erro se a coluna já existir.

### **P: Por que esse erro aconteceu?**
**R:** Provavelmente você executou uma versão antiga do schema SQL que não tinha essas colunas. Este script atualiza para a versão completa.

---

## 🆘 Ainda com Problemas?

Se após seguir todos os passos o erro persistir:

1. **Limpe o cache do navegador:**
   - Chrome/Edge: `Ctrl + Shift + Delete`
   - Firefox: `Ctrl + Shift + Delete`
   - Safari: `Cmd + Option + E`

2. **Force update no sistema:**
   - Acesse: `https://seu-dominio.com/force-update`
   - Isso limpa localStorage e força re-login

3. **Verifique permissões RLS:**
   ```sql
   -- Ver políticas de segurança
   SELECT * FROM pg_policies WHERE tablename = 'marketing_spend';
   ```

4. **Teste inserção manual:**
   ```sql
   INSERT INTO marketing_spend (
     merchant_id,
     amount,
     date,
     platform
   ) VALUES (
     'seu-merchant-id-aqui',
     50.00,
     CURRENT_DATE,
     'manual'
   );
   ```

---

## 📌 Resumo

✅ Execute os comandos SQL no Supabase  
✅ Verifique que as colunas foram criadas  
✅ Teste adicionar investimento no sistema  
✅ Sucesso! 🎉

---

**Última atualização:** 2025-10-26  
**Versão do sistema:** v1.2.0
