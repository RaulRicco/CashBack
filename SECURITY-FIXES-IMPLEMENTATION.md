# 🔧 GUIA DE IMPLEMENTAÇÃO - CORREÇÕES DE SEGURANÇA

## 📌 ORDEM DE EXECUÇÃO

Execute as correções nesta ordem de prioridade:

1. **Correções Críticas** (30 minutos)
2. **Correções de Alta Prioridade** (2 horas)
3. **Correções Médias** (4 horas)

---

## 🚨 FASE 1: CORREÇÕES CRÍTICAS (30 min)

### ✅ 1.1 Corrigir Permissões do .env

```bash
cd /home/root/webapp

# Alterar permissões
chmod 600 .env
chmod 600 .env.example

# Verificar
ls -la .env
# Esperado: -rw------- (600)
```

### ✅ 1.2 Remover Backups Expostos

```bash
cd /home/root/webapp

# Remover backups antigos
rm -f .env.backup.*

# Atualizar .gitignore
cat >> .gitignore << 'EOF'

# Environment files (including backups)
.env*
!.env.example
EOF

# Commit
git add .gitignore
git commit -m "security: prevent .env backups exposure"
```

### ✅ 1.3 Instalar Rate Limiting

```bash
cd /home/root/webapp

# Instalar biblioteca
npm install express-rate-limit --save
```

**Adicionar ao server.js:**

```javascript
// No topo do arquivo
import rateLimit from 'express-rate-limit';

// Após as importações, antes das rotas
// ====================================
// RATE LIMITING
// ====================================

// Rate limiter geral (100 req/15min)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para checkout (10 req/hora)
const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Limite de checkouts atingido. Tente em 1 hora.' }
});

// Rate limiter para emails (20 req/hora)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Limite de envio de emails atingido.' }
});

// Rate limiter para push notifications (50 req/hora)
const pushLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { error: 'Limite de notificações atingido.' }
});

// Aplicar limiters
app.use('/api/', generalLimiter);
app.use('/api/stripe/create-checkout-session', checkoutLimiter);
app.use('/api/stripe/create-checkout', checkoutLimiter);
app.use('/api/resend/send', emailLimiter);
app.use('/api/onesignal/', pushLimiter);
```

### ✅ 1.4 Atualizar Dependências Vulneráveis

```bash
cd /home/root/webapp

# Executar audit
npm audit

# Corrigir automaticamente (cuidado: pode quebrar código)
npm audit fix

# Se houver vulnerabilidades críticas que não podem ser corrigidas:
# Substituir onesignal-node
npm uninstall onesignal-node
npm install @onesignal/node-onesignal --save

# Verificar novamente
npm audit
```

### ✅ 1.5 Testar Aplicação

```bash
cd /home/root/webapp

# Build do frontend
cd cashback-system && npm run build

# Reiniciar backend
cd ..
pm2 restart stripe-api

# Verificar logs
pm2 logs stripe-api --lines 50
```

---

## 🟠 FASE 2: CORREÇÕES DE ALTA PRIORIDADE (2h)

### ✅ 2.1 Instalar Helmet.js

```bash
cd /home/root/webapp
npm install helmet --save
```

**Adicionar ao server.js:**

```javascript
// No topo
import helmet from 'helmet';

// Após express.json(), antes das rotas
// ====================================
// SECURITY HEADERS (HELMET)
// ====================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://*.supabase.co",
        "https://onesignal.com",
        "https://*.mailchimp.com"
      ],
      frameSrc: ["https://js.stripe.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));
```

### ✅ 2.2 Adicionar Input Validation

```bash
cd /home/root/webapp
npm install express-validator --save
```

**Criar arquivo de validação:**

