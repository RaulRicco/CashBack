# 🔒 AUDITORIA DE SEGURANÇA COMPLETA - LocalCashback

**Data da Auditoria:** 07 de Janeiro de 2026  
**Sistema:** LocalCashback - Plataforma de Cashback SaaS Multi-tenant  
**Versão:** 1.0.0  
**Status:** Em Produção  

---

## 📊 RESUMO EXECUTIVO

### Pontuação Geral de Segurança: **6.5/10**

**Classificação:** ⚠️ **ATENÇÃO NECESSÁRIA**

| Categoria | Pontuação | Status |
|-----------|-----------|--------|
| Autenticação & Autorização | 7/10 | 🟡 BOM |
| Proteção de Dados | 5/10 | 🔴 CRÍTICO |
| Segurança de API | 6/10 | 🟠 MODERADO |
| Infraestrutura | 7/10 | 🟡 BOM |
| Conformidade | 5/10 | 🔴 CRÍTICO |
| Segurança de Código | 6/10 | 🟠 MODERADO |

---

## 🚨 VULNERABILIDADES CRÍTICAS (Prioridade ALTA)

### 1. **EXPOSIÇÃO DE CREDENCIAIS NO .ENV**
**Severidade:** 🔴 **CRÍTICA**  
**Impacto:** Comprometimento total do sistema

#### Problema:
```bash
# Arquivo .env com permissões inseguras
-rw-r--r-- 1 root root 2585 Jan 4 19:50 .env
```

- ✅ **9 credenciais sensíveis expostas:**
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `MAILCHIMP_API_KEY`
  - `ONESIGNAL_REST_API_KEY`
  - `VITE_RESEND_API_KEY`
  - E outras...

#### Riscos:
- ✅ Acesso não autorizado ao banco de dados
- ✅ Fraude de pagamentos via Stripe
- ✅ Envio de emails maliciosos
- ✅ Acesso a dados de clientes

#### Solução IMEDIATA:
```bash
# 1. Alterar permissões
chmod 600 /home/root/webapp/.env

# 2. Rotacionar TODAS as chaves comprometidas
# - Supabase: Gerar nova anon key
# - Stripe: Rotacionar secret key
# - Mailchimp: Regenerar API key
# - OneSignal: Nova REST API key

# 3. Usar gerenciador de segredos
# Migrar para AWS Secrets Manager, HashiCorp Vault ou similar
```

---

### 2. **AUSÊNCIA DE RATE LIMITING**
**Severidade:** 🔴 **ALTA**  
**Impacto:** Ataques DDoS, brute force, spam

#### Problema:
```javascript
// server.js - SEM rate limiting
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  // ⚠️ Sem limitação de requisições
});
```

#### Riscos:
- ✅ Ataques de força bruta em login
- ✅ DDoS na API
- ✅ Abuso de webhooks
- ✅ Spam em emails e push notifications
- ✅ Custos elevados com APIs de terceiros

#### Solução:
```bash
cd /home/root/webapp && npm install express-rate-limit --save
```

```javascript
// server.js
import rateLimit from 'express-rate-limit';

// Rate limiter geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições
  message: 'Muitas requisições. Tente novamente mais tarde.'
});

// Rate limiter para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // apenas 5 tentativas
  skipSuccessfulRequests: true,
  message: 'Muitas tentativas de login. Aguarde 15 minutos.'
});

// Rate limiter para checkout (evitar fraude)
const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 checkouts por hora
  message: 'Limite de checkouts atingido. Tente novamente em 1 hora.'
});

app.use('/api/', generalLimiter);
app.use('/api/stripe/create-checkout-session', checkoutLimiter);
```

---

### 3. **VULNERABILIDADES EM DEPENDÊNCIAS**
**Severidade:** 🔴 **CRÍTICA**  
**Impacto:** Exploração de bibliotecas vulneráveis

#### Problemas Encontrados:
```bash
# npm audit --production

CRITICAL vulnerabilities found:
- form-data < 2.5.4 (GHSA-fjxv-7rqg-78g4)
  └── Unsafe random function for boundary selection
  
- qs < 6.14.1 (GHSA-6rw7-vpxm-498p)
  └── DoS via memory exhaustion
  
- onesignal-node (multiple vulnerabilities)
  └── Depends on vulnerable versions of request
```

#### Solução:
```bash
# 1. Atualizar dependências
cd /home/root/webapp
npm audit fix --force

# 2. Substituir onesignal-node por @onesignal/node-onesignal
npm uninstall onesignal-node
npm install @onesignal/node-onesignal --save

# 3. Executar audit novamente
npm audit
```

---

### 4. **CORS RESTRITIVO DEMAIS**
**Severidade:** 🟠 **MÉDIA**  
**Impacto:** Falhas em subdomínios e aplicativos mobile

#### Problema:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://localcashback.com.br',
  'https://www.localcashback.com.br',
  'https://cashback.raulricco.com.br'
];
```

❌ **Faltam origens importantes:**
- `https://cashback.churrascariaboidourado.com.br`
- `https://cashback.reservabar.com.br`
- `https://dev-cashback.*`

