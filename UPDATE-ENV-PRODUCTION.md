# 🔧 Atualizar .env em Produção

## ⚠️ IMPORTANTE: Execute este comando no servidor de produção

O arquivo `.env` está no `.gitignore` (correto para segurança), mas você precisa adicionar a variável `VITE_API_URL` manualmente no servidor.

---

## 📝 EXECUTAR NO SERVIDOR:

```bash
# 1. Acessar a pasta do projeto
cd /home/root/webapp/cashback-system

# 2. Adicionar a variável VITE_API_URL ao .env
echo "" >> .env
echo "# API Backend URL" >> .env
echo "VITE_API_URL=https://localcashback.com.br:3001" >> .env

# 3. Verificar se foi adicionado
tail -3 .env

# 4. Rebuild do frontend
npm run build

# 5. Deploy
cd /home/root/webapp
rsync -av --delete cashback-system/dist/ /var/www/cashback/cashback-system/
```

---

## ✅ VERIFICAR SE DEU CERTO:

Abra o navegador e acesse:
```
https://cashback.raulricco.com.br
```

Faça login e verifique se:
- ✅ Não aparece mais erro `ERR_CONNECTION_REFUSED`
- ✅ O banner de trial carrega corretamente
- ✅ O botão "Assinar Agora" funciona
- ✅ O preço mostrado é **R$ 97/mês** (não R$ 147)

---

## 🔍 DEBUGAR ERROS:

Se ainda aparecer erro de conexão, verifique:

### **1. Verificar se o server.js está rodando:**
```bash
pm2 list
```

**Resultado esperado:**
```
│ stripe-api │ online │
```

### **2. Verificar se a porta 3001 está aberta:**
```bash
netstat -tulpn | grep 3001
```

**Resultado esperado:**
```
tcp6  :::3001  :::*  LISTEN  928883/node
```

### **3. Testar a API diretamente:**
```bash
curl https://localcashback.com.br:3001/api/health
```

**Resultado esperado:**
```json
{"status":"ok","timestamp":"..."}
```

### **4. Ver logs do servidor:**
```bash
pm2 logs stripe-api --lines 50
```

---

## 🚨 SE A API NÃO ESTIVER ACESSÍVEL POR HTTPS:

Pode ser que o Nginx não esteja fazendo proxy reverso para a porta 3001.

### **Opção 1: Adicionar proxy no Nginx**

Edite o arquivo de configuração do Nginx:
```bash
nano /etc/nginx/sites-available/cashback
```

Adicione dentro do bloco `server`:
```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Teste e reinicie o Nginx:
```bash
nginx -t
systemctl restart nginx
```

Depois, mude o `.env` para:
```bash
VITE_API_URL=https://localcashback.com.br
```

### **Opção 2: Liberar porta 3001 no firewall**

Se quiser manter `:3001` na URL:
```bash
# UFW
sudo ufw allow 3001/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

---

## 📋 RESUMO:

| Item | Status |
|------|--------|
| Código atualizado | ✅ Commitado |
| Build gerado | ✅ Completo |
| Deploy feito | ✅ Rsync OK |
| .env atualizado | ⏳ **Fazer manualmente** |
| Preço corrigido | ✅ R$ 97 |
| API URL dinâmica | ✅ Implementada |

---

## 🎯 PRÓXIMO PASSO:

Execute os comandos acima no servidor de produção para adicionar `VITE_API_URL` ao `.env` e rebuild.

**Data:** 2025-01-04  
**Commit:** `5787a59`  
**Branch:** `genspark_ai_developer`
