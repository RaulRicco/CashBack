# 📧 SETUP RESEND - RECUPERAÇÃO DE SENHA POR EMAIL

## 🎯 OBJETIVO

Implementar recuperação de senha por email para:
- ✅ Estabelecimentos (Merchants)
- ✅ Clientes (Customers)

Usando **Resend** para envio de emails transacionais.

---

## 📋 PASSO 1: CRIAR CONTA NO RESEND

### **1.1. Acessar Resend**
```
https://resend.com
```

### **1.2. Criar conta gratuita**
- Clique em "Sign Up"
- Use email profissional
- Confirme email

### **1.3. Plano Gratuito:**
```
✅ 100 emails/dia
✅ 3.000 emails/mês
✅ Todos os recursos
✅ Sem cartão de crédito
```

---

## 📋 PASSO 2: CONFIGURAR DOMÍNIO

### **2.1. Adicionar Domínio**

No painel Resend:
1. Clique em "Domains"
2. Clique em "Add Domain"
3. Digite seu domínio: `vipclubesystem.com.br`

### **2.2. Configurar DNS**

Resend vai fornecer registros DNS. Adicione no seu provedor (Cloudflare, GoDaddy, etc):

**Registros obrigatórios:**
```
Tipo: TXT
Nome: _resend
Valor: resend-verification=xxxxxxxxxxxx

Tipo: TXT  
Nome: @
Valor: v=spf1 include:amazonses.com ~all

Tipo: CNAME
Nome: resend._domainkey
Valor: resend._domainkey.resend.com

Tipo: CNAME
Nome: resend2._domainkey
Valor: resend2._domainkey.resend.com

Tipo: CNAME
Nome: resend3._domainkey
Valor: resend3._domainkey.resend.com
```

### **2.3. Verificar Domínio**

- Aguarde DNS propagar (pode levar até 48h, mas geralmente 5-10 minutos)
- Clique em "Verify" no painel Resend
- Status deve mudar para "Verified" ✅

**Enquanto verifica, use email de teste:**
```
From: onboarding@resend.dev (domínio padrão)
```

---

## 📋 PASSO 3: OBTER API KEY

### **3.1. Criar API Key**

No painel Resend:
1. Clique em "API Keys"
2. Clique em "Create API Key"
3. Nome: `CashBack System - Production`
4. Permission: `Full Access` (ou `Sending Access` apenas)
5. Clique em "Create"

### **3.2. Copiar API Key**

```
Formato: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Exemplo: re_123456789abcdefghijklmnopqrstuv
```

⚠️ **IMPORTANTE:** Copie agora! Não será mostrada novamente.

---

## 📋 PASSO 4: CONFIGURAR VARIÁVEIS DE AMBIENTE

### **4.1. Adicionar no .env**

Edite `/var/www/cashback/cashback-system/.env`:

```bash
# Resend Email Service
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_RESEND_FROM_EMAIL=noreply@vipclubesystem.com.br
VITE_RESEND_FROM_NAME=Local CashBack
```

**Explicação:**
- `VITE_RESEND_API_KEY`: Sua API key do Resend
- `VITE_RESEND_FROM_EMAIL`: Email remetente (use seu domínio verificado)
- `VITE_RESEND_FROM_NAME`: Nome que aparece como remetente

### **4.2. Se domínio não estiver verificado (temporário):**

```bash
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

## 📋 PASSO 5: INSTALAR RESEND SDK

### **5.1. Instalar dependência**

```bash
cd /var/www/cashback/cashback-system
npm install resend
```

### **5.2. Verificar instalação**

```bash
npm list resend
# Deve mostrar: resend@x.x.x
```

---

## 📋 PASSO 6: IMPLEMENTAR NO CÓDIGO

### **6.1. Arquivos que serão criados:**

```
src/lib/resend.js              - Cliente Resend
src/lib/passwordReset.js       - Lógica de reset
src/templates/resetPassword.js - Template HTML do email
src/pages/ForgotPassword.jsx   - Página de esqueci senha
src/pages/ResetPassword.jsx    - Página de redefinir senha
```

### **6.2. Fluxo:**

```
1. Usuário clica em "Esqueci minha senha"
2. Digita email
3. Sistema gera token único
4. Envia email com link de reset
5. Usuário clica no link
6. Página para definir nova senha
7. Token é validado
8. Senha é atualizada
```

---

## 📋 PASSO 7: CRIAR TABELA NO SUPABASE

### **7.1. Executar SQL no Supabase:**

```sql
-- Tabela para tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL, -- 'merchant' ou 'customer'
  user_id UUID,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Limpar tokens expirados automaticamente (opcional)
