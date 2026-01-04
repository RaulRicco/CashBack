# 🔒 Correção do Erro SSL (ERR_SSL_PROTOCOL_ERROR)

## ❌ PROBLEMA:

```
ERR_SSL_PROTOCOL_ERROR
Failed to load resource: https://localcashback.com.br:3001/api/...
```

**Causa:** O Node.js server (porta 3001) não está configurado para HTTPS. Tentar acessar diretamente via HTTPS gera erro SSL.

---

## ✅ SOLUÇÃO IMPLEMENTADA:

Usar o **Nginx como proxy reverso** (já estava configurado, só precisava atualizar o `.env`).

### **Antes:**
```bash
VITE_API_URL=https://localcashback.com.br:3001
```
- ❌ Tentava acessar direto a porta 3001 com HTTPS
- ❌ Node.js não tem certificado SSL
- ❌ Erro: `ERR_SSL_PROTOCOL_ERROR`

### **Depois:**
```bash
VITE_API_URL=https://localcashback.com.br
```
- ✅ Acessa via Nginx proxy em `/api/`
- ✅ SSL termina no Nginx
- ✅ Nginx faz proxy para `http://localhost:3001/api/`

---

## 🔧 CONFIGURAÇÃO DO NGINX:

O arquivo `/etc/nginx/sites-available/localcashback` já tinha a configuração correta:

```nginx
server {
    listen 443 ssl http2;
    server_name localcashback.com.br www.localcashback.com.br;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/localcashback.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/localcashback.com.br/privkey.pem;
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    root /var/www/cashback/cashback-system;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🎯 COMO FUNCIONA:

```
1. Cliente faz request:
   https://localcashback.com.br/api/merchants/123/subscription-status
   
2. Nginx recebe (porta 443, HTTPS):
   - Verifica certificado SSL (Let's Encrypt)
   - Match location /api/
   
3. Nginx faz proxy para Node.js:
   http://localhost:3001/api/merchants/123/subscription-status
   (HTTP interno, sem SSL)
   
4. Node.js responde:
   { status: "active", ... }
   
5. Nginx retorna para cliente:
   HTTPS response com SSL
```

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO:

### **1. Testar API diretamente:**
```bash
curl https://localcashback.com.br/api/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "message": "Servidor Stripe API funcionando!",
  "timestamp": "2026-01-04T18:08:07.461Z"
}
```

### **2. Testar no navegador:**
```
https://cashback.raulricco.com.br
```

Fazer login e verificar:
- ✅ Não aparece mais `ERR_SSL_PROTOCOL_ERROR`
- ✅ Banner de trial carrega corretamente
- ✅ Botão "Assinar Agora" funciona
- ✅ Console do navegador sem erros

---

## 📋 ARQUIVO .ENV ATUALIZADO:

```bash
# /home/root/webapp/cashback-system/.env

VITE_SUPABASE_URL=https://zxiehkdtsoeauqouwxvi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# OneSignal
VITE_ONESIGNAL_APP_ID=8e891d9e-5631-4ff7-9955-1f49d3b44ee7
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_...

# Resend Email
VITE_RESEND_API_KEY=re_gqFK8iHM_...
VITE_RESEND_FROM_EMAIL=noreply@localcashback.com.br

# Integration Proxy URL (CORRIGIDO)
VITE_PROXY_URL=https://localcashback.com.br

# API Backend URL (CORRIGIDO)
VITE_API_URL=https://localcashback.com.br

# Stripe Payment Gateway (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...

# Stripe Price IDs
VITE_STRIPE_PRICE_STARTER=price_1SWgeOAev6mInEFV2GiSVeDL
VITE_STRIPE_PRICE_BUSINESS=price_1SWgfxAev6mInEFVDS93iRaN
VITE_STRIPE_PRICE_PREMIUM=price_1SWgh0Aev6mInEFVN6oI0g6x
```

**Alterações:**
- ❌ Removido `:3001` de `VITE_PROXY_URL`
- ❌ Removido `:3001` de `VITE_API_URL`

---

## 🚀 DEPLOY REALIZADO:

```bash
# 1. Atualizar .env
cd /home/root/webapp/cashback-system
nano .env
# Mudar de :3001 para sem porta

# 2. Rebuild
npm run build

# 3. Deploy
cd /home/root/webapp
rsync -av --delete cashback-system/dist/ /var/www/cashback/cashback-system/

# 4. Verificar
curl https://localcashback.com.br/api/health
```

---

## 📊 RESUMO:

| Item | Antes | Depois |
|------|-------|--------|
| **API URL** | `https://...br:3001` | `https://...br` |
| **Método** | Acesso direto porta | Proxy Nginx |
| **SSL** | ❌ Não configurado | ✅ Nginx (Let's Encrypt) |
| **Erro** | `ERR_SSL_PROTOCOL_ERROR` | ✅ Funcionando |

---

## 🎉 RESULTADO FINAL:

✅ **Erro SSL corrigido**  
✅ **API acessível via proxy**  
✅ **SSL termina no Nginx**  
✅ **Node.js usa HTTP interno**  
✅ **Build e deploy concluídos**  
✅ **Sistema funcionando em produção**

---

## 🔗 LINKS DE TESTE:

- **Site:** https://cashback.raulricco.com.br
- **API Health:** https://localcashback.com.br/api/health
- **Assinaturas:** https://cashback.raulricco.com.br/subscription-plans

---

**Data:** 2025-01-04  
**Status:** ✅ Erro SSL corrigido, sistema operacional