#### Solução:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://localcashback.com.br',
  'https://www.localcashback.com.br',
  'https://cashback.raulricco.com.br',
  'https://cashback.churrascariaboidourado.com.br',
  'https://cashback.reservabar.com.br',
  /^https:\/\/.*\.localcashback\.com\.br$/, // Wildcard para subdomínios
  /^https:\/\/dev-cashback\..*\.com\.br$/ // Ambiente de dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

### 5. **LOGGING EXCESSIVO EM PRODUÇÃO**
**Severidade:** 🟠 **MÉDIA**  
**Impacto:** Exposição de informações sensíveis

#### Problema:
```bash
# 110 console.log() encontrados no server.js
grep -E "console\.(log|error|warn)" server.js | wc -l
# Output: 110
```

#### Riscos:
- ✅ Logs podem expor dados de clientes
- ✅ Credenciais podem ser logadas acidentalmente
- ✅ Informações de sessão expostas

#### Solução:
```bash
cd /home/root/webapp && npm install winston --save
```

```javascript
// lib/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Não logar em console em produção
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

---

## 🟡 VULNERABILIDADES MÉDIAS (Prioridade MÉDIA)

### 6. **AUSÊNCIA DE HELMET.JS**
**Severidade:** 🟠 **MÉDIA**

#### Problema:
Headers de segurança HTTP não configurados na aplicação Express.

#### Solução:
```bash
cd /home/root/webapp && npm install helmet --save
```

```javascript
// server.js
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

### 7. **USO DE innerHTML**
**Severidade:** 🟠 **MÉDIA**  
**Impacto:** Potencial XSS

#### Locais Encontrados:
```javascript
// src/lib/tracking.js
script.innerHTML = `...`; // ⚠️ Pode permitir XSS

// src/pages/CustomerSignup.jsx
e.target.parentElement.innerHTML = `...`; // ⚠️ Risco de XSS
```

#### Solução:
```javascript
// ✅ Usar textContent ou createElement
script.textContent = `...`;

// ✅ Ou React's dangerouslySetInnerHTML com sanitização
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(htmlContent)
}} />
```

---

### 8. **VARIÁVEIS VITE_ EXPOSTAS NO FRONTEND**
**Severidade:** 🟠 **MÉDIA**

#### Problema:
```bash
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_r2er3hswgfh7...
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
```

⚠️ **TODAS as variáveis VITE_ são expostas no bundle do frontend!**

#### Solução:
```javascript
// ✅ Mover API keys sensíveis para o backend
// .env (backend apenas)
ONESIGNAL_REST_API_KEY=...
RESEND_API_KEY=...

// .env (frontend)
VITE_API_URL=https://localcashback.com.br:3001
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=... // OK expor (anon key é pública)
```

---

### 9. **AUSÊNCIA DE SANITIZAÇÃO DE ENTRADA**
**Severidade:** 🟠 **MÉDIA**

#### Problema:
```javascript
// server.js
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  const { priceId, merchantId, merchantEmail } = req.body;
  // ⚠️ Sem validação/sanitização
});
```

#### Solução:
```bash
cd /home/root/webapp && npm install express-validator --save
```

```javascript
import { body, validationResult } from 'express-validator';

app.post('/api/stripe/create-checkout-session',
  // Validação
  body('priceId').isString().trim().notEmpty(),
  body('merchantId').isUUID(),
  body('merchantEmail').isEmail().normalizeEmail(),
  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Processar requisição...
  }
);
```

---

### 10. **BACKUP DE .ENV EXPOSTO**
**Severidade:** 🟠 **MÉDIA**

#### Problema:
```bash
-rw-r--r-- 1 root root 790 Nov 20 16:32 .env.backup.20251108_170243
```

#### Solução:
```bash
# Remover backups de .env
rm /home/root/webapp/.env.backup.*

# Atualizar .gitignore
echo ".env*" >> /home/root/webapp/.gitignore
echo "!.env.example" >> /home/root/webapp/.gitignore

# Commit
cd /home/root/webapp
git add .gitignore
git commit -m "security: prevent .env backups from being committed"
```

---

## ✅ PONTOS POSITIVOS

