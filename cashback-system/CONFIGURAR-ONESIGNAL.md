# 🔔 CONFIGURAR ONESIGNAL - GUIA COMPLETO

## ❌ PROBLEMA IDENTIFICADO

O sistema estava com **erro ao enviar notificações via OneSignal** devido a:

1. **❌ URL do proxy incorreta** - Tentava acessar `https://localcashback.com.br` ao invés do próprio servidor
2. **⚠️ Meta tag depreciada** - Faltava `mobile-web-app-capable`

---

## ✅ CORREÇÕES APLICADAS

### 1. **Proxy URL Corrigida**

**Antes:**
```javascript
const proxyUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://localcashback.com.br'; // ❌ ERRADO!
```

**Depois:**
```javascript
const proxyUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : ''; // ✅ Usa mesma origem (relative URL)
```

**Por quê?**
- Em produção, o proxy roda **no mesmo servidor** que o frontend
- Usar URL completa diferente causava erro de CORS
- URL vazia (`''`) = mesma origem = `/api/onesignal/send-to-all`

---

### 2. **Meta Tag Adicionada**

**Adicionado no `index.html`:**
```html
<meta name="mobile-web-app-capable" content="yes" />
```

Essa tag é necessária para PWAs modernos (substitui a antiga `apple-mobile-web-app-capable`).

---

## 🔧 CONFIGURAÇÃO DO ONESIGNAL

### **1. Criar Conta e App no OneSignal**

1. Acesse: https://onesignal.com
2. Crie uma conta gratuita
3. Crie um novo App:
   - **App Name:** `Local CashBack` (ou nome do seu sistema)
   - **Platform:** Web Push
   - **Site URL:** `https://seudominio.com.br`

---

### **2. Configurar Web Push**

No painel do OneSignal:

#### **Configuration → Web Push:**

1. **Site Name:** Local CashBack
2. **Site URL:** `https://cashback.vipclubesystem.com.br`
3. **Default Icon URL:** `https://seudominio.com.br/icon-192.png`
4. **Auto Resubscribe:** ✅ Enabled

#### **Permission Prompt:**
```
Settings → Prompts → Slide Prompt

Title: "Receba notificações de cashback"
Message: "Fique por dentro de promoções e quando ganhar cashback!"
Allow Button: "Permitir"
Cancel Button: "Agora não"
```

---

### **3. Obter Credenciais**

No painel OneSignal, vá em **Settings → Keys & IDs**:

```
App ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
REST API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **4. Configurar Variáveis de Ambiente**

Crie arquivo `.env` no projeto:

```bash
VITE_ONESIGNAL_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_ONESIGNAL_REST_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** 
- Em produção, defina essas variáveis no seu servidor
- Para Vercel/Netlify: Settings → Environment Variables
- Para VPS: Adicione no `.env` e rebuild

---

### **5. Verificar Integration Proxy**

O proxy server (`integration-proxy.js`) **DEVE ESTAR RODANDO** para enviar notificações.

#### **Verificar se está rodando:**
```bash
pm2 list
# Deve mostrar: integration-proxy | online
```

#### **Se não estiver rodando:**
```bash
cd /var/www/cashback/cashback-system
pm2 start integration-proxy.js
pm2 save
```

#### **Ver logs:**
```bash
pm2 logs integration-proxy
```

---

## 🧪 TESTAR ONESGNAL

### **1. Testar no Console do Browser**

Abra DevTools → Console e execute:

```javascript
// Ver se OneSignal está carregado
console.log('OneSignal:', window.OneSignal);

// Ver se está inicializado
OneSignalDeferred.push(async (OneSignal) => {
  console.log('Initialized:', await OneSignal.User.PushSubscription.optedIn);
});
```

---

### **2. Testar Permissão de Notificações**

Na página de Admin → Notificações:

1. Clique em "Habilitar Notificações Push"
2. Browser deve mostrar prompt de permissão
3. Clique em "Permitir"

**Resultado esperado:**
```
✅ OneSignal inicializado
✅ Permissão concedida
✅ Push Subscription criado
```

---

### **3. Enviar Notificação de Teste**

No Admin → Notificações:

1. Preencha:
   - **Título:** "Teste de Notificação"
   - **Mensagem:** "Se você recebeu isso, está funcionando!"
2. Clique em "Enviar para Todos"

**Resultado esperado:**
```
Console:
📤 Enviando notificação via OneSignal para TODOS os clientes...
📤 Enviando notificação para todos via proxy: {...}
✅ Notificação enviada com sucesso! { recipients: 1, id: "..." }

Browser:
[Notificação aparece com título e mensagem]
```

---

## 🐛 TROUBLESHOOTING

### **Erro: "REST API Key não configurada"**

**Causa:** Variável de ambiente não está definida.

**Solução:**
```bash
# Verifique se existe
echo $VITE_ONESIGNAL_REST_API_KEY

# Se não existir, adicione no .env
VITE_ONESIGNAL_REST_API_KEY=sua_rest_api_key_aqui

# Rebuild
npm run build

# Reiniciar servidor (se necessário)
pm2 restart all
```

