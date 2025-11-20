# 🔍 **DIAGNÓSTICO COMPLETO - SISTEMA DE EMAIL RESEND**

## 🚨 **PROBLEMA CRÍTICO ENCONTRADO**

### **Linha 15 do .env:**
```bash
VITE_RESEND_API_KEY=
```

**❌ A API KEY DO RESEND ESTÁ VAZIA!**

---

## 📋 **ANÁLISE COMPLETA**

### **1. Configuração Atual (.env)**

```bash
# ❌ PROBLEMA - API Key vazia
VITE_RESEND_API_KEY=

# ✅ OK
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_RESEND_FROM_NAME=Local CashBack
```

### **2. O que acontece quando API key está vazia:**

- `resend.js` linha 16-18 lança erro: **"RESEND_API_KEY não configurada"**
- Nenhum email é enviado
- Sistema de verificação não funciona
- Recuperação de senha não funciona

---

## ✅ **SOLUÇÃO**

### **OPÇÃO 1: Usar API Key que você tinha antes**

Você mencionou que tinha esta key:
```
re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
```

### **OPÇÃO 2: Gerar nova API Key no Resend**

1. Acesse: https://resend.com/api-keys
2. Login com sua conta
3. Crie nova API Key
4. Copie a key

---

## 🔧 **COMANDO PARA CORRIGIR**

### **No servidor:**

```bash
cd /var/www/cashback

# Editar .env
nano .env

# Encontrar esta linha:
VITE_RESEND_API_KEY=

# Substituir por (cole SUA key):
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF

# Salvar: Ctrl+O, Enter, Ctrl+X
```

### **Ou comando automático:**

```bash
cd /var/www/cashback

# Substituir automaticamente (USE SUA KEY)
sed -i 's/^VITE_RESEND_API_KEY=$/VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF/' .env

# Verificar
grep RESEND_API_KEY .env
```

---

## 🧪 **CRIAR SCRIPT DE TESTE**

Depois de adicionar a API key, teste com este script:

```bash
cd /var/www/cashback/cashback-system

cat > test_resend.js << 'ENDTEST'
// Script de teste do Resend
const RESEND_API_KEY = 'COLE_SUA_KEY_AQUI';

async function testResend() {
  console.log('🧪 Testando Resend API...\n');
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Local CashBack <onboarding@resend.dev>',
      to: ['SEU_EMAIL_AQUI@gmail.com'],
      subject: 'Teste Resend',
      html: '<h1>Email de teste funcionando!</h1>',
    }),
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ SUCESSO!');
    console.log('Email ID:', data.id);
  } else {
    console.log('❌ ERRO:');
    console.log(data);
  }
}

testResend();
ENDTEST

# Editar o arquivo para adicionar sua key e email
nano test_resend.js

# Executar teste
node test_resend.js
```

---

## 📊 **LIMITAÇÕES SEM DOMÍNIO PRÓPRIO**

### **Com `onboarding@resend.dev` (sem domínio):**

✅ **PODE:**
- Enviar até 100 emails/dia
- Enviar até 3.000 emails/mês
- Testar completamente o sistema
- Enviar para qualquer email

❌ **NÃO PODE:**
- Personalizar remetente (`from`)
- Garantir entrega na caixa de entrada (pode ir para spam)
- Usar em produção de longo prazo

### **Com domínio próprio configurado:**

✅ **PODE:**
- Enviar emails ilimitados (plano free: 3k/mês, pro: ilimitado)
- Remetente personalizado: `noreply@seudominio.com`
- Melhor reputação e entrega
- DNS configurado (SPF, DKIM, DMARC)

---

## 🔐 **CONFIGURAR DOMÍNIO NO RESEND (OPCIONAL)**

### **1. Adicionar domínio:**
- Acesse: https://resend.com/domains
- Clique em "Add Domain"
- Digite seu domínio: `seudominio.com`

### **2. Configurar DNS:**

Adicionar estes registros no seu provedor de domínio:

```
Tipo: TXT
Nome: @
Valor: [Resend fornecerá]

Tipo: TXT  
Nome: resend._domainkey
Valor: [Resend fornecerá]

Tipo: MX
Nome: @
Prioridade: 10
Valor: [Resend fornecerá]
```

