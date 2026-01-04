# 🔧 SQL PARA ATUALIZAR MERCHANTS - PLANO R$ 97

## ⚡ COPIE E COLE NO SUPABASE SQL EDITOR

### 1. Acessar
- https://supabase.com
- Login → Projeto LocalCashback
- SQL Editor → New Query

### 2. Executar este SQL

```sql
-- ========================================
-- ATUALIZAR PLANO LAUNCH: R$ 97/mês
-- Limites: 5.000 clientes / 10 funcionários
-- ========================================

-- Atualizar todos os merchants
UPDATE merchants 
SET 
  subscription_plan = 'launch',
  customer_limit = 5000,
  employee_limit = 10
WHERE subscription_plan IS NULL 
   OR subscription_plan IN ('starter', 'business', 'premium');

-- ========================================
-- VERIFICAR RESULTADO
-- ========================================

SELECT 
  id,
  name,
  email,
  subscription_plan,
  customer_limit,
  employee_limit,
  subscription_status
FROM merchants 
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Resultado Esperado

Após executar, você verá:

```
subscription_plan: 'launch'
customer_limit: 5000
employee_limit: 10
```

---

## 📊 O QUE MUDOU

### ANTES:
```
Plano Business - R$ 297/mês
Clientes: 5 de 10.000
Funcionários: 1 de 5
```

### DEPOIS:
```
Plano Mensal - R$ 97/mês
Clientes: 5 de 5.000
Funcionários: 1 de 10
💬 Renegociação após 5.000 clientes
```

---

## ✅ VERIFICAR

1. Execute o SQL no Supabase
2. Faça **logout** da aplicação
3. Limpe cache: `Ctrl + Shift + R`
4. Faça **login** novamente
5. Acesse: **Assinatura** (menu lateral)

**Deve aparecer:**
- ✅ Plano Mensal - R$ 97/mês
- ✅ Clientes: X de 5.000
- ✅ Funcionários: X de 10

---

## 🎯 LIMITES DO PLANO

| Item | Limite | Ação ao atingir |
|------|--------|-----------------|
| **Clientes** | 5.000 | Renegociar plano |
| **Funcionários** | 10 | Renegociar plano |
| **Preço** | R$ 97/mês | Fixo |
| **Trial** | 14 dias | Grátis |

---

## 📱 BENEFÍCIOS INCLUÍDOS

✅ Até 5.000 clientes  
✅ Até 10 funcionários  
✅ Sistema de Cashback completo  
✅ Portal do Cliente  
✅ QR Code para Resgate  
✅ Dashboard Avançado  
✅ Relatórios CAC/LTV  
✅ Integrações (Mailchimp, RD Station)  
✅ Push Notifications  
✅ Domínio Próprio  
✅ Whitelabel (sua marca)  
✅ Múltiplas lojas/unidades  
✅ Suporte WhatsApp prioritário  
🎁 14 dias de teste GRÁTIS  
💬 Renegociação após 5.000 clientes

---

**Tempo para executar:** 30 segundos  
**Status:** ⏳ Aguardando execução no Supabase

Execute o SQL agora e depois faça logout/login! 🚀
