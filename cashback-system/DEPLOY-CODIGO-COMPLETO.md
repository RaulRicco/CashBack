# 🚀 CÓDIGO COMPLETO PARA DEPLOY - COPIE E EXECUTE

## ✨ **DEPLOY MAIS RÁPIDO (1 COMANDO)**

Cole este comando no **seu terminal local** (substituindo `usuario` e `servidor`):

```bash
ssh usuario@servidor.com "cd /var/www/cashback && \
git fetch origin genspark_ai_developer && \
git reset --hard origin/genspark_ai_developer && \
chmod +x DEPLOY-ISOLAMENTO-DADOS.sh && \
bash DEPLOY-ISOLAMENTO-DADOS.sh"
```

**Exemplo real:**
```bash
ssh root@142.93.12.34 "cd /var/www/cashback && \
git fetch origin genspark_ai_developer && \
git reset --hard origin/genspark_ai_developer && \
chmod +x DEPLOY-ISOLAMENTO-DADOS.sh && \
bash DEPLOY-ISOLAMENTO-DADOS.sh"
```

---

## 🔧 **OU: DEPLOY PASSO A PASSO**

Se preferir executar manualmente, siga estes passos:

### **Passo 1: Conectar ao Servidor**

```bash
ssh usuario@seu-servidor.com
```

### **Passo 2: Navegar para o Projeto**

```bash
cd /var/www/cashback
```

### **Passo 3: Executar Script de Deploy**

```bash
# Baixar última versão do código
git fetch origin genspark_ai_developer
git reset --hard origin/genspark_ai_developer

# Dar permissão ao script
chmod +x DEPLOY-ISOLAMENTO-DADOS.sh

# Executar deploy
bash DEPLOY-ISOLAMENTO-DADOS.sh
```

---

## 📝 **OU: COMANDOS MANUAIS (Sem Script)**

Se o script não funcionar, execute linha por linha:

```bash
# 1. Conectar ao servidor
ssh usuario@servidor.com

# 2. Ir para o projeto
cd /var/www/cashback

# 3. Atualizar código
git fetch origin genspark_ai_developer
git reset --hard origin/genspark_ai_developer

# 4. Verificar .env (IMPORTANTE!)
ls -la .env
# Se não existir, crie (veja seção abaixo)

# 5. Limpar cache
rm -rf node_modules/.vite dist

# 6. Instalar dependências
npm ci

# 7. Gerar build
npm run build

# 8. Verificar se build foi criado
ls -la dist/index.html

# 9. Recarregar Nginx
sudo nginx -t
sudo systemctl reload nginx

# 10. Reiniciar integration-proxy (se existir)
pm2 restart integration-proxy
```

---

## 🔑 **CRIAR ARQUIVO .ENV (SE NÃO EXISTIR)**

Se o arquivo `.env` não existir no servidor, crie com este comando:

```bash
cd /var/www/cashback

cat > .env << 'EOF'
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNDMyMzIsImV4cCI6MjA0NTYxOTIzMn0.rOWvxiKNLu6kbdQ8PVPxYpzJLf0qKvSbJOB9VeFGn1I
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_RESEND_FROM_NAME=Local CashBack
VITE_ONESIGNAL_APP_ID=e2b2fb1d-4a56-470f-a33a-aeb35e99631d
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_a5p2iaxr4vb7rgzmfymtidtvmyztnkebpfglnc5qxrk4n3ptvtptclrxbsttqlxs
EOF

# Verificar se foi criado
cat .env
```

---

## ✅ **TESTAR APÓS DEPLOY**

### **1. Testar se site está no ar**

```bash
# No servidor
curl -I http://localhost
```

**Deve retornar:** `HTTP/1.1 200 OK`

### **2. Testar no navegador**

Abra seu site: `https://seu-dominio.com`

### **3. Testar Isolamento de Dados** ⭐

Este é o teste mais importante!

#### **Teste A: Estabelecimento Existente**
1. Faça login em um estabelecimento que já tem vendas
2. Anote quantos clientes aparecem (exemplo: 15 clientes)
3. ✅ Deve mostrar apenas clientes que compraram neste estabelecimento

#### **Teste B: Novo Estabelecimento**
1. Crie um **novo estabelecimento**
2. Faça login nele
3. ✅ **Deve mostrar ZERO clientes** 
4. ✅ **Deve mostrar ZERO transações**
5. ✅ **Todos os contadores devem estar em zero**

#### **Teste C: Primeira Venda**
1. No novo estabelecimento, faça uma venda de teste
2. ✅ Contador de clientes deve mudar de 0 para 1
3. ✅ Deve aparecer 1 transação

