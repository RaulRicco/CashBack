# 🔴 MUDAR PARA LIVE MODE (PRODUÇÃO)

## ⚠️ ATENÇÃO: LIVE MODE = DINHEIRO REAL!

Você está prestes a mudar para **LIVE mode**. Isso significa:
- ✅ Cobranças **REAIS** dos clientes
- ✅ Dinheiro **REAL** na sua conta Stripe
- ❌ Cartões de teste **NÃO funcionam mais**

---

## 📋 CHECKLIST ANTES DE ATIVAR LIVE MODE:

### **1. Obter Chaves de LIVE mode no Stripe:**

1. Acesse: https://dashboard.stripe.com
2. **IMPORTANTE:** Mude para **LIVE mode** (toggle no canto superior direito deve estar AZUL/VERDE, não laranja)
3. Menu lateral → **"Developers"** → **"API keys"**
4. Você verá:

```
┌─────────────────────────────────────────────────────┐
│ Standard keys                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Publishable key                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ pk_live_XXXXX...                      [📋]     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Secret key                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ sk_live_XXXXX...                      [👁️ Reveal]│ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

5. **Copie ambas as chaves:**
   - `pk_live_...` (Publishable key)
   - `sk_live_...` (Secret key - clique em "Reveal" primeiro)

---

## 🔑 FORMATE AS CHAVES ASSIM:

```
pk_live_XXXXX... (comece com pk_live_)
sk_live_XXXXX... (comece com sk_live_)
```

---

## ⚡ DEPOIS DE COPIAR, ME ENVIE:

**Apenas cole aqui:**
```
pk_live_XXXXXXXXXX
sk_live_XXXXXXXXXX
```

**Eu vou:**
1. Atualizar o `.env` com as chaves de LIVE
2. Fazer rebuild
3. Deploy
4. Testar

---

## 🎯 VERIFICAR SE O PRICE EXISTE EM LIVE MODE:

Antes de ativar, vamos confirmar se o Price ID existe:

1. Acesse: https://dashboard.stripe.com/products
2. **Certifique-se que está em LIVE mode** (não laranja)
3. Procure: **"Assinatura LocalCashback - Lançamento"**
4. Verifique se o **Price ID é:** `price_1SluhgAev6mInEFVzGTKjPoV`

**Se o Price NÃO existir em LIVE mode:**
- Você precisa criar um novo price (igual ao de TEST)
- Nome: Assinatura LocalCashback - Lançamento
- Preço: R$ 97,00/mês
- Billing: Monthly

---

## 🔔 CONFIGURAR WEBHOOK EM LIVE MODE:

**IMPORTANTE:** O webhook também precisa estar em LIVE mode!

1. Acesse: https://dashboard.stripe.com/webhooks
2. **Certifique-se que está em LIVE mode**
3. Clique em **"+ Add endpoint"**
4. Preencha:
   ```
   Endpoint URL: https://localcashback.com.br/api/stripe/webhook
   ```
5. Selecione eventos:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Clique **"Add endpoint"**
7. **Copie o Signing Secret:**
   ```
   whsec_XXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## 📝 RESUMO DO QUE PRECISO:

1. **Chave pública de LIVE:** `pk_live_...`
2. **Chave secreta de LIVE:** `sk_live_...`
3. **Webhook secret de LIVE:** `whsec_...` (se ainda não tiver)
4. **Confirmar:** Price `price_1SluhgAev6mInEFVzGTKjPoV` existe em LIVE

---

## ⚠️ DEPOIS DE ATIVAR LIVE MODE:

### **O que VAI funcionar:**
- ✅ Cartões REAIS
- ✅ Cobranças REAIS
- ✅ Dinheiro na conta Stripe

### **O que NÃO VAI funcionar:**
- ❌ Cartão de teste `4242 4242 4242 4242`
- ❌ Outros cartões de teste

---

## 🧪 COMO TESTAR EM LIVE MODE:

**Opção 1: Usar cartão real (recomendado):**
- Use seu próprio cartão
- Valor será cobrado: R$ 97,00/mês
- Você pode cancelar imediatamente depois

**Opção 2: Configurar cupom de 100% desconto:**
- Criar cupom no Stripe: 100% OFF
- Testar checkout sem pagar

---

## 📊 CHECKLIST FINAL:

Antes de eu ativar, confirme:
- [ ] Tenho as chaves `pk_live_...` e `sk_live_...`
- [ ] Webhook configurado em LIVE mode
- [ ] Price `price_1SluhgAev6mInEFVzGTKjPoV` existe em LIVE
- [ ] Entendo que vai cobrar dinheiro REAL
- [ ] Tenho certeza que quero ativar LIVE mode

---

## 🚀 ASSIM QUE VOCÊ ME ENVIAR AS CHAVES:

Eu faço em **5 minutos**:
1. ✏️ Atualizo `.env` com chaves de LIVE
2. 🔨 Rebuild do frontend
3. 📦 Deploy para produção
4. ✅ Sistema ativo em LIVE mode

---

**Aguardando suas chaves de LIVE mode!** 🔐

**Cole aqui:**
```
pk_live_XXXXXXXXXX
sk_live_XXXXXXXXXX
whsec_XXXXXXXXXX (opcional, mas recomendado)
```
