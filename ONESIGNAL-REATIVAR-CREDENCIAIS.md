# 🔔 OneSignal: Reativar Credenciais (DEV)

## ❌ **PROBLEMA ENCONTRADO**

```
❌ ERRO: Access denied
Status: 403
Resposta: "Access denied. Please include an 'Authorization: ...' header with a valid API key"
```

**Causa:** A REST API Key do OneSignal está **inválida ou expirada**.

---

## ✅ **SOLUÇÃO: OBTER NOVA REST API KEY**

### **1️⃣ Acessar o Painel do OneSignal**

🔗 **Link direto:** https://app.onesignal.com/

**Login:**
- Faça login com a conta do LocalCashback

---

### **2️⃣ Obter as Credenciais Corretas**

#### **App ID (já temos):**
```
e2b2fb1d-4a56-470f-a33a-aeb35e99631d
```

#### **REST API Key (PRECISA SER ATUALIZADA):**

1. No painel OneSignal, acesse: **Settings** → **Keys & IDs**
2. Copie a **REST API Key**
3. Ela deve começar com `os_v2_app_...` ou similar

---

### **3️⃣ Atualizar o `.env` (Backend)**

Abra o arquivo `.env` na **raiz do projeto** (`/home/root/webapp/.env`):

```bash
# OneSignal
VITE_ONESIGNAL_APP_ID=e2b2fb1d-4a56-470f-a33a-aeb35e99631d
VITE_ONESIGNAL_REST_API_KEY=COLE_A_NOVA_CHAVE_AQUI
```

---

### **4️⃣ Reiniciar o Backend**

```bash
cd /home/root/webapp
pm2 restart stripe-api
pm2 logs stripe-api --lines 20
```

---

### **5️⃣ Testar a Conexão**

Após atualizar a chave, rode novamente:

```bash
cd /home/root/webapp
node check-onesignal-status.js
```

**Resultado esperado:**
```
✅ CONEXÃO ONESIGNAL: ATIVA

📊 INFORMAÇÕES DA CONTA:
   Nome do App: LocalCashback
   App ID: e2b2fb1d-4a56-470f-a33a-aeb35e99631d
   Total de Usuários Inscritos: X
   Usuários Alcançáveis: X
   Criado em: 2024-XX-XX
   Última atualização: 2025-XX-XX

✅ OneSignal está PRONTO para enviar notificações!
```

---

## 📊 **VERIFICAÇÃO DE ASSINATURA**

### **Plano Atual do OneSignal**

Acesse: **Settings** → **Subscription**

- **Plano Free:** Até **10.000 inscritos** e notificações **ilimitadas**
- **Plano Paid:** A partir de $9/mês para mais de 10.000 inscritos

**Para desenvolvimento:** O plano **Free** é suficiente! 🎉

---

## 🧪 **PRÓXIMOS PASSOS APÓS REATIVAR**

### **1. Teste de Envio Manual**

Após reativar, vamos testar o envio de uma notificação:

```bash
curl -X POST http://localhost:3001/api/onesignal/notify-signup \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "teste@localcashback.com.br",
    "customerName": "João da Silva"
  }'
```

---

### **2. Testar nos 3 Eventos**

✅ **Cadastro (signup):**
- Cliente se cadastra → Recebe notificação "🎉 Bem-vindo ao LocalCashback!"

✅ **Compra (cashback):**
- Cliente ganha cashback → Recebe notificação "💰 Você ganhou R$ XX em cashback!"

✅ **Resgate (redemption):**
- Cliente resgata → Recebe notificação "✅ Resgate aprovado! R$ XX creditado"

---

## 🔐 **SEGURANÇA**

⚠️ **IMPORTANTE:**
- A **REST API Key** é **SECRETA** (não commitar no Git)
- Já está no `.env` que está no `.gitignore`
- Apenas compartilhe com desenvolvedores autorizados

---

## 📁 **ARQUIVOS RELACIONADOS**

```
/home/root/webapp/
├── .env                           ← Atualizar REST API Key aqui
├── server.js                      ← Função sendWebPushNotification()
├── check-onesignal-status.js      ← Script de verificação
└── ONESIGNAL-REATIVAR-CREDENCIAIS.md ← Este guia
```

---

## 🆘 **PRECISA DE AJUDA?**

Se tiver problemas para obter a chave:

1. Verifique se está logado na conta correta do OneSignal
2. Verifique se o app `e2b2fb1d-4a56-470f-a33a-aeb35e99631d` existe
3. Se necessário, crie um **novo app** no OneSignal e atualize o `APP_ID` também

---

## ✅ **CHECKLIST**

- [ ] Acessar https://app.onesignal.com/
- [ ] Ir em **Settings** → **Keys & IDs**
- [ ] Copiar a **REST API Key**
- [ ] Atualizar `.env` com a nova chave
- [ ] Reiniciar backend: `pm2 restart stripe-api`
- [ ] Testar conexão: `node check-onesignal-status.js`
- [ ] Testar envio manual (curl)
- [ ] Testar nos 3 eventos (cadastro, compra, resgate)

---

**🚀 Após reativar, o OneSignal estará pronto para enviar notificações em DEV!**
