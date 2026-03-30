# RELATÓRIO TÉCNICO — LocalCashback
## Sistema de Cashback para Estabelecimentos Comerciais
**Data:** Março 2026 | **Servidor:** 31.97.167.88 | **Domínio principal:** localcashback.com.br

---

## 1. ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUÇÃO                                │
├─────────────────┬───────────────────┬───────────────────────────┤
│   NGINX (443)   │   Node.js (3001)  │   Supabase (PostgreSQL)   │
│  Serve dist/    │   server.js       │   Auth + Banco de dados   │
│  Proxy /api/    │   PM2: stripe-api │   Storage: logos/assets   │
└────────┬────────┴─────────┬─────────┴───────────────────────────┘
         │                  │
         ▼                  ▼
  React + Vite         Integrações:
  (Frontend SPA)       • Stripe (pagamentos)
                       • Resend (e-mail)
                       • OneSignal (push)
                       • Mailchimp (marketing)
```

**Domínios ativos com SSL:**
| Domínio | Finalidade |
|---------|------------|
| `localcashback.com.br` | Plataforma principal / painel dos lojistas |
| `cashback.churrascariaboidourado.com.br` | Domínio white-label — Churrascaria Boi Dourado |
| `cashback.reservabar.com.br` | Domínio white-label — Reserva Bar |
| `cashback.raulricco.com.br` | Domínio white-label — Raul Ricco |

---

## 2. O QUE FOI IMPLEMENTADO (POR ÁREA)

---

### 2.1 AUTENTICAÇÃO E CADASTRO

#### ✅ Login com Google (OAuth)
**Arquivos:** `src/pages/OAuthCallback.jsx`, `src/pages/SignupComplete.jsx`, `server.js`

Fluxo implementado:
1. Usuário clica em "Entrar com Google" na tela de cadastro
2. Supabase redireciona para Google OAuth
3. Após autenticação, `OAuthCallback.jsx` detecta se é novo usuário ou existente
4. Novos usuários são enviados para `/signup/complete` para preencher dados do negócio
5. Backend valida e cria registro na tabela `merchants`

```javascript
// server.js — endpoint de conclusão do cadastro Google
app.post('/api/signup/oauth', async (req, res) => {
  const { userId, businessName, phone, email } = req.body;
  // Cria merchant vinculado ao usuário Supabase Auth
});
```

#### ✅ Recuperação de Senha via Resend
**Arquivos:** `src/lib/passwordReset.js`, `server.js`

- Backend gera link seguro via `supabase.auth.admin.generateLink()`
- E-mail enviado via Resend com domínio `localcashback.com.br` verificado
- Fallback para Supabase nativo caso Resend falhe

```javascript
// server.js
app.post('/api/auth/password-reset/request', async (req, res) => {
  const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery', email
  });
  await resend.emails.send({ from: 'noreply@localcashback.com.br', ... });
});
```

#### ✅ Correção da Race Condition no Settings
**Arquivo:** `src/pages/Settings.jsx`

**Problema:** `useEffect` rodava antes do Zustand hidratar o merchant do localStorage.
**Solução:** Dependência explícita no `merchant?.id`.

```javascript
// ANTES (bugado)
useEffect(() => { loadSettings(); }, []);

