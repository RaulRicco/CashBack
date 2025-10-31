# 🚀 DEPLOY RÁPIDO - Integrações Funcionando

## ⚡ 3 COMANDOS PARA FAZER FUNCIONAR

### 1️⃣ Fazer Deploy e Instalar Dependências

```bash
ssh root@31.97.167.88

cd /var/www/cashback/cashback-system
git pull origin main
npm install express cors axios md5
npm run build
systemctl reload nginx
```

### 2️⃣ Iniciar o Proxy Server

**Opção Rápida (Teste):**
```bash
cd /var/www/cashback/cashback-system
node integration-proxy.js
```

**Opção Recomendada (Produção com PM2):**
```bash
npm install -g pm2
cd /var/www/cashback/cashback-system
pm2 start integration-proxy.js --name "integration-proxy"
pm2 save
pm2 startup
```

### 3️⃣ Testar se Está Funcionando

```bash
curl http://localhost:3001/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

---

## ✅ AGORA CONFIGURE NO SISTEMA

### Mailchimp:
1. Acesse **Integrações** → **Mailchimp**
2. Cole API Key, Audience ID e Server Prefix
3. Clique em **Testar Conexão** → Agora funciona! ✅
4. **Salvar** e **Ativar**
5. **Sincronizar Todos os Clientes**

### RD Station:
1. Acesse **Integrações** → **RD Station**
2. Cole o Access Token (80+ caracteres)
3. Clique em **Testar Conexão** → Agora funciona! ✅
4. **Salvar** e **Ativar**
5. **Sincronizar Todos os Clientes**

---

## 🔍 Ver se Está Rodando

```bash
# Se usou PM2:
pm2 status
pm2 logs integration-proxy --nostream

# Se usou node direto:
ps aux | grep integration-proxy
```

---

## 🆘 Se Der Erro

```bash
# Reiniciar o proxy
pm2 restart integration-proxy

# Ver logs completos
pm2 logs integration-proxy
```

---

## 📚 Guia Completo

Leia: `INTEGRACAO-FUNCIONANDO.md` para instruções detalhadas.

---

**Tempo total: 5 minutos!** ⏱️
