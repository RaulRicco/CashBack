# 📧 Configurar SMTP no Supabase

## Problema Atual

O Supabase não está configurado para enviar emails, por isso a recuperação de senha retorna erro 500:
```
Error sending recovery email
```

## Solução: Configurar SMTP Customizado

### Passo 1: Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `zxiehkdtsoeauqouwxvi`
3. Vá em **Settings** > **Authentication**

### Passo 2: Configurar SMTP

Você tem 3 opções de provedor de email:

#### Opção A: Gmail (Grátis, mas limitado)
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Password: <senha de app do Gmail>
```

**Como criar senha de app no Gmail:**
1. Vá em https://myaccount.google.com/apppasswords
2. Crie uma senha de app para "Supabase"
3. Use essa senha no SMTP Password

#### Opção B: SendGrid (Recomendado - 100 emails/dia grátis)
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: <sua SendGrid API key>
```

**Como criar conta SendGrid:**
1. Acesse: https://signup.sendgrid.com/
2. Crie conta gratuita
3. Crie uma API Key em Settings > API Keys
4. Use "apikey" como user e a API Key como password

#### Opção C: Resend (Moderno - 100 emails/dia grátis)
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: <sua Resend API key>
```

**Como criar conta Resend:**
1. Acesse: https://resend.com/signup
2. Crie conta gratuita
3. Crie uma API Key
4. Use "resend" como user e a API Key como password

### Passo 3: Configurar Sender

No Supabase Dashboard > Authentication > SMTP Settings:

```
Sender Name: LocalCashback
Sender Email: noreply@seu-dominio.com
```

### Passo 4: Testar

Após configurar, teste a recuperação de senha novamente.

## Solução Temporária para Desenvolvimento

Enquanto não configura o SMTP, use estas credenciais de teste:

**Email:** raul.vendasbsb@gmail.com  
**Senha:** Cashback2025!

O usuário pode fazer login com essas credenciais e trocar a senha dentro do sistema.

## Próximos Passos

1. ✅ Fazer login com credenciais temporárias
2. ⏳ Configurar SMTP no Supabase
3. ✅ Testar recuperação de senha novamente
4. ✅ Deploy para produção com SMTP configurado
