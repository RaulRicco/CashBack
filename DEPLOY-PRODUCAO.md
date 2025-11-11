# 🚀 Deploy em Produção - Recuperação de Senha por Email

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de que:

1. ✅ Pull Request #2 foi aprovado e mergeado na branch `main`
2. ✅ Banco de dados de produção tem a estrutura correta
3. ✅ Variáveis de ambiente configuradas no servidor
4. ✅ Clientes têm email cadastrado (campo `email` na tabela `customers`)

---

## 🔧 Opção 1: Deploy Direto da Branch (Recomendado para Testes)

Se você quiser testar antes de mergear o PR, use a branch `genspark_ai_developer`:

```bash
# No servidor de produção

# 1. Navegar para o diretório do projeto
cd /var/www/cashback-system
# OU o caminho onde seu projeto está

# 2. Fazer backup do código atual (segurança)
cp -r . ../cashback-system-backup-$(date +%Y%m%d-%H%M%S)

# 3. Puxar as últimas mudanças da branch de desenvolvimento
git fetch origin
git checkout genspark_ai_developer
git pull origin genspark_ai_developer

# 4. Instalar dependências (se houver novas)
npm install

# 5. Build para produção
npm run build

# 6. Reiniciar o servidor (depende do seu setup)
# Para PM2:
pm2 restart cashback-system

# OU para systemd:
sudo systemctl restart cashback-system

# OU para nginx + static files:
# Apenas copie os arquivos do dist/ para o diretório web
sudo cp -r dist/* /var/www/html/
```

---

## 🎯 Opção 2: Deploy da Branch Main (Produção Oficial)

Depois que o PR #2 for aprovado e mergeado:

```bash
# No servidor de produção

# 1. Navegar para o diretório do projeto
cd /var/www/cashback-system

# 2. Fazer backup
cp -r . ../cashback-system-backup-$(date +%Y%m%d-%H%M%S)

# 3. Puxar branch main atualizada
git fetch origin
git checkout main
git pull origin main

# 4. Instalar dependências
npm install

# 5. Build para produção
npm run build

# 6. Reiniciar servidor
pm2 restart cashback-system
# OU
sudo systemctl restart cashback-system
```

---

## 🗄️ Verificações no Banco de Dados

Antes do deploy, execute estas queries no banco de produção:

### 1. Verificar estrutura da tabela customers

```sql
-- Ver colunas da tabela
\d customers;

-- OU
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers';
```

**Certifique-se de que existe:**
- ✅ `id` (uuid ou bigint)
- ✅ `phone` (varchar)
- ✅ `name` (varchar, nullable)
- ✅ `email` (varchar, nullable) ← **IMPORTANTE**
- ✅ `password_hash` (varchar)
- ✅ `referred_by_merchant_id` (uuid ou bigint)
- ✅ `cashback_balance` (numeric)

### 2. Verificar clientes com email

```sql
-- Quantos clientes têm email cadastrado?
SELECT COUNT(*) as total_clientes,
       COUNT(email) as com_email,
       COUNT(*) - COUNT(email) as sem_email
FROM customers;
```

### 3. Adicionar email para clientes sem (OPCIONAL)

Se muitos clientes não têm email, você pode:

**Opção A:** Permitir que cadastrem email no perfil (futuro)

**Opção B:** Adicionar emails de teste temporariamente:
```sql
-- NÃO FAÇA ISSO EM PRODUÇÃO SEM CONFIRMAR
-- É apenas um exemplo para testes

UPDATE customers 
SET email = CONCAT('cliente', id, '@temporary.com')
WHERE email IS NULL;
```

### 4. Verificar RLS (Row Level Security)

```sql
-- Verificar se RLS está desabilitado (recomendado para customers)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'customers';

-- Se rowsecurity = true, desabilite:
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
```

### 5. Verificar constraint UNIQUE

```sql
-- Verificar constraints da tabela
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'customers'::regclass;

-- Deve existir:
-- customers_phone_merchant_unique: UNIQUE (phone, referred_by_merchant_id)
```