```bash
cat > /home/root/webapp/validators.js << 'EOF'
import { body, param, query, validationResult } from 'express-validator';

// Middleware para processar erros de validação
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Validadores
export const validateCheckoutSession = [
  body('priceId')
    .isString()
    .trim()
    .matches(/^price_[a-zA-Z0-9]+$/)
    .withMessage('Price ID do Stripe inválido'),
  
  body('merchantId')
    .isUUID()
    .withMessage('Merchant ID deve ser um UUID válido'),
  
  body('merchantEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  handleValidationErrors
];

export const validatePortalSession = [
  body('merchantId')
    .isUUID()
    .withMessage('Merchant ID deve ser um UUID válido'),
  
  handleValidationErrors
];

export const validateEmail = [
  body('apiKey')
    .optional()
    .isString()
    .trim(),
  
  body('from')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email remetente inválido'),
  
  body('to')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email destinatário inválido'),
  
  body('subject')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Assunto deve ter entre 1 e 200 caracteres'),
  
  body('html')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Conteúdo HTML muito grande'),
  
  handleValidationErrors
];

export const validateMerchantId = [
  param('merchantId')
    .isUUID()
    .withMessage('Merchant ID deve ser um UUID válido'),
  
  handleValidationErrors
];

export const validateBirthdayQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Dias deve ser entre 1 e 365'),
  
  handleValidationErrors
];

export const validateNotification = [
  body('merchantId')
    .isUUID()
    .withMessage('Merchant ID inválido'),
  
  body('customerId')
    .isUUID()
    .withMessage('Customer ID inválido'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor deve ser positivo'),
  
  handleValidationErrors
];
EOF
```

**Atualizar server.js para usar validadores:**

```javascript
// No topo
import {
  validateCheckoutSession,
  validatePortalSession,
  validateEmail,
  validateMerchantId,
  validateBirthdayQuery,
  validateNotification
} from './validators.js';

// Aplicar nas rotas
app.post('/api/stripe/create-checkout-session', 
  validateCheckoutSession, 
  async (req, res) => {
    // ... código existente
  }
);

app.post('/api/stripe/create-portal-session', 
  validatePortalSession, 
  async (req, res) => {
    // ... código existente
  }
);

app.post('/api/resend/send', 
  validateEmail, 
  async (req, res) => {
    // ... código existente
  }
);

app.get('/api/stripe/subscription-status/:merchantId', 
  validateMerchantId, 
  async (req, res) => {
    // ... código existente
  }
);

app.get('/api/birthday/upcoming', 
  validateBirthdayQuery, 
  async (req, res) => {
    // ... código existente
  }
);

app.post('/api/onesignal/notify-cashback', 
  validateNotification, 
  async (req, res) => {
    // ... código existente
  }
);
```

### ✅ 2.3 Configurar Logger Profissional

```bash
cd /home/root/webapp
npm install winston --save
```

**Criar arquivo de logger:**

```bash
cat > /home/root/webapp/logger.js << 'EOF'
import winston from 'winston';
import path from 'path';

const logDir = 'logs';

// Criar diretório de logs se não existir
import fs from 'fs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Formato customizado
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` | ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Criar logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    // Erros em arquivo separado
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Todos os logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Adicionar console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    )
  }));
}

// Funções helper
export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

export const logError = (message, error = null, meta = {}) => {
  if (error) {
    logger.error(message, { ...meta, error: error.message, stack: error.stack });
  } else {
    logger.error(message, meta);
  }
};

export const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

export const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

export default logger;
EOF
```

**Substituir console.log por logger no server.js:**

```javascript
// No topo
import logger, { logInfo, logError, logWarn } from './logger.js';

// Substituir console.log
// ANTES: console.log('✅ Servidor rodando na porta', PORT);
// DEPOIS:
logInfo(`✅ Servidor rodando na porta ${PORT}`);

// ANTES: console.error('Erro:', err);
// DEPOIS:
logError('Erro ao processar requisição', err);
```

### ✅ 2.4 Atualizar CORS com Subdomínios

**No server.js:**

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://localcashback.com.br',
  'https://www.localcashback.com.br',
  'https://cashback.raulricco.com.br',
  'https://cashback.churrascariaboidourado.com.br',
  'https://cashback.reservabar.com.br',
  /^https:\/\/.*\.localcashback\.com\.br$/,
  /^https:\/\/dev-cashback\..*\.com\.br$/,
  /^https:\/\/cashback-dev\..*\.com\.br$/
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
      logWarn('CORS blocked origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## 🟡 FASE 3: TESTES E DEPLOY (30 min)

### ✅ 3.1 Build e Test

```bash
cd /home/root/webapp

# Build frontend
cd cashback-system
npm run build

# Deploy
cd ..
rsync -av --delete cashback-system/dist/ /var/www/cashback/cashback-system/

# Reiniciar backend
pm2 restart stripe-api

# Verificar logs
pm2 logs stripe-api --lines 100 | grep -E "ERROR|WARN"
```

### ✅ 3.2 Testar Endpoints

```bash
# Teste 1: Health check
curl https://localcashback.com.br:3001/api/health

# Teste 2: Rate limiting (deve bloquear após 100 req)
for i in {1..105}; do
  curl -s https://localcashback.com.br:3001/api/health > /dev/null
  echo "Request $i"