### 1. **SSL/TLS Bem Configurado**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
add_header Strict-Transport-Security "max-age=31536000" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
```

### 2. **Autenticação via Supabase**
- ✅ JWT tokens gerenciados pelo Supabase
- ✅ Refresh automático de tokens
- ✅ Persistência segura de sessão

### 3. **Validação de Webhooks Stripe**
```javascript
const event = stripe.webhooks.constructEvent(
  req.body, 
  sig, 
  webhookSecret
); // ✅ Verifica assinatura
```

### 4. **Row Level Security (RLS) no Supabase**
- ✅ Políticas RLS configuradas
- ✅ Multi-tenancy isolado por merchant_id

### 5. **Tratamento de Erros**
- ✅ 42 blocos try/catch no server.js
- ✅ Erros capturados e logados

### 6. **HTTPS em Produção**
- ✅ Certificados Let's Encrypt
- ✅ Renovação automática via Certbot

---

## 📋 CHECKLIST DE CORREÇÕES

### 🔴 CRÍTICO (Fazer AGORA)
- [ ] Alterar permissões do .env (`chmod 600`)
- [ ] Rotacionar todas as API keys expostas
- [ ] Implementar rate limiting
- [ ] Atualizar dependências vulneráveis
- [ ] Remover backups de .env

### 🟠 ALTO (Fazer esta semana)
- [ ] Instalar Helmet.js
- [ ] Adicionar Content Security Policy
- [ ] Implementar input validation
- [ ] Configurar logger profissional (Winston)
- [ ] Adicionar origens faltantes no CORS

### 🟡 MÉDIO (Fazer este mês)
- [ ] Substituir innerHTML por textContent
- [ ] Mover API keys do frontend para backend
- [ ] Implementar monitoramento de segurança
- [ ] Adicionar testes de penetração
- [ ] Documentar políticas de segurança

### 🟢 BAIXO (Backlog)
- [ ] Implementar 2FA
- [ ] Adicionar Web Application Firewall (WAF)
- [ ] Configurar backup automático criptografado
- [ ] Auditoria de código com SonarQube
- [ ] Penetration testing por empresa especializada

---

## 🛡️ RECOMENDAÇÕES DE INFRAESTRUTURA

### 1. **Gerenciamento de Segredos**
```bash
# Migrar para AWS Secrets Manager
aws secretsmanager create-secret --name localcashback/stripe --secret-string '{"key":"sk_live_..."}'

# Ou usar HashiCorp Vault
vault kv put secret/localcashback stripe_key=sk_live_...
```

### 2. **Firewall de Aplicação Web (WAF)**
```nginx
# Instalar ModSecurity no Nginx
apt-get install libnginx-mod-security
```

### 3. **Backup Seguro**
```bash
# Backup diário criptografado
0 2 * * * /usr/local/bin/backup-encrypted.sh
```

### 4. **Monitoramento de Segurança**
- Configurar Datadog Security Monitoring
- Alertas de anomalias em tempo real
- Dashboard de métricas de segurança

---

## 📊 CONFORMIDADE (LGPD/GDPR)

### ⚠️ Itens Pendentes:

1. **Consentimento de Dados**
   - [ ] Implementar banner de cookies
   - [ ] Política de privacidade atualizada
   - [ ] Termos de uso claros

2. **Direito ao Esquecimento**
   - [ ] Endpoint para exclusão de dados
   - [ ] Processo de anonimização

3. **Portabilidade de Dados**
   - [ ] Export de dados do cliente em JSON/CSV
   - [ ] API de acesso a dados pessoais

4. **Registro de Processamento**
   - [ ] Log de acesso a dados sensíveis
   - [ ] Auditoria de modificações

---

## 🔧 SCRIPTS DE CORREÇÃO RÁPIDA

### Script 1: Corrigir Permissões
```bash
#!/bin/bash
# fix-permissions.sh

echo "🔒 Corrigindo permissões de arquivos sensíveis..."

chmod 600 /home/root/webapp/.env
chmod 600 /home/root/webapp/.env.example
chmod 700 /home/root/webapp/logs

echo "✅ Permissões corrigidas!"
```

### Script 2: Rotacionar Chaves
```bash
#!/bin/bash
# rotate-keys.sh

echo "🔄 Rotacionando chaves de API..."

# Backup do .env atual
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Instruções
echo ""
echo "⚠️  AÇÃO MANUAL NECESSÁRIA:"
echo "1. Acesse Supabase Dashboard e gere nova anon key"
echo "2. Acesse Stripe Dashboard e rotacione secret key"
echo "3. Acesse Mailchimp e regenere API key"
echo "4. Acesse OneSignal e gere nova REST API key"
echo ""
echo "Após gerar novas chaves, atualize o arquivo .env"
```

### Script 3: Instalar Dependências de Segurança
```bash
#!/bin/bash
# install-security-deps.sh

cd /home/root/webapp

echo "📦 Instalando bibliotecas de segurança..."

npm install helmet --save
npm install express-rate-limit --save
npm install express-validator --save
npm install winston --save
npm install dompurify --save

echo "✅ Dependências instaladas!"
echo ""
echo "⚠️  PRÓXIMO PASSO:"
echo "Atualize o server.js para usar as novas bibliotecas"
```

---

## 📞 CONTATO PARA SUPORTE DE SEGURANÇA

**Email:** security@localcashback.com.br  
**Documentação:** Este arquivo (`SECURITY-AUDIT-COMPLETE.md`)

---

## 📝 CHANGELOG

- **07/01/2026:** Auditoria completa de segurança realizada
- **Próxima auditoria:** 07/04/2026 (trimestral)

---

**NOTA IMPORTANTE:** Este documento contém informações sensíveis sobre vulnerabilidades de segurança. Mantenha este arquivo privado e não o compartilhe publicamente.

