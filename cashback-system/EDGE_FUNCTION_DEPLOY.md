# 📧 Guia de Deploy da Edge Function - Envio de Emails

## 🎯 Objetivo

Esta Edge Function (`send-email`) é necessária para o recurso de **Esqueci minha senha** (Forgot Password) enviar emails via Resend API sem problemas de CORS.

## ⚠️ Por que precisamos da Edge Function?

Quando chamamos a API do Resend diretamente do navegador, ocorre erro de CORS:
```
Access to fetch at 'https://api.resend.com/emails' from origin 'https://localcashback.com.br' 
has been blocked by CORS policy
```

A Edge Function resolve isso atuando como um **proxy server-side** que:
- Recebe a requisição do frontend
- Chama a API do Resend com a API key segura
- Retorna a resposta para o frontend

## 📋 Pré-requisitos

1. Acesso ao Supabase Dashboard: https://supabase.com/dashboard
2. API Key do Resend: `re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF`
3. Projeto Supabase: `mtylboaluqswdkgljgsd`

## 🚀 Método 1: Deploy via Supabase Dashboard (RECOMENDADO)

### Passo 1: Acessar Edge Functions

1. Faça login em https://supabase.com/dashboard
2. Selecione o projeto `mtylboaluqswdkgljgsd`
3. No menu lateral, clique em **Edge Functions**
4. Clique em **Create a new function**

### Passo 2: Criar a Function

1. **Nome da função**: `send-email`
2. **Copie e cole o código** de `/home/user/webapp/cashback-system/supabase/functions/send-email/index.ts`
3. Clique em **Create function**

### Passo 3: Configurar Secrets (Variáveis de Ambiente)

1. Na página da Edge Function, clique em **Settings** ou **Secrets**
2. Adicione o secret:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF`
3. Clique em **Save**

### Passo 4: Deploy

1. Clique em **Deploy** para publicar a função
2. Aguarde o deploy completar (alguns segundos)
3. A função estará disponível em: `https://mtylboaluqswdkgljgsd.supabase.co/functions/v1/send-email`

## 🚀 Método 2: Deploy via Supabase CLI (Para Desenvolvedores)

### Instalação do Supabase CLI

```bash
# Linux/macOS
curl -fsSL https://supabase.com/install.sh | sh

# Ou via npm
npm install -g supabase
```

### Login e Link do Projeto

```bash
# Login no Supabase
supabase login

# Link ao projeto
supabase link --project-ref mtylboaluqswdkgljgsd
```

### Configurar Secrets

```bash
# Configurar API key do Resend
supabase secrets set RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
```

### Deploy da Função

```bash
# Deploy da Edge Function
cd /home/user/webapp/cashback-system
supabase functions deploy send-email
```

## 🧪 Testar a Edge Function

### Teste via cURL

```bash
curl -X POST \
  'https://mtylboaluqswdkgljgsd.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNjYwNzYsImV4cCI6MjA1MTk0MjA3Nn0.VfhcqDpzMVcuhsQvFCjZkIe_NN7zHJ0n7k_xLDZE1w4' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "LocalCashback <noreply@localcashback.com.br>",
    "to": "seu-email@exemplo.com",
    "subject": "Teste de Email",
    "html": "<p>Este é um email de teste</p>",
    "text": "Este é um email de teste"
  }'
```

### Resposta Esperada (Sucesso)

```json
{
  "success": true,
  "id": "abc123...",
  "data": {
    "id": "abc123...",
    "from": "LocalCashback <noreply@localcashback.com.br>",
    "to": ["seu-email@exemplo.com"],
    "created_at": "2025-11-09T15:30:00Z"
  }
}
```

## 🔍 Ver Logs da Edge Function

### Via Dashboard

1. Acesse a Edge Function no Supabase Dashboard
2. Clique em **Logs** ou **Invocations**
3. Visualize as execuções recentes e erros

### Via CLI

```bash
supabase functions logs send-email --project-ref mtylboaluqswdkgljgsd
```

## 🐛 Troubleshooting

### Erro 401 (Unauthorized)

**Problema**: `{"code":401,"message":"Invalid JWT"}`

**Solução**: A Edge Function precisa aceitar requisições anônimas. Verifique se o código está configurado corretamente com CORS headers.

### Erro 500 (Internal Server Error)

**Problema**: Erro interno na Edge Function

**Causas possíveis**:
- `RESEND_API_KEY` não configurada
- Código com erro de sintaxe
- Problema na API do Resend

**Solução**: Verifique os logs da Edge Function

### Email não chega

**Problema**: Função retorna sucesso mas email não chega

**Causas possíveis**:
1. Email na caixa de spam
2. Domínio do Resend não verificado
3. API key do Resend inválida

**Solução**: 
- Verifique a caixa de spam
- Verifique o domínio no painel do Resend
- Teste com outro email

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Resend API Docs](https://resend.com/docs/api-reference/emails/send-email)
- [Deno Deploy Docs](https://deno.com/deploy/docs)

## ✅ Checklist de Deploy

- [ ] Edge Function criada no Supabase Dashboard
- [ ] Secret `RESEND_API_KEY` configurado
- [ ] Função deployada com sucesso
- [ ] Teste via cURL funcionando
- [ ] Teste no frontend funcionando
- [ ] Emails chegando na caixa de entrada

## 🎉 Após Deploy

Depois que a Edge Function estiver funcionando:

1. Teste o fluxo completo de "Esqueci minha senha"
2. Verifique se os emails estão chegando
3. Teste com diferentes tipos de email (Gmail, Outlook, etc.)
4. Monitore os logs para detectar problemas

---

**Última atualização**: 2025-11-09
**Versão da Edge Function**: 1.1
**Status**: Pronto para deploy
