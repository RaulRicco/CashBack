# 🚀 GUIA DE CONFIGURAÇÃO STRIPE - LocalCashback

## ✅ PASSOS JÁ CONCLUÍDOS

### 1. Banco de Dados ✅
- [x] Campos de assinatura adicionados na tabela `merchants`
- [x] Índices criados para performance
- [x] Banco de dados pronto para receber assinaturas

### 2. Servidor de API ✅
- [x] Arquivo `server.js` criado
- [x] Dependências instaladas (Express, CORS, Stripe)
- [x] Scripts npm configurados

---

## 🎯 PRÓXIMOS PASSOS

### Passo 3: Atualizar arquivo .env (OBRIGATÓRIO)

Você precisa adicionar uma variável adicional no arquivo `.env`:

```bash
# Adicione esta linha no final do arquivo .env:
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI
```

**Onde conseguir o WEBHOOK_SECRET:**
1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em "+ Add endpoint"
3. Configure:
   - **Endpoint URL**: `http://localhost:3001/api/stripe/webhook` (por enquanto)
   - **Events to send**: Selecione estes eventos:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Clique em "Add endpoint"
5. Copie o **Signing secret** (começa com `whsec_`)
6. Cole no arquivo `.env`

---

### Passo 4: Iniciar o Servidor

**Opção 1: Rodar apenas o servidor de API**
```bash
npm run server
```

**Opção 2: Rodar servidor + frontend juntos**
```bash
npm run dev:full
```

O servidor vai iniciar na porta **3001** e você verá:
```
🚀 Servidor Stripe API Iniciado!
📍 URL: http://localhost:3001
✅ Pronto para receber requisições!
```

---

### Passo 5: Testar o Servidor

Abra outro terminal e teste:

```bash
curl http://localhost:3001/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "Servidor Stripe API funcionando!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📋 ENDPOINTS DISPONÍVEIS

### 1. Health Check
```
GET http://localhost:3001/api/health
```

### 2. Criar Sessão de Checkout
```
POST http://localhost:3001/api/stripe/create-checkout-session
Body: {
  "priceId": "price_1SWgeOAev6mInEFV2GiSVeDL",
  "merchantId": "123",
  "merchantEmail": "comerciante@email.com"
}
```

### 3. Criar Portal do Cliente
```
POST http://localhost:3001/api/stripe/create-portal-session
Body: {
  "merchantId": "123"
}
```

### 4. Buscar Status da Assinatura
```
GET http://localhost:3001/api/stripe/subscription-status/123
```

### 5. Webhook Stripe
```
POST http://localhost:3001/api/stripe/webhook
(Stripe envia automaticamente)
```

---

## 🔧 COMO FUNCIONA

### Fluxo de Assinatura:

1. **Cliente escolhe plano** → Frontend envia `priceId` para API
2. **API cria sessão** → Stripe retorna URL de pagamento
3. **Cliente paga** → Stripe redireciona de volta
4. **Webhook notifica** → API atualiza banco de dados
5. **Status atualizado** → Cliente vê plano ativo

### Processamento de Webhook:

```
Stripe Evento → Webhook Verifica Assinatura → Processa Evento → Atualiza DB
```

---

## 🛡️ SEGURANÇA

✅ Chave secreta nunca exposta no frontend
✅ Webhooks verificados com assinatura
✅ CORS configurado apenas para origens permitidas
✅ Validação de dados em todas as requisições

---

## 🧪 TESTE COM CARTÕES STRIPE

Use estes cartões de teste:

- **Sucesso**: `4242 4242 4242 4242`
- **Recusado**: `4000 0000 0000 0002`
- **Autenticação 3D**: `4000 0027 6000 3184`

**Qualquer data futura** para validade
**Qualquer CVV** de 3 dígitos

---

## 📝 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```bash
# Supabase
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_key_aqui

# Stripe (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
VITE_STRIPE_PRICE_STARTER=price_1SWgeOAev6mInEFV2GiSVeDL
VITE_STRIPE_PRICE_BUSINESS=price_1SWgfxAev6mInEFVDS93iRaN
VITE_STRIPE_PRICE_PREMIUM=price_1SWgh0Aev6mInEFVN6oI0g6x
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Cannot find module 'express'"
```bash
npm install express cors dotenv --save
```

### Erro: "Webhook signature verification failed"
- Verifique se `STRIPE_WEBHOOK_SECRET` está correto no `.env`
- Confirme que o webhook está configurado no Stripe Dashboard

### Servidor não inicia
- Verifique se a porta 3001 está disponível
- Confirme que todas as variáveis de ambiente estão configuradas

### Checkout não funciona
- Verifique se o servidor está rodando (`npm run server`)
- Confirme os Price IDs no `.env`
- Teste o endpoint health: `curl http://localhost:3001/api/health`

---

## 📞 PRÓXIMO PASSO

Depois de configurar e testar o servidor, vamos criar as páginas de interface (UI) para:
- Selecionar planos
- Gerenciar assinatura
- Visualizar uso de limites

**Aguardando confirmação para prosseguir! 🚀**
