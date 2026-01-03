# ✅ FIX: NGINX PROXY PORT - ERRO 502 MAILCHIMP

**Data**: 03/01/2026  
**Status**: ✅ **RESOLVIDO**

---

## 🔍 **PROBLEMA IDENTIFICADO**

### Sintoma
- ❌ Erro **502 Bad Gateway** ao sincronizar clientes com Mailchimp
- ❌ Erro no log de integração: `Request failed with status code 502`
- ✅ Endpoint `/api/mailchimp/sync` funcionava em testes diretos
- ❌ Falhava apenas através do NGINX em `cashback.raulricco.com.br`

### Erro no Log do NGINX
```
[error] connect() failed (111: Unknown error) while connecting to upstream
upstream: "http://127.0.0.1:3002/mailchimp/sync"
host: "cashback.raulricco.com.br"
```

---

## 🔍 **CAUSA RAIZ**

### Configuração NGINX Incorreta

**Arquivo**: `/etc/nginx/sites-available/cashback.raulricco.com.br`

**Antes** (ERRADO):
```nginx
location /api/ {
    proxy_pass http://localhost:3002/;  # ❌ PORTA ERRADA
    ...
}
```

**Backend Rodando na Porta**: `3001`  
**NGINX Tentando Conectar na Porta**: `3002` ❌

### Por Que Funcionava em `localcashback.com.br`?

O arquivo `/etc/nginx/sites-available/localcashback` tinha a configuração correta:
```nginx
location /api/ {
    proxy_pass http://localhost:3001/api/;  # ✅ CORRETO
    ...
}
```

---

## ✅ **SOLUÇÃO APLICADA**

### 1. Corrigir Porta do Proxy

**Comando**:
```bash
sudo sed -i 's|proxy_pass http://localhost:3002/;|proxy_pass http://localhost:3001/api/;|g' \
  /etc/nginx/sites-available/cashback.raulricco.com.br
```

**Depois** (CORRETO):
```nginx
location /api/ {
    proxy_pass http://localhost:3001/api/;  # ✅ CORRETO
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
}
```

### 2. Validar Configuração
```bash
sudo nginx -t
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 3. Recarregar NGINX
```bash
sudo systemctl reload nginx
```

---

## 🧪 **VALIDAÇÃO**

### Teste 1: `localcashback.com.br` (já funcionava)
```bash
curl -X POST https://localcashback.com.br/api/mailchimp/sync \
  -d '{"customer":{"email":"teste@localcashback.com.br","name":"Test","phone":"11999999999"}}'
```

**Resultado**: ✅ HTTP 200 - 0.94s

### Teste 2: `cashback.raulricco.com.br` (estava com erro)
```bash
curl -X POST https://cashback.raulricco.com.br/api/mailchimp/sync \
  -d '{"customer":{"email":"teste.fix@localcashback.com.br","name":"Test Fix","phone":"11888888888"}}'
```

**Resultado ANTES**: ❌ HTTP 502 Bad Gateway  
**Resultado DEPOIS**: ✅ HTTP 200 - 0.63s

---

## 📊 **IMPACTO**

### Antes da Correção
| Domínio | Endpoint Mailchimp | Status |
|---------|-------------------|--------|
| `localcashback.com.br` | `/api/mailchimp/sync` | ✅ Funcionando |
| `cashback.raulricco.com.br` | `/api/mailchimp/sync` | ❌ Erro 502 |

### Depois da Correção
| Domínio | Endpoint Mailchimp | Status |
|---------|-------------------|--------|
| `localcashback.com.br` | `/api/mailchimp/sync` | ✅ Funcionando |
| `cashback.raulricco.com.br` | `/api/mailchimp/sync` | ✅ Funcionando |

---

## 📝 **LOGS DE ERRO (RESOLVIDOS)**

### Antes (Erro no NGINX)
```
2026/01/03 01:16:14 [error] connect() failed (111: Unknown error) while connecting to upstream
client: 187.43.171.174
server: cashback.raulricco.com.br
request: "POST /api/mailchimp/sync HTTP/2.0"
upstream: "http://127.0.0.1:3002/mailchimp/sync"  # ❌ Porta 3002
```

### Depois (Sem Erros)
```
# Nenhum erro 502 nos logs após a correção ✅
```

---

## 🎯 **RESUMO**

| Item | Status |
|------|--------|
| **Problema** | NGINX proxy na porta errada (3002 em vez de 3001) |
| **Causa** | Configuração incorreta em `cashback.raulricco.com.br` |
| **Solução** | Corrigir porta de 3002 para 3001 |
| **Validação** | ✅ Ambos os domínios funcionando |
| **Tempo de Resposta** | < 1 segundo |

---

## 🚀 **PRÓXIMOS PASSOS**

### 1. ✅ Testar Fluxo Completo de Cadastro
1. Acessar: https://cashback.raulricco.com.br/signup/bardoraul
2. Fazer cadastro como cliente
3. Verificar se o Mailchimp sincroniza com sucesso
4. Verificar logs de integração no Supabase

### 2. 📊 Monitorar Logs
```bash
# Verificar logs NGINX em tempo real
sudo tail -f /var/log/nginx/error.log | grep -E "502|mailchimp"

# Verificar logs PM2
pm2 logs stripe-api --lines 50 | grep -i mailchimp
```

### 3. 🔧 Melhorias Opcionais
- Adicionar timeout maior no NGINX (já tem 300s)
- Adicionar retry automático no frontend
- Adicionar alertas para erros 502

---

## 📚 **DOCUMENTAÇÃO RELACIONADA**

- `FIX-MAILCHIMP-SYNC-ENDPOINT.md` - Criação do endpoint /api/mailchimp/sync
- `DEPLOY-ONESIGNAL-PRODUCAO.md` - Deploy completo OneSignal + Mailchimp
- `ONESIGNAL-MAILCHIMP-FINALIZACAO.md` - Resumo final da implementação

---

**Problema Resolvido**: ✅  
**Sistema Testado**: ✅  
**Pronto para Produção**: ✅

---

**Autor**: GenSpark AI Developer  
**Commit**: Pendente  
