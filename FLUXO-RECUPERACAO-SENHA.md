# 🔐 Fluxo de Recuperação de Senha - LocalCashback

## 📊 Visão Geral

O sistema tem **DOIS fluxos diferentes** de recuperação de senha:

```
┌─────────────────────────────────────────────────────────┐
│                    ESTABELECIMENTO                      │
│  - Usa Supabase Auth                                   │
│  - Magic Link por email                                │
│  - Supabase envia o email (SMTP Resend)               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      CLIENTE                            │
│  - NÃO usa Supabase Auth                               │
│  - Autenticação custom (tabela customers)              │
│  - Código de 6 dígitos por email                       │
│  - Resend API envia o email diretamente                │
└─────────────────────────────────────────────────────────┘
```

---

## 🏪 FLUXO 1: Estabelecimento (Merchant)

### **Autenticação:**
- ✅ Usa **Supabase Auth** (`auth.users`)
- ✅ Email é o identificador principal
- ✅ Senha gerenciada pelo Supabase

### **Fluxo de Recuperação:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário acessa /forgot-password                         │
│    URL: http://31.97.167.88:8080/forgot-password          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Digita EMAIL                                             │
│    Exemplo: raul.vendasbsb@gmail.com                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Sistema chama:                                           │
│    supabase.auth.resetPasswordForEmail(email)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Supabase Auth:                                           │
│    - Verifica se email existe em auth.users                │
│    - Gera token de recuperação                             │
│    - Envia email via SMTP (Resend configurado)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Email contém MAGIC LINK:                                │
│    http://31.97.167.88:8080/reset-password#               │
│    access_token=xxx&type=recovery&refresh_token=yyy        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Usuário clica no link                                    │
│    Sistema extrai tokens da URL e estabelece sessão        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Define nova senha                                        │
│    Sistema chama: supabase.auth.updateUser({password})    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                       ✅ SUCESSO!
```

### **Arquivo Chave:**
- `src/lib/passwordReset.js` - Funções Supabase Auth
- `src/pages/ForgotPassword.jsx` - Tela de solicitação
- `src/pages/ResetPassword.jsx` - Tela de nova senha

---

## 👤 FLUXO 2: Cliente (Customer)

### **Autenticação:**
- ❌ **NÃO** usa Supabase Auth
- ✅ Usa tabela `customers` com `password_hash`
- ✅ Telefone é o identificador principal
- ✅ Email é opcional mas necessário para recuperação

### **Fluxo de Recuperação:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário acessa /customer/forgot-password/:slug          │
│    URL: http://31.97.167.88:8080/customer/forgot-password/│
│         boicashback                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Digita TELEFONE                                          │
│    Exemplo: (61) 98765-4321                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Sistema busca cliente:                                   │
│    SELECT * FROM customers                                  │
│    WHERE phone = '61987654321'                             │
│    AND referred_by_merchant_id = merchant.id                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Cliente tem email?                                       │
│    SIM → Continua                                           │
│    NÃO  → Mostra erro: "Cliente não possui email"         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Sistema:                                                 │
│    - Gera código de 6 dígitos aleatório                    │
│    - Armazena em memória (generatedCode)                   │
│    - Envia email via Resend API direta (DEV)               │
│      ou Integration Proxy (PROD)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Email contém CÓDIGO de 6 DÍGITOS:                       │
│    Exemplo: 123456                                          │
│                                                             │
│    (Não é link, é código para digitar)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Usuário digita código na tela                           │
│    Sistema compara com generatedCode                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Código correto?                                          │
│    SIM → Mostra tela de nova senha                         │
│    NÃO  → Mostra erro "Código inválido"                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Define nova senha                                        │
│    Sistema:                                                 │
│    - Hash da senha: btoa(password)                         │
│    - UPDATE customers                                       │
│      SET password_hash = hash                              │
│      WHERE id = customer_id                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
                       ✅ SUCESSO!
```

### **Arquivos Chave:**
- `src/pages/CustomerForgotPassword.jsx` - Fluxo completo (3 steps)
- `src/lib/resend.js` - Envio de email via Resend
- Tabela: `customers` (não usa `auth.users`)

---

## 🔑 Diferenças Principais

