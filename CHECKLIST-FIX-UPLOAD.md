# ✅ CHECKLIST RÁPIDO - Corrigir Upload de Logo

## 📌 ORDEM DE EXECUÇÃO

Siga esta ordem exatamente:

---

### ✅ PASSO 1: DIAGNÓSTICO
**Onde:** Supabase SQL Editor  
**Arquivo:** `diagnostic_storage.sql`  
**Ação:** Copie e cole TODO o conteúdo e execute

**O que verificar:**
- [ ] Bucket `merchant-assets` existe?
- [ ] RLS está habilitado?
- [ ] Existem políticas?

**ME ENVIE OS RESULTADOS!** (Copie e cole a saída)

---

### ✅ PASSO 2: APLICAR CORREÇÃO
**Onde:** Supabase SQL Editor  
**Arquivo:** `fix_storage_rls.sql`  
**Ação:** Copie e cole TODO o conteúdo e execute

**Resultado esperado:**
```
DROP POLICY
DROP POLICY
DROP POLICY
DROP POLICY
ALTER TABLE
CREATE POLICY
CREATE POLICY
CREATE POLICY
CREATE POLICY
```

**Se der erro:** Use `fix_storage_rls_simple.sql` em vez disso

---

### ✅ PASSO 3: VERIFICAR CORREÇÃO
**Onde:** Supabase SQL Editor  
**Arquivo:** `verify_storage_fix.sql`  
**Ação:** Copie e cole TODO o conteúdo e execute

**Busque por:**
- [ ] "✅ CONFIGURAÇÃO PARECE BOA"
- [ ] 4 políticas criadas
- [ ] RLS habilitado
- [ ] Usuário autenticado

**ME ENVIE OS RESULTADOS!**

---

### ✅ PASSO 4: TESTAR UPLOAD
**Onde:** Navegador - `/whitelabel`  
**Ação:** 
1. [ ] Abra o Console (F12 → Console)
2. [ ] Recarregue a página (Ctrl + Shift + R)
3. [ ] Tente fazer upload de uma imagem (máx 2MB)
4. [ ] Veja a mensagem no console

**✅ Sucesso:** "Logo atualizada com sucesso!"  
**❌ Erro:** Me envie a mensagem completa do console

---

## 🚨 SE NÃO FUNCIONAR

Execute estes comandos SQL:

```sql
-- 1. Verificar se você está logado
SELECT auth.uid() as meu_user_id;
-- Se retornar NULL, você NÃO está logado!

-- 2. Verificar bucket
SELECT name, public FROM storage.buckets WHERE name = 'merchant-assets';
-- public deve ser 'true'

-- 3. Contar políticas
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
-- Deve ter pelo menos 1
```

**ME ENVIE:**
- [ ] Resultado do auth.uid()
- [ ] Resultado do bucket
- [ ] Número de políticas
- [ ] Mensagem completa do erro no console

---

## 📁 ARQUIVOS DISPONÍVEIS

1. **FIX-STORAGE-UPLOAD.md** → Guia completo e detalhado
2. **diagnostic_storage.sql** → Diagnóstico (EXECUTAR PRIMEIRO)
3. **fix_storage_rls.sql** → Correção principal
4. **fix_storage_rls_simple.sql** → Correção alternativa (mais permissiva)
5. **verify_storage_fix.sql** → Verificação pós-correção
6. **CHECKLIST-FIX-UPLOAD.md** → Este arquivo (checklist rápido)

---

## 🎯 OBJETIVO

Permitir que o merchant faça upload da logo da sua loja no sistema White Label.

**Por que é importante:**
Cada loja pode ter sua própria identidade visual com logo e cores personalizadas.

---

## 💬 DÚVIDAS?

Me envie:
1. Em qual passo você está
2. Qual erro apareceu
3. Os resultados dos scripts SQL que executou

Estou aqui para ajudar! 🚀
