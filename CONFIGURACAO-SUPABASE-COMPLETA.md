# 🗄️ Configuração Completa do Supabase para Recuperação de Senha

## ⚠️ IMPORTANTE - Estrutura Atual do Sistema

### **Como funciona AGORA:**
- ✅ **Employees (Funcionários)**: Fazem login com email e senha
- ❌ **Merchants (Estabelecimentos)**: NÃO fazem login (não têm campo de senha)
- ❌ **Customers (Clientes)**: NÃO fazem login (identificados por telefone)

### **Problema Identificado:**
O código de recuperação de senha foi criado para "merchants" e "customers", mas essas tabelas **não têm campo de senha** no banco atual!

---

## 🔧 OPÇÕES PARA RESOLVER:

### **OPÇÃO 1: Adicionar campo de senha nas tabelas** ✅ (RECOMENDADO)

Execute este SQL no Supabase para adicionar campos de senha:

```sql
-- ============================================
-- ADICIONAR CAMPOS DE SENHA
-- ============================================

-- 1. Adicionar campo password na tabela merchants
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Adicionar campo password na tabela customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 4. Verificar se foi adicionado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'merchants' AND column_name = 'password';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'password';
```

**Vantagens:**
- ✅ Permite que merchants e customers façam login
- ✅ Sistema de recuperação funciona perfeitamente
- ✅ Mais seguro (controle de acesso individual)

**Desvantagens:**
- ⚠️ Precisa criar tela de cadastro para merchants
- ⚠️ Precisa criar tela de cadastro para customers
- ⚠️ Precisa atualizar o authStore.js

---

### **OPÇÃO 2: Recuperação apenas para Employees** (SOLUÇÃO RÁPIDA)

Modificar o sistema para funcionar apenas com funcionários:

```sql
-- Tabela de reset tokens já existe
-- Apenas use userType = 'employee' ao invés de 'merchant'
```

**Vantagens:**
- ✅ Funciona imediatamente
- ✅ Não precisa alterar banco
- ✅ Employees já têm password_hash

**Desvantagens:**
- ❌ Merchants não podem recuperar senha
- ❌ Customers não podem recuperar senha

---

### **OPÇÃO 3: Usar Supabase Auth** (SOLUÇÃO PROFISSIONAL)

Migrar todo sistema para Supabase Auth:

```sql
-- Supabase Auth gerencia usuários automaticamente
-- Não precisa de campo password nas tabelas
-- Usa auth.users nativo
```

**Vantagens:**
- ✅ Sistema de auth completo
- ✅ Recuperação de senha nativa
- ✅ 2FA, OAuth, etc.
- ✅ Segurança gerenciada pelo Supabase

**Desvantagens:**
- ❌ Requer refatoração completa
- ❌ Migração de dados complexa
- ❌ Mudança grande de arquitetura

---

## 📋 RECOMENDAÇÃO: OPÇÃO 1

Vou te dar o SQL completo para **OPÇÃO 1** (adicionar campos de senha):

### **SQL COMPLETO PARA EXECUTAR NO SUPABASE:**

```sql
-- ============================================
-- 🔐 PREPARAR BANCO PARA RECUPERAÇÃO DE SENHA
-- ============================================

-- PASSO 1: Adicionar campo password nas tabelas
-- ============================================

-- Merchants (Estabelecimentos)
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Customers (Clientes)  
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password TEXT;

-- PASSO 2: Criar tabela de tokens de reset
-- ============================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('merchant', 'customer', 'employee')),
  user_id UUID,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PASSO 3: Criar índices
-- ============================================

-- Índices para merchants e customers
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Índices para password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_used ON password_reset_tokens(used);

-- PASSO 4: Ativar RLS (Row Level Security)
-- ============================================

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Políticas de segurança
-- ============================================

-- Permitir inserção pública (para criar tokens)
CREATE POLICY "Permitir criar tokens de reset"
ON password_reset_tokens FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir leitura de tokens válidos
CREATE POLICY "Permitir ler tokens válidos"
ON password_reset_tokens FOR SELECT
TO anon, authenticated
USING (used = false AND expires_at > NOW());

-- Permitir atualização para marcar como usado
CREATE POLICY "Permitir marcar token como usado"
ON password_reset_tokens FOR UPDATE
TO anon, authenticated
USING (used = false AND expires_at > NOW())
WITH CHECK (used = true);

-- Permitir deleção de tokens expirados
CREATE POLICY "Permitir deletar tokens expirados"
ON password_reset_tokens FOR DELETE
TO authenticated
USING (expires_at < NOW() OR used = true);

-- PASSO 6: Permitir leitura pública de merchants/customers (para validar email)
-- ============================================

-- Merchants
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Permitir leitura pública para validação"
ON merchants FOR SELECT
TO anon, authenticated
USING (true);

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Permitir leitura pública para validação"
ON customers FOR SELECT
TO anon, authenticated
USING (true);

-- PASSO 7: Permitir atualização de senha
-- ============================================

-- Merchants podem atualizar própria senha
CREATE POLICY IF NOT EXISTS "Permitir atualizar própria senha"
ON merchants FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Customers podem atualizar própria senha
CREATE POLICY IF NOT EXISTS "Permitir atualizar própria senha"
ON customers FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- ✅ VERIFICAÇÃO
-- ============================================

-- Verificar se campo password foi adicionado
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('merchants', 'customers') 
  AND column_name = 'password'
ORDER BY table_name;

-- Verificar tabela password_reset_tokens
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'password_reset_tokens'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE tablename IN ('merchants', 'customers', 'password_reset_tokens')
ORDER BY tablename, policyname;
```

