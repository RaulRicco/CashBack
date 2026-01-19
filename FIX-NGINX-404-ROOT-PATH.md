# 🔧 FIX: Site com erro 404 após deploy

**Data:** 2026-01-03  
**Problema:** Todas as páginas retornando 404 Not Found  
**Status:** ✅ **RESOLVIDO**

---

## 🔍 **PROBLEMA**

Após fazer deploy do frontend com `rsync`, todos os domínios ficaram fora do ar:

```
404 Not Found
nginx/1.18.0 (Ubuntu)
```

---

## 🎯 **CAUSA RAIZ**

### Comando de Deploy:
```bash
rsync -av --delete cashback-system/dist/ /var/www/cashback/cashback-system/
```

Esse comando copia o **conteúdo** de `dist/` para `/var/www/cashback/cashback-system/` (sem criar subpasta `dist`).

### Configuração NGINX (INCORRETA):
```nginx
root /var/www/cashback/cashback-system/dist;  # ❌ Pasta não existe!
```

O NGINX estava procurando em `/var/www/cashback/cashback-system/dist/`, mas os arquivos estavam em `/var/www/cashback/cashback-system/`.

---

## ✅ **SOLUÇÃO**

### Correção Aplicada:

```bash
# Corrigir ambos os domínios
sudo sed -i 's|root /var/www/cashback/cashback-system/dist;|root /var/www/cashback/cashback-system;|g' /etc/nginx/sites-available/localcashback

sudo sed -i 's|root /var/www/cashback/cashback-system/dist;|root /var/www/cashback/cashback-system;|g' /etc/nginx/sites-available/cashback.raulricco.com.br

# Validar configuração
sudo nginx -t

# Recarregar NGINX
sudo systemctl reload nginx
```

### Resultado:
```
✅ HTTP 200 OK
✅ Site online: https://localcashback.com.br
✅ Site online: https://cashback.raulricco.com.br
```

---

## 📋 **TESTES**

```bash
# Teste 1: localcashback.com.br
curl -I https://localcashback.com.br
# HTTP/2 200 ✅

# Teste 2: cashback.raulricco.com.br
curl -I https://cashback.raulricco.com.br
# HTTP/2 200 ✅
```

---

## 🔧 **CONFIGURAÇÃO NGINX CORRETA**

### `/etc/nginx/sites-available/localcashback`
```nginx
server {
    listen 443 ssl http2;
    server_name localcashback.com.br www.localcashback.com.br;
    
    # ✅ CORRETO: Sem /dist no final
    root /var/www/cashback/cashback-system;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### `/etc/nginx/sites-available/cashback.raulricco.com.br`
```nginx
server {
    listen 443 ssl http2;
    server_name cashback.raulricco.com.br;
    
    # ✅ CORRETO: Sem /dist no final
    root /var/www/cashback/cashback-system;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📚 **LIÇÕES APRENDIDAS**

### ❌ **O que NÃO fazer:**
```bash
# Copiar com trailing slash (/) no destino cria inconsistência
rsync -av --delete dist/ /var/www/app/
# Arquivos vão para: /var/www/app/index.html

# Mas NGINX aponta para:
root /var/www/app/dist;  # ❌ Não existe!
```

### ✅ **O que fazer:**

**Opção 1:** Copiar mantendo estrutura
```bash
rsync -av --delete dist /var/www/app/
# Arquivos vão para: /var/www/app/dist/index.html
# NGINX: root /var/www/app/dist; ✅
```

**Opção 2:** Copiar conteúdo e ajustar NGINX (atual)
```bash
rsync -av --delete dist/ /var/www/app/
# Arquivos vão para: /var/www/app/index.html
# NGINX: root /var/www/app; ✅
```

---

## ✅ **CONCLUSÃO**

**Problema:** NGINX apontava para `/dist` que não existia  
**Solução:** Removido `/dist` da configuração do NGINX  
**Status:** ✅ Sites online e funcionando  

**URLs:**
- https://localcashback.com.br ✅
- https://cashback.raulricco.com.br ✅

---

**Criado em:** 2026-01-03  
**Tempo de resolução:** ~2 minutos  
**Impacto:** Sites restaurados ✅
