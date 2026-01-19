# 🔧 ATUALIZAR PLANO DOS MERCHANTS PARA R$ 97

## 🎯 OBJETIVO

Atualizar todos os merchants do banco de dados para usar o novo plano "launch" (R$ 97/mês) com:
- **5.000 clientes** (limite)
- **10 funcionários** (limite)
- Renegociação após atingir 5.000 clientes

---

## ⚡ EXECUTAR SQL NO SUPABASE (2 MINUTOS)

### 1. Acessar Supabase
1. Acesse: https://supabase.com
2. Login com sua conta
3. Selecione o projeto: **LocalCashback**

### 2. Abrir SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### 3. Executar SQL

Cole o seguinte SQL e execute (`Ctrl + Enter` ou botão **RUN**):

```sql
-- Atualizar todos os merchants para usar o plano "launch" (R$ 97)
UPDATE merchants 
SET 
  subscription_plan = 'launch',
  customer_limit = 5000,  -- Limite de 5 mil clientes
  employee_limit = 10     -- Limite de 10 funcionários
WHERE subscription_plan IS NULL 
   OR subscription_plan IN ('starter', 'business', 'premium');

-- Verificar resultado
SELECT id, name, email, subscription_plan, customer_limit, employee_limit 
FROM merchants 
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Resultado Esperado

Você verá uma tabela com os merchants atualizados:

```
subscription_plan: 'launch'
customer_limit: 5000 (máximo de 5 mil clientes)
employee_limit: 10 (máximo de 10 funcionários)
```

---

## 🔍 VERIFICAR SE DEU CERTO

### Opção 1: Via Dashboard

1. Faça logout e login novamente em: https://cashback.raulricco.com.br
2. Acesse: **Assinatura** (menu lateral)
3. Deve aparecer:
   - ✅ **Plano Mensal** (não mais "Plano Business")
   - ✅ **R$ 97** /mês (não mais R$ 297)
   - ✅ Clientes: **5 de 5.000** (limite de 5 mil clientes)
   - ✅ Funcionários: **1 de 10** (limite de 10 funcionários)

### Opção 2: Via SQL (Verificação técnica)

Execute no Supabase SQL Editor:

```sql
-- Ver seu merchant específico
SELECT 
  id, 
  name, 
  email,
  subscription_plan,
  customer_limit,
  employee_limit,
  subscription_status
FROM merchants 
WHERE email = 'seu-email@exemplo.com';
```

Resultado esperado:
```
subscription_plan: 'launch'
customer_limit: 5000
employee_limit: 10
```

---

## 📋 O QUE ESSE SQL FAZ

### Antes da atualização:
```sql
subscription_plan: 'business'  ❌
customer_limit: 10000          ❌
employee_limit: 5              ❌
```

**Resultado:** Página mostra "Plano Business - R$ 297/mês"

### Depois da atualização:
```sql
subscription_plan: 'launch'    ✅
customer_limit: 5000           ✅ (limite de 5 mil clientes)
employee_limit: 10             ✅ (limite de 10 funcionários)
```

**Resultado:** Página mostra "Plano Mensal - R$ 97/mês" com limites visíveis

---

## 🎨 COMPARAÇÃO VISUAL

### ANTES (❌ Incorreto):
```
┌─────────────────────────────────────┐
│ 👑 Plano Business                   │
│ 📊 Período de Teste          R$ 297 │
│                               /mês  │
├─────────────────────────────────────┤
│ Clientes        Funcionários        │
│ 5 / 10.000      1 / 5              │
└─────────────────────────────────────┘
```

### DEPOIS (✅ Correto):
```
┌─────────────────────────────────────┐
│ 👑 Plano Mensal                     │
│ 📊 Período de Teste           R$ 97 │
│                               /mês  │
├─────────────────────────────────────┤
│ Clientes        Funcionários        │
│ 5 de 5.000      1 de 10            │
└─────────────────────────────────────┘
Limite: 5.000 clientes / 10 funcionários
Renegociação após atingir o limite
```

---

## ⚠️ IMPORTANTE

### Afeta TODOS os merchants
Este SQL atualiza **todos os merchants** do banco de dados, não apenas o seu.

Se você tem múltiplos merchants e quer atualizar apenas o seu:

```sql
-- Atualizar apenas SEU merchant
UPDATE merchants 
SET 
  subscription_plan = 'launch',
  customer_limit = 5000,
  employee_limit = 10
WHERE email = 'seu-email@exemplo.com';  -- Substitua pelo seu email
```

### Não afeta assinaturas ativas no Stripe
Este SQL apenas atualiza o banco de dados local. As assinaturas no Stripe (pagamentos) não são afetadas.

---

## 🐛 TROUBLESHOOTING

### Problema: Ainda aparece "Plano Business"

**Solução 1:** Fazer logout e login novamente
```
1. Clique no seu nome (canto superior direito)
2. Sair
3. Fazer login novamente
```

**Solução 2:** Limpar cache do navegador
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Solução 3:** Verificar se o SQL foi executado
```sql
SELECT subscription_plan FROM merchants WHERE id = 'seu-merchant-id';
```

### Problema: Aparece "null" ou vazio

Isso significa que o merchant não tem um plano definido. Execute:

```sql
UPDATE merchants 
SET subscription_plan = 'launch'
WHERE subscription_plan IS NULL;
```

---

## 📊 VERIFICAÇÃO COMPLETA

Execute este SQL para ver o status de todos os merchants:

```sql
SELECT 
  name,
  email,
  subscription_plan,
  CASE 
    WHEN customer_limit IS NULL THEN 'Ilimitado'
    ELSE customer_limit::text
  END as clientes,
  CASE 
    WHEN employee_limit IS NULL THEN 'Ilimitado'
    ELSE employee_limit::text
  END as funcionarios,
  subscription_status
FROM merchants
ORDER BY created_at DESC;
```

---

## ✅ CHECKLIST

Após executar o SQL:

- [ ] SQL executado sem erros no Supabase
- [ ] Verificado que `subscription_plan = 'launch'`
- [ ] Verificado que `customer_limit = NULL`
- [ ] Verificado que `employee_limit = NULL`
- [ ] Logout e login realizados
- [ ] Cache do navegador limpo
- [ ] Página "Minha Assinatura" mostra **R$ 97**
- [ ] Página "Minha Assinatura" mostra **Plano Mensal**
- [ ] Clientes mostram como **Ilimitado**
- [ ] Funcionários mostram como **Ilimitado**

---

## 🚀 PRÓXIMOS PASSOS

Após atualizar o banco de dados:

1. ✅ Página mostrará o plano correto (Plano Mensal - R$ 97)
2. ✅ Limites aparecerão como ilimitados
3. ✅ Todos os recursos estarão disponíveis
4. ✅ Trial de 14 dias funcionará normalmente
5. ✅ Checkout direcionará para o plano de R$ 97

---

## 📚 ARQUIVOS RELACIONADOS

- `update-merchant-plan.sql`: Script SQL pronto para usar
- `UPDATE-MERCHANT-PLAN-TO-LAUNCH.md`: Este guia
- `stripe.js`: Definição do plano "launch"
- `useSubscription.js`: Hook que busca o plano do banco

---

**Status**: ⏳ **AGUARDANDO EXECUÇÃO DO SQL**

Execute o SQL no Supabase e depois:
1. Faça logout
2. Limpe o cache
3. Faça login novamente
4. Verifique a página "Minha Assinatura"

**Tempo estimado**: 2-3 minutos

---

**Data**: 04/01/2026  
**Hora**: 20:15 (Brasília)
