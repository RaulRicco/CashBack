# 🔗 Configuração do Webhook Stripe - Guia Completo

## 📋 O Que É o Webhook?

O webhook do Stripe permite que o servidor receba notificações automáticas quando eventos de pagamento acontecem (assinatura criada, pagamento recebido, cancelamento, etc).

**IMPORTANTE**: Sem o webhook configurado, as assinaturas NÃO serão atualizadas automaticamente no banco de dados!

---

## 🎯 Passo a Passo para Configurar

### 1. Acessar Dashboard do Stripe

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Faça login com sua conta Stripe
3. Certifique-se de estar em **TEST MODE** (canto superior direito)

### 2. Adicionar Novo Endpoint

1. Clique no botão **"+ Add endpoint"**
2. Preencha os campos:

**Endpoint URL:**
```
https://localcashback.com.br/api/stripe/webhook
```

**Description (opcional):**
```
LocalCashback Subscription Webhook
```

### 3. Selecionar Eventos

Na seção "Select events to listen to", selecione estes eventos:

#### ✅ Eventos Obrigatórios:
- `checkout.session.completed` - Quando o checkout é completado
- `customer.subscription.created` - Quando uma assinatura é criada
- `customer.subscription.updated` - Quando uma assinatura é atualizada (upgrade/downgrade)
- `customer.subscription.deleted` - Quando uma assinatura é cancelada
- `invoice.payment_succeeded` - Quando um pagamento é bem-sucedido
- `invoice.payment_failed` - Quando um pagamento falha

#### Atalho Rápido:
Você pode selecionar "Customer" e marcar todos os eventos de `customer.subscription.*` e depois adicionar os de `checkout` e `invoice`.

### 4. Adicionar Endpoint

1. Clique em **"Add endpoint"**
2. O endpoint será criado

### 5. Copiar Webhook Secret

1. Após criar, você verá a página do endpoint
2. Procure por **"Signing secret"** (começa com `whsec_...`)
3. Clique em **"Reveal"** para mostrar o secret
4. Clique no ícone de **copiar** 📋

Exemplo:
```
whsec_1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdef
```

### 6. Adicionar Secret no .env

1. Abra o arquivo `.env` no servidor de produção:
```bash
nano /home/root/webapp/.env
```

2. Adicione esta linha no final do arquivo:
```bash
STRIPE_WEBHOOK_SECRET=whsec_SEU_SECRET_AQUI
```

3. Substitua `whsec_SEU_SECRET_AQUI` pelo secret que você copiou

4. Salve o arquivo:
   - Pressione `Ctrl + O` para salvar
   - Pressione `Enter` para confirmar
   - Pressione `Ctrl + X` para sair

### 7. Reiniciar Servidor

```bash
cd /home/root/webapp
pm2 restart stripe-api
```

### 8. Verificar Logs

```bash
pm2 logs stripe-api --lines 50
```

Você deve ver algo como:
```
🚀 Servidor Stripe API Iniciado!
📍 URL: http://localhost:3001
🔑 Stripe Mode: TEST
✅ Pronto para receber requisições!
```

---

## 🧪 Testar o Webhook

### Teste Automático no Stripe Dashboard

1. Acesse o webhook que você criou
2. Clique na aba **"Testing"**
3. Clique em **"Send test webhook"**
4. Escolha um evento (ex: `checkout.session.completed`)
5. Clique em **"Send test webhook"**

### Ver Resultado nos Logs

```bash
pm2 logs stripe-api --lines 20
```

Você deve ver:
```
📨 Webhook recebido: checkout.session.completed
✅ Checkout completado: cs_test_...
```

### Teste Real com Checkout

1. Acesse: https://localcashback.com.br/dashboard/planos
2. Clique em "Assinar Agora" em qualquer plano
3. Use cartão de teste:
   - Número: `4242 4242 4242 4242`
   - Validade: Qualquer data futura
   - CVV: Qualquer 3 dígitos
4. Complete o pagamento
5. Verifique os logs:
```bash
pm2 logs stripe-api
```

Você deve ver:
```
📨 Webhook recebido: checkout.session.completed
✅ Checkout completado: cs_test_...
✅ Merchant abc123 atualizado - Plano: business
```

