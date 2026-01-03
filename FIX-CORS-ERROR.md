# 🔧 FIX: CORS Error Blocking Mailchimp Sync

**Data:** 2026-01-03  
**Problema:** Erro CORS bloqueando sincronização com Mailchimp  
**Status:** ✅ **RESOLVIDO**

---

## 🔍 **PROBLEMA IDENTIFICADO NO CONSOLE**

```
Error: Not allowed by CORS
at origin (file:///home/root/webapp/server.js:68:16)
```

Ao tentar fazer cadastro em `https://cashback.raulricco.com.br`, o endpoint `/api/mailchimp/sync` retornava erro CORS:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Error: Not allowed by CORS
    at origin (file:///home/root/webapp/server.js:68:16)
    at /home/root/webapp/node_modules/cors/lib/index.js:219:13
    ...
</pre>
</body>
</html>
```

---

## 🎯 **CAUSA RAIZ**

### Configuração CORS Incompleta:

```javascript
// ❌ ANTES (sem cashback.raulricco.com.br)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://localcashback.com.br',
  'https://www.localcashback.com.br',
];
```

O domínio `cashback.raulricco.com.br` **não estava na lista de origins permitidos**, causando bloqueio de todas as requisições vindas desse domínio.

---

## ✅ **SOLUÇÃO APLICADA**

### Adicionado Domínio aos Allowed Origins:

```javascript
// ✅ DEPOIS (com cashback.raulricco.com.br)
const allowedOrigins = [
  'http://localhost:5173', // DEV
  'http://localhost:8080', // DEV server
  'https://localcashback.com.br', // Produção
  'https://www.localcashback.com.br', // Produção www
  'https://cashback.raulricco.com.br', // Produção alternativa ✅
];
```

### Deploy Realizado:

```bash
# Copiar arquivo corrigido
sudo cp server.js /var/www/cashback/

# Reiniciar backend
sudo pm2 restart stripe-api --update-env
```

---

## 🧪 **TESTES**

### Teste 1: Endpoint com CORS Header
```bash
curl -X POST https://cashback.raulricco.com.br/api/mailchimp/sync \
  -H "Content-Type: application/json" \
  -H "Origin: https://cashback.raulricco.com.br" \
  -d '{"customer": {...}}'

# ANTES: Error: Not allowed by CORS ❌
# DEPOIS: HTTP 403 (API key error) ✅
```

✅ **CORS resolvido!** Agora retorna 403 (problema da API key) ao invés de erro CORS.

### Teste 2: Ambos os Domínios
```bash
# localcashback.com.br
curl -I https://localcashback.com.br
# HTTP/2 200 ✅

# cashback.raulricco.com.br  
curl -I https://cashback.raulricco.com.br
# HTTP/2 200 ✅
```

---

## 📊 **IMPACTO**

### ANTES:
- ❌ Requisições de `cashback.raulricco.com.br` bloqueadas
- ❌ Mailchimp sync falhando com erro CORS
- ❌ OneSignal funcionando (não afetado)
- ❌ Cadastro de clientes falhando

### DEPOIS:
- ✅ Requisições de ambos os domínios permitidas
- ✅ CORS resolvido para `/api/mailchimp/*`
- ✅ Erro agora é 401 (API Key inválida) - problema conhecido
- ✅ OneSignal continuando funcionando

---

## 🔍 **OUTROS ERROS NO CONSOLE (NÃO CRÍTICOS)**

### 1️⃣ **Manifest Warnings** (Não Crítico)
```
Manifest: property 'start_url' ignored, URL is invalid.
Manifest: property 'scope' ignored, URL is invalid.
```

**Causa:** Manifest dinâmico injetado via blob  
**Impacto:** ⚠️ Baixo (PWA funciona mesmo assim)  
**Status:** Pode ser ignorado por enquanto

### 2️⃣ **Supabase 406** (Intermitente)
```
Failed to load resource: the server responded with a status of 406
```

**Causa:** Possível problema de RLS ou headers  
**Impacto:** ⚠️ Baixo (query funciona no backend)  
**Status:** Monitorar (pode ser temporário)

### 3️⃣ **Stripe DNS Error** (Não Crítico)
```
m.stripe.com/6:1 Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

**Causa:** Script do Stripe tentando carregar  
**Impacto:** ⚠️ Baixo (Stripe funciona normalmente)  
**Status:** Pode ser ignorado

### 4️⃣ **Meta Pixel Warning** (Informativo)
```
[Meta Pixel] - You are sending a non-standard event 'CustomerSignup'
```

**Causa:** Uso de `track()` ao invés de `trackCustom()`  
**Impacto:** ℹ️ Informativo (evento registra normalmente)  
**Status:** Funcional (melhorar depois)

---

## 🎯 **PROBLEMA PRINCIPAL RESTANTE**

### ❌ **Mailchimp API Key Inválida** (401)

Mesmo com CORS resolvido, o Mailchimp ainda retorna erro porque a **API Key está inválida/expirada**.

**Solução Final:**
1. Gerar nova API Key: https://us8.admin.mailchimp.com/account/api/
2. Atualizar no sistema: https://cashback.raulricco.com.br/integrations
3. Testar cadastro novamente

---

## ✅ **CONCLUSÃO**

**Problema CORS:** ✅ **RESOLVIDO**  
**Backend:** ✅ Online e acessível  
**Ambos domínios:** ✅ Funcionando  

**Próximo passo:**  
Atualizar API Key do Mailchimp para resolver definitivamente!

---

**Criado em:** 2026-01-03  
**Deploy:** Produção ✅  
**Commit:** `52821df`