---

## 🌍 Variáveis de Ambiente

Certifique-se de que o arquivo `.env` de produção tem:

```bash
# Supabase (Banco de Dados)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Resend (Email) - JÁ CONFIGURADO
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_RESEND_FROM_NAME=Local CashBack

# Outros (se aplicável)
VITE_GTM_ID=seu-gtm-id
VITE_META_PIXEL_ID=seu-pixel-id
```

**IMPORTANTE:** 
- Para produção, considere trocar `onboarding@resend.dev` por seu domínio verificado
- Exemplo: `noreply@seudominio.com`

---

## 📦 Comandos de Deploy Completos

### Deploy Automatizado (Script)

Crie um script de deploy:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy do CashBack System..."

# Configurações
PROJECT_DIR="/var/www/cashback-system"
BACKUP_DIR="/var/www/backups"
BRANCH="main"  # ou "genspark_ai_developer" para testes

# Criar diretório de backups
mkdir -p $BACKUP_DIR

# Fazer backup
echo "📦 Fazendo backup..."
BACKUP_NAME="cashback-backup-$(date +%Y%m%d-%H%M%S)"
cp -r $PROJECT_DIR $BACKUP_DIR/$BACKUP_NAME

# Navegar para projeto
cd $PROJECT_DIR

# Puxar código
echo "📥 Puxando código do GitHub..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Instalar dependências
echo "📚 Instalando dependências..."
npm install

# Build
echo "🔨 Building projeto..."
npm run build

# Verificar se build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Reiniciar servidor
    echo "🔄 Reiniciando servidor..."
    pm2 restart cashback-system
    
    echo "🎉 Deploy concluído com sucesso!"
    echo "📊 Status:"
    pm2 status cashback-system
else
    echo "❌ Erro no build! Restaurando backup..."
    rm -rf $PROJECT_DIR
    cp -r $BACKUP_DIR/$BACKUP_NAME $PROJECT_DIR
    pm2 restart cashback-system
    echo "⚠️ Deploy falhou. Backup restaurado."
    exit 1
fi
```

Tornar executável e rodar:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🧪 Testes Pós-Deploy

Depois do deploy, teste:

### 1. Acesso às páginas

```bash
# Login de cliente
curl -I https://seudominio.com/customer/login/slug-do-merchant

# Recuperação de senha
curl -I https://seudominio.com/customer/forgot-password/slug-do-merchant

# Deve retornar: HTTP/1.1 200 OK
```

### 2. Teste funcional completo

1. **Acesse a página de login:**
   ```
   https://seudominio.com/customer/login/MERCHANT_SLUG
   ```

2. **Clique em "Esqueci minha senha"**

3. **Digite um telefone de cliente COM email cadastrado**

4. **Clique em "Enviar Código"**

5. **Verifique:**
   - ✅ Toast: "Código enviado para seu email: abc...@gmail.com"
   - ✅ Console (F12): "✅ Email enviado com sucesso: re_xxx"
   - ✅ Email chegou na caixa do cliente

6. **Abra o email e copie o código de 6 dígitos**

7. **Cole o código na página**

8. **Digite nova senha e confirme**

9. **Verifique:**
   - ✅ Toast: "Senha alterada com sucesso!"
   - ✅ Segundo email de confirmação enviado
   - ✅ Redirect para login após 2 segundos

10. **Faça login com a nova senha**
    - ✅ Login funciona
    - ✅ Acesso ao dashboard do cliente

### 3. Teste de erro (cliente sem email)

1. **Digite telefone de cliente SEM email**
2. **Deve mostrar erro:** "Cliente não possui email cadastrado"
3. **Não deve avançar para próxima tela**

---

## 📊 Monitoramento Pós-Deploy

### Logs do Servidor

```bash
# PM2 logs
pm2 logs cashback-system --lines 100

# Logs em tempo real
pm2 logs cashback-system --raw