---

## 🔍 Verificar Status do Webhook

### No Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique no endpoint
3. Veja a lista de eventos recebidos
4. Status verde ✅ = Sucesso
5. Status vermelho ❌ = Erro (clique para ver detalhes)

### Nos Logs do Servidor

```bash
# Ver logs em tempo real
pm2 logs stripe-api

# Ver últimas 100 linhas
pm2 logs stripe-api --lines 100

# Ver apenas erros
pm2 logs stripe-api --err
```

---

## 🆘 Troubleshooting

### ❌ Erro: "Webhook signature verification failed"

**Causa**: Secret do webhook está incorreto no `.env`

**Solução**:
1. Verifique o secret no Stripe Dashboard
2. Copie o secret correto (começa com `whsec_`)
3. Atualize no `.env`
4. Reinicie: `pm2 restart stripe-api`

### ❌ Erro: "Timeout" ou "Connection refused"

**Causa**: Servidor não está acessível pela internet

**Solução**:
1. Verifique se o servidor está rodando:
```bash
curl http://localhost:3001/api/health
```

2. Verifique se NGINX está fazendo proxy:
```bash
curl https://localcashback.com.br/api/health
```

3. Adicione configuração NGINX se necessário (veja seção abaixo)

### ❌ Erro: "Merchant não encontrado"

**Causa**: metadata.merchant_id não está sendo enviado corretamente

**Solução**:
1. Verifique os logs do webhook
2. Confirme que o frontend está enviando `merchantId` na requisição

---

## 🌐 Configuração NGINX (Se Necessário)

Se o webhook não conseguir acessar `https://localcashback.com.br/api/stripe/webhook`, você precisa configurar o NGINX para fazer proxy.

### Adicionar no NGINX Config

```bash
sudo nano /etc/nginx/sites-available/localcashback
```

Adicione dentro do bloco `server`:

```nginx
# Stripe API Proxy
location /api/stripe/ {
    proxy_pass http://localhost:3001/api/stripe/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeout para webhooks
    proxy_read_timeout 60s;
    proxy_connect_timeout 60s;
}
```

### Testar e Recarregar NGINX

```bash
# Testar configuração
sudo nginx -t

# Recarregar NGINX
sudo systemctl reload nginx

# Testar endpoint
curl https://localcashback.com.br/api/health
```

---

## ✅ Checklist Final

Após configurar tudo, verifique:

- [ ] Webhook criado no Stripe Dashboard
- [ ] URL do webhook: `https://localcashback.com.br/api/stripe/webhook`
- [ ] Eventos selecionados (checkout.*, customer.subscription.*, invoice.*)
- [ ] `STRIPE_WEBHOOK_SECRET` adicionado no `.env`
- [ ] Servidor reiniciado: `pm2 restart stripe-api`
- [ ] Health check funcionando: `curl http://localhost:3001/api/health`
- [ ] NGINX proxy configurado (se necessário)
- [ ] Teste manual enviado do Stripe Dashboard
- [ ] Logs mostrando webhooks recebidos: `pm2 logs stripe-api`

---

## 📞 Suporte

### Ver Status do Servidor
```bash
pm2 status stripe-api
```

### Ver Logs em Tempo Real
```bash
pm2 logs stripe-api
```

### Reiniciar Servidor
```bash
pm2 restart stripe-api
```

### Parar Servidor
```bash
pm2 stop stripe-api
```

---

## 🎯 Produção vs Desenvolvimento

### Ambiente de Teste (TEST MODE)
- Use chaves `pk_test_...` e `sk_test_...`
- Webhook: Pode ser localhost com ngrok/localtunnel
- Cartões de teste funcionam

### Ambiente de Produção (LIVE MODE)
- Use chaves `pk_live_...` e `sk_live_...`
- Webhook: DEVE ser HTTPS público
- Cartões reais são cobrados

**⚠️ IMPORTANTE**: Comece sempre em TEST MODE e só mude para LIVE MODE quando tudo estiver testado!

---

**Status**: ✅ Pronto para configurar  
**Tempo estimado**: 10-15 minutos  
**Dificuldade**: Fácil
