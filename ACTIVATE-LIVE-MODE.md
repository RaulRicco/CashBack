# 🚀 ATIVAR LIVE MODE - GUIA RÁPIDO

## 📝 PASSO 1: OBTER CHAVES DO STRIPE

1. Acesse: https://dashboard.stripe.com
2. **Mude para LIVE mode** (toggle azul/verde)
3. Vá em: **Developers → API keys**
4. Copie:
   - `pk_live_...` (Publishable key)
   - `sk_live_...` (Secret key - clique "Reveal")

---

## ⚡ PASSO 2: EXECUTAR O SCRIPT

```bash
cd /home/root/webapp
./switch-to-live.sh
```

**O script vai perguntar:**
```
Cole sua Publishable Key (pk_live_...):
```
→ Cole e pressione ENTER

```
Cole sua Secret Key (sk_live_...):
```
→ Cole e pressione ENTER

---

## 🎯 O SCRIPT VAI FAZER:

1. ✅ Validar suas chaves
2. ✅ Fazer backup dos .env atuais
3. ✅ Atualizar frontend .env
4. ✅ Atualizar backend .env
5. ✅ Rebuild do frontend
6. ✅ Deploy para produção
7. ✅ Reiniciar servidor PM2

**Tempo:** ~2-3 minutos

---

## ⚠️ IMPORTANTE ANTES DE EXECUTAR:

### **Verificar no Stripe (LIVE mode):**

1. **Price existe?**
   - URL: https://dashboard.stripe.com/products
   - Procure: "Assinatura LocalCashback"
   - Price ID: `price_1SluhgAev6mInEFVzGTKjPoV`
   - Se NÃO existe, crie antes!

2. **Webhook configurado?**
   - URL: https://dashboard.stripe.com/webhooks
   - Endpoint: `https://localcashback.com.br/api/stripe/webhook`
   - Eventos: checkout.session.completed, subscription.*

---

## 🧪 TESTAR DEPOIS:

1. **Limpar cache:**
   ```
   Ctrl + Shift + R
   ```

2. **Acessar:**
   ```
   https://cashback.raulricco.com.br/subscription-plans
   ```

3. **Verificar:**
   - ✅ Preço: R$ 97/mês
   - ✅ Botão funciona
   - ❌ Cartão teste NÃO funciona mais

4. **Testar com cartão REAL:**
   - Use seu cartão
   - Será cobrado R$ 97/mês
   - Pode cancelar depois

---

## 🔍 VERIFICAR SE ATIVOU:

```bash
# Ver chaves atuais
cd /home/root/webapp/cashback-system
grep VITE_STRIPE .env | head -2
```

**Resultado esperado:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  ✅
VITE_STRIPE_SECRET_KEY=sk_live_...       ✅
```

Se começar com `pk_test_` ou `sk_test_`, ainda está em TEST! ❌

---

## 📊 MONITORAR PAGAMENTOS:

- **Dashboard:** https://dashboard.stripe.com/payments
- **Logs servidor:** `pm2 logs stripe-api`
- **Logs Nginx:** `tail -f /var/log/nginx/localcashback-access.log`

---

## 🆘 VOLTAR PARA TEST MODE:

Se quiser reverter para TEST:

```bash
cd /home/root/webapp/cashback-system
cp .env.backup.before_live_XXXXXXXX .env
npm run build
cd /home/root/webapp
rsync -av --delete cashback-system/dist/ /var/www/cashback/cashback-system/
pm2 restart stripe-api
```

---

## ✅ CHECKLIST FINAL:

Antes de executar o script:
- [ ] Estou certo que quero LIVE mode
- [ ] Tenho as chaves pk_live_ e sk_live_
- [ ] Price existe em LIVE mode
- [ ] Webhook configurado em LIVE
- [ ] Entendo que vai cobrar DINHEIRO REAL

**Se todos marcados, execute:**
```bash
cd /home/root/webapp
./switch-to-live.sh
```

---

## 🎉 DEPOIS DE ATIVAR:

✅ Sistema em LIVE mode  
✅ Cobrando dinheiro real  
✅ Cartões reais funcionam  
❌ Cartões teste não funcionam  

**Parabéns! Sistema em produção!** 🚀