---

### **Erro: "Cannot connect to proxy"**

**Causa:** Integration proxy não está rodando.

**Solução:**
```bash
# Ver se está rodando
pm2 list

# Se não estiver
cd /var/www/cashback/cashback-system
pm2 start integration-proxy.js --name integration-proxy

# Ver logs
pm2 logs integration-proxy
```

---

### **Erro: "Notification permission denied"**

**Causa:** Usuário negou permissão ou browser bloqueou.

**Solução:**
1. Limpar permissão do site:
   - Chrome: Settings → Privacy → Site Settings → Notifications
   - Encontrar seu site e remover
2. Recarregar página e pedir permissão novamente

---

### **Erro: "Failed to fetch" ou CORS**

**Causa:** Proxy URL incorreta ou proxy não rodando.

**Solução:**
```javascript
// Verificar URL do proxy no código
const proxyUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : ''; // ← DEVE SER VAZIO em produção

// Testar proxy diretamente
curl http://localhost:3001/health
# Deve retornar: {"status":"ok"}
```

---

### **Notificação não aparece**

**Causa:** Push subscription não criada ou OneSignal não inicializado.

**Solução:**
1. **Verificar se está inscrito:**
```javascript
OneSignalDeferred.push(async (OneSignal) => {
  const optedIn = await OneSignal.User.PushSubscription.optedIn;
  console.log('Opted in:', optedIn);
  
  const token = await OneSignal.User.PushSubscription.token;
  console.log('Token:', token);
});
```

2. **Se não estiver inscrito:**
   - Pedir permissão novamente
   - Verificar se Service Worker está registrado
   - Verificar se site é HTTPS (obrigatório)

---

## 📊 LOGS ÚTEIS

### **Frontend (Browser Console):**
```
📤 Enviando notificação via OneSignal para TODOS os clientes...
📤 Enviando notificação para todos via proxy: {title, message, ...}
✅ Notificação enviada com sucesso! {recipients: X, id: "..."}
```

### **Backend (PM2 Logs):**
```bash
pm2 logs integration-proxy --lines 50
```

Deve mostrar:
```
[OneSignal] Recebeu requisição
[OneSignal] appId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[OneSignal] restApiKey: xxxxxxxxxxxxxxxxxxxxx...
[OneSignal] notification: {title, message, ...}
[OneSignal] Sucesso! Recipients: 1
```

---

## 🎯 CASOS DE USO

### **1. Notificação de Cashback Recebido**

Enviada automaticamente quando cliente escaneia QR Code:

```javascript
// Em CustomerCashback.jsx
notifyCashbackReceived({
  amount: 50.00,
  merchantName: "Pizzaria do João",
  customerPhone: "11999999999"
});
```

**Resultado:**
```
🎉 Cashback Recebido!
Você ganhou R$ 50.00 em Pizzaria do João
```

---

### **2. Notificação de Resgate**

Enviada quando cliente resgata cashback:

```javascript
// Em CustomerRedemption.jsx
notifyRedemptionCompleted({
  amount: 30.00,
  merchantName: "Pizzaria do João",
  customerPhone: "11999999999"
});
```

**Resultado:**
```
💰 Resgate Confirmado!
Você usou R$ 30.00 em Pizzaria do João
```

---

### **3. Notificação Manual (Admin)**

Enviada pelo merchant via dashboard:

```
Título: 🎁 Promoção Especial
Mensagem: Ganhe 20% de cashback extra hoje!
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### OneSignal:
- [ ] Conta criada no OneSignal
- [ ] App configurado (Web Push)
- [ ] App ID obtido
- [ ] REST API Key obtido
- [ ] Site URL configurado
- [ ] Default icon configurado

### Projeto:
- [ ] Variáveis de ambiente definidas (`.env`)
- [ ] Meta tag `mobile-web-app-capable` adicionada
- [ ] Proxy URL corrigida (vazio em produção)
- [ ] Build realizado
- [ ] Deploy feito

### Servidor:
- [ ] Integration proxy rodando (`pm2 list`)
- [ ] Porta 3001 acessível (se localhost)
- [ ] Logs sem erros (`pm2 logs integration-proxy`)

### Teste:
- [ ] Permissão de notificação concedida
- [ ] Push subscription criada
- [ ] Notificação de teste enviada
- [ ] Notificação recebida no browser

---

## 📚 DOCUMENTAÇÃO OFICIAL

- **OneSignal Docs:** https://documentation.onesignal.com/docs/web-push-quickstart
- **OneSignal SDK:** https://github.com/OneSignal/OneSignal-Website-SDK
- **Web Push API:** https://developer.mozilla.org/en-US/docs/Web/API/Push_API

---

**Data:** 07/11/2024  
**Status:** ✅ Corrigido  
**Próximo passo:** Configurar credenciais do OneSignal e testar