done

# Teste 3: Validação de entrada (deve retornar 400)
curl -X POST https://localcashback.com.br:3001/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId": "invalid", "merchantId": "not-uuid", "merchantEmail": "invalid-email"}'

# Deve retornar:
# { "error": "Dados inválidos", "details": [...] }
```

### ✅ 3.3 Verificar Logs

```bash
cd /home/root/webapp

# Ver logs de erro
tail -f logs/error.log

# Ver logs gerais
tail -f logs/combined.log

# Verificar se não há console.log em produção
pm2 logs stripe-api --lines 20 | grep "console"
# Não deve retornar nada
```

---

## 📊 VERIFICAÇÃO FINAL

### Checklist de Segurança:

```bash
cd /home/root/webapp

# 1. Permissões corretas
ls -la .env
# Esperado: -rw------- (600)

# 2. Rate limiting funcionando
curl -I https://localcashback.com.br:3001/api/health
# Esperado: X-RateLimit-Limit, X-RateLimit-Remaining

# 3. Security headers
curl -I https://localcashback.com.br
# Esperado: Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options

# 4. CORS configurado
curl -H "Origin: https://cashback.churrascariaboidourado.com.br" \
  -I https://localcashback.com.br:3001/api/health
# Esperado: Access-Control-Allow-Origin

# 5. Input validation
curl -X POST https://localcashback.com.br:3001/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId": "invalid"}'
# Esperado: 400 Bad Request

# 6. Logs funcionando
ls -la logs/
# Esperado: error.log, combined.log

# 7. Vulnerabilidades corrigidas
npm audit --production
# Esperado: 0 vulnerabilidades críticas
```

---

## 🔄 ROTAÇÃO DE CHAVES (CRÍTICO!)

### ⚠️ APÓS IMPLEMENTAR AS CORREÇÕES, ROTACIONE TODAS AS CHAVES:

#### 1. Supabase
```
1. Acesse https://supabase.com/dashboard
2. Projeto: LocalCashback
3. Settings → API
4. Gere nova anon key
5. Atualize VITE_SUPABASE_ANON_KEY no .env
```

#### 2. Stripe
```
1. Acesse https://dashboard.stripe.com
2. Developers → API keys
3. Create restricted key
4. Atualize VITE_STRIPE_SECRET_KEY no .env
5. Regenere STRIPE_WEBHOOK_SECRET
```

#### 3. Mailchimp
```
1. Acesse https://mailchimp.com
2. Account → Extras → API keys
3. Create A Key
4. Atualize MAILCHIMP_API_KEY no .env
```

#### 4. OneSignal
```
1. Acesse https://onesignal.com
2. Settings → Keys & IDs
3. Regenerate REST API Key
4. Atualize ONESIGNAL_REST_API_KEY no .env
```

#### 5. Resend
```
1. Acesse https://resend.com/api-keys
2. Create API Key
3. Atualize VITE_RESEND_API_KEY no .env
```

### Após rotacionar todas as chaves:

```bash
cd /home/root/webapp

# Reiniciar todos os serviços
pm2 restart all

# Rebuild frontend
cd cashback-system
npm run build

# Deploy
cd ..
rsync -av --delete cashback-system/dist/ /var/www/cashback/cashback-system/

# Recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx

# Verificar
pm2 logs stripe-api --lines 50
```

---

## ✅ COMMIT DAS MUDANÇAS

```bash
cd /home/root/webapp

# Stage files
git add server.js validators.js logger.js .gitignore

# Commit
git commit -m "security: implement critical security fixes

- Add rate limiting to prevent DDoS and brute force
- Install Helmet.js for security headers
- Add input validation with express-validator
- Configure Winston logger for production
- Update CORS to include all subdomains
- Fix .env file permissions
- Remove exposed .env backups

BREAKING CHANGES:
- Updated dependencies (npm audit fix)
- Added new validation layer (may affect API clients)
- Changed logging system (console.log → Winston)

Addresses: SECURITY-AUDIT-COMPLETE.md"

# Push
git push origin genspark_ai_developer
```

---

## 📞 SUPORTE

Se encontrar problemas durante a implementação:

1. Verifique os logs: `pm2 logs stripe-api`
2. Teste rollback: `git checkout HEAD~1`
3. Consulte: `SECURITY-AUDIT-COMPLETE.md`

---

**TEMPO TOTAL ESTIMADO:** 3-4 horas  
**PRÓXIMA AUDITORIA:** 07/04/2026 (trimestral)
