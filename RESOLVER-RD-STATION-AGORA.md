# 🚨 RESOLVER ERRO 500 RD STATION - PASSO A PASSO

## ⚡ RÁPIDO: Execute primeiro (copia e cola)

```bash
cd /var/www/cashback/cashback-system
./TESTE-SIMPLES-RD.sh
```

**O que isso faz:** Testa se o proxy funciona diretamente e através do nginx.

---

## 📋 DIAGNÓSTICO COMPLETO (se precisar de mais detalhes)

```bash
cd /var/www/cashback/cashback-system
./DIAGNOSTICO-RD-STATION-500.sh
```

**O que isso faz:** Mostra status completo (proxy, nginx, logs, portas, etc).

---

## 🔍 CENÁRIOS POSSÍVEIS

### ✅ CENÁRIO 1: Proxy funciona direto, mas não através do nginx

**Sintoma:**
- ✅ Teste 1 (localhost:3001) = `"success":true`
- ❌ Teste 2 (https://localcashback.com.br/api/...) = erro ou `"success":false`

**Solução: Problema no roteamento do nginx**

```bash
# 1. Ver configuração atual do nginx
sudo cat /etc/nginx/sites-available/localcashback | grep -A 15 "location /api/"

# 2. Verificar se nginx está rodando
sudo systemctl status nginx

# 3. Testar configuração
sudo nginx -t

# 4. Se tudo OK, recarregar
sudo systemctl reload nginx
```

---

### ❌ CENÁRIO 2: Proxy não funciona nem direto

**Sintoma:**
- ❌ Teste 1 (localhost:3001) = erro de conexão ou timeout

**Solução: Proxy não está rodando**

```bash
# 1. Ver status do PM2
pm2 list

# 2. Se integration-proxy não está rodando:
pm2 start integration-proxy.js --name integration-proxy

# 3. Ver logs
pm2 logs integration-proxy --lines 20
```

---

### 🔇 CENÁRIO 3: Proxy roda mas logs estão vazios

**Sintoma:**
- ✅ Teste 1 funciona
- ❌ Teste 2 funciona MAS logs do proxy estão vazios
- ❌ Usuário no navegador vê erro 500

**Solução: Requisições do frontend não chegam ao proxy**

**Possíveis causas:**
1. **Cache do navegador** (mais provável)
2. **Outro serviço interceptando /api/**
3. **Frontend compilado com código antigo**

**Teste de cache:**
```bash
# 1. Ver quando foi o último build
stat /var/www/cashback/cashback-system/dist/index.html | grep Modify

# 2. Verificar se código compilado está correto
grep -o "window.location.protocol" /var/www/cashback/cashback-system/dist/assets/*.js | wc -l
# Deve retornar número > 0

grep ":3001" /var/www/cashback/cashback-system/dist/assets/*.js
# NÃO deve retornar nada (ou só em comentários)
```

**Forçar novo build:**
```bash
cd /var/www/cashback/cashback-system
npm run build
sudo systemctl reload nginx

# Adicionar header no nginx para evitar cache
sudo nano /etc/nginx/sites-available/localcashback
# Adicione dentro do bloco 'location /':
#   add_header Cache-Control "no-cache, no-store, must-revalidate";
#   add_header Pragma "no-cache";
#   add_header Expires "0";

sudo nginx -t && sudo systemctl reload nginx
```

---

### 🌐 CENÁRIO 4: Descobrir exatamente o que nginx está fazendo

**Ativar logs detalhados:**

```bash
./ATIVAR-LOG-DEBUG-NGINX.sh
```

**Depois siga as instruções do script para:**
1. Editar configuração do nginx
2. Adicionar logs específicos para /api/
3. Monitorar em tempo real

**Monitorar logs:**
```bash
# Terminal 1: Ver requisições chegando
sudo tail -f /var/log/nginx/api-access.log

# Terminal 2: Ver erros
sudo tail -f /var/log/nginx/api-error.log

# Terminal 3: Ver logs do proxy
pm2 logs integration-proxy --lines 0 --raw
```

**Agora teste no navegador e veja EXATAMENTE onde para.**

---

## 🎯 TESTE FINAL (depois de qualquer mudança)

```bash
# 1. Teste rápido
./TESTE-SIMPLES-RD.sh

# 2. No navegador, abra DevTools (F12)
# 3. Vá em Network
# 4. Teste conexão RD Station
# 5. Veja a requisição /api/rdstation/test
# 6. Verifique:
#    - Status Code (deve ser 200, não 500)
#    - Response Headers (procure por X-Debug-Proxy)
#    - Response Body (deve ter "success": true)
```

---

## ❓ AINDA NÃO FUNCIONOU?

**Cole aqui a saída completa de:**

```bash
./DIAGNOSTICO-RD-STATION-500.sh
```

**E também:**

```bash
# Ver últimos 20 logs do nginx
sudo tail -20 /var/log/nginx/access.log

# Ver headers da resposta
curl -I -k https://localcashback.com.br/api/rdstation/test

# Ver se há outro processo na porta 3001
sudo lsof -i :3001
```

---

## 🚀 COMANDOS ÚTEIS PARA COPIAR E COLAR

```bash
# Reiniciar proxy
pm2 restart integration-proxy

# Ver logs do proxy em tempo real
pm2 logs integration-proxy --lines 0

# Recarregar nginx
sudo systemctl reload nginx

# Testar proxy direto
curl http://localhost:3001/api/rdstation/test \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"924c4bde788c0710b77bb3a10127c850"}'

# Testar através do nginx
curl -k https://localcashback.com.br/api/rdstation/test \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"924c4bde788c0710b77bb3a10127c850"}'

# Verificar permissões
ls -la /var/www/cashback/cashback-system/integration-proxy.js
ls -la /var/www/cashback/cashback-system/dist/
```

---

## 📝 NOTAS IMPORTANTES

1. **Sempre teste com os scripts primeiro** (`TESTE-SIMPLES-RD.sh`)
2. **Cada mudança de configuração precisa de reload:** `sudo systemctl reload nginx`
3. **Cache do navegador é o vilão #1:** Teste em aba anônima ou limpe cache (Ctrl+Shift+Delete)
4. **Logs são seus amigos:** Use `pm2 logs` e `tail -f /var/log/nginx/...`
5. **O token que funciona é:** `924c4bde788c0710b77bb3a10127c850` (Token Público)

---

**🎯 PRÓXIMO PASSO:** Execute `./TESTE-SIMPLES-RD.sh` e me envie a saída!
