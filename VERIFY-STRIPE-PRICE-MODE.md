# 🔍 VERIFICAR SE O PRICE É DE TEST OU LIVE MODE

## ⚠️ IMPORTANTE: O erro persiste porque o Price ID ainda é de LIVE mode!

Você me passou: `price_1SluhgAev6mInEFVzGTKjPoV`

Mas suas chaves são de **TEST mode**: `sk_test_51RmMzGAev6mInEFV...`

---

## ✅ COMO VERIFICAR NO STRIPE DASHBOARD:

### **Passo 1: Confirmar o modo**

1. Acesse: https://dashboard.stripe.com
2. Verifique o **toggle no canto superior direito**:
   - Se está **LARANJA** e diz "Test mode" → TEST ✅
   - Se está **AZUL/VERDE** → LIVE ❌

### **Passo 2: Ir para Products**

1. Menu lateral → **"Products"**
2. Procure: **"Assinatura LocalCashback - Lançamento"** ou similar
3. Clique no produto

### **Passo 3: Verificar o Price ID**

No produto, você verá:
```
Price ID: price_1SluhgAev6mInEFVzGTKjPoV
```

**Verifique:**
- Este price aparece quando você está em **TEST mode**? ✅
- Ou só aparece quando você muda para **LIVE mode**? ❌

---

## 🎯 CENÁRIOS POSSÍVEIS:

### **Cenário 1: O Price JÁ existe em TEST mode** ✅

Se você consegue ver o price `price_1SluhgAev6mInEFVzGTKjPoV` enquanto está em **TEST mode**, então:

**Solução:** O código já está correto! O problema pode ser cache do servidor.

Execute:
```bash
cd /home/root/webapp
pm2 restart stripe-api
pm2 logs stripe-api --lines 50
```

Teste novamente no navegador.

---

### **Cenário 2: O Price SÓ existe em LIVE mode** ❌

Se o price `price_1SluhgAev6mInEFVzGTKjPoV` **desaparece** quando você muda para TEST mode, então:

**Solução:** Você precisa **criar um novo price no TEST mode**.

#### **Como criar no TEST mode:**

1. **Certifique-se que está em TEST mode** (toggle laranja)
2. Vá em **Products** → **"+ Add product"**
3. Preencha:
   ```
   Name: Assinatura LocalCashback - Lançamento
   Description: Plano de lançamento com todos os recursos
   Price: 97.00 BRL
   Billing: Monthly
   ```
4. Clique **"Save product"**
5. **Copie o novo Price ID** (será diferente!)

Exemplo:
```
price_1AbCdEf123456789  ← NOVO Price ID de TEST
```

6. **Me envie o novo Price ID** para eu atualizar o código

---

## 🧪 TESTE RÁPIDO (via terminal):

Vou criar um script para testar se o price existe:

```bash
# Testar se o price existe em TEST mode
# Substituir sk_test_XXX pela sua chave de teste
curl https://api.stripe.com/v1/prices/price_1SluhgAev6mInEFVzGTKjPoV \
  -u sk_test_XXX:
```

**Se retornar:**
```json
{
  "id": "price_1SluhgAev6mInEFVzGTKjPoV",
  "object": "price",
  "active": true,
  "currency": "brl",
  "unit_amount": 9700,
  ...
}
```
✅ **O price EXISTE em TEST mode!**

**Se retornar:**
```json
{
  "error": {
    "message": "No such price: 'price_1SluhgAev6mInEFVzGTKjPoV'; a similar object exists in live mode..."
  }
}
```
❌ **O price NÃO existe em TEST mode!**

---

## 📊 RESUMO VISUAL:

```
┌─────────────────────────────────────────────────────────┐
│  STRIPE DASHBOARD                                       │
│                                                         │
│  [●] Test mode    [ ] Live mode     ← Verifique isso!  │
│                                                         │
│  Products                                               │
│  ├─ Assinatura LocalCashback - Lançamento             │
│  │   Price ID: price_1SluhgAev6mInEFVzGTKjPoV         │
│  │                                                      │
│  │   Se você VÊ este price quando está em TEST mode:  │
│  │   ✅ O price já existe em TEST                     │
│  │                                                      │
│  │   Se você NÃO VÊ este price em TEST mode:          │
│  │   ❌ Precisa criar um novo price                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 SE PRECISAR CRIAR NOVO PRICE:

**Template para criar:**
```
Nome: Assinatura LocalCashback - Lançamento
Preço: R$ 97,00
Frequência: Mensal
Moeda: BRL
Trial: 14 dias (configurar depois via código)
```

**Depois me envie:**
- O novo Price ID de TEST mode
- Screenshot confirmando que está em TEST mode

---

## 🎯 PRÓXIMOS PASSOS:

1. **Verifique** se o price existe em TEST mode (Dashboard)
2. **Se SIM**: Reinicie o servidor (`pm2 restart stripe-api`)
3. **Se NÃO**: Crie novo price e me envie o ID
4. Eu atualizo o código e faço deploy

---

**Aguardando sua confirmação:** O price `price_1SluhgAev6mInEFVzGTKjPoV` aparece em TEST mode? 🤔