### **3. Verificar:**
- Aguardar propagação DNS (até 48h, geralmente < 1h)
- Resend verificará automaticamente
- Status mudará para "Verified"

### **4. Atualizar .env:**
```bash
VITE_RESEND_FROM_EMAIL=noreply@seudominio.com
VITE_RESEND_FROM_NAME=Local CashBack
```

---

## 🎯 **CHECKLIST DE VERIFICAÇÃO**

### **Backend (Servidor):**
- [ ] `.env` no servidor tem `VITE_RESEND_API_KEY` preenchida
- [ ] API key é válida (testar com `test_resend.js`)
- [ ] `resend.js` está correto
- [ ] `emailVerification.js` foi criado
- [ ] Tabela `email_verifications` criada no Supabase

### **Frontend (Build):**
- [ ] `EmailVerification.jsx` criado
- [ ] `Signup.jsx` chama `sendVerificationCode()`
- [ ] `authStore.js` verifica `email_verified`
- [ ] Rota `/verify-email` adicionada em `App.jsx`
- [ ] Build gerado com sucesso

### **Supabase:**
- [ ] Tabela `email_verifications` existe
- [ ] Campo `email_verified` adicionado em `employees`
- [ ] RLS policies configuradas
- [ ] Índices criados

### **Teste End-to-End:**
- [ ] Criar conta → Email enviado
- [ ] Abrir email → Código visível
- [ ] Verificar código → Sucesso
- [ ] Login sem verificar → Erro
- [ ] Login após verificar → Sucesso

---

## 🚀 **ORDEM DE EXECUÇÃO (REVISADA)**

### **1. Corrigir API Key (URGENTE):**
```bash
cd /var/www/cashback
nano .env
# Adicionar: VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
```

### **2. Testar Resend:**
```bash
cd /var/www/cashback/cashback-system
node test_resend.js
```

### **3. Rebuild (API key é lida no build):**
```bash
cd /var/www/cashback/cashback-system
rm -rf dist node_modules/.vite
npm run build
sudo systemctl reload nginx
pm2 restart integration-proxy
```

### **4. Testar sistema:**
- Criar conta
- Verificar se email foi enviado
- Verificar código
- Fazer login

---

## 📞 **TROUBLESHOOTING**

### **Erro: "RESEND_API_KEY não configurada"**
- Verificar se `.env` tem a key
- Rebuild após adicionar key
- Verificar se `.env` está na raiz correta

### **Erro: "Authentication failed"**
- API key inválida ou expirada
- Gerar nova key no Resend
- Verificar se copiou corretamente

### **Email não chega:**
- Verificar spam/lixo eletrônico
- Testar com `test_resend.js` primeiro
- Verificar logs do Resend: https://resend.com/emails
- Limite de 100 emails/dia atingido?

### **Email vai para spam:**
- Normal sem domínio próprio
- Configurar domínio no Resend
- Configurar SPF/DKIM/DMARC

---

## 📧 **FLUXO CORRETO DE EMAIL**

```
1. Usuário cria conta
   ↓
2. Signup.jsx chama sendVerificationCode()
   ↓
3. emailVerification.js:
   - Gera código de 6 dígitos
   - Salva no Supabase (email_verifications)
   - Chama sendEmailVerification()
   ↓
4. resend.js:
   - Verifica RESEND_API_KEY ← PROBLEMA ESTAVA AQUI
   - Faz POST para api.resend.com/emails
   - Resend envia email
   ↓
5. Usuário recebe email
   ↓
6. Usuário clica no link OU copia código
   ↓
7. EmailVerification.jsx valida código
   ↓
8. emailVerification.js:
   - Verifica código no Supabase
   - Marca email_verified = true
   ↓
9. Usuário pode fazer login
```

---

## 🎨 **TEMPLATE DO EMAIL**

O email que o usuário recebe tem:
- ✉️ Header verde com logo
- 🔢 Código de 6 dígitos em destaque
- 🔘 Botão "Verificar Email"
- ⏰ Aviso de expiração (24h)
- 📱 Responsivo

---

## 💡 **DICA IMPORTANTE**

**Variáveis de ambiente Vite:**
- São lidas APENAS durante o `npm run build`
- Mudar `.env` sem rebuild → não funciona
- Sempre fazer rebuild após mudar `.env`

---

**RESUMO: Adicione a API key no .env e faça rebuild!** 🚀
