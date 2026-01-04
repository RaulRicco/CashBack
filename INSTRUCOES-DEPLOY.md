# 🚀 Instruções de Deploy - Correção de Isolamento de Dados

## 📋 **Pré-requisitos**

Antes de executar o deploy, verifique:

- ✅ Acesso SSH ao servidor VPS
- ✅ Node.js instalado no servidor (versão 18+)
- ✅ Nginx configurado
- ✅ PM2 instalado (opcional, para integration-proxy)
- ✅ Git configurado no servidor
- ✅ Arquivo `.env` com variáveis configuradas

---

## 🔑 **Método 1: Deploy Automatizado (RECOMENDADO)**

### **1. Conecte-se ao servidor via SSH**

```bash
ssh usuario@seu-servidor.com
# Exemplo: ssh root@142.93.12.34
```

### **2. Navegue até o diretório do projeto**

```bash
cd /var/www/cashback
```

### **3. Baixe o script de deploy**

```bash
# Fazer fetch do repositório
git fetch origin genspark_ai_developer

# Fazer checkout do script
git checkout origin/genspark_ai_developer -- DEPLOY-ISOLAMENTO-DADOS.sh

# Dar permissão de execução
chmod +x DEPLOY-ISOLAMENTO-DADOS.sh
```

### **4. Execute o script**

```bash
bash DEPLOY-ISOLAMENTO-DADOS.sh
```

**O script irá:**
1. ✅ Criar backup do build atual
2. ✅ Atualizar código da branch `genspark_ai_developer`
3. ✅ Verificar variáveis de ambiente
4. ✅ Limpar cache e builds antigos
5. ✅ Instalar dependências
6. ✅ Gerar novo build de produção
7. ✅ Recarregar Nginx
8. ✅ Reiniciar integration-proxy (se existir)

---

## ⚙️ **Método 2: Deploy Manual (Passo a Passo)**

Se preferir executar manualmente ou se o script falhar:

### **1. Conectar ao servidor**

```bash
ssh usuario@seu-servidor.com
```

### **2. Navegar para o projeto**

```bash
cd /var/www/cashback
```

### **3. Verificar branch atual**

```bash
git branch
# Deve estar em genspark_ai_developer
```

### **4. Salvar mudanças locais (se houver)**

```bash
git status
# Se houver mudanças:
git stash
```

### **5. Atualizar código**

```bash
git fetch origin genspark_ai_developer
git reset --hard origin/genspark_ai_developer
```

### **6. Verificar .env**

```bash
# Verificar se existe
ls -la .env

# Ver conteúdo (sem mostrar senhas)
cat .env | grep -E "^VITE_" | sed 's/=.*/=***/'
```

**Variáveis obrigatórias:**
```bash
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_RESEND_FROM_NAME=Local CashBack
```

### **7. Limpar cache**

```bash
# Remover cache do Vite
rm -rf node_modules/.vite

# Remover build anterior
rm -rf dist
```

### **8. Instalar dependências**

```bash
# Opção 1: Instalação limpa (mais rápido)
npm ci

# Opção 2: Instalação normal
npm install
```

### **9. Gerar build**

```bash
npm run build
```

**Aguarde a mensagem:**
```
✓ built in XXs
```

### **10. Verificar build**

```bash
# Verificar se foi criado
ls -la dist/

# Ver tamanho
du -sh dist/

# Deve mostrar index.html e pasta assets/
```

### **11. Recarregar Nginx**

```bash
# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx

# Verificar status
sudo systemctl status nginx
```

### **12. Reiniciar integration-proxy (se existir)**

```bash
# Verificar se está rodando
pm2 list

# Reiniciar
pm2 restart integration-proxy

# Ver logs
pm2 logs integration-proxy --lines 20
```

---

## ✅ **Verificação Pós-Deploy**

### **1. Verificar acesso ao site**

```bash
# No servidor, testar localmente
curl -I http://localhost

# Deve retornar: HTTP/1.1 200 OK
```

### **2. Testar no navegador**

Abra seu site e verifique:

- ✅ Dashboard carrega
- ✅ Login funciona
- ✅ Contadores estão corretos

### **3. Testar isolamento de dados**

#### **Cenário 1: Estabelecimento Existente**
1. Faça login em um estabelecimento que já tem vendas
2. Verifique que mostra apenas os clientes daquele estabelecimento
3. Anote o número de clientes