| Aspecto | Estabelecimento | Cliente |
|---------|----------------|---------|
| **Auth System** | Supabase Auth | Custom (tabela) |
| **Identificador** | Email | Telefone |
| **Email de Recuperação** | Supabase SMTP | Resend API |
| **Tipo de Código** | Magic Link (token) | 6 dígitos |
| **Onde armazena código** | Supabase Auth (interno) | Memória frontend |
| **Validação** | Supabase valida token | Frontend compara código |
| **Update Senha** | `supabase.auth.updateUser()` | `UPDATE customers` |
| **Hash de Senha** | Supabase (bcrypt) | `btoa()` (base64) |
| **Expiração** | 1 hora | 15 min (não implementado) |

---

## ⚠️ Importante: Clientes NÃO Usam Supabase Auth

**Isso é intencional!** O sistema foi projetado assim porque:

1. **Clientes são vinculados a estabelecimentos**
   - Cada cliente pertence a um merchant (`referred_by_merchant_id`)
   - Identificação por telefone (mais comum no Brasil)

2. **Autenticação mais simples**
   - Sem necessidade de verificação de email
   - Telefone + senha
   - Cadastro rápido no estabelecimento

3. **Estabelecimentos têm acesso completo**
   - Supabase Auth para segurança
   - Dashboard administrativo
   - Email profissional

---

## 🧪 Como Testar Recuperação de Cliente

### **Pré-requisitos:**

1. **Cliente deve ter EMAIL cadastrado**
   ```sql
   -- Verificar no Supabase SQL Editor:
   SELECT id, name, phone, email 
   FROM customers 
   WHERE phone = '61987654321' -- sem formatação
   LIMIT 1;
   ```

2. **Se cliente não tem email, adicione:**
   ```sql
   UPDATE customers 
   SET email = 'teste@email.com'
   WHERE phone = '61987654321';
   ```

3. **Pegue o slug do merchant:**
   ```sql
   SELECT signup_link_slug 
   FROM merchants 
   WHERE id = (
     SELECT referred_by_merchant_id 
     FROM customers 
     WHERE phone = '61987654321'
   );
   ```

### **Passos do Teste:**

1. **Acesse:**
   ```
   http://31.97.167.88:8080/customer/forgot-password/[SLUG]
   ```

2. **Digite telefone** (com formatação)

3. **Abra Console do navegador (F12)**
   - Deve mostrar: `🔧 Modo DEV: Enviando email via Resend API direta`

4. **Verifique email**

5. **Digite código de 6 dígitos**

6. **Defina nova senha**

7. **Teste login:**
   ```
   http://31.97.167.88:8080/customer/login/[SLUG]
   ```

---

## 🔧 Troubleshooting

### **Email não chega:**
- ✅ Verificar se cliente tem email cadastrado
- ✅ Verificar logs no console (F12)
- ✅ Verificar se Resend API key está correta
- ✅ Verificar spam/lixo

### **Código inválido:**
- ✅ Código é case-sensitive
- ✅ Código só existe em memória (se recarregar página, perde)
- ✅ Sem expiração implementada (por enquanto)

### **Cliente não encontrado:**
- ✅ Verificar se telefone está correto
- ✅ Verificar se cliente pertence ao merchant correto
- ✅ Verificar se slug está correto

---

## 📋 Checklist de Funcionamento

- [ ] Cliente tem email cadastrado no banco
- [ ] Slug do merchant está correto
- [ ] Telefone do cliente está correto (sem formatação no DB)
- [ ] API Key do Resend está configurada no .env
- [ ] Build foi feito após a correção
- [ ] Console mostra "Modo DEV" e "Email enviado"
- [ ] Email chegou na caixa de entrada
- [ ] Código de 6 dígitos está no email
- [ ] Conseguiu definir nova senha
- [ ] Login funciona com nova senha

---

## 🎯 Resumo

**Clientes NÃO precisam de Supabase Auth!**

Eles já têm um sistema funcionando:
- ✅ Recuperação via telefone + email
- ✅ Código de 6 dígitos via Resend
- ✅ Update direto na tabela customers
- ✅ Funciona independente do Supabase Auth

**O que corrigimos:**
- ✅ Resend API agora funciona em DEV (era o problema)
- ✅ Email de recuperação agora é enviado
- ✅ Fluxo completo funciona

**Próximo passo:**
- 🧪 Testar com um cliente real que tenha email cadastrado
