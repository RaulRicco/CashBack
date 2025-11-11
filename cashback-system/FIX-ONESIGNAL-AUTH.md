# 🔧 FIX: OneSignal REST API v2 Authentication

## ❌ PROBLEMA IDENTIFICADO

Erro ao enviar notificações:
```
❌ Access denied. Please include an 'Authorization: ...' header with a valid API key
```

### **Causa Raiz:**

A **REST API Key v2** do OneSignal (que começa com `os_v2_`) usa um **formato de autenticação diferente** da versão antiga.

---

## 🔄 DIFERENÇA ENTRE V1 E V2

### **REST API Key v1 (Antiga):**
```
Formato: String de 48 caracteres (sem prefixo)
Exemplo: NzAwYjM1NTQtZjQ5My00MTA0LWI0YjAtY2FlODc3ZjRjYzM1

Authorization Header:
Authorization: Basic NzAwYjM1NTQtZjQ5My00MTA0LWI0YjAtY2FlODc3ZjRjYzM1
```

### **REST API Key v2 (Nova):**
```
Formato: Começa com 'os_v2_app_' seguido de string longa
Exemplo: os_v2_app_4kzpwhkkkzdq7iz2v2zv5glddvok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici

Authorization Header:
Authorization: Key os_v2_app_4kzpwhkkkzdq7iz2v2zv5glddvok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici
```

**Diferença crítica:**
- v1: `Authorization: Basic <key>`
- v2: `Authorization: Key <key>` ← **KEY, não BASIC!**

---

## ✅ CORREÇÃO APLICADA

### **integration-proxy.js**

**Antes (ERRADO):**
```javascript
{
  headers: {
    'Authorization': `Basic ${restApiKey}` // ❌ Sempre usava "Basic"
  }
}
```

**Depois (CORRETO):**
```javascript
// Detectar formato da chave automaticamente
const authHeader = restApiKey.startsWith('os_v2_') 
  ? `Key ${restApiKey}`    // ✅ v2: usa "Key"
  : `Basic ${restApiKey}`;  // ✅ v1: usa "Basic"

{
  headers: {
    'Authorization': authHeader
  }
}
```

---

## 🧪 COMO TESTAR

### **1. Ver logs no proxy server:**

```bash
pm2 logs integration-proxy --lines 100
```

**Deve mostrar:**
```
[OneSignal] Auth header format: Key os_v2_app_4kzp...
[OneSignal] Sucesso! Recipients: X
```

### **2. Testar no browser:**

1. Acesse Admin → Notificações
2. Preencha título e mensagem
3. Clique em "Enviar para Todos"

**Console deve mostrar:**
```
📤 Enviando notificação para todos via proxy: {...}
✅ Notificação enviada com sucesso! {recipients: X, id: "..."}
```

### **3. Verificar se notificação chegou:**

A notificação deve aparecer no browser!

---

## 📚 DOCUMENTAÇÃO OFICIAL

### **OneSignal REST API v2:**
https://documentation.onesignal.com/reference/create-notification

**Exemplo de curl:**
```bash
curl --request POST \
  --url https://onesignal.com/api/v1/notifications \
  --header 'Authorization: Key os_v2_app_XXXXXXXXX' \
  --header 'Content-Type: application/json' \
  --data '{
    "app_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "included_segments": ["All"],
    "headings": {"en": "Test"},
    "contents": {"en": "Hello World"}
  }'
```

**Note:** `Authorization: Key` não `Authorization: Basic`

---

## 🔍 COMO IDENTIFICAR SUA VERSÃO

### **Método 1: Ver a chave no OneSignal Dashboard**

1. Acesse: https://dashboard.onesignal.com
2. Settings → Keys & IDs
3. Veja **REST API Key**:
   - Se começa com `os_v2_` → **v2** ✅
   - Se não tem prefixo → **v1** (antiga)

### **Método 2: Ver no arquivo .env**

