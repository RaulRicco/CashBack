# 🗄️ Guia de Configuração do Supabase

## Passo 1: Acessar o SQL Editor

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**

## Passo 2: Executar o Schema

Cole todo o conteúdo do arquivo `supabase-schema.sql` e execute.

Ou copie e execute este script:

```sql
-- ====================================
-- SISTEMA DE CASHBACK - SCHEMA SUPABASE
-- ====================================

-- Tabela de Estabelecimentos (Merchants)
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cashback_percentage DECIMAL(5,2) DEFAULT 5.00,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Funcionários (Employees)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator',
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes (Customers)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  total_cashback DECIMAL(10,2) DEFAULT 0.00,
  available_cashback DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  first_purchase_at TIMESTAMP WITH TIME ZONE,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações (Transactions)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
  transaction_type VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  cashback_amount DECIMAL(10,2) NOT NULL,
  cashback_percentage DECIMAL(5,2) NOT NULL,
  qr_code_token VARCHAR(255) UNIQUE,
  qr_scanned BOOLEAN DEFAULT false,
  qr_scanned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Resgates (Redemptions)
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  qr_code_token VARCHAR(255) UNIQUE,
  qr_scanned BOOLEAN DEFAULT false,
  qr_scanned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Gastos com Marketing (Marketing Spend)
CREATE TABLE IF NOT EXISTS marketing_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(50),
  campaign_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [... resto do schema com índices, triggers, etc ...]
```

## Passo 3: Inserir Dados de Teste

Execute este script para criar um estabelecimento e funcionário de teste:

```sql
-- Inserir estabelecimento de exemplo
INSERT INTO merchants (name, email, phone, cashback_percentage)
VALUES ('Minha Loja', 'contato@minhaloja.com', '11999999999', 5.00)
ON CONFLICT (email) DO NOTHING;

-- Inserir funcionário de exemplo
INSERT INTO employees (merchant_id, name, email, role, password_hash, is_active)
SELECT 
  id,
  'Administrador',
  'admin@minhaloja.com',
  'admin',
  'temp_password_hash',
  true
FROM merchants
WHERE email = 'contato@minhaloja.com'
ON CONFLICT (email) DO NOTHING;
```

## Passo 4: Verificar Tabelas

Execute para verificar se tudo foi criado:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver:
- ✅ customers
- ✅ employees
- ✅ marketing_spend
- ✅ merchants
- ✅ redemptions
- ✅ transactions

## Passo 5: Testar Login

Após executar tudo, você pode fazer login no sistema com:

- **Email**: `admin@minhaloja.com`
- **Senha**: Qualquer senha (modo desenvolvimento)

## 🔐 Configurar RLS (Row Level Security)

Por padrão, o schema já vem com políticas RLS permissivas para desenvolvimento.

Para produção, você pode ajustar as políticas em **Authentication → Policies**.

## 📊 Visualizar Dados

Use o **Table Editor** no Supabase para:
- Ver clientes cadastrados
- Acompanhar transações
- Gerenciar funcionários
- Verificar resgates

## 🔄 Atualizar Schema

Se precisar atualizar o schema no futuro:

1. Acesse **SQL Editor**
2. Execute seus comandos ALTER TABLE
3. Ou delete as tabelas e recrie:

```sql
-- CUIDADO: Isso apaga todos os dados!
DROP TABLE IF EXISTS redemptions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS marketing_spend CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- Execute o schema novamente
```

## 🎯 Próximos Passos

1. ✅ Schema criado
2. ✅ Dados de teste inseridos
3. 🔄 Configurar variáveis de ambiente no `.env`
4. 🔄 Executar `npm run dev`
5. 🔄 Fazer login e testar o sistema

## 🆘 Problemas Comuns

### Erro: "relation already exists"
- Significa que a tabela já existe
- Pode ignorar ou usar `DROP TABLE` antes

### Erro: "permission denied"
- Verifique as políticas RLS
- Temporariamente, desative RLS para testes:
```sql
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;
-- Faça isso para todas as tabelas
```

### Dados não aparecem
- Verifique se executou os INSERTs de teste
- Use o Table Editor para visualizar
- Confira as queries no console do navegador

---

**Pronto! Seu banco de dados está configurado! 🎉**
