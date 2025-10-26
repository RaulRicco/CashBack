# 🚨 SOLUÇÃO COMPLETA: Erro no Resgate de Cashback

## ❌ Problema Identificado

**Erro**: `Could not find the 'qr_scanned' column of 'redemptions' in the schema cache`

### Causa Raiz
O código estava tentando usar campos que **NÃO EXISTEM** na tabela `redemptions`:
- ❌ `qr_scanned` (não existe)
- ❌ `qr_scanned_at` (não existe)

**Campos que REALMENTE existem:**
- ✅ `id`
- ✅ `merchant_id`
- ✅ `customer_id`
- ✅ `employee_id`
- ✅ `amount`
- ✅ `qr_code_token`
- ✅ `status`
- ✅ `created_at`

---

## ✅ Solução Implementada

### 1️⃣ Correção do Código (JÁ FEITA)
**Arquivo**: `src/pages/CustomerRedemption.jsx`

**ANTES** (❌ Tentava usar campos inexistentes):
```javascript
// Verificar se já foi escaneado
if (redemptionData.qr_scanned) { // ❌ Campo não existe
  // ...
}

// Marcar como escaneado
update({
  qr_scanned: true,           // ❌ Campo não existe
  qr_scanned_at: new Date(),  // ❌ Campo não existe  
  status: 'completed'
})
```

**DEPOIS** (✅ Usa apenas campos que existem):
```javascript
// Verificar se já foi processado
if (redemptionData.status === 'completed') { // ✅ Campo existe
  // ...
}

// Marcar como completado
update({
  status: 'completed'  // ✅ Apenas o status
})
```

### 2️⃣ Criar Trigger para Atualizar Saldo (VOCÊ PRECISA EXECUTAR)

Quando um resgate é completado, o saldo do cliente precisa ser deduzido automaticamente.

---

## 🚀 EXECUTE ESTE SQL NO SUPABASE AGORA:

```sql
-- ============================================
-- Trigger para atualizar saldo quando resgate é completado
-- ============================================

-- Função que atualiza o saldo do cliente após resgate
CREATE OR REPLACE FUNCTION update_customer_redemption()
RETURNS TRIGGER AS $$
BEGIN
  -- Só atualiza se o resgate for completado
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE customers
    SET 
      available_cashback = available_cashback - NEW.amount
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_redemption_trigger ON redemptions;

-- Criar trigger para redemptions
CREATE TRIGGER update_redemption_trigger 
  AFTER INSERT OR UPDATE ON redemptions
  FOR EACH ROW 
  EXECUTE FUNCTION update_customer_redemption();
```

---

## 📋 Passos para Resolver

### Passo 1: Executar SQL (2 minutos)

1. **Acesse**: https://supabase.com/dashboard/project/mtylboaluqswdkgljgsd/sql
2. Clique em **"New query"**
3. **Cole** o SQL acima
4. **Execute** (botão "Run")
5. Aguarde: **"Success. No rows returned"**

### Passo 2: Testar o Resgate (3 minutos)

#### No Sistema (Funcionário):
1. Acesse: https://5173-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
2. Faça login como funcionário
3. Vá em **"Resgate"**
4. Digite telefone: **61992082577**
5. Clique em **"Buscar"**
6. Veja o saldo disponível (deve ser R$ 23,00)
7. Digite valor do resgate: **R$ 5,00**
8. Clique em **"Gerar QR Code de Resgate"**
9. **Copie a URL** do QR Code

#### No Navegador (Cliente):
1. Abra uma **nova aba anônima** (Ctrl+Shift+N)
2. **Cole a URL** do QR Code
3. Aguarde processar
4. Deve aparecer: **"🎊 Resgate Confirmado!"**
5. Valor mostrado: **R$ 5,00**
6. Saldo restante deve ser: **R$ 18,00** (era 23, menos 5)

#### Verificar no Dashboard do Cliente:
1. Abra: https://5173-...sandbox.../customer/61992082577
2. **Saldo Disponível** deve mostrar: **R$ 18,00**
3. **Histórico de Resgates** deve mostrar o resgate de R$ 5,00

---

## 🔍 Como Funciona Agora

### Fluxo Completo de Resgate:

```
1. Funcionário gera QR Code de resgate
   ↓
2. Redemption criada com status='pending'
   ↓
3. Cliente escaneia QR Code
   ↓
4. Sistema atualiza status para 'completed'
   ↓
5. TRIGGER detecta mudança para 'completed'
   ↓
6. TRIGGER deduz valor de available_cashback
   ↓
7. Cliente vê confirmação com novo saldo
```

---

## ✅ Verificação Rápida

Execute esta query no Supabase para ver se funcionou:

```sql
-- Ver saldo atual do cliente
SELECT phone, available_cashback, total_cashback 
FROM customers 
WHERE phone = '61992082577';

-- Ver últimos resgates
SELECT r.created_at, c.phone, r.amount, r.status
FROM redemptions r
JOIN customers c ON c.id = r.customer_id
ORDER BY r.created_at DESC
LIMIT 5;
```

**Resultado esperado:**
- `available_cashback` deve ter diminuído após o resgate
- Resgate deve aparecer com `status = 'completed'`

---

## 🐛 Troubleshooting

### Se o erro persistir:

#### 1. Limpar cache do navegador
```
Ctrl + Shift + Delete → Limpar cache e recarregar
```

#### 2. Verificar se o código foi atualizado
```bash
cd /home/user/webapp/cashback-system
git pull origin main
```

#### 3. Verificar se o trigger foi criado
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'update_redemption_trigger';
```
Deve retornar 1 linha.

#### 4. Testar trigger manualmente
```sql
-- Criar resgate de teste
INSERT INTO redemptions (
  merchant_id,
  customer_id,
  employee_id,
  amount,
  qr_code_token,
  status
) VALUES (
  (SELECT id FROM merchants LIMIT 1),
  (SELECT id FROM customers WHERE phone = '61992082577'),
  (SELECT id FROM employees LIMIT 1),
  1,
  'TEST_REDEMPTION_123',
  'completed'
);

-- Verificar se saldo diminuiu
SELECT available_cashback FROM customers WHERE phone = '61992082577';
```

---

## 📊 Resumo das Correções

| Item | Status | Descrição |
|------|--------|-----------|
| Código corrigido | ✅ FEITO | Removidos campos inexistentes |
| Git commit | ✅ FEITO | Commit 512f847 |
| Git push | ✅ FEITO | Enviado para GitHub |
| Trigger SQL | ⏳ PENDENTE | **VOCÊ PRECISA EXECUTAR** |
| Teste de resgate | ⏳ PENDENTE | Após executar SQL |

---

## 🎯 Próximos Passos

1. **AGORA**: Execute o SQL do trigger no Supabase
2. **Depois**: Teste criar um resgate
3. **Confirme**: Me avise se funcionou ou se há erro

---

**Commit**: `512f847`  
**Branch**: `main`  
**Status**: ✅ Código corrigido | ⏳ SQL pendente de execução  
**Tempo estimado**: 2 minutos para executar SQL + 3 minutos para testar
