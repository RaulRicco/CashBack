# 🚀 Deploy - Domínios Personalizados Automáticos

## 📋 O que foi implementado

Sistema completo para merchants configurarem domínios personalizados com SSL automático via painel admin.

### ✨ Funcionalidades:
- ✅ Interface no painel admin para adicionar domínios
- ✅ Verificação automática de DNS
- ✅ Geração automática de certificado SSL (Let's Encrypt)
- ✅ Status em tempo real (pending, verifying, active, error)
- ✅ Instruções de configuração de DNS
- ✅ Suporte a múltiplos domínios por merchant
- ✅ Renovação automática de certificados (90 dias)

---

## 🎯 Deploy no Servidor de Produção

Execute os comandos na ordem:

### 1️⃣ Atualizar código

```bash
cd /var/www/cashback/cashback-system && \
git pull origin genspark_ai_developer
```

### 2️⃣ Criar tabela no banco de dados

```bash
# Copie o conteúdo do arquivo CREATE-TABLE-CUSTOM-DOMAINS.sql
cat /var/www/cashback/cashback-system/CREATE-TABLE-CUSTOM-DOMAINS.sql
```

Depois execute no Supabase SQL Editor:
1. Acesse: https://supabase.com/dashboard/project/mtylboaluqswdkgljgsd/sql/new
2. Cole o conteúdo do SQL
3. Clique em "Run"

### 3️⃣ Instalar dependências (se necessário)

```bash
cd /var/www/cashback/cashback-system && \
npm install
```

### 4️⃣ Build do frontend

```bash
cd /var/www/cashback/cashback-system && \
npm run build
```

### 5️⃣ Reiniciar proxy

```bash
pm2 restart integration-proxy
```

### 6️⃣ Recarregar Nginx

```bash
systemctl reload nginx
```

---

## 🧪 Testar a Funcionalidade

### 1. Acessar o painel admin

```
https://localcashback.com.br
```

### 2. Fazer login como merchant

### 3. Ir no menu lateral

Clicar em **"Domínio Próprio"** (ícone de globo 🌐)

### 4. Adicionar domínio de teste

Digite: `cashback.reservabar.com.br`

### 5. Verificar DNS

Clique em **"Verificar DNS"**

**Resultado esperado:**
- ✅ "DNS verificado com sucesso!"

### 6. Gerar SSL

Clique em **"Gerar SSL"**

**Aguarde 2-3 minutos**

**Resultado esperado:**
- ✅ "SSL configurado com sucesso!"
- Status muda para "Ativo"
- Badge verde com "🔒 SSL Ativo"

### 7. Visitar o site

Clique em **"Visitar Site"**

**Deve abrir:**
```
https://cashback.reservabar.com.br
```

Com **cadeado verde** no navegador! 🔒

---

## 📝 Fluxo Completo para Novo Domínio

### Para o Merchant:

1. **Configurar DNS** no registrador
   - Adicionar registro A ou CNAME
   - Apontar para `31.97.167.88` ou `localcashback.com.br`

2. **Adicionar domínio** no painel admin
   - Ir em "Domínio Próprio"
   - Digitar o domínio
   - Clicar em "Adicionar Domínio"

3. **Aguardar propagação do DNS** (5-30 minutos)

4. **Verificar DNS**
   - Clicar em "Verificar DNS"
   - Aguardar confirmação ✅

5. **Gerar SSL**
   - Clicar em "Gerar SSL"
   - Aguardar 2-3 minutos
   - Site fica ativo com HTTPS! 🎉

---

## 🔍 Verificações de Deploy

Execute para confirmar que tudo está funcionando:

```bash
# 1. Verificar se tabela foi criada
echo "SELECT COUNT(*) FROM custom_domains;" | # Executar no Supabase

# 2. Verificar se proxy está rodando
pm2 status

# 3. Verificar logs do proxy
pm2 logs integration-proxy --lines 20 --nostream

# 4. Testar endpoint de verificação DNS
curl -X POST https://localcashback.com.br/api/admin/verify-dns \
  -H "Content-Type: application/json" \
  -d '{"domain": "localcashback.com.br"}'

# Deve retornar: {"success":true,"verified":true,...}

# 5. Verificar se script de SSL existe
ls -la /var/www/cashback/setup-custom-domain.sh

# 6. Testar acesso ao painel
curl -I https://localcashback.com.br/custom-domains
# Deve retornar: HTTP/2 200
```

---

## ⚠️ Possíveis Problemas

### Problema 1: "Tabela custom_domains não existe"

**Solução:**
```bash
# Execute o SQL no Supabase SQL Editor
cat /var/www/cashback/cashback-system/CREATE-TABLE-CUSTOM-DOMAINS.sql
```

### Problema 2: "Endpoint /api/admin/verify-dns não encontrado"

**Solução:**
```bash
# Reiniciar proxy
pm2 restart integration-proxy

# Verificar logs
pm2 logs integration-proxy
```

### Problema 3: "Script setup-custom-domain.sh não encontrado"

**Solução:**
```bash
# Verificar se existe
ls -la /var/www/cashback/setup-custom-domain.sh

# Se não existir, fazer pull do repositório
cd /var/www/cashback && git pull origin genspark_ai_developer
```

### Problema 4: "Erro ao gerar SSL"

**Causas comuns:**
- DNS ainda não propagou
- Porta 80 não está acessível
- Certbot não instalado

**Solução:**
```bash
# Verificar se Certbot está instalado
certbot --version

# Se não estiver, instalar
apt-get update && apt-get install -y certbot python3-certbot-nginx

# Testar manualmente
bash /var/www/cashback/setup-custom-domain.sh cashback.reservabar.com.br
```

---

## 📊 Monitoramento

### Ver domínios configurados:

```bash
# No servidor
ls -la /etc/nginx/sites-available/
certbot certificates
```

### Ver logs de SSL:

```bash
tail -f /var/log/letsencrypt/letsencrypt.log
```

### Ver logs do proxy:

```bash
pm2 logs integration-proxy --lines 50
```

---

## 🎉 Checklist de Sucesso

Antes de considerar o deploy concluído, confirme:

- [ ] Código atualizado do GitHub
- [ ] Tabela `custom_domains` criada no Supabase
- [ ] Frontend buildado com sucesso
- [ ] Proxy reiniciado sem erros
- [ ] Nginx recarregado sem erros
- [ ] Menu "Domínio Próprio" aparece no painel
- [ ] Página `/custom-domains` carrega corretamente
- [ ] Consegue adicionar um domínio de teste
- [ ] Verificação de DNS funciona
- [ ] Geração de SSL funciona
- [ ] Domínio fica ativo com HTTPS
- [ ] Cadeado verde aparece no navegador

---

## 📞 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Testar com domínio `cashback.reservabar.com.br`
2. ✅ Documentar processo para outros merchants
3. ✅ Adicionar monitoramento de certificados expirando
4. ✅ Criar notificação quando SSL for renovado

---

**🚀 Boa sorte com o deploy!**

Se tiver problemas, verifique os logs:
- Proxy: `pm2 logs integration-proxy`
- Nginx: `tail -f /var/log/nginx/error.log`
- Certbot: `tail -f /var/log/letsencrypt/letsencrypt.log`
