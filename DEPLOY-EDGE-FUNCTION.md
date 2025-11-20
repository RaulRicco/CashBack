# 🚀 Deploy da Edge Function - Resend Email

## ❌ Problema Resolvido

**Erro CORS:** O navegador bloqueava chamadas diretas para `api.resend.com` 

**Solução:** Criamos uma Supabase Edge Function que funciona como proxy seguro

---

## 📋 Passo 1: Instalar Supabase CLI

```bash
# No seu computador local (não no servidor)
npm install -g supabase
```

---

## 📋 Passo 2: Login no Supabase

```bash
supabase login
```

Isso vai abrir o navegador para você fazer login.

---

## 📋 Passo 3: Link com seu projeto

```bash
cd /caminho/para/cashback-system

# Link com seu projeto Supabase
supabase link --project-ref SEU_PROJECT_REF
```

**Como achar o `PROJECT_REF`:**
1. Vá em https://supabase.com/dashboard
2. Abra seu projeto
3. Vá em Settings → General
4. Copie o "Reference ID"

---

## 📋 Passo 4: Configurar Secret (API Key do Resend)

```bash
supabase secrets set RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
```

---

## 📋 Passo 5: Deploy da Edge Function

```bash
supabase functions deploy send-email
```

---

## ✅ Pronto!

A Edge Function está deployada e funcionando! 

Agora você pode:

1. **Fazer deploy do frontend** no servidor:
```bash
cd /var/www/cashback/cashback-system
git reset --hard origin/genspark_ai_developer
npm run build
pm2 restart integration-proxy
```

2. **Testar recuperação de senha** - não vai mais dar erro de CORS!

---

## 🔍 Como Verificar se Funcionou

### No Supabase Dashboard:

1. Vá em **Edge Functions** no menu lateral
2. Você deve ver `send-email` listada
3. Clique nela para ver logs

### Testando:

1. Acesse: `https://seudominio.com/customer/login/SLUG`
2. Clique em "Esqueceu sua senha?"
3. Digite telefone
4. O email deve ser enviado sem erro CORS!

---

## 🐛 Troubleshooting

### Erro: "Function not found"
```bash
# Re-deploy
supabase functions deploy send-email --no-verify-jwt
```

### Erro: "RESEND_API_KEY not set"
```bash
# Setar novamente
supabase secrets set RESEND_API_KEY=sua_chave_aqui
```

### Ver logs da function:
```bash
supabase functions logs send-email
```

---

## 📌 Resumo do que foi feito

1. ✅ Criada Edge Function `send-email` que funciona como proxy
2. ✅ Edge Function chama Resend API no backend (sem CORS)
3. ✅ Frontend chama Edge Function do Supabase (permitido)
4. ✅ API Key do Resend fica segura no backend (secret)

---

## 🔗 Links Úteis

- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Resend API:** https://resend.com/docs
- **Código da função:** `supabase/functions/send-email/index.ts`
