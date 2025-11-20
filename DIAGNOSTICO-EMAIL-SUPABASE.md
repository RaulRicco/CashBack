# 🔍 Diagnóstico - Emails do Supabase Não Chegam

## ❓ Qual email você está tentando receber?

Primeiro, preciso saber qual fluxo você está testando:

- [ ] **A) Confirm Sign Up** - Cadastro de novo usuário
- [ ] **B) Reset Password** - Recuperação de senha  
- [ ] **C) Magic Link** - Login sem senha
- [ ] **D) Invite User** - Convite
- [ ] **E) Change Email** - Alteração de email
- [ ] **F) Reauthentication** - Confirmar identidade

---

## 🚨 PROBLEMA COMUM: Supabase usa servidor próprio de email

### **⚠️ ATENÇÃO:**

O Supabase tem **limitações no plano gratuito** para envio de emails:

- ✅ **Desenvolvimento:** Emails funcionam
- ❌ **Produção:** Limite de 4 emails/hora (muito baixo!)
- ⚠️ **Pode estar bloqueado** por spam filters

---

## 🔧 SOLUÇÕES:

### **SOLUÇÃO 1: Verificar Logs do Supabase** ⭐ (FAÇA PRIMEIRO)

1. Acesse: https://supabase.com
2. Selecione seu projeto
3. Vá em **Logs** (menu lateral)
4. Filtre por **Authentication**
5. Procure por erros como:
   - "Email delivery failed"
   - "Rate limit exceeded"
   - "Invalid email configuration"

**Viu algum erro?** Me mostre e eu ajudo!

---

### **SOLUÇÃO 2: Verificar Configuração de Email**

1. Vá em **Authentication** → **Email Templates**
2. Role até o final da página
3. Clique em **Settings**
4. Verifique:

```
SMTP Settings:
  Host: smtp.supabase.net (padrão)
  Port: 587
  Username: (seu projeto)
  
Rate Limits:
  ⚠️ Free tier: 4 emails/hora
  💰 Pro tier: Ilimitado
```

---

### **SOLUÇÃO 3: Testar Email Manualmente**

Execute este teste no Supabase SQL Editor:

```sql
-- Verificar se há tentativas de envio de email
SELECT 
  created_at,
  email,
  email_confirmed_at,
  confirmation_sent_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

**Perguntas:**
- `email_confirmed_at` está NULL? ✅ Normal (não confirmou ainda)
- `confirmation_sent_at` está NULL? ❌ Email não foi enviado!
- `confirmation_sent_at` tem data? ✅ Email foi enviado

---

### **SOLUÇÃO 4: Usar SMTP Personalizado (Resend)** ⭐ RECOMENDADO

Como você já tem **Resend configurado**, vamos usar ele para emails do Supabase!

#### **Vantagens:**
- ✅ 100 emails/dia (grátis)
- ✅ 3.000 emails/mês (grátis)
- ✅ Emails chegam na caixa de entrada
- ✅ Dashboard com estatísticas

#### **Como Configurar:**

1. **Pegar API Key do Resend:**
   - Você já tem: `re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF`

2. **Configurar SMTP no Supabase:**
   - Acesse: Authentication → Settings
   - Role até "SMTP Settings"
   - Clique em "Enable Custom SMTP"

3. **Configurações do Resend:**

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
Sender Email: onboarding@resend.dev
Sender Name: Local CashBack
```

4. **Salvar e Testar**

---

### **SOLUÇÃO 5: Verificar Spam/Lixeira**

Às vezes o email chega mas vai para spam:

1. **Gmail:**
   - Verifique pasta "Spam"
   - Verifique pasta "Promoções"
   - Verifique "Todas as mensagens"

2. **Outlook/Hotmail:**
   - Verifique "Lixo Eletrônico"
   - Verifique "Outras" (ou "Other")

3. **Outros:**
   - Aguarde até 5 minutos
   - Email pode demorar

---

### **SOLUÇÃO 6: Desabilitar Confirmação por Email (Temporário)**

Se precisar testar urgente, desabilite a confirmação:

1. Acesse: **Authentication** → **Settings**
2. Procure por "Enable email confirmations"
3. **Desmarque** essa opção
4. Salvar

**⚠️ ATENÇÃO:** Isso permite que qualquer um se cadastre sem confirmar email!
**Apenas para testes!**

---

## 🧪 TESTE COMPLETO:

### **Passo 1: Verificar se Supabase está enviando**

```sql
-- Execute no Supabase SQL Editor
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token
FROM auth.users
WHERE email = 'SEU_EMAIL_AQUI'
ORDER BY created_at DESC;
```

**Resultado esperado:**
- `confirmation_sent_at` deve ter uma data
- `confirmation_token` deve ter um valor
- `email_confirmed_at` deve ser NULL

### **Passo 2: Verificar Logs**

1. Vá em **Logs**
2. Filtre por "auth"
3. Procure por seu email
4. Veja se há erros

### **Passo 3: Testar com outro email**

Tente com:
- Gmail
- Outlook
- Email profissional

Se funcionar com um mas não com outro = problema de spam filter

---

## 🆘 SOLUÇÃO RÁPIDA (5 minutos):

### **Use Resend como SMTP do Supabase:**

```
1. Supabase → Authentication → Settings
2. Role até "SMTP Settings"
3. Enable Custom SMTP: ✅
4. Preencher:
   Host: smtp.resend.com
   Port: 587
   User: resend
   Password: re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
   From: onboarding@resend.dev
   Name: Local CashBack
5. SAVE
6. Testar cadastro novamente
7. Verificar dashboard Resend: https://resend.com/emails
```

---

## 📊 CHECKLIST DE DIAGNÓSTICO:

Marque o que você já verificou:

**Configuração:**
- [ ] Templates em português configurados
- [ ] SMTP settings verificadas
- [ ] Rate limits não excedidos
- [ ] Email confirmation está habilitada

**Teste:**
- [ ] Tentou cadastrar novo usuário
- [ ] Aguardou 5 minutos
- [ ] Verificou spam/lixeira
- [ ] Verificou com outro email
- [ ] Verificou logs do Supabase

**SQL:**
- [ ] Executou query de verificação
- [ ] `confirmation_sent_at` tem data
- [ ] `confirmation_token` existe

**Resend:**
- [ ] SMTP configurado
- [ ] Dashboard do Resend checado
- [ ] Emails aparecendo lá

---

## 🎯 PRÓXIMOS PASSOS:

Me responda estas perguntas:

1. **Qual email você está tentando receber?**
   - Confirm signup?
   - Reset password?
   - Outro?

2. **Você tentou com qual email?**
   - Gmail?
   - Outlook?
   - Outro?

3. **Verificou os logs do Supabase?**
   - Sim (me mostre os erros)
   - Não (vou verificar agora)

4. **Quer configurar Resend como SMTP?**
   - Sim (me guie passo a passo)
   - Não (vou tentar outra coisa)

---

## 💡 DICA IMPORTANTE:

Se você está usando **Supabase Auth** (padrão), ele gerencia todo o fluxo de autenticação.

Mas se você criou seu **próprio sistema de recuperação de senha** com Resend (que fizemos antes), são **2 sistemas diferentes**:

- 🔵 **Supabase Auth** → Usa auth.users (nativo)
- 🟢 **Sistema Custom** → Usa merchants/customers + password_reset_tokens

**Qual você está usando?**
- Se for Supabase Auth → Configure SMTP do Resend
- Se for sistema custom → Já funciona com Resend

---

Me diga qual é seu caso e eu te ajudo a resolver! 🚀
