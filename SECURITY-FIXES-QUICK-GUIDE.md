# 🚨 CORREÇÕES DE SEGURANÇA CRÍTICAS - GUIA RÁPIDO

**ATENÇÃO:** Este guia contém ações CRÍTICAS que devem ser executadas IMEDIATAMENTE.

---

## 🔴 AÇÃO 1: REVOGAR API KEYS EXPOSTAS (15 minutos)

### Stripe

1. Acesse: https://dashboard.stripe.com/apikeys
2. **Revoke** ambas as chaves (Publishable e Secret)
3. Gerar novas chaves
4. Atualizar `.env`:
   ```bash
   nano /home/root/webapp/.env
   # Substituir VITE_STRIPE_PUBLISHABLE_KEY e VITE_STRIPE_SECRET_KEY
   ```

### Supabase

1. Acesse: https://supabase.com/dashboard/project/_/settings/api
2. **Regenerate** a ANON key
3. Copiar nova chave
4. Atualizar `.env`:
   ```bash
   VITE_SUPABASE_ANON_KEY=nova-chave-aqui
   ```

### Resend

1. Acesse: https://resend.com/api-keys
2. **Revoke** chave atual
3. Gerar nova
4. Atualizar `.env`

### OneSignal

1. Acesse: https://dashboard.onesignal.com/
2. Settings → Keys & IDs
3. Regenerar REST API Key
4. Atualizar `.env`

---

## 🔴 AÇÃO 2: CORRIGIR PERMISSÕES DE ARQUIVOS (2 minutos)

```bash
# Proteger .env
chmod 600 /home/root/webapp/.env
chmod 600 /home/root/webapp/cashback-system/.env

# Verificar
ls -la /home/root/webapp/.env
# Deve mostrar: -rw------- (apenas root pode ler/escrever)

# Proteger diretório de produção
chown -R www-data:www-data /var/www/cashback/
chmod -R 750 /var/www/cashback/
```

---

## 🔴 AÇÃO 3: ADICIONAR CSP NO NGINX (5 minutos)

```bash
# Editar config do Nginx
sudo nano /etc/nginx/sites-available/localcashback
```

Adicionar após os outros `add_header`:

```nginx
# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.onesignal.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.stripe.com https://onesignal.com https://*.onesignal.com wss://*.supabase.co; frame-src https://js.stripe.com; worker-src 'self' blob:;" always;

# X-XSS-Protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer-Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Testar e aplicar:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🟡 AÇÃO 4: IMPLEMENTAR RATE LIMITING (10 minutos)

```bash
cd /home/root/webapp
npm install express-rate-limit
```

Adicionar no `server.js` (após as importações):

```javascript
import rateLimit from 'express-rate-limit';

// Rate limiter geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para API de pagamentos (mais restritivo)
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 tentativas de pagamento por hora
  message: 'Limite de tentativas de pagamento excedido.',
});

// Aplicar
app.use('/api/', generalLimiter);
app.use('/api/stripe/create-checkout-session', paymentLimiter);
app.use('/api/stripe/create-portal-session', paymentLimiter);
```

Reiniciar servidor:
```bash
pm2 restart stripe-api
```

---

## 🟡 AÇÃO 5: ADICIONAR VALIDAÇÃO DE INPUTS (15 minutos)

```bash
cd /home/root/webapp
npm install express-validator
```

Adicionar no `server.js`:

```javascript
import { body, param, validationResult } from 'express-validator';

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Dados inválidos', 
      details: errors.array() 
    });
  }
  next();
};

// Exemplo de uso em endpoint de checkout
app.post('/api/stripe/create-checkout-session',
  [
    body('priceId').isString().trim().notEmpty(),
    body('merchantId').isUUID(),
    body('merchantEmail').isEmail().normalizeEmail(),
  ],
  validate,
  async (req, res) => {
    // ... código existente
  }
);

// Exemplo de uso em endpoint com params
app.get('/api/merchants/:merchantId/subscription-status',
  [
    param('merchantId').isUUID()
  ],
  validate,
  async (req, res) => {
    // ... código existente
  }
);
```

---

## 🟡 AÇÃO 6: DESABILITAR server_tokens DO NGINX (1 minuto)

```bash
sudo nano /etc/nginx/nginx.conf
```

Adicionar dentro do bloco `http`:

```nginx
http {
    server_tokens off;  # Oculta versão do Nginx
    # ... resto da config
}
```

Aplicar:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🟢 AÇÃO 7: IMPLEMENTAR LOGGING DE SEGURANÇA (10 minutos)

Adicionar no `server.js`:

```javascript
// Função de log de segurança
const securityLog = (event, req, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    url: req.originalUrl,
    method: req.method,
    ...data
  };
  console.log('[SECURITY]', JSON.stringify(logEntry));
};

// Usar em pontos críticos:

