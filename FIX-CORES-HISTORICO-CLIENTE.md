# 🎨 CORREÇÕES: CORES E HISTÓRICO DO CLIENTE

## ✅ O QUE FOI CORRIGIDO:

### 1. **Cores Personalizadas Aplicadas**
- ✅ Dashboard do cliente agora busca as cores do merchant
- ✅ Cores aplicadas dinamicamente (primary, secondary, accent)
- ✅ Busca merchant por `referred_by_merchant_id` do cliente
- ✅ Fallback para merchant da primeira transação se necessário

### 2. **Histórico com Debug Detalhado**
- ✅ Adicionado logging detalhado de entradas e saídas
- ✅ Melhor tratamento de dados faltantes
- ✅ Logs no console para debug

---

## 🚀 COMO APLICAR NO SERVIDOR:

```bash
# 1. Conectar no servidor
ssh root@seu-servidor

# 2. Atualizar código
cd /var/www/cashback/cashback-system
git pull origin main

# 3. Build
npm run build

# 4. Recarregar nginx
sudo systemctl reload nginx
```

---

## 🧪 COMO TESTAR:

### **Teste 1: Verificar Cores**

1. Configure as cores no painel administrativo:
   - Vá em **Configurações White Label**
   - Escolha uma cor primária (ex: azul #3B82F6)
   - Salve

2. Acesse o dashboard de um cliente do estabelecimento:
   - URL: `https://localcashback.com.br/customer/dashboard/TELEFONE`
   - Faça login com a senha

3. **Verifique:**
   - ✅ Header deve estar com a cor escolhida
   - ✅ Botões e elementos devem usar a cor primária

4. **Debug no Console (F12):**
   - Procure por mensagens como:
   - `"Merchant autenticado: ..."`
   - `"Cores aplicadas"`

---

### **Teste 2: Verificar Histórico**

1. Abra o console do navegador (F12)

2. Acesse o dashboard do cliente

3. **Procure pelos logs:**
   ```
   📊 Transações (entradas) encontradas: X
   💰 Resgates (saídas) encontrados: Y
   🔄 Processando transações (entradas): X
     ➕ Entrada: {...}
   🔄 Processando resgates (saídas): Y
     ➖ Saída: {...}
   📋 Total de itens no histórico: X+Y
   ```

4. **Verifique na tela:**
   - ✅ Se houver transações (cashback recebido), devem aparecer em VERDE
   - ✅ Se houver resgates, devem aparecer em LARANJA
   - ✅ Filtros "Todas", "Entradas", "Saídas" devem funcionar

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS:

### **Problema 1: Cores não aplicadas**

**Sintomas:**
- Dashboard do cliente ainda com cores padrão (verde)
- Cores escolhidas não aparecem

**Soluções:**

1. **Verificar se merchant tem cores configuradas:**
```sql
-- Execute no Supabase SQL Editor
SELECT id, name, primary_color, secondary_color, accent_color 
FROM merchants 
WHERE id = 'ID_DO_MERCHANT';
```

2. **Verificar no console se merchant foi carregado:**
   - Abra F12
   - Procure: `"Merchant autenticado: ..."`
   - Se não aparecer, o problema é na busca do merchant

3. **Verificar referred_by_merchant_id do cliente:**
```sql
-- Execute no Supabase SQL Editor
SELECT id, phone, name, referred_by_merchant_id 
FROM customers 
WHERE phone = 'TELEFONE_DO_CLIENTE';
```

Se `referred_by_merchant_id` for NULL:
```sql
-- Corrigir associando ao merchant correto
UPDATE customers 
SET referred_by_merchant_id = 'ID_DO_MERCHANT'
WHERE phone = 'TELEFONE_DO_CLIENTE';
```

---

### **Problema 2: Histórico vazio ou só saídas**

**Sintomas:**
- Histórico mostra "Nenhuma movimentação"
- Ou só mostra resgates (saídas)
- Entradas não aparecem

**Diagnóstico pelo Console:**

1. Abra F12 e veja os logs:
   ```
   📊 Transações (entradas) encontradas: 0  ← PROBLEMA AQUI
   💰 Resgates (saídas) encontrados: 2
   ```

2. Se transações = 0, o problema é no banco de dados

**Soluções:**

1. **Verificar transações do cliente:**
```sql
-- Execute no Supabase SQL Editor
SELECT 
  t.*,
  m.name as merchant_name
FROM transactions t
LEFT JOIN merchants m ON t.merchant_id = m.id
WHERE t.customer_id = (
  SELECT id FROM customers WHERE phone = 'TELEFONE_DO_CLIENTE'
)
AND t.status = 'completed'
ORDER BY t.created_at DESC;
```

2. **Se não houver transações, criar uma de teste:**
```sql
-- Inserir transação de teste
INSERT INTO transactions (
  merchant_id,
  customer_id,
  employee_id,
  transaction_type,
  amount,
  cashback_amount,
  cashback_percentage,
  status
) VALUES (
  'ID_DO_MERCHANT',
  (SELECT id FROM customers WHERE phone = 'TELEFONE_DO_CLIENTE'),
  'ID_DE_ALGUM_EMPLOYEE',
  'cashback',
  100.00,  -- R$ 100 de compra
  5.00,    -- R$ 5 de cashback (5%)
  5.00,
  'completed'
);
```

3. **Atualizar saldo do cliente manualmente (se necessário):**
```sql
UPDATE customers 
SET 
  total_cashback = total_cashback + 5.00,
  available_cashback = available_cashback + 5.00,
  total_spent = total_spent + 100.00,
  last_purchase_at = NOW()
WHERE phone = 'TELEFONE_DO_CLIENTE';
```

---

## 📊 FLUXO ESPERADO:

```
CLIENTE FAZ COMPRA DE R$ 100
    ↓
FUNCIONÁRIO REGISTRA TRANSAÇÃO
    ↓
TRANSACTION CRIADA:
  - amount: 100.00
  - cashback_amount: 5.00 (5%)
  - status: completed
    ↓
TRIGGER AUTOMÁTICO ATUALIZA CUSTOMER:
  - total_spent += 100
  - total_cashback += 5
  - available_cashback += 5
    ↓
DASHBOARD DO CLIENTE MOSTRA:
  ✅ Entrada: +R$ 5,00 (Cashback recebido)
  ✅ Saldo disponível: R$ 5,00
```

---

## 🎯 CHECKLIST DE TESTE COMPLETO:

- [ ] Cores aplicadas no header do dashboard
- [ ] Cores aplicadas nos cards de saldo
- [ ] Cores aplicadas nos botões e elementos
- [ ] Histórico mostra entradas (verde)
- [ ] Histórico mostra saídas (laranja)
- [ ] Filtro "Todas" funciona
- [ ] Filtro "Entradas" funciona
- [ ] Filtro "Saídas" funciona
- [ ] Logs aparecem no console (F12)

---

## 📝 COMANDOS ÚTEIS:

```bash
# Ver logs do build
cd /var/www/cashback/cashback-system
ls -lh dist/index.html

# Ver logs do nginx
sudo tail -f /var/log/nginx/error.log

# Limpar cache do navegador
# Ctrl + Shift + Delete (ou Cmd + Shift + Delete no Mac)
```

---

## 💡 DICA:

Se o histórico continuar vazio após aplicar a correção, o problema é que **não existem transações no banco de dados** para aquele cliente. Use o SQL acima para criar transações de teste!

---

**🎉 Depois de testar, me avise os resultados!**
