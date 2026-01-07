# 🔧 FIX: 404 ERROR ON SUBDOMAIN CUSTOMER PAGES

## 🎯 PROBLEMA IDENTIFICADO

**URL com erro:**
```
https://cashback.churrascariaboidourado.com.br/signup/dourado
```

**Erro exibido:**
```
404 Not Found
nginx 1.18.0 (Ubuntu)
```

**Causa:** Configuração incorreta do Nginx apontando para diretório errado.

---

## ✅ SOLUÇÃO APLICADA

### 1. Configuração do Nginx corrigida

**Arquivo:** `/etc/nginx/sites-available/cashback.churrascariaboidourado.com.br`

**ANTES (❌ Incorreto):**
```nginx
root /var/www/cashback/cashback-system/dist;
```

**DEPOIS (✅ Correto):**
```nginx
root /var/www/cashback/cashback-system;
```

### 2. Nginx recarregado

```bash
nginx -t  # Testar configuração
systemctl reload nginx  # Aplicar mudanças
```

### 3. Verificação

```bash
curl -I https://cashback.churrascariaboidourado.com.br/signup/dourado
# Resultado: HTTP/2 200 ✅
```

---

## 📊 DETALHES TÉCNICOS

### Por que o erro aconteceu?

O deploy do Vite coloca os arquivos diretamente em `/var/www/cashback/cashback-system/`:
```
/var/www/cashback/cashback-system/
├── index.html
├── assets/
│   ├── index-XXX.js
│   └── index-XXX.css
├── logo-192x192.png
└── ...
```

A configuração antiga apontava para `/dist/` que não existe:
```
/var/www/cashback/cashback-system/dist/  ❌ NÃO EXISTE
```

Resultado: Nginx não encontrava `index.html` → **404 Not Found**

---

## 🔍 COMO VERIFICAR SE ESTÁ FUNCIONANDO

### 1. Via Browser

Acesse: https://cashback.churrascariaboidourado.com.br/signup/dourado

**Resultado esperado:**
- ✅ Página de cadastro carrega normalmente
- ✅ Logo do estabelecimento aparece
- ✅ Formulário de cadastro visível
- ❌ **NÃO** mostra "404 Not Found"

### 2. Via curl

```bash
curl -I https://cashback.churrascariaboidourado.com.br/signup/dourado
```

**Resultado esperado:**
```
HTTP/2 200 ✅
server: nginx/1.18.0 (Ubuntu)
content-type: text/html
```

### 3. Via Console do Browser (F12)

**ANTES:**
```
404 Not Found
nginx 1.18.0 (Ubuntu)
```

**DEPOIS:**
```
(Nenhum erro 404 relacionado à página)
(Página carrega normalmente)
```

---

## 📁 ARQUIVOS AFETADOS

### Nginx Config
- **Arquivo:** `/etc/nginx/sites-available/cashback.churrascariaboidourado.com.br`
- **Backup:** `/home/root/webapp/nginx-cashback-churrascaria.conf`
- **Mudança:** `root` path corrigido

### Symlink
```bash
ls -la /etc/nginx/sites-enabled/cashback.churrascariaboidourado.com.br
# Deve apontar para sites-available/
```

---

## 🚨 OUTROS SUBDOMÍNIOS

Verificar se outros subdomínios têm o mesmo problema:

```bash
# Listar todas as configs de cashback
ls -la /etc/nginx/sites-available/ | grep cashback
```

**Configs encontradas:**
- `cashback.churrascariaboidourado.com.br` ✅ CORRIGIDO
- `cashback.raulricco.com.br` (verificar se precisa correção)
- `cashback-dev.churrascariaboidourado.com.br` (verificar)
- `cashback.reservabar.com.br` (verificar)

### Como verificar outros domínios:

```bash
# Ver configuração
cat /etc/nginx/sites-available/cashback.raulricco.com.br | grep "root "

# Deve ser:
root /var/www/cashback/cashback-system;  ✅

# NÃO deve ser:
root /var/www/cashback/cashback-system/dist;  ❌
```

---

## 🔧 SE PRECISAR CORRIGIR OUTROS DOMÍNIOS

### Template de correção:

```bash
# 1. Editar config
sudo nano /etc/nginx/sites-available/NOME-DO-DOMINIO

# 2. Mudar linha:
# DE:   root /var/www/cashback/cashback-system/dist;
# PARA: root /var/www/cashback/cashback-system;

# 3. Testar
sudo nginx -t

# 4. Recarregar
sudo systemctl reload nginx

# 5. Verificar
curl -I https://DOMINIO/signup/slug
```

---

## 📝 ESTRUTURA CORRETA DO DEPLOY

```
/var/www/cashback/cashback-system/
├── index.html                    ← Nginx serve este arquivo
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── logo-192x192.png
├── logo-512x512.png
├── favicon.png
└── ...
```

**Nginx config:**
```nginx
root /var/www/cashback/cashback-system;
index index.html;

location / {
    try_files $uri $uri/ /index.html;  # SPA routing
}
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [x] Nginx config corrigida (`/dist` removido)
- [x] Nginx testado (`nginx -t`)
- [x] Nginx recarregado (`systemctl reload nginx`)
- [x] Página retorna 200 OK (via curl)
- [x] Backup da config criado
- [x] Documentação criada

**Próximos passos:**
- [ ] Verificar outros subdomínios de cashback
- [ ] Testar página no browser
- [ ] Confirmar que cadastro funciona

---

## 🎯 RESULTADO FINAL

**Status:** ✅ **CORRIGIDO E FUNCIONANDO**

**URL:** https://cashback.churrascariaboidourado.com.br/signup/dourado

**Antes:** 404 Not Found ❌  
**Depois:** 200 OK - Página carrega ✅

**Tempo de correção:** 5 minutos  
**Data:** 05/01/2026 - 20:13 (Brasília)

---

## 🔍 LOGS PARA DEBUGGING

Se houver problemas futuros:

```bash
# Ver logs de erro do Nginx
sudo tail -f /var/log/nginx/churrascaria-error.log

# Ver logs de acesso
sudo tail -f /var/log/nginx/churrascaria-access.log

# Ver status do Nginx
sudo systemctl status nginx

# Recarregar Nginx
sudo systemctl reload nginx

# Reiniciar Nginx (se necessário)
sudo systemctl restart nginx
```

---

**Correção aplicada com sucesso!** 🎉