CREATE OR REPLACE FUNCTION delete_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperação de senha de merchants e customers';
COMMENT ON COLUMN password_reset_tokens.user_type IS 'merchant ou customer';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expira em 1 hora';
```

---

## 📋 PASSO 8: CONFIGURAR RLS (Row Level Security)

### **8.1. Políticas de segurança:**

```sql
-- Habilitar RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Permitir inserção (criar token)
CREATE POLICY "Permitir criação de token" ON password_reset_tokens
  FOR INSERT
  WITH CHECK (true);

-- Permitir leitura apenas do próprio token
CREATE POLICY "Permitir leitura de token válido" ON password_reset_tokens
  FOR SELECT
  USING (
    expires_at > NOW() 
    AND used = FALSE
  );

-- Permitir update apenas para marcar como usado
CREATE POLICY "Permitir marcar token como usado" ON password_reset_tokens
  FOR UPDATE
  USING (
    expires_at > NOW() 
    AND used = FALSE
  )
  WITH CHECK (used = TRUE);
```

---

## 📋 PASSO 9: TESTAR RESEND

### **9.1. Teste via API (opcional):**

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "seu-email@exemplo.com",
    "subject": "Teste Resend",
    "html": "<h1>Funcionou!</h1><p>Se você recebeu este email, o Resend está configurado corretamente.</p>"
  }'
```

**Resposta esperada:**
```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "from": "onboarding@resend.dev",
  "to": ["seu-email@exemplo.com"],
  "created_at": "2024-11-07T20:00:00.000Z"
}
```

---

## 📋 PASSO 10: BUILD E DEPLOY

### **10.1. Build com novas variáveis:**

```bash
cd /var/www/cashback/cashback-system
npm install
npm run build
```

### **10.2. Reiniciar serviços:**

```bash
pm2 restart all
```

---

## 📧 EXEMPLO DE EMAIL QUE SERÁ ENVIADO

### **Assunto:**
```
Recuperação de Senha - Local CashBack
```

### **Corpo (HTML):**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
    <h1 style="color: #17A589;">🔒 Recuperação de Senha</h1>
    
    <p>Olá,</p>
    
    <p>Você solicitou a recuperação de senha para sua conta no <strong>Local CashBack</strong>.</p>
    
    <p>Clique no botão abaixo para redefinir sua senha:</p>
    
    <a href="https://seusite.com/reset-password?token=xxxxx" 
       style="display: inline-block; background: #17A589; color: white; padding: 15px 30px; 
              text-decoration: none; border-radius: 5px; margin: 20px 0;">
      Redefinir Senha
    </a>
    
    <p><small>Este link expira em 1 hora.</small></p>
    
    <p>Se você não solicitou esta recuperação, ignore este email.</p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #666; font-size: 12px;">
      Local CashBack - Sistema de Fidelidade<br>
      Este é um email automático, não responda.
    </p>
  </div>
</body>
</html>
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### Resend:
- [ ] Conta criada no Resend
- [ ] Domínio adicionado
- [ ] DNS configurado (ou usar onboarding@resend.dev temporariamente)
- [ ] Domínio verificado (opcional)
- [ ] API Key criada e copiada

### Código:
- [ ] Variáveis de ambiente adicionadas no `.env`
- [ ] Resend SDK instalado (`npm install resend`)
- [ ] Tabela `password_reset_tokens` criada no Supabase
- [ ] RLS configurado
- [ ] Build executado

### Teste:
- [ ] Envio de email de teste funcionando
- [ ] Link de reset funcionando
- [ ] Nova senha sendo salva
- [ ] Token expirando após 1 hora
- [ ] Token não pode ser reutilizado

---

## 🔒 SEGURANÇA

### **Token de Reset:**
- Gerado com `crypto.randomBytes(32)` (256 bits)
- Expira em 1 hora
- Uso único (marcado como `used` após redefinição)
- Não pode ser adivinhado

### **Email:**
- Enviado via HTTPS
- Não contém senha em texto
- Link com token único

### **Validação:**
- Token deve existir
- Token não pode estar expirado
- Token não pode estar usado
- Email deve corresponder ao token

---

## 📊 LIMITES DO PLANO GRATUITO

```
100 emails/dia
3.000 emails/mês
```

**Estimativa:**
```
100 estabelecimentos × 1 reset/mês = 100 emails
1000 clientes × 0.5 reset/mês = 500 emails
Total: ~600 emails/mês ✅ Dentro do limite
```

**Se exceder:**
- Plano Starter: $20/mês (50.000 emails)
- Plano Business: $80/mês (100.000 emails)

---

## 📚 DOCUMENTAÇÃO RESEND

- **Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Node.js SDK:** https://resend.com/docs/send-with-nodejs
- **Examples:** https://github.com/resend/resend-node

---

**Status:** 🔧 Aguardando configuração  
**Próximo passo:** Criar conta no Resend e obter API Key
