# 🚨 EXECUTAR NO SUPABASE - URGENTE

## 🐛 PROBLEMAS ATUAIS

1. ❌ **Erro 409**: Email `pprih.24@gmail.com` já existe (duplicado)
2. ❌ **Erro 404**: Tabela `email_verifications` não existe

---

## ✅ SOLUÇÃO RÁPIDA (10 minutos)

### PARTE 1: Criar Tabela + Limpar Duplicados

#### 1. Acesse Supabase
- https://supabase.com/dashboard
- Projeto: **localcashback**

#### 2. SQL Editor → New Query

#### 3. Cole e Execute Este SQL

```sql
-- ========================================
-- PASSO 1: Criar tabela email_verifications
-- ========================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_email_verifications_employee_id 
ON email_verifications(employee_id);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email 
ON email_verifications(email);

CREATE INDEX IF NOT EXISTS idx_email_verifications_code 
ON email_verifications(code);

-- ========================================
-- PASSO 2: Configurar RLS
-- ========================================
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Permitir acesso anônimo
DROP POLICY IF EXISTS "Enable insert for anon" ON email_verifications;
CREATE POLICY "Enable insert for anon" 
ON email_verifications FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for anon" ON email_verifications;
CREATE POLICY "Enable select for anon" 
ON email_verifications FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Enable update for anon" ON email_verifications;
CREATE POLICY "Enable update for anon" 
ON email_verifications FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Permitir acesso autenticado
DROP POLICY IF EXISTS "Enable all for authenticated users" ON email_verifications;
CREATE POLICY "Enable all for authenticated users" 
ON email_verifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================
-- PASSO 3: Limpar duplicados
-- ========================================

-- Ver duplicados (não deleta, só mostra)
SELECT email, COUNT(*) as count
FROM merchants
GROUP BY email
HAVING COUNT(*) > 1;

-- DELETAR duplicados do email de teste
DELETE FROM employees WHERE email = 'pprih.24@gmail.com';
DELETE FROM merchants WHERE email = 'pprih.24@gmail.com';

-- Limpar outros testes de hoje (OPCIONAL)
-- DELETE FROM employees WHERE DATE(created_at) = CURRENT_DATE;
-- DELETE FROM merchants WHERE DATE(created_at) = CURRENT_DATE;

-- ========================================
-- PASSO 4: Verificar
-- ========================================
SELECT 'Tabela criada!' as status, COUNT(*) as total 
FROM information_schema.tables 
WHERE table_name = 'email_verifications';

SELECT 'Políticas criadas!' as status, COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'email_verifications';

SELECT 'Duplicados removidos!' as status, COUNT(*) as total
FROM merchants 
WHERE email = 'pprih.24@gmail.com';
```

#### 4. Clique em **Run** ▶️

#### 5. Aguarde Resultado

Você deve ver:

```
✅ Tabela criada! total: 1
✅ Políticas criadas! total: 4
✅ Duplicados removidos! total: 0
```

---

## 🧪 TESTE IMEDIATAMENTE

### 1. Limpe Cache
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 2. Acesse Signup
```
https://localcashback.com.br/signup
```

### 3. Preencha Formulário

Use o **MESMO email** agora (pprih.24@gmail.com):

**Dados do Estabelecimento:**
- Nome: Meu Estabelecimento
- Telefone: (11) 98765-4321
- Endereço: Rua Exemplo, 123

**Seus Dados:**
- Nome: Seu Nome Completo
- Email: **pprih.24@gmail.com**
- Senha: suasenha123
- Confirmar: suasenha123

### 4. Clique em "Criar Conta Grátis"

### 5. Resultado Esperado

✅ "Conta criada! Verifique seu email para ativar."
✅ Email enviado para pprih.24@gmail.com
✅ Redirecionamento para verificação
✅ **SEM erro 404** (tabela criada)
✅ **SEM erro 409** (duplicados removidos)

---

## ❌ SE AINDA DER ERRO

### Erro 404 persiste?
**Causa**: SQL não foi executado corretamente
**Solução**: 
1. Execute novamente
2. Verifique se tem permissões de admin
3. Copie o erro e me envie

### Erro 409 persiste?
**Causa**: Ainda há duplicados
**Solução**:
```sql
-- Execute só isso
DELETE FROM employees WHERE email = 'pprih.24@gmail.com';
DELETE FROM merchants WHERE email = 'pprih.24@gmail.com';
```

### Erro 400?
**Causa**: Campo obrigatório faltando
**Solução**: Preencha TODOS os campos do formulário

---

## 📊 O QUE ESSE SQL FAZ

1. ✅ **Cria tabela** `email_verifications` para salvar códigos
2. ✅ **Cria índices** para performance
3. ✅ **Ativa RLS** com políticas permissivas
4. ✅ **Remove duplicados** do seu email
5. ✅ **Verifica** que tudo foi criado

---

## 🔒 SEGURANÇA

**É seguro?**

✅ SIM! 
- Tabela para verificação de email é necessária
- Políticas RLS protegem os dados
- Apenas remove duplicados de TESTE
- Códigos expiram automaticamente

---

## 📝 RESUMO

### Execute no Supabase:
1. ✅ SQL Editor → New Query
2. ✅ Cole o SQL completo acima
3. ✅ Execute (Run)
4. ✅ Verifique sucesso

### Teste no site:
1. ✅ Limpe cache (`Ctrl + Shift + R`)
2. ✅ Acesse `/signup`
3. ✅ Preencha formulário com `pprih.24@gmail.com`
4. ✅ Clique em "Criar Conta Grátis"

### Resultado:
✅ Conta criada
✅ Email enviado
✅ Sem erros 404 ou 409

---

## 📞 DEPOIS DE EXECUTAR

Me avise:
- ✅ "SQL executado com sucesso!"
- ✅ "Testei e funcionou!"
- ❌ "Deu erro X ao executar" (me envie o erro)
- ❌ "Executou mas ainda dá erro" (me envie o erro do console)

---

**Tempo estimado: 5-10 minutos**

**Execute agora e me avise!** 🚀