#### **Teste D: Verificar Isolamento**
1. Volte para o primeiro estabelecimento (que tinha 15 clientes)
2. ✅ **Ainda deve mostrar 15 clientes** (não mudou)
3. ✅ **NÃO deve mostrar** o novo cliente do outro estabelecimento

**Se todos esses testes passarem, o isolamento está funcionando! 🎉**

---

## 🐛 **SE ALGO DER ERRADO**

### **Erro: "Build falhou"**

```bash
# Limpar completamente
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Erro: "Página em branco"**

```bash
# Verificar permissões
sudo chown -R www-data:www-data /var/www/cashback/dist
sudo chmod -R 755 /var/www/cashback/dist

# Recarregar Nginx
sudo systemctl restart nginx
```

### **Erro: "Variáveis de ambiente não funcionam"**

```bash
# Verificar .env
cat .env

# Se estiver vazio, recrie (veja seção acima)

# Gerar build novamente
npm run build
```

### **Ver Logs de Erro**

```bash
# Logs do Nginx
sudo tail -50 /var/log/nginx/error.log

# Logs do PM2
pm2 logs integration-proxy

# Status dos serviços
sudo systemctl status nginx
pm2 status
```

---

## 🔄 **REVERTER DEPLOY (EMERGÊNCIA)**

Se o deploy quebrar algo:

```bash
# Ver backups disponíveis
ls -la /var/www/backups/cashback/

# Restaurar backup mais recente
cd /var/www/cashback
rm -rf dist
tar -xzf /var/www/backups/cashback/backup_*.tar.gz --sort=date | tail -1

# Recarregar Nginx
sudo systemctl reload nginx
```

**OU voltar para commit anterior:**

```bash
cd /var/www/cashback
git log --oneline -5
git reset --hard HASH_DO_COMMIT_ANTERIOR
npm run build
sudo systemctl reload nginx
```

---

## 📊 **INFORMAÇÕES DO DEPLOY**

### **O que foi corrigido:**
- ✅ Dashboard agora filtra dados por `merchant_id`
- ✅ Novos estabelecimentos começam com contadores zerados
- ✅ Cada loja vê apenas seus próprios clientes
- ✅ Isolamento completo de dados entre estabelecimentos

### **Arquivos modificados:**
- `src/pages/Dashboard.jsx` - Queries corrigidas

### **Branch:**
- `genspark_ai_developer`

### **Pull Request:**
- https://github.com/RaulRicco/CashBack/pull/2

---

## 📞 **RESUMO EXECUTIVO**

### **OPÇÃO 1 - Mais Rápida (1 linha):**
```bash
ssh usuario@servidor.com "cd /var/www/cashback && git fetch origin genspark_ai_developer && git reset --hard origin/genspark_ai_developer && chmod +x DEPLOY-ISOLAMENTO-DADOS.sh && bash DEPLOY-ISOLAMENTO-DADOS.sh"
```

### **OPÇÃO 2 - Manual (6 comandos):**
```bash
ssh usuario@servidor.com
cd /var/www/cashback
git fetch origin genspark_ai_developer && git reset --hard origin/genspark_ai_developer
npm ci && npm run build
sudo nginx -t && sudo systemctl reload nginx
pm2 restart integration-proxy
```

### **OPÇÃO 3 - Usar o Script:**
```bash
ssh usuario@servidor.com
cd /var/www/cashback
bash DEPLOY-ISOLAMENTO-DADOS.sh
```

---

## 🎯 **CHECKLIST FINAL**

Após executar o deploy, verifique:

- [ ] Script executou sem erros
- [ ] Pasta `dist/` foi criada com arquivos
- [ ] Nginx recarregou com sucesso
- [ ] Site abre no navegador
- [ ] Login funciona
- [ ] Dashboard carrega corretamente
- [ ] **Novo estabelecimento mostra ZERO clientes** ⭐
- [ ] Estabelecimento existente mostra clientes corretos
- [ ] Primeira venda incrementa contador
- [ ] Outros estabelecimentos não veem clientes de outras lojas

---

## 🎉 **PRONTO!**

Seu sistema agora tem **isolamento completo de dados**!

Cada estabelecimento vê apenas:
- ✅ Seus próprios clientes
- ✅ Suas próprias transações
- ✅ Suas próprias estatísticas
- ✅ Seus próprios resgates

**Novos estabelecimentos começam sempre do zero! 🚀**

---

_Última atualização: 2025-11-08_
_Autor: GenSpark AI Developer_
_PR: https://github.com/RaulRicco/CashBack/pull/2_