# Filtrar erros
pm2 logs cashback-system --err
```

### Logs do Navegador

Abra DevTools (F12) e verifique:
- ❌ Não deve ter erros em vermelho
- ✅ Deve mostrar logs de sucesso em verde
- ⚠️ Warnings são ok se não afetarem funcionalidade

### Resend Dashboard

Acesse: https://resend.com/emails

Verifique:
- ✅ Emails estão sendo enviados
- ✅ Status: "delivered"
- ❌ Se "bounced" ou "failed", verificar email do cliente

---

## 🔧 Troubleshooting

### Problema: Build falha

**Solução:**
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Servidor não reinicia

**Solução para PM2:**
```bash
# Ver processos
pm2 list

# Parar e reiniciar
pm2 stop cashback-system
pm2 start cashback-system

# OU deletar e recriar
pm2 delete cashback-system
pm2 start npm --name "cashback-system" -- run preview
```

**Solução para systemd:**
```bash
sudo systemctl status cashback-system
sudo journalctl -u cashback-system -n 50
sudo systemctl restart cashback-system
```

### Problema: Email não envia

**Verificar:**
1. API Key correta no `.env`?
2. Cliente tem email cadastrado?
3. Console mostra erro?
4. Resend Dashboard mostra o email?

**Teste manual da API:**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "seu-email@teste.com",
    "subject": "Teste Deploy",
    "html": "<h1>Teste de email</h1>"
  }'
```

### Problema: Página não carrega

**Verificar:**
1. Build gerou arquivos em `dist/`?
   ```bash
   ls -lh dist/
   ```

2. Nginx está servindo os arquivos corretos?
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. Rotas estão configuradas (SPA)?
   ```nginx
   # /etc/nginx/sites-available/cashback
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

---

## 📱 Teste em Produção - Checklist

Após deploy, preencha este checklist:

### Funcionalidades Básicas
- [ ] Login de cliente funciona
- [ ] Signup de cliente funciona
- [ ] Dashboard de cliente carrega

### Recuperação de Senha
- [ ] Link "Esqueci minha senha" aparece
- [ ] Página de recuperação carrega
- [ ] Step 1: Envio de código funciona
- [ ] Email chega na caixa do cliente
- [ ] Step 2: Validação de código funciona
- [ ] Step 3: Reset de senha funciona
- [ ] Email de confirmação enviado
- [ ] Redirect para login funciona
- [ ] Login com nova senha funciona

### Casos de Erro
- [ ] Cliente sem email: erro claro
- [ ] Código errado: "Código inválido"
- [ ] Senhas não coincidem: erro claro
- [ ] Telefone não cadastrado: erro claro

### Performance
- [ ] Páginas carregam em < 2s
- [ ] Email enviado em < 5s
- [ ] Sem erros no console
- [ ] Sem warnings críticos

### Segurança
- [ ] Senha hasheada no banco
- [ ] Email mascarado na UI
- [ ] Multi-tenant funcionando
- [ ] Sem dados sensíveis em logs públicos

---

## 🎉 Deploy Concluído!

Se todos os testes passaram, seu deploy está completo! 🚀

### Próximos Passos (Opcional)

1. **Notificar clientes** sobre nova funcionalidade
2. **Monitorar emails** no Resend por 24h
3. **Coletar feedback** dos primeiros usuários
4. **Adicionar analytics** para tracking de uso
5. **Implementar melhorias** baseadas no uso real

### Links Úteis

- **PR #2:** https://github.com/RaulRicco/CashBack/pull/2
- **Resend Dashboard:** https://resend.com/emails
- **Supabase Dashboard:** https://app.supabase.com
- **Documentação:** TESTE-RECUPERACAO-EMAIL.md

---

**Data de Deploy:** $(date +%Y-%m-%d)
**Versão:** 1.0.0 (Recuperação por Email)
**Branch:** genspark_ai_developer → main
**Commits:** 38bbc89, 4073245

✅ **Sistema de recuperação de senha por email está em produção!**