// Login bem-sucedido
securityLog('LOGIN_SUCCESS', req, { email, merchantId });

// Login falhou
securityLog('LOGIN_FAILED', req, { email, reason: 'invalid_password' });

// Tentativa de acesso não autorizado
securityLog('UNAUTHORIZED_ACCESS', req, { resource: '/admin' });

// Webhook recebido
securityLog('WEBHOOK_RECEIVED', req, { type: event.type });

// Pagamento iniciado
securityLog('PAYMENT_INITIATED', req, { merchantId, amount: price });
```

---

## 🟢 AÇÃO 8: CONFIGURAR LOGROTATE (5 minutos)

```bash
sudo nano /etc/logrotate.d/nginx-cashback
```

Adicionar:

```
/var/log/nginx/churrascaria-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}

/var/log/nginx/*cashback*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

Testar:
```bash
sudo logrotate -d /etc/logrotate.d/nginx-cashback
```

---

## 🟢 AÇÃO 9: ADICIONAR PRE-COMMIT HOOK (5 minutos)

Prevenir commit de secrets:

```bash
cd /home/root/webapp
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Criar `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Verificar secrets
echo "🔍 Verificando secrets..."

if grep -r "sk_live_\|sk_test_\|rk_live_\|pk_live_\|pk_test_" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" .; then
  echo "❌ ERRO: API keys detectadas no código!"
  echo "Por favor, use variáveis de ambiente (.env)"
  exit 1
fi

if grep -r "password.*=.*\|secret.*=.*\|api_key.*=.*" --include="*.js" --include="*.jsx" | grep -v "process.env"; then
  echo "⚠️  AVISO: Possível secret detectado!"
  echo "Verifique se está usando variáveis de ambiente"
fi

echo "✅ Verificação de secrets OK"
```

---

## ✅ CHECKLIST DE AÇÕES

### Crítico (Fazer AGORA)
- [ ] Revogar e regenerar todas as API keys
- [ ] Atualizar .env com novas chaves
- [ ] Corrigir permissões de arquivos (chmod 600)
- [ ] Fazer rebuild do frontend
- [ ] Reiniciar servidor Node (pm2 restart)

### Alta Prioridade (Hoje)
- [ ] Adicionar CSP no Nginx
- [ ] Desabilitar server_tokens
- [ ] Recarregar Nginx

### Média Prioridade (Esta semana)
- [ ] Implementar rate limiting
- [ ] Adicionar validação de inputs
- [ ] Implementar logging de segurança
- [ ] Configurar logrotate
- [ ] Adicionar pre-commit hooks

---

## 🔄 REBUILD E RESTART

Após todas as mudanças:

```bash
# 1. Rebuild frontend (se mudou .env do frontend)
cd /home/root/webapp/cashback-system
npm run build

# 2. Deploy
rsync -av --delete dist/ /var/www/cashback/cashback-system/

# 3. Restart backend
cd /home/root/webapp
pm2 restart stripe-api

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Verificar
pm2 status
sudo systemctl status nginx

# 6. Testar
curl -I https://localcashback.com.br
```

---

## 🧪 TESTES DE VERIFICAÇÃO

### 1. Verificar CSP

```bash
curl -I https://localcashback.com.br | grep -i "content-security-policy"
# Deve retornar o header CSP
```

### 2. Verificar Rate Limiting

```bash
# Fazer múltiplas requisições
for i in {1..105}; do curl https://localcashback.com.br/api/health; done
# Após 100 deve retornar erro 429
```

### 3. Verificar Headers

```bash
curl -I https://localcashback.com.br | grep -E "X-Frame|X-Content|X-XSS|Strict-Transport|Referrer"
# Todos devem aparecer
```

### 4. Verificar Permissões

```bash
ls -la /home/root/webapp/.env
# Deve mostrar: -rw------- (600)
```

---

## 📞 EM CASO DE PROBLEMAS

### API keys não funcionam após troca
1. Verificar se copiou corretamente (sem espaços)
2. Verificar se usou chaves de LIVE/TEST corretas
3. Limpar cache do navegador
4. Fazer rebuild do frontend

### Nginx não recarrega
```bash
sudo nginx -t  # Ver erro
sudo systemctl status nginx  # Ver status
sudo journalctl -xe  # Ver logs
```

### Rate limiting muito restritivo
```bash
# Ajustar no server.js:
max: 200,  # Aumentar limite
windowMs: 15 * 60 * 1000,  # Ajustar janela
```

---

## ⏱️ TEMPO TOTAL ESTIMADO

- 🔴 Ações Críticas: ~25 minutos
- 🟡 Ações Alta Prioridade: ~20 minutos
- 🟢 Ações Média Prioridade: ~35 minutos

**Total: ~1h 20min**

---

**Execute as ações CRÍTICAS IMEDIATAMENTE!** 🚨

**Data:** 08/01/2026  
**Versão:** 1.0.0