// DEPOIS (correto)
useEffect(() => {
  if (merchant?.id) loadSettings();
}, [merchant?.id]);
```

---

### 2.2 PLANOS E PAGAMENTOS (STRIPE)

#### ✅ Sistema de 3 Planos com Checkout Stripe
**Arquivos:** `src/pages/PlansPublic.jsx`, `src/pages/SubscriptionPlans.jsx`, `src/lib/stripe.js`

| Plano | Preço | Price ID Stripe | Perfil |
|-------|-------|-----------------|--------|
| Starter | R$ 147/mês | `price_1SluhgAev6mInEFVzGTKjPoV` | Pequenas empresas |
| Business | R$ 297/mês | `price_1TEVzwAev6mInEFVFkqZkxRL` | Empresas médias |
| Premium | R$ 497/mês | `price_1TEVzwAev6mInEFVfEh3ySHG` | Grandes empresas |

```javascript
// src/lib/stripe.js — carregamento sem telemetria (resolve bloqueio de DNS)
import { loadStripe } from '@stripe/stripe-js/pure';
const stripe = await loadStripe(PUBLISHABLE_KEY, {
  advancedFraudSignals: false
});
```

#### ✅ Redirect para Planos Após Cadastro
**Arquivo:** `src/hooks/useSignup.js`

Após cadastro bem-sucedido, o usuário é direcionado diretamente para `/plans` ao invés do fluxo antigo de verificação de e-mail.

---

### 2.3 NOTIFICAÇÕES PUSH (ONESIGNAL)

#### ✅ Backend — 3 Endpoints de Notificação
**Arquivo:** `server.js`

```javascript
POST /api/onesignal/notify-signup     // Novo cadastro de cliente
POST /api/onesignal/notify-cashback   // Cashback recebido
POST /api/onesignal/notify-redemption // Resgate aprovado
```

**Correções realizadas:**
- Auth header corrigido: `Basic` → `Key`
- Endpoint atualizado: `onesignal.com/api/v1` → `api.onesignal.com/api/v1`
- Credenciais atualizadas (App ID + REST API Key válidos)

#### ✅ Frontend — Hook com Fallback Global
**Arquivo:** `src/hooks/useOneSignal.js`

```javascript
const FALLBACK_ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

// Usa config do merchant OU fallback global
const appId = config?.app_id || FALLBACK_ONESIGNAL_APP_ID;
```

**Antes:** SDK só inicializava se o merchant tivesse uma linha ativa em `integration_configs`
**Depois:** Fallback para App ID global — todos os merchants podem receber notificações

---

### 2.4 SEGURANÇA

#### ✅ Headers de Segurança no Nginx
**Arquivo:** `/etc/nginx/sites-enabled/localcashback`

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "..." always;
```

#### ✅ CSP Atualizada — Google Fonts
Problema: fontes externas bloqueadas pelo CSP, quebrando visual de páginas de clientes.

```nginx
# ANTES
font-src 'self' data:;

# DEPOIS
font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
```

#### ✅ Correção do Cliente Supabase (RLS)
**Arquivo:** `src/lib/supabase.js`

**Problema crítico:** O cliente Supabase tinha `Authorization: Bearer ${anonKey}` fixo nos headers globais. Isso sobrescrevia o JWT do usuário logado em TODAS as requisições, fazendo o RLS bloquear silenciosamente todos os UPDATEs.

```javascript
// ANTES (bugado — bloqueava RLS)
export const supabase = createClient(url, key, {
  global: {
    headers: {
      'Authorization': `Bearer ${anonKey}`, // ← ERRO: sobrescreve JWT do usuário
    }
  }
});

// DEPOIS (correto — JWT do usuário usado automaticamente)
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true }
});
```

#### ✅ Rate Limiting no Backend
**Arquivo:** `server.js`

Limites aplicados via `express-rate-limit` nas rotas sensíveis:
- `/api/auth/*` — máx. 10 req/15min por IP
- `/api/resend/*` — máx. 5 req/hora por IP
- `/api/stripe/webhook` — sem limite (webhook do Stripe)

---

### 2.5 DOMÍNIOS WHITE-LABEL

#### ✅ Ativação do Domínio Churrascaria
**Arquivo:** `/etc/nginx/sites-available/cashback.churrascariaboidourado.com.br`

3 problemas encontrados e corrigidos simultaneamente:

| Problema | Antes | Depois |
|----------|-------|--------|
| Site não estava ativo | Só em `sites-available` | Symlink criado em `sites-enabled` |
| Root path incorreto | `/cashback-system` | `/cashback-system/dist` |
| Porta da API errada | `3002` | `3001` |

---

### 2.6 UPLOAD DE LOGO / WHITE-LABEL

#### ✅ Correção do Upload de Logo
**Arquivo:** `src/pages/WhiteLabelSettings.jsx`

