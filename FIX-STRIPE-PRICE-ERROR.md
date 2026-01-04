# 🔧 CORRIGIR ERRO DO STRIPE PRICE ID

## ❌ ERRO ATUAL:

```
No such price: 'price_1SluhgAev6mInEFVzGTKjPoV'; 
a similar object exists in live mode, but a test mode key was used to make this request.
```

---

## 🎯 CAUSA:

Você está usando:
- **Chave de TEST mode**: `sk_test_51RmMzGAev6mInEFV...`
- **Price ID de LIVE mode**: `price_1SluhgAev6mInEFVzGTKjPoV`

**Stripe TEST e LIVE mode são ambientes separados!**

---

## ✅ SOLUÇÃO: CRIAR PRICE NO TEST MODE

### **Passo 1: Acessar Stripe Dashboard**

1. Acesse: https://dashboard.stripe.com/test
2. Certifique-se que está em **"Test mode"** (toggle no canto superior direito)

### **Passo 2: Criar Produto**

1. No menu lateral, clique em **"Products"**
2. Clique em **"+ Add product"**
3. Preencha:
   - **Name**: `Assinatura LocalCashback - Lançamento`
   - **Description**: `Plano de lançamento com todos os recursos`
   - **Pricing model**: `Standard pricing`

### **Passo 3: Configurar Preço**

1. **Price**: `97.00`
2. **Billing period**: `Monthly`
3. **Currency**: `BRL` (Real brasileiro)
4. Clique em **"Save product"**

### **Passo 4: Copiar o Price ID**

Após criar, você verá o **Price ID de TEST**:
```
price_1XXXXXXXXXXXXXXXXX  (começa com price_1)
```

**IMPORTANTE:** Este é o Price ID de **TEST mode** que você deve usar!

### **Passo 5: Atualizar o código**

Edite o arquivo de assinatura:

```bash
cd /home/root/webapp/cashback-system/src/pages
nano SubscriptionPlans.jsx
```

Mude a linha:
```javascript
// ANTES (LIVE mode - NÃO FUNCIONA)
priceId: 'price_1SluhgAev6mInEFVzGTKjPoV',

// DEPOIS (TEST mode - FUNCIONA)
priceId: 'price_1XXXXXXXXXXXXXXXXX',  // Cole o ID que você copiou
```

### **Passo 6: Rebuild e Deploy**

```bash
cd /home/root/webapp/cashback-system
npm run build

cd /home/root/webapp
rsync -av --delete cashback-system/dist/ /var/www/cashback/cashback-system/
```

---

## 🔧 CORREÇÃO DO ENDPOINT 404

O endpoint `/api/merchants/:id/subscription-status` não estava funcionando porque o servidor precisava ser reiniciado.

**JÁ CORRIGIDO:**
```bash
pm2 restart stripe-api
```

Teste agora:
```bash
curl https://localcashback.com.br/api/merchants/d1de704a-2b5b-4b5d-a675-a413c965f16c/subscription-status
```

**Resultado esperado:**
```json
{
  "status":"trial",
  "trialStartDate":null,
  "trialEndDate":null,
  "trialDaysRemaining":null,
  "nextBillingDate":null
}
```

✅ **Funcionando!**

---

## 🎯 ALTERNATIVA: USAR LIVE MODE (NÃO RECOMENDADO)

Se você quiser usar o price de LIVE mode que já existe:

### **Opção A: Mudar para chaves de LIVE mode**

Edite `/home/root/webapp/cashback-system/.env`:

```bash
# LIVE Mode (pagamentos reais!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXX
VITE_STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXX
```

**⚠️ ATENÇÃO:**
- Isso vai cobrar **DINHEIRO REAL** dos clientes!
- Apenas faça isso quando estiver 100% pronto para produção
- Configure webhook em LIVE mode também

---

## 📋 DIFERENÇA ENTRE TEST E LIVE MODE

| Item | TEST Mode | LIVE Mode |
|------|-----------|-----------|
| **Chaves** | `sk_test_...` | `sk_live_...` |
| **Price IDs** | `price_1XXX...` (test) | `price_1XXX...` (live) |
| **Pagamentos** | Cartões de teste | Cartões reais |
| **Dinheiro** | Fictício | Real |
| **Webhook** | URL de teste | URL de produção |
| **Uso** | Desenvolvimento | Produção |

---

## 🧪 CARTÕES DE TESTE (TEST MODE)

Quando estiver em TEST mode, use estes cartões:

| Tipo | Número | CVC | Data |
|------|--------|-----|------|
| **Sucesso** | `4242 4242 4242 4242` | Qualquer | Futuro |
| **Recusado** | `4000 0000 0000 0002` | Qualquer | Futuro |
| **3D Secure** | `4000 0025 0000 3155` | Qualquer | Futuro |

---

## ✅ RESUMO DA SOLUÇÃO:

1. ✅ **Servidor reiniciado** - Endpoint 404 corrigido
2. ⏳ **Criar Price no TEST mode do Stripe**
3. ⏳ **Copiar novo Price ID**
4. ⏳ **Atualizar SubscriptionPlans.jsx**
5. ⏳ **Rebuild e deploy**

---

## 🔗 LINKS ÚTEIS:

- **Stripe Test Dashboard**: https://dashboard.stripe.com/test
- **Criar Produto**: https://dashboard.stripe.com/test/products
- **Documentação**: https://stripe.com/docs/testing

---

**Próximo passo:** Criar o price no Stripe TEST mode e me enviar o novo Price ID! 🚀
