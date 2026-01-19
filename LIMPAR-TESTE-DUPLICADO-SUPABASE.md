# 🧹 Limpar Registros de Teste Duplicados

## 🐛 ERRO 409 - Conflito

Se você viu este erro:
```
Failed to load resource: the server responded with a status of 409 ()
```

Significa que já existe um registro duplicado no banco (provavelmente da tentativa anterior de teste).

---

## ✅ SOLUÇÃO: Limpar Registros de Teste

### Opção 1: Via Supabase Dashboard (Recomendado)

#### 1. Acesse Supabase
- URL: https://supabase.com/dashboard
- Projeto: **localcashback**

#### 2. Vá em Table Editor
- Menu lateral → **Table Editor**

#### 3. Limpar Merchants
1. Clique na tabela **merchants**
2. Encontre o registro de teste (ex: "Padaria Teste", "Teste RLS Fix", etc)
3. Clique no ícone de **lixeira** (🗑️) na linha
4. Confirme a exclusão

#### 4. Limpar Employees
1. Clique na tabela **employees**
2. Encontre o registro de teste (ex: "Maria Silva", "João Silva", etc)
3. Clique no ícone de **lixeira** (🗑️) na linha
4. Confirme a exclusão

---

### Opção 2: Via SQL Editor (Mais Rápido)

#### 1. Acesse SQL Editor
- Menu lateral → **SQL Editor**
- Clique em **New Query**

#### 2. Execute Este SQL

**⚠️ CUIDADO**: Isso vai deletar TODOS os registros de teste. Use com cuidado!

```sql
-- Ver registros antes de deletar (SEGURO)
SELECT id, name, email, created_at 
FROM merchants 
ORDER BY created_at DESC 
LIMIT 10;

SELECT id, name, email, merchant_id, role
FROM employees
ORDER BY created_at DESC
LIMIT 10;
```

**Se quiser deletar registros específicos de teste:**

```sql
-- Deletar merchant específico pelo email
DELETE FROM employees 
WHERE email = 'teste@exemplo.com';

DELETE FROM merchants 
WHERE email = 'teste@exemplo.com';

-- Ou deletar pelo nome
DELETE FROM employees 
WHERE name ILIKE '%teste%';

DELETE FROM merchants 
WHERE name ILIKE '%teste%';

-- Ou deletar todos os de hoje (CUIDADO!)
DELETE FROM employees 
WHERE DATE(created_at) = CURRENT_DATE;

DELETE FROM merchants 
WHERE DATE(created_at) = CURRENT_DATE;
```

#### 3. Verificar Limpeza

```sql
-- Contar registros
SELECT COUNT(*) as total_merchants FROM merchants;
SELECT COUNT(*) as total_employees FROM employees;

-- Ver últimos registros
SELECT * FROM merchants ORDER BY created_at DESC LIMIT 5;
SELECT * FROM employees ORDER BY created_at DESC LIMIT 5;
```

---

## 🧪 DEPOIS DE LIMPAR

### 1. Limpe o Cache do Navegador
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 2. Teste o Cadastro Novamente

Acesse:
```
https://localcashback.com.br/signup
```

Preencha com dados **NOVOS**:
- Email diferente
- Nome diferente
- Telefone diferente

### 3. Resultado Esperado

✅ **SEM erro 409** (conflito)
✅ **SEM erro 400** (password_hash agora está correto)
✅ Mensagem: "Conta criada! Verifique seu email para ativar."

---

## 🔍 ENTENDENDO OS CÓDIGOS DE ERRO

| Código | Significado | Causa |
|--------|-------------|-------|
| **400** | Bad Request | Dados inválidos (ex: campo obrigatório faltando) |
| **401** | Unauthorized | Sem permissão (RLS bloqueando) |
| **409** | Conflict | Registro duplicado (email/unique já existe) |

---

## 🎯 CHECKLIST PÓS-LIMPEZA

Depois de limpar e testar:

- [ ] Registros de teste deletados
- [ ] Cache do navegador limpo
- [ ] Tentei cadastrar com dados novos
- [ ] ✅ Cadastro funcionou sem erros
- [ ] Recebi email de verificação

---

## 📞 SE AINDA DER ERRO

### Erro 409 persiste?
**Causa**: Email ainda duplicado
**Solução**: Use email diferente ou delete o registro antigo

### Erro 400 persiste?
**Causa**: Campo obrigatório faltando
**Solução**: Verifique se preencheu TODOS os campos:
- Nome do Estabelecimento
- Telefone
- Endereço
- Seu Nome
- Email
- Senha
- Confirmar Senha

### Erro 401 persiste?
**Causa**: RLS ainda bloqueando
**Solução**: Execute o SQL de permissões novamente (arquivo anterior)

---

## 🎉 RESUMO

1. ✅ Limpe registros duplicados (409)
2. ✅ Nova build corrigiu password_hash (400)
3. ✅ Teste com dados novos
4. ✅ Deve funcionar agora!

---

**Build Atual**: 23/Nov/2025 22:00 UTC
**Status**: ✅ Código corrigido e deployado
