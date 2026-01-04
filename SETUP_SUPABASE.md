# 🗄️ SETUP SUPABASE - Passo a Passo

## ⚠️ IMPORTANTE: Execute ESTE arquivo primeiro!

## 📋 Passo 1: Acessar o Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione seu projeto: **mtylboaluqswdkgljgsd**

## 📝 Passo 2: Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique no botão **+ New query** (canto superior direito)

## 📄 Passo 3: Copiar o Schema Completo

1. Abra o arquivo: `supabase-schema-completo.sql`
2. **COPIE TODO O CONTEÚDO** (Ctrl+A, Ctrl+C)
3. **COLE** no SQL Editor do Supabase (Ctrl+V)

## ▶️ Passo 4: Executar

1. Clique no botão **RUN** (ou pressione Ctrl+Enter)
2. Aguarde a execução (leva ~5-10 segundos)
3. Você verá mensagens de sucesso no console

## ✅ Passo 5: Verificar

Você deve ver esta mensagem no final:

```
✅ Schema criado com sucesso!
✅ 8 tabelas criadas
✅ Triggers configurados
✅ Índices criados
✅ RLS ativado

🔐 Login de teste:
   Email: admin@cashback.com
   Senha: qualquer_coisa
```

## 🔍 Passo 6: Confirmar Tabelas Criadas

1. No menu lateral, clique em **Table Editor**
2. Você deve ver estas 8 tabelas:
   - ✅ `merchants` (estabelecimentos)
   - ✅ `employees` (funcionários)
   - ✅ `customers` (clientes)
   - ✅ `transactions` (transações)
   - ✅ `redemptions` (resgates)
   - ✅ `marketing_spend` (gastos com marketing)
   - ✅ `integration_configs` (configurações de integração)
   - ✅ `integration_sync_log` (logs de sincronização)

## 🎯 Passo 7: Testar o Sistema

1. Acesse: **https://5174-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai**
2. Faça login com:
   - Email: `admin@cashback.com`
   - Senha: `qualquer_coisa` (qualquer coisa mesmo!)

3. Você deve entrar no dashboard! 🎉

## 🔧 Se algo der errado

### Erro: "relation already exists"
- Normal! Significa que a tabela já existe
- O script DROP no início limpa tudo
- Execute novamente

### Erro: "permission denied"
1. Vá em **Authentication** → **Policies**
2. Verifique se as políticas RLS estão ativas
3. O script já cria políticas permissivas

### Tabelas não aparecem
1. Recarregue a página (F5)
2. Verifique se está no projeto correto
3. Execute o script novamente

### Não consigo fazer login
1. Verifique no **Table Editor** se a tabela `employees` tem dados
2. Execute este SQL para verificar:
```sql
SELECT * FROM employees;
```

## 📊 Estrutura Criada

### Tabelas Principais (6)
- `merchants` - Seus estabelecimentos
- `employees` - Funcionários que podem acessar
- `customers` - Clientes finais
- `transactions` - Transações de cashback
- `redemptions` - Resgates
- `marketing_spend` - Gastos com tráfego (para CAC)

### Tabelas de Integrações (2)
- `integration_configs` - Credenciais Mailchimp/RD Station
- `integration_sync_log` - Histórico de sincronizações

### Funcionalidades Automáticas
- ✅ **Triggers**: Atualizam saldo automaticamente
- ✅ **Índices**: Buscas rápidas
- ✅ **RLS**: Segurança habilitada
- ✅ **Updated_at**: Atualiza automaticamente
- ✅ **Timestamps**: Registra data/hora

## 🎓 Próximos Passos

Depois de criar as tabelas:

1. ✅ Acesse o sistema
2. ✅ Faça login
3. ✅ Explore o dashboard
4. ✅ Teste gerar um cashback
5. ✅ Configure integrações (Mailchimp/RD Station)

## 💡 Dicas

### Adicionar mais funcionários
```sql
INSERT INTO employees (merchant_id, name, email, role, password_hash, is_active)
SELECT 
  id,
  'Seu Nome',
  'seu@email.com',
  'admin',
  'temp',
  true
FROM merchants
WHERE email = 'demo@cashback.com';
```

### Ver todos os clientes
```sql
SELECT * FROM customers ORDER BY created_at DESC;
```

### Ver transações recentes
```sql
SELECT 
  t.*,
  c.phone as customer_phone,
  m.name as merchant_name
FROM transactions t
JOIN customers c ON t.customer_id = c.id
JOIN merchants m ON t.merchant_id = m.id
ORDER BY t.created_at DESC
LIMIT 10;
```

### Limpar todos os dados (mas manter estrutura)
```sql
TRUNCATE TABLE integration_sync_log CASCADE;
TRUNCATE TABLE integration_configs CASCADE;
TRUNCATE TABLE marketing_spend CASCADE;
TRUNCATE TABLE redemptions CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE merchants CASCADE;
```

## 🆘 Suporte

Se tiver problemas:
1. Veja os logs no console do SQL Editor
2. Verifique se tem permissão de administrador no projeto
3. Tente executar o script novamente (ele limpa tudo antes)

---

**Pronto! Após executar o SQL, seu sistema estará 100% funcional! 🚀**