```bash
cat /var/www/cashback/cashback-system/.env | grep ONESIGNAL_REST_API_KEY
```

**Se mostrar:**
```bash
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_...
```
→ Está usando **v2** (código agora suporta!)

---

## 🚨 TROUBLESHOOTING

### **Erro persiste: "Access denied"**

**Possíveis causas:**

1. **REST API Key errada:**
   ```bash
   # Verificar no .env
   cat .env | grep ONESIGNAL_REST_API_KEY
   
   # Comparar com OneSignal Dashboard
   # Settings → Keys & IDs → REST API Key
   ```

2. **Chave não foi recompilada no build:**
   ```bash
   cd /var/www/cashback/cashback-system
   npm run build
   pm2 restart all
   ```

3. **Proxy server não foi reiniciado:**
   ```bash
   pm2 restart integration-proxy
   pm2 logs integration-proxy --lines 20
   ```

---

### **Erro: "restApiKey is undefined"**

**Causa:** Variável de ambiente não carregada.

**Solução:**
```bash
# 1. Verificar se existe no .env
cat /var/www/cashback/cashback-system/.env

# 2. Se não existir, adicionar:
echo "VITE_ONESIGNAL_REST_API_KEY=os_v2_app_..." >> .env

# 3. Rebuild
npm run build

# 4. Reiniciar
pm2 restart all
```

---

### **Erro: "Invalid format"**

**Causa:** Chave corrompida ou com espaços.

**Solução:**
```bash
# Remover espaços e line breaks
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_4kzpwhkkkzdq7iz2v2zv5glddvok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici
# (tudo em uma linha, sem espaços)
```

---

## 📊 LOGS ÚTEIS

### **Frontend (Browser Console):**
```javascript
// Ver se REST API Key está carregada
console.log('REST API Key:', import.meta.env.VITE_ONESIGNAL_REST_API_KEY?.substring(0, 20));

// Resultado esperado:
// REST API Key: os_v2_app_4kzpwhkkk
```

### **Backend (PM2 Logs):**
```bash
pm2 logs integration-proxy --lines 50
```

**Buscar por:**
```
[OneSignal] Auth header format: Key os_v2_app_... ✅
[OneSignal] Sucesso! Recipients: 1 ✅
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de testar, confirme:

- [ ] REST API Key v2 está no `.env` (começa com `os_v2_`)
- [ ] Build foi executado (`npm run build`)
- [ ] Integration proxy foi reiniciado (`pm2 restart integration-proxy`)
- [ ] Proxy está online (`pm2 list` mostra `online`)
- [ ] Logs não mostram erros (`pm2 logs integration-proxy`)
- [ ] Browser console não mostra "REST API Key não configurada"

---

## 🎯 TESTE RÁPIDO

```bash
# 1. Ver se proxy está rodando
pm2 list

# 2. Ver logs em tempo real
pm2 logs integration-proxy

# 3. Em outro terminal, testar envio via curl:
curl -X POST http://localhost:3001/api/onesignal/send-to-all \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "e2b2fb1d-4a56-470f-a33a-aeb35e99631d",
    "restApiKey": "os_v2_app_4kzpwhkkkzdq7iz2v2zv5glddvok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici",
    "notification": {
      "title": "Teste",
      "message": "Hello World"
    }
  }'

# Resultado esperado:
# {"success":true,"recipients":1,"id":"..."}
```

---

## 📈 PRÓXIMAS VERSÕES

Se o OneSignal lançar v3 da API:

1. Verificar novo formato de autenticação
2. Atualizar função `authHeader` no `integration-proxy.js`
3. Adicionar detecção para `os_v3_` se necessário

**Código atual já suporta:**
- ✅ REST API Key v1 (sem prefixo)
- ✅ REST API Key v2 (prefixo `os_v2_`)

---

**Data:** 07/11/2024  
**Status:** ✅ Corrigido  
**Versão suportada:** OneSignal REST API v1 e v2
