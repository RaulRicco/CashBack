# 📋 SQL para executar no Supabase

## ⚠️ IMPORTANTE: Execute este SQL ANTES de testar o sistema

### 🎯 O que este SQL faz:
1. Adiciona as colunas de trial na tabela `merchants`
2. Cria índices para melhorar a performance
3. Adiciona comentários para documentar cada coluna

---

## 📝 COPIE E COLE NO SUPABASE SQL EDITOR:

```sql
-- ========================================
-- 1️⃣ ADICIONAR COLUNAS DE TRIAL
-- ========================================

-- Data de início do trial (preenchida automaticamente no signup)
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;

-- Data de fim do trial (trial_start_date + 14 dias)
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;

-- Status da subscription (trial, active, expired, cancelled, past_due)
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial';

-- ID da subscription no Stripe
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);

-- ID do customer no Stripe
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Data do último pagamento
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Data do próximo pagamento
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

-- ========================================
-- 2️⃣ CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice para buscar trials que expiraram
CREATE INDEX IF NOT EXISTS idx_merchants_trial_end 
ON merchants(trial_end_date) 
WHERE subscription_status = 'trial';

-- Índice para buscar por status
CREATE INDEX IF NOT EXISTS idx_merchants_subscription_status 
ON merchants(subscription_status);

-- ========================================
-- 3️⃣ ADICIONAR COMENTÁRIOS (DOCUMENTAÇÃO)
-- ========================================

COMMENT ON COLUMN merchants.subscription_status IS 
'Status da assinatura: trial, active, expired, cancelled, past_due';

COMMENT ON COLUMN merchants.trial_start_date IS 
'Data de início do trial (14 dias grátis)';

COMMENT ON COLUMN merchants.trial_end_date IS 
'Data de fim do trial';

COMMENT ON COLUMN merchants.subscription_id IS 
'ID da subscription no Stripe';

COMMENT ON COLUMN merchants.stripe_customer_id IS 
'ID do customer no Stripe';

COMMENT ON COLUMN merchants.last_payment_date IS 
'Data do último pagamento confirmado';

COMMENT ON COLUMN merchants.next_billing_date IS 
'Data do próximo pagamento agendado';
```

---

## 🎯 COMO EXECUTAR:

### **Passo 1: Acessar o Supabase**
1. Acesse: https://supabase.com
2. Faça login na sua conta
3. Selecione o projeto do LocalCashback

### **Passo 2: Abrir o SQL Editor**
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New Query"**

### **Passo 3: Executar o SQL**
1. Cole o SQL acima no editor
2. Clique em **"Run"** (ou pressione `Ctrl + Enter`)
3. Aguarde a mensagem: **"Success. No rows returned"**

---

## ✅ VERIFICAR SE DEU CERTO:

### **Método 1: Via SQL Editor**
```sql
-- Ver a estrutura da tabela merchants
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'merchants'
AND column_name IN (
  'trial_start_date', 
  'trial_end_date', 
  'subscription_status',
  'subscription_id',
  'stripe_customer_id'
)
ORDER BY column_name;
```

**Resultado esperado:**
```
column_name          | data_type                | column_default
---------------------|--------------------------|---------------
subscription_status  | character varying        | 'trial'
stripe_customer_id   | character varying        | NULL
subscription_id      | character varying        | NULL
trial_end_date       | timestamp with time zone | NULL
trial_start_date     | timestamp with time zone | NULL
```

### **Método 2: Via Table Editor**
1. Clique em **"Table Editor"** no menu lateral
2. Selecione a tabela **"merchants"**
3. Verifique se as seguintes colunas existem:
   - ✅ `trial_start_date`
   - ✅ `trial_end_date`
   - ✅ `subscription_status`
   - ✅ `subscription_id`
   - ✅ `stripe_customer_id`
   - ✅ `last_payment_date`
   - ✅ `next_billing_date`

---

## 🎉 PRONTO!

Após executar o SQL, o sistema estará pronto para:

✅ Criar contas com **trial de 14 dias automático**  
✅ Mostrar **banner de trial** no dashboard  
✅ **Bloquear automaticamente** quando trial expirar  
✅ **Desbloquear automaticamente** após pagamento  

---

## 🧪 TESTAR O SISTEMA:

### **1️⃣ Criar uma conta de teste:**
```
https://cashback.raulricco.com.br
```

### **2️⃣ Verificar no Supabase:**
```sql
-- Buscar o merchant criado
SELECT 
  id,
  name,
  subscription_status,
  trial_start_date,
  trial_end_date,
  DATE_PART('day', trial_end_date - NOW()) as dias_restantes
FROM merchants
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado:**
```
id | name         | subscription_status | trial_start_date | trial_end_date | dias_restantes
---|--------------|---------------------|------------------|----------------|----------------
1  | Teste LTDA   | trial               | 2025-01-04       | 2025-01-18     | 14
```

### **3️⃣ Fazer login e ver o banner:**
```
Dashboard → "🎁 Trial: 14 dias restantes"
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS:

### **Erro: "column already exists"**
✅ **Normal!** Significa que a coluna já foi criada antes.  
✅ O `IF NOT EXISTS` previne erros de duplicação.

### **Erro: "permission denied"**
❌ Você não tem permissão de administrador no Supabase.  
✅ Use a conta que criou o projeto.

### **Erro: "relation merchants does not exist"**
❌ A tabela `merchants` não existe.  
✅ Verifique se está no projeto correto.

---

## 📞 SUPORTE:

Se tiver algum problema:
1. Tire um print da mensagem de erro
2. Verifique se está no projeto correto do Supabase
3. Verifique se tem permissões de administrador

---

**Data:** 2025-01-04  
**Status:** ✅ SQL pronto para execução  
**Tempo estimado:** 30 segundos