**Problema:** Merchant era `null` no momento do upload (estado local ainda não carregado).
**Solução:** Fallback para `authMerchant` do store.

```javascript
// ANTES
if (!merchant || !merchant.id) { /* erro */ }

// DEPOIS
const currentMerchant = merchant || authMerchant;
if (!currentMerchant || !currentMerchant.id) { /* erro */ }
```

---

## 3. ESTADO ATUAL DOS SERVIÇOS

| Serviço | Status | Detalhes |
|---------|--------|---------|
| **Nginx** | ✅ Ativo | 2 sites ativos, SSL válido em todos |
| **Node.js (PM2)** | ✅ Online | `stripe-api`, 4 dias uptime, 72MB RAM |
| **Supabase** | ✅ Conectado | Auth + DB + Storage operacionais |
| **Stripe** | ✅ Live | 3 planos em produção |
| **Resend** | ✅ Ativo | Domínio `localcashback.com.br` verificado |
| **OneSignal** | ✅ Credenciais OK | `recipients: 0` — aguarda opt-in de usuários |

---

## 4. ARQUIVOS MODIFICADOS (RESUMO)

### Backend
| Arquivo | O que mudou |
|---------|-------------|
| `server.js` (1.777 linhas) | Resend, OAuth, OneSignal, rate limiting, plans |
| `/etc/nginx/sites-enabled/localcashback` | Security headers, CSP, Google Fonts |
| `/etc/nginx/sites-enabled/cashback.churrascariaboidourado.com.br` | Ativado + root path + porta corrigidos |
| `/var/www/cashback/.env` | Resend key, Supabase service role, Stripe prices, OneSignal |

### Frontend (`cashback-system/src/`)
| Arquivo | O que mudou |
|---------|-------------|
| `lib/supabase.js` | Removido Authorization header fixo (bug crítico de RLS) |
| `lib/stripe.js` | Pure loader, advancedFraudSignals: false |
| `lib/passwordReset.js` | Integração com backend Resend |
| `hooks/useSignup.js` | Redirect para /plans após cadastro |
| `hooks/useOneSignal.js` | Fallback global App ID |
| `pages/Settings.jsx` | Race condition corrigida, dependência merchant?.id |
| `pages/WhiteLabelSettings.jsx` | Fallback authMerchant no upload de logo |
| `pages/PlansPublic.jsx` | Reescrito: 3 planos com Stripe checkout |
| `pages/SubscriptionPlans.jsx` | Atualizado: 3 planos autenticados |
| `pages/Signup.jsx` | Botão Google OAuth + redirect para plans |
| `pages/OAuthCallback.jsx` | Novo: handler do callback Google OAuth |
| `pages/SignupComplete.jsx` | Novo: coleta dados após OAuth |
| `store/authStore.js` | Supabase Auth real integrado |

---

## 5. VARIÁVEIS DE AMBIENTE CONFIGURADAS

### Backend (`/var/www/cashback/.env`)
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...       # Para generateLink (reset de senha)
RESEND_API_KEY=...                   # E-mail transacional
RESEND_FROM_EMAIL=noreply@localcashback.com.br
STRIPE_SECRET_KEY=...               # Live mode
STRIPE_WEBHOOK_SECRET=...
VITE_STRIPE_PRICE_STARTER=price_1SluhgAev6mInEFVzGTKjPoV
VITE_STRIPE_PRICE_BUSINESS=price_1TEVzwAev6mInEFVFkqZkxRL
VITE_STRIPE_PRICE_PREMIUM=price_1TEVzwAev6mInEFVfEh3ySHG
ONESIGNAL_APP_ID=8e891d9e-5631-4ff7-9955-1f49d3b44ee7
ONESIGNAL_REST_API_KEY=os_v2_app_...
```

### Frontend (`cashback-system/.env`)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=...     # Live mode
VITE_STRIPE_PRICE_STARTER=...
VITE_STRIPE_PRICE_BUSINESS=...
VITE_STRIPE_PRICE_PREMIUM=...
VITE_ONESIGNAL_APP_ID=8e891d9e-...
```