#### **Cenário 2: Novo Estabelecimento**
1. Crie um novo estabelecimento
2. Faça login nele
3. ✅ **Deve mostrar ZERO clientes**
4. ✅ **Deve mostrar ZERO transações**
5. ✅ **Todos os contadores devem estar zerados**

#### **Cenário 3: Primeira Venda**
1. No novo estabelecimento, faça uma venda
2. ✅ Contador de clientes deve ir para 1
3. ✅ Deve aparecer 1 transação
4. Entre no primeiro estabelecimento
5. ✅ **NÃO** deve mostrar esse novo cliente

---

## 🐛 **Solução de Problemas**

### **Erro: "Build falhou"**

```bash
# Limpar completamente node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Tentar build novamente
npm run build
```

### **Erro: "Nginx não recarrega"**

```bash
# Ver erros do Nginx
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar completamente
sudo systemctl restart nginx
```

### **Erro: "Página em branco"**

```bash
# Verificar se build foi gerado
ls -la dist/index.html

# Verificar permissões
sudo chown -R www-data:www-data /var/www/cashback/dist
sudo chmod -R 755 /var/www/cashback/dist

# Verificar configuração do Nginx
sudo cat /etc/nginx/sites-enabled/cashback
```

### **Erro: "Variáveis de ambiente não funcionam"**

```bash
# Verificar se .env existe
ls -la .env

# Se não existir, criar:
nano .env

# Colar as variáveis:
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_RESEND_FROM_NAME=Local CashBack
VITE_ONESIGNAL_APP_ID=e2b2fb1d-4a56-470f-a33a-aeb35e99631d
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_...

# Salvar: CTRL+O, Enter, CTRL+X

# Gerar build novamente
npm run build
```

---

## 🔄 **Reverter Deploy (Se necessário)**

Se algo der errado, você pode reverter:

### **Opção 1: Restaurar backup**

```bash
# Listar backups
ls -la /var/www/backups/cashback/

# Extrair backup anterior
cd /var/www/cashback
rm -rf dist
tar -xzf /var/www/backups/cashback/backup_YYYYMMDD_HHMMSS.tar.gz

# Recarregar Nginx
sudo systemctl reload nginx
```

### **Opção 2: Voltar commit anterior**

```bash
cd /var/www/cashback

# Ver commits
git log --oneline -5

# Voltar para commit anterior
git reset --hard COMMIT_HASH

# Rebuild
npm run build

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 📞 **Suporte**

Se encontrar problemas:

1. **Verificar logs:**
   ```bash
   # Logs do Nginx
   sudo tail -f /var/log/nginx/error.log
   
   # Logs do PM2
   pm2 logs
   
   # Logs do sistema
   journalctl -u nginx -f
   ```

2. **Status dos serviços:**
   ```bash
   sudo systemctl status nginx
   pm2 status
   ```

3. **Informações do sistema:**
   ```bash
   # Versão Node.js
   node -v
   
   # Versão NPM
   npm -v
   
   # Espaço em disco
   df -h
   
   # Memória
   free -h
   ```

---

## 📊 **O que foi corrigido neste deploy**

### **Problema Identificado:**
- Dashboard mostrava clientes de TODOS os estabelecimentos
- Novo estabelecimento já vinha com contadores populados
- Falta de isolamento de dados entre lojas

### **Solução Implementada:**
- ✅ Dashboard agora filtra por `merchant_id` através da tabela `transactions`
- ✅ Novos estabelecimentos começam com ZERO clientes
- ✅ Cada loja vê apenas seus próprios clientes e estatísticas
- ✅ "Novos Clientes do Mês" conta apenas primeira compra naquela loja
- ✅ Isolamento completo de dados entre estabelecimentos

### **Arquivos Alterados:**
- `src/pages/Dashboard.jsx` - Queries corrigidas para filtrar por merchant

---

## 🎯 **Checklist Final**

Antes de considerar o deploy concluído:

- [ ] Script executou sem erros
- [ ] Build foi gerado (pasta `dist/` existe)
- [ ] Nginx recarregado com sucesso
- [ ] Site abre no navegador
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Novo estabelecimento mostra ZERO clientes
- [ ] Estabelecimento existente mostra clientes corretos
- [ ] Primeira venda incrementa contador
- [ ] Outros estabelecimentos não veem esse cliente

---

**Deploy preparado e testado! 🚀**

_Última atualização: 2025-11-08_