---

## 🧪 APÓS EXECUTAR O SQL:

### **1. Testar se campo foi adicionado:**

```sql
-- Deve retornar 2 linhas (merchants e customers)
SELECT 
  table_name, 
  column_name 
FROM information_schema.columns 
WHERE column_name = 'password' 
  AND table_name IN ('merchants', 'customers');
```

### **2. Definir senhas iniciais (opcional):**

```sql
-- Definir senha padrão para merchants existentes
UPDATE merchants 
SET password = 'senha123' 
WHERE password IS NULL;

-- Definir senha padrão para customers existentes
UPDATE customers 
SET password = 'senha123' 
WHERE password IS NULL;
```

**⚠️ ATENÇÃO:** Em produção, use senhas hasheadas com bcrypt!

---

## 🔐 SEGURANÇA - Próximos Passos:

### **Depois de testar, você DEVE:**

1. **Implementar hash de senha** (bcrypt)
   - Não salvar senha em texto plano
   - Usar bcrypt.js ou similar
   
2. **Atualizar authStore.js**
   - Adicionar verificação de senha hasheada
   - Implementar login para merchants e customers

3. **Criar telas de cadastro**
   - Merchant signup
   - Customer signup
   - Definir senha inicial

---

## 📊 RESUMO:

| Ação | Status | Obrigatório? |
|------|--------|--------------|
| Adicionar campo `password` em `merchants` | ⏳ Pendente | ✅ SIM |
| Adicionar campo `password` em `customers` | ⏳ Pendente | ✅ SIM |
| Criar tabela `password_reset_tokens` | ⏳ Pendente | ✅ SIM |
| Criar índices | ⏳ Pendente | ✅ SIM |
| Ativar RLS | ⏳ Pendente | ✅ SIM |
| Criar políticas de segurança | ⏳ Pendente | ✅ SIM |
| Implementar hash de senha (bcrypt) | ⏳ Pendente | ⚠️ Recomendado |
| Atualizar authStore.js | ⏳ Pendente | ⚠️ Recomendado |

---

## 🚀 EXECUÇÃO RÁPIDA:

### **Copie e cole TUDO no Supabase SQL Editor:**

1. Acesse: https://supabase.com
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Clique em "New Query"
5. Cole o **SQL COMPLETO** acima (do PASSO 1 ao PASSO 7)
6. Clique em **RUN** (Ctrl+Enter)
7. Aguarde mensagem de sucesso ✅

**Tempo:** ~30 segundos ⏱️

---

## ❓ Dúvidas Comuns:

**Q: Por que merchants não têm senha?**
**A:** O sistema atual foi projetado para que **employees** (funcionários) façam login, não os merchants diretamente.

**Q: Posso usar só para employees?**
**A:** Sim! Mas o código atual tenta buscar em `merchants` e `customers`. Você precisaria modificar o código.

**Q: É seguro salvar senha em texto plano?**
**A:** NÃO! Apenas para testes. Em produção, use bcrypt para hashear as senhas.

**Q: O sistema de recuperação funciona sem adicionar campo password?**
**A:** NÃO! Vai dar erro ao tentar atualizar a senha, pois o campo não existe.

---

## ✅ CONCLUSÃO:

**EXECUTE O SQL COMPLETO ACIMA** para preparar o Supabase completamente.

Depois disso, o sistema de recuperação de senha funcionará perfeitamente! 🎉
