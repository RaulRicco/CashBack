# 🚨 EXECUTAR SQL NO SUPABASE - URGENTE

## 🐛 PROBLEMA ATUAL

Erro 401 ao criar conta:
```
Failed to load resource: the server responded with a status of 401 ()
Erro ao criar conta: Object
```

**Causa**: As tabelas `merchants` e `employees` no Supabase têm RLS (Row Level Security) ativado, mas **NÃO têm políticas que permitam usuários anônimos** (não autenticados) criarem registros.

**Resultado**: Quando alguém tenta se cadastrar pela primeira vez (ainda não está logado), o Supabase bloqueia a inserção.

---

## ✅ SOLUÇÃO: Executar SQL

Preciso que você execute o SQL que criei no Supabase para permitir cadastro anônimo.

---

## 📋 PASSO A PASSO (5 minutos)

### Passo 1: Acesse o Supabase
1. Abra: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: **localcashback**

### Passo 2: Abra o SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor** (ícone `</>`)
2. Clique em **New Query** (+ Nova Consulta)

### Passo 3: Cole o SQL Abaixo

Copie e cole TODO este SQL:

```sql
-- ========================================
-- FIX: Permitir Signup Anônimo
-- ========================================

-- 1. MERCHANTS: Permitir INSERT anônimo
DROP POLICY IF EXISTS "Enable insert for anon" ON merchants;
CREATE POLICY "Enable insert for anon" 
ON merchants 
FOR INSERT 
TO anon 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for anon" ON merchants;
CREATE POLICY "Enable select for anon" 
ON merchants 
FOR SELECT 
TO anon 
USING (true);

-- 2. EMPLOYEES: Permitir INSERT anônimo
DROP POLICY IF EXISTS "Enable insert for anon" ON employees;
CREATE POLICY "Enable insert for anon" 
ON employees 
FOR INSERT 
TO anon 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for anon" ON employees;
CREATE POLICY "Enable select for anon" 
ON employees 
FOR SELECT 
TO anon 
USING (true);

-- 3. Garantir RLS ativado
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 4. Manter políticas para autenticados
DROP POLICY IF EXISTS "Enable all for authenticated users" ON merchants;
CREATE POLICY "Enable all for authenticated users" 
ON merchants 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for authenticated users" ON employees;
CREATE POLICY "Enable all for authenticated users" 
ON employees 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Verificação
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('merchants', 'employees')
ORDER BY tablename, policyname;
```

### Passo 4: Execute o SQL
1. Clique no botão **Run** (▶️ Executar) no canto inferior direito
2. Aguarde alguns segundos

### Passo 5: Verifique o Resultado

Você deve ver na parte inferior:

```
Success. Rows returned: X
```

E uma tabela mostrando as políticas criadas:

| tablename | policyname | roles | cmd |
|-----------|-----------|-------|-----|
| merchants | Enable insert for anon | {anon} | INSERT |
| merchants | Enable select for anon | {anon} | SELECT |
| merchants | Enable all for authenticated... | {authenticated} | ALL |
| employees | Enable insert for anon | {anon} | INSERT |
| employees | Enable select for anon | {anon} | SELECT |
| employees | Enable all for authenticated... | {authenticated} | ALL |

**Se ver isso, está PERFEITO!** ✅

---

## 🧪 TESTE IMEDIATAMENTE

Após executar o SQL:

1. **Volte para o site**
   ```
   https://localcashback.com.br/signup
   ```

2. **Limpe o cache**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Abra o Console** (F12)
   - Vá na aba "Console"
   - Limpe mensagens antigas

4. **Preencha o Formulário**
   - Nome do Estabelecimento: "Teste RLS Fix"
   - Telefone: (11) 98765-4321
   - Endereço: Rua Teste, 456
   - Nome: Maria Silva
   - Email: maria@teste.com
   - Senha: teste123
   - Confirmar: teste123

5. **Clique em "Criar Conta Grátis"**

### Resultado Esperado:

✅ **SEM erro 401**
✅ Mensagem: "Conta criada! Verifique seu email para ativar."
✅ Redirecionamento para verificação de email

### Se ainda der erro:

- Copie TODO o erro do console (F12)
- Me envie para eu analisar
- Verifique se o SQL foi executado corretamente

---

## ❓ POR QUE ISSO É NECESSÁRIO?

### Antes (Com erro):
```
Usuário não logado (anon) 
   ↓ Tenta criar conta
   ↓ INSERT em merchants
   ❌ Bloqueado por RLS (401)
```

### Depois (Corrigido):
```
Usuário não logado (anon) 
   ↓ Tenta criar conta
   ↓ INSERT em merchants
   ✅ Permitido pela política "Enable insert for anon"
   ✅ Conta criada com sucesso!
```

---

## 🔒 SEGURANÇA

**Isso é seguro?**

✅ **SIM!** Estamos apenas permitindo:
- Criar novos registros (INSERT)
- Ler para verificar duplicatas (SELECT)

❌ **NÃO permitimos**:
- Deletar registros (DELETE)
- Atualizar registros de outros (UPDATE protegido)
- Ver dados sensíveis de outros merchants

Após o usuário fazer login, ele terá acesso completo apenas aos **seus próprios dados**.

---

## 📊 VERIFICAÇÃO ADICIONAL (Opcional)

Se quiser ver todas as políticas ativas:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('merchants', 'employees')
ORDER BY tablename, policyname;
```

---

## 🚨 SE DER ERRO AO EXECUTAR SQL

### Erro: "permission denied"
**Solução**: Você precisa estar como owner do projeto ou ter permissões de admin.

### Erro: "relation does not exist"
**Solução**: Verifique se as tabelas `merchants` e `employees` existem:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Erro: "syntax error"
**Solução**: Copie o SQL novamente, certifique-se de pegar TODO o código.

---

## 📞 APÓS EXECUTAR

Me avise:
1. ✅ "SQL executado com sucesso" - E teste o cadastro
2. ❌ "Deu erro ao executar" - Me envie o erro completo
3. ⚠️ "Executou mas ainda dá erro 401" - Me envie o erro do console

---

## 🎯 RESUMO

1. ✅ Acesse Supabase Dashboard
2. ✅ SQL Editor → New Query
3. ✅ Cole o SQL completo
4. ✅ Execute (Run)
5. ✅ Verifique sucesso
6. ✅ Teste cadastro no site

**Tempo estimado: 5 minutos**

---

**Arquivo SQL também salvo em:**
`/var/www/cashback/cashback-system/FIX-SIGNUP-RLS-ANON.sql`

Depois que executar, me avise se funcionou! 🚀
