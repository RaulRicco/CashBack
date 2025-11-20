# 🌐 Guia de Domínios Personalizados com SSL

Este guia explica como configurar domínios personalizados para merchants com SSL automático.

---

## 📋 Pré-requisitos

1. **DNS Configurado**: O domínio deve apontar para o servidor
   - Tipo A: `dominio.com.br` → `31.97.167.88`
   - ou CNAME: `dominio.com.br` → `localcashback.com.br`

2. **Portas Abertas**: 
   - Porta 80 (HTTP) - para validação SSL
   - Porta 443 (HTTPS) - para tráfego seguro

3. **Certbot Instalado**: Let's Encrypt para SSL gratuito

---

## 🚀 Uso Rápido

### Configurar Novo Domínio

```bash
bash /var/www/cashback/setup-custom-domain.sh dominio.com.br
```

**Exemplo:**
```bash
bash /var/www/cashback/setup-custom-domain.sh cashback.reservabar.com.br
```

O script vai:
1. ✅ Verificar se DNS aponta para o servidor
2. ✅ Criar configuração Nginx
3. ✅ Gerar certificado SSL com Let's Encrypt
4. ✅ Configurar HTTPS com redirecionamento automático
5. ✅ Ativar o domínio

---

## 🔍 Verificar Domínio Existente

### Ver configuração Nginx:
```bash
cat /etc/nginx/sites-available/dominio.com.br
```

### Ver certificado SSL:
```bash
ls -la /etc/letsencrypt/live/dominio.com.br
```

### Testar SSL:
```bash
curl -I https://dominio.com.br
```

ou no navegador:
```
https://dominio.com.br
```

---

## 🔄 Renovação de Certificados

Os certificados são renovados **automaticamente** pelo Certbot.

### Testar renovação:
```bash
certbot renew --dry-run
```

### Forçar renovação manual:
```bash
certbot renew
```

### Ver quando expira:
```bash
certbot certificates
```

---

## 🛠️ Resolução de Problemas

### Problema 1: "DNS não aponta para servidor"

**Causa**: O domínio não está configurado no DNS do registrador.

**Solução**:
1. Acesse o painel do registrador (Registro.br, GoDaddy, etc)
2. Configure:
   - **Tipo A**: `dominio.com.br` → `31.97.167.88`
   - ou **CNAME**: `dominio.com.br` → `localcashback.com.br`
3. Aguarde propagação (pode levar até 24h, geralmente 5-30 minutos)
4. Teste: `nslookup dominio.com.br`

---

### Problema 2: "Erro ao gerar certificado SSL"

**Causas comuns**:
- DNS ainda não propagou
- Porta 80 não está acessível
- Já existe certificado para o domínio

**Solução**:
```bash
# Verificar DNS
nslookup dominio.com.br

# Testar porta 80
curl http://dominio.com.br

# Tentar gerar certificado manualmente
certbot --nginx -d dominio.com.br
```

---

### Problema 3: "Site não carrega (502 Bad Gateway)"

**Causa**: Proxy não está rodando ou configuração errada.

**Solução**:
```bash
# Verificar se proxy está rodando
pm2 status

# Reiniciar proxy
pm2 restart integration-proxy

# Ver logs
pm2 logs integration-proxy
```

---

### Problema 4: "Certificado expirado"

**Causa**: Renovação automática falhou.

**Solução**:
```bash
# Renovar manualmente
certbot renew

# Recarregar Nginx
systemctl reload nginx

# Verificar renovação automática
systemctl status certbot.timer
```

---

## 📝 Remover Domínio

Se precisar remover um domínio:

```bash
# 1. Desativar site
rm /etc/nginx/sites-enabled/dominio.com.br

# 2. Remover configuração
rm /etc/nginx/sites-available/dominio.com.br

# 3. Revogar certificado (opcional)
certbot revoke --cert-path /etc/letsencrypt/live/dominio.com.br/cert.pem

# 4. Remover certificado
certbot delete --cert-name dominio.com.br

# 5. Recarregar Nginx
systemctl reload nginx
```

---

## 📊 Listar Todos os Domínios

### Ver domínios configurados:
```bash
ls -la /etc/nginx/sites-available/
```

### Ver certificados SSL:
```bash
certbot certificates
```

---

## 🔐 Segurança

O script configura automaticamente:

- ✅ **HTTPS obrigatório** - Redirecionamento automático HTTP → HTTPS
- ✅ **TLS 1.2 e 1.3** - Protocolos modernos
- ✅ **HSTS** - Strict-Transport-Security
- ✅ **X-Frame-Options** - Proteção contra clickjacking
- ✅ **X-Content-Type-Options** - Proteção contra MIME sniffing

---

## 📚 Exemplos de Uso

### Configurar domínio para Reserva Bar:
```bash
bash /var/www/cashback/setup-custom-domain.sh cashback.reservabar.com.br
```

### Configurar domínio para outro merchant:
```bash
bash /var/www/cashback/setup-custom-domain.sh cashback.outrocliente.com.br
```

### Verificar se está funcionando:
```bash
# Ver se tem certificado
ls -la /etc/letsencrypt/live/cashback.reservabar.com.br

# Testar HTTPS
curl -I https://cashback.reservabar.com.br

# Ver configuração Nginx
cat /etc/nginx/sites-available/cashback.reservabar.com.br
```

---

## ⚡ Comandos Úteis

```bash
# Ver todos os sites ativos
ls -la /etc/nginx/sites-enabled/

# Ver todos os certificados
certbot certificates

# Testar configuração Nginx
nginx -t

# Recarregar Nginx
systemctl reload nginx

# Ver logs do Nginx
tail -f /var/log/nginx/error.log

# Ver logs de acesso de um domínio específico
tail -f /var/log/nginx/dominio.com.br-access.log
```

---

## 🎯 Checklist de Configuração

Antes de configurar um domínio, confirme:

- [ ] DNS está configurado no registrador
- [ ] DNS propagou (teste com `nslookup`)
- [ ] Portas 80 e 443 estão abertas no firewall
- [ ] Sistema Cashback está rodando (`pm2 status`)
- [ ] Nginx está funcionando (`systemctl status nginx`)

Depois de configurar, confirme:

- [ ] Site carrega com HTTPS
- [ ] Certificado SSL válido (cadeado verde no navegador)
- [ ] Redirecionamento HTTP → HTTPS funciona
- [ ] API funciona (`/api/*` routes)
- [ ] OneSignal carrega corretamente

---

## 📞 Suporte

Se tiver problemas, verifique:

1. **Logs do Nginx**: `/var/log/nginx/error.log`
2. **Logs do Certbot**: `/var/log/letsencrypt/letsencrypt.log`
3. **Logs do Proxy**: `pm2 logs integration-proxy`

---

**✨ Pronto! Agora você pode configurar domínios personalizados com SSL automaticamente!**
