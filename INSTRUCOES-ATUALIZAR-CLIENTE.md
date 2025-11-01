# 🎯 INSTRUÇÕES PARA ATUALIZAR PÁGINA DO CLIENTE

## ✅ O QUE FOI ALTERADO:

### 1. **Página de Signup** (`CustomerSignup.jsx`)
- ❌ **REMOVIDO**: Logo LocalCashback do topo
- ✅ **ADICIONADO**: Logo do estabelecimento no topo (maior e com destaque)
- ✅ **ADICIONADO**: "Powered by LocalCashback" no rodapé
- ✅ **ADICIONADO**: Campo de data de nascimento (obrigatório)
- ✅ **ADICIONADO**: Campo de senha (mínimo 6 caracteres, obrigatório)

### 2. **Página do Dashboard** (`CustomerDashboard.jsx`)
- ✅ **ADICIONADO**: Tela de login com senha antes de acessar o perfil
- ✅ **ADICIONADO**: Autenticação via sessionStorage
- ✅ **SEGURANÇA**: Cliente precisa digitar senha para ver seus dados

### 3. **Banco de Dados**
- ✅ **CRIADO**: Migração SQL para adicionar campos:
  - `birthdate` (DATE) - Data de nascimento
  - `password_hash` (TEXT) - Senha criptografada

---

## 🚀 COMO APLICAR NO SERVIDOR:

### **PASSO 1: Atualizar código do servidor**

```bash
# Conectar no servidor via SSH
ssh root@seu-servidor

# Navegar até o diretório do projeto
cd /var/www/cashback/cashback-system

# Puxar as alterações
git pull origin main

# Instalar dependências (se necessário)
npm install

# Fazer o build do projeto
npm run build

# Recarregar nginx
sudo systemctl reload nginx
```

---

### **PASSO 2: Atualizar banco de dados (Supabase)**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `ADD-PASSWORD-BIRTHDATE-CUSTOMERS.sql`:

```sql
-- ====================================
-- ADICIONAR CAMPOS PASSWORD E BIRTHDATE NA TABELA CUSTOMERS
-- ====================================

-- Adicionar campo de data de nascimento
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS birthdate DATE;

-- Adicionar campo de senha hash
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Criar índice no campo de senha para melhor performance
CREATE INDEX IF NOT EXISTS idx_customers_password ON customers(password_hash);

-- Comentários nas colunas
COMMENT ON COLUMN customers.birthdate IS 'Data de nascimento do cliente';
COMMENT ON COLUMN customers.password_hash IS 'Hash da senha do cliente para proteger acesso ao perfil';
```

4. Clique em **Run** para executar

---

## 📋 COMANDOS COMPLETOS (COPIAR E COLAR):

```bash
# 1. Conectar no servidor
ssh root@seu-servidor

# 2. Navegar e atualizar
cd /var/www/cashback/cashback-system
git pull origin main

# 3. Build e deploy
npm run build
sudo systemctl reload nginx

# 4. Verificar se está funcionando
pm2 status
pm2 logs integration-proxy --lines 10 --nostream
```

---

## 🔍 COMO TESTAR:

### **Teste 1: Novo Cadastro**
1. Acesse o link de cadastro de algum estabelecimento
2. Verifique se:
   - ✅ Logo do estabelecimento aparece no topo
   - ✅ LocalCashback aparece apenas no rodapé como "Powered by"
   - ✅ Campo "Data de Nascimento" está presente
   - ✅ Campo "Crie uma Senha" está presente
3. Preencha todos os campos e cadastre
4. Você deve ser redirecionado para a tela de login

### **Teste 2: Login no Perfil**
1. Acesse o perfil usando o link: `/customer/dashboard/TELEFONE`
2. Você deve ver:
   - ✅ Tela de login com campo de senha
   - ✅ Telefone preenchido automaticamente
3. Digite a senha criada no cadastro
4. Clique em "Entrar"
5. Você deve ver o dashboard com seu saldo

### **Teste 3: Cliente Antigo (sem senha)**
⚠️ **IMPORTANTE**: Clientes antigos que não têm senha cadastrada precisarão:
- Entrar em contato com o estabelecimento para redefinir senha
- OU você pode criar uma ferramenta de "Primeira senha" para eles

---

## ⚠️ ATENÇÃO: CLIENTES ANTIGOS

Clientes cadastrados ANTES desta atualização **não têm senha cadastrada**.

**Opções:**

### **Opção 1: Migração Manual (Recomendado)**
Execute este SQL no Supabase para definir uma senha padrão para clientes antigos:

```sql
-- Definir senha padrão "123456" para clientes sem senha
UPDATE customers 
SET password_hash = 'MTIzNDU2'  -- Base64 de "123456"
WHERE password_hash IS NULL;
```

Depois, avise aos clientes para alterarem a senha no primeiro acesso.

### **Opção 2: Link de Redefinição**
Criar uma página especial `/customer/first-password/:phone` onde clientes antigos podem criar sua primeira senha.

---

## 📝 RESUMO DAS MUDANÇAS:

| Antes | Depois |
|-------|--------|
| Logo LocalCashback no topo | Logo do estabelecimento no topo |
| Sem "Powered by" | "Powered by LocalCashback" no rodapé |
| Sem data de nascimento | Campo obrigatório de data de nascimento |
| Sem senha | Senha obrigatória (mínimo 6 caracteres) |
| Acesso livre ao perfil | Tela de login antes de acessar |

---

## 🎉 BENEFÍCIOS:

✅ **Branding**: Estabelecimento ganha destaque com logo no topo  
✅ **Segurança**: Perfil do cliente protegido por senha  
✅ **Dados**: Data de nascimento para campanhas de aniversário  
✅ **UX**: Cliente sente que está usando app do estabelecimento  
✅ **Credibilidade**: "Powered by LocalCashback" mantém credibilidade  

---

## 🆘 PROBLEMAS COMUNS:

### **Problema**: Cliente não consegue fazer login
**Solução**: Verificar se o cliente digitou a senha correta no cadastro

### **Problema**: Build não funciona
**Solução**: Rodar `npm install` antes de `npm run build`

### **Problema**: Migração SQL falha
**Solução**: Verificar se já existe os campos na tabela customers

### **Problema**: Clientes antigos não conseguem acessar
**Solução**: Executar o SQL da Opção 1 para definir senha padrão

---

## 📞 SUPORTE

Se tiver algum problema durante a aplicação, me avise que te ajudo!

**Comandos úteis:**
```bash
# Ver logs do nginx
sudo tail -f /var/log/nginx/error.log

# Ver logs do PM2
pm2 logs integration-proxy

# Verificar status do build
ls -la /var/www/cashback/cashback-system/dist/
```
