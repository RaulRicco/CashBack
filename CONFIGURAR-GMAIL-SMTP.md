# 📧 Configurar Gmail como SMTP (Solução Rápida)

## Por que usar Gmail?

- ✅ Mais simples de configurar
- ✅ Não precisa domínio verificado
- ✅ Funciona imediatamente
- ⚠️ Limitado a ~500 emails/dia

---

## Passo a Passo

### 1. Criar Senha de App no Gmail

1. Acesse: https://myaccount.google.com/apppasswords
2. Se pedir para ativar 2FA, ative primeiro
3. Clique em "Criar"
4. Nome do app: `Supabase LocalCashback`
5. Clique em "Criar"
6. **COPIE** a senha gerada (16 caracteres sem espaços)
   - Exemplo: `abcd efgh ijkl mnop` → copie `abcdefghijklmnop`

### 2. Configurar no Supabase

Acesse: https://supabase.com/dashboard/project/zxiehkdtsoeauqouwxvi/auth/providers

Role até "SMTP provider settings" e configure:

```
Host:         smtp.gmail.com
Port:         587
Username:     seu-email@gmail.com
Password:     abcdefghijklmnop (senha de app que copiou)
Sender Name:  LocalCashback
Sender Email: seu-email@gmail.com
```

### 3. Salvar e Testar

1. Clique em "Save"
2. Aguarde 1 minuto
3. Teste a recuperação de senha

---

## ✅ Vantagens do Gmail

- ✅ Configuração em 2 minutos
- ✅ Sem necessidade de domínio
- ✅ Emails chegam instantaneamente
- ✅ Não vai para spam

## ⚠️ Desvantagens do Gmail

- ❌ Limite de ~500 emails/dia
- ❌ Pode ser bloqueado se enviar muitos emails rapidamente
- ❌ Sender sempre será seu email pessoal

---

## Recomendação

**Para desenvolvimento/teste:** Use Gmail (mais rápido)  
**Para produção:** Configure Resend ou SendGrid com domínio próprio
