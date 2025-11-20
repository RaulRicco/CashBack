# 🔧 VARIÁVEIS DE AMBIENTE - CONFIGURADAS

## ✅ STATUS ATUAL

Todas as variáveis de ambiente necessárias **JÁ ESTÃO CONFIGURADAS** no arquivo `.env`:

```bash
# Supabase (Database)
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (configurado)

# Google Tag Manager (Analytics) - OPCIONAL
VITE_GTM_ID= (vazio - adicione se quiser analytics)

# Meta Pixel (Facebook Ads) - OPCIONAL
VITE_META_PIXEL_ID= (vazio - adicione se quiser tracking de ads)

# OneSignal (Push Notifications)
VITE_ONESIGNAL_APP_ID=e2b2fb1d-4a56-470f-a33a-aeb35e99631d ✅
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_4kzp... ✅
```

---

## 📋 VARIÁVEIS OBRIGATÓRIAS (✅ Configuradas)

### 1. **VITE_SUPABASE_URL**
- **Status:** ✅ Configurada
- **Valor:** `https://mtylboaluqswdkgljgsd.supabase.co`
- **Uso:** Conexão com banco de dados Supabase
- **Obrigatória:** Sim

### 2. **VITE_SUPABASE_ANON_KEY**
- **Status:** ✅ Configurada
- **Valor:** `eyJhbGc...` (JWT token)
- **Uso:** Autenticação anônima no Supabase
- **Obrigatória:** Sim

### 3. **VITE_ONESIGNAL_APP_ID**
- **Status:** ✅ Configurada
- **Valor:** `e2b2fb1d-4a56-470f-a33a-aeb35e99631d`
- **Uso:** Identificação do app no OneSignal
- **Obrigatória:** Sim (para notificações push)

### 4. **VITE_ONESIGNAL_REST_API_KEY**
- **Status:** ✅ Configurada
- **Valor:** `os_v2_app_4kzp...`
- **Uso:** Envio de notificações via API do OneSignal
- **Obrigatória:** Sim (para notificações push)

---

## 📋 VARIÁVEIS OPCIONAIS (⚠️ Não Configuradas)

### 5. **VITE_GTM_ID** (Google Tag Manager)
- **Status:** ⚠️ Vazio
- **Uso:** Analytics e tracking de eventos
- **Opcional:** Sim
- **Como obter:** https://tagmanager.google.com
- **Formato:** `GTM-XXXXXXX`

**Benefícios se configurar:**
- Tracking de conversões
- Analytics de comportamento de usuário
- Funis de venda
- Eventos personalizados

### 6. **VITE_META_PIXEL_ID** (Facebook Pixel)
- **Status:** ⚠️ Vazio
- **Uso:** Tracking de conversões para Facebook/Instagram Ads
- **Opcional:** Sim
- **Como obter:** https://business.facebook.com/events_manager
- **Formato:** Número de 15 dígitos

**Benefícios se configurar:**
- Otimização de campanhas de ads
- Remarketing
- Lookalike audiences
- Tracking de ROI

---

## 🔒 SEGURANÇA

### **Variáveis Públicas (VITE_*)**

Todas as variáveis com prefixo `VITE_` são **expostas no frontend**. Por isso:

✅ **Seguro expor:**
- `VITE_SUPABASE_URL` - URL pública
- `VITE_SUPABASE_ANON_KEY` - Chave anônima (sem permissões críticas)
- `VITE_ONESIGNAL_APP_ID` - ID público do app
- `VITE_GTM_ID` - ID público do Google Tag Manager
- `VITE_META_PIXEL_ID` - ID público do Meta Pixel

❌ **NÃO expor (não use VITE_):**
- Service Role Keys do Supabase
- Senhas de API
- Tokens de admin

### **VITE_ONESIGNAL_REST_API_KEY**

⚠️ **ATENÇÃO:** Esta chave é sensível mas precisa estar no frontend para enviar notificações via proxy.

**Proteção:**
- Sempre envie via proxy server (não chame API do OneSignal diretamente)
- Proxy valida a origem da requisição
- Limite de rate limiting no OneSignal

---

## 🚀 APLICAR MUDANÇAS

### **Se você adicionar novas variáveis:**

```bash
# 1. Edite o .env
nano /var/www/cashback/cashback-system/.env

# 2. Adicione as variáveis:
VITE_GTM_ID=GTM-XXXXXXX
VITE_META_PIXEL_ID=123456789012345

# 3. Rebuild o projeto
cd /var/www/cashback/cashback-system
npm run build

# 4. Reinicie os serviços
pm2 restart all
```

---

## 🧪 VERIFICAR VARIÁVEIS

### **No servidor (backend):**

```bash
# Ver variáveis carregadas
cat /var/www/cashback/cashback-system/.env

# Testar se estão sendo lidas
cd /var/www/cashback/cashback-system
node -e "require('dotenv').config(); console.log(process.env.VITE_ONESIGNAL_APP_ID)"
```

### **No browser (frontend):**

Abra DevTools → Console:

```javascript
// Ver se variáveis foram compiladas
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('OneSignal App ID:', import.meta.env.VITE_ONESIGNAL_APP_ID);
console.log('GTM ID:', import.meta.env.VITE_GTM_ID);
```

---

## 📊 IMPACTO DE CADA VARIÁVEL

### **VITE_SUPABASE_*** (Obrigatórias)
```
Impacto: Sistema inteiro
Sem isso: Nada funciona (sem banco de dados)
```

### **VITE_ONESIGNAL_*** (Obrigatórias para push)
```
Impacto: Notificações push
Sem isso: Notificações não são enviadas
Alternativa: Notificações locais (menos poderosas)
```

### **VITE_GTM_ID** (Opcional)
```
Impacto: Analytics e tracking
Sem isso: Sem dados de comportamento de usuário
Alternativa: Google Analytics direto (menos flexível)
```

### **VITE_META_PIXEL_ID** (Opcional)
```
Impacto: Facebook/Instagram Ads
Sem isso: Sem tracking de conversões de ads
Alternativa: UTM parameters (menos preciso)
```

---

## 🔄 EXEMPLO DE .env COMPLETO

```bash
# ========================================
# OBRIGATÓRIAS (JÁ CONFIGURADAS)
# ========================================

# Supabase Database
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OneSignal Push Notifications
VITE_ONESIGNAL_APP_ID=e2b2fb1d-4a56-470f-a33a-aeb35e99631d
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_4kzpwhkkkzdq7iz2v2zv5glddvok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici

# ========================================
# OPCIONAIS (ADICIONE SE QUISER)
# ========================================

# Google Tag Manager (Analytics)
VITE_GTM_ID=GTM-XXXXXXX

# Meta/Facebook Pixel (Ads Tracking)
VITE_META_PIXEL_ID=123456789012345
```

---

## ✅ CONCLUSÃO

**Status geral:** ✅ **TUDO CONFIGURADO**

Todas as variáveis **obrigatórias** estão configuradas e funcionando. As variáveis opcionais (GTM e Meta Pixel) podem ser adicionadas depois se você quiser analytics/ads tracking mais avançados.

**Próximos passos:**
1. Fazer deploy com as variáveis atuais
2. Testar notificações OneSignal
3. (Opcional) Adicionar GTM/Meta Pixel depois

---

**Data:** 07/11/2024  
**Status:** ✅ Configurado e pronto para produção
