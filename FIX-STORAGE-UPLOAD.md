# 🔧 GUIA COMPLETO - Corrigir Upload de Logo no Storage

## ❌ PROBLEMA ATUAL

**Erro:** `StorageApiError: new row violates row-level security policy`

**Onde:** Ao fazer upload de logo na página White Label Settings (`/whitelabel`)

**Causa:** As políticas RLS (Row Level Security) no `storage.objects` estão bloqueando uploads autenticados

---

## 📋 PASSO 1: DIAGNÓSTICO

Execute este script no **Supabase SQL Editor** para entender o problema:

```sql
-- COPIE E COLE TODO O CONTEÚDO DO ARQUIVO: diagnostic_storage.sql
```

**O que verificar:**
1. ✅ Bucket `merchant-assets` existe e está público?
2. ✅ RLS está habilitado na tabela `storage.objects`?
3. ❓ Quais políticas existem? Veja os nomes e condições
4. ❓ Existem objetos no bucket? (pode estar vazio)

**Me envie os resultados desse script!**

---

## 🔧 PASSO 2: SOLUÇÃO PRINCIPAL

Execute este script no **Supabase SQL Editor**:

```sql
-- COPIE E COLE TODO O CONTEÚDO DO ARQUIVO: fix_storage_rls.sql
```

**O que esse script faz:**
1. Remove todas as políticas antigas que podem estar conflitando
2. Habilita RLS corretamente
3. Cria 4 políticas novas e específicas:
   - `merchant_assets_insert` - Permite autenticados fazer upload
   - `merchant_assets_select` - Permite público ler arquivos
   - `merchant_assets_update` - Permite autenticados atualizar
   - `merchant_assets_delete` - Permite autenticados deletar
4. Verifica se as políticas foram criadas com sucesso

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

policyname              | cmd    | roles         | with_check
------------------------+--------+---------------+---------------------------
merchant_assets_insert  | INSERT | authenticated | bucket_id = 'merchant-assets'
merchant_assets_select  | SELECT | public        | NULL
merchant_assets_update  | UPDATE | authenticated | bucket_id = 'merchant-assets'
merchant_assets_delete  | DELETE | authenticated | NULL
```

---

## 🔧 PASSO 3: SOLUÇÃO ALTERNATIVA (Se Passo 2 falhar)

Se o script anterior não funcionar, use esta versão **SUPER PERMISSIVA** para testes:

```sql
-- COPIE E COLE TODO O CONTEÚDO DO ARQUIVO: fix_storage_rls_simple.sql
```

**⚠️ ATENÇÃO:** Essa versão permite que **qualquer pessoa** (até não autenticados) façam upload. Use apenas para testar!

**O que esse script faz:**
1. Desabilita RLS temporariamente
2. Remove TODAS as políticas antigas
3. Cria UMA política que permite TUDO no bucket `merchant-assets`
4. Re-habilita RLS

---

## 🧪 PASSO 4: TESTAR UPLOAD

Após executar o script de correção:

1. **Recarregue a página** `/whitelabel` no navegador (Ctrl + Shift + R)
2. **Tente fazer upload** de uma imagem pequena (menos de 1MB)
3. **Abra o Console do navegador** (F12 → Console)

### ✅ **Se funcionar:**
Você verá:
```
Logo atualizada com sucesso!
```

E a imagem aparecerá na página.

### ❌ **Se ainda não funcionar:**

**Me envie:**
1. A mensagem completa do console
2. Os resultados do `diagnostic_storage.sql`
3. Confirme que executou um dos scripts de correção

---

## 🔍 POSSÍVEIS CAUSAS ADICIONAIS

Se nenhuma das soluções acima funcionar, o problema pode ser:

### 1. **Sessão não está autenticada corretamente**

Teste se você está autenticado:

```sql
SELECT auth.uid() as current_user_id;
```

Se retornar `NULL`, você não está logado. Faça login novamente no sistema.

### 2. **Bucket não está público**

No Supabase Dashboard:
- Vá em **Storage** → **merchant-assets**
- Clique em **Settings** (ícone de engrenagem)
- Marque **Public bucket**
- Salve

### 3. **Configuração do Supabase Client**

Verifique se o `.env` tem as variáveis corretas:

```bash
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

---

## 📝 CHECKLIST DE VERIFICAÇÃO

Antes de testar novamente:

- [ ] Executei o `diagnostic_storage.sql` e vi os resultados
- [ ] Executei o `fix_storage_rls.sql` (ou versão simples)
- [ ] Vi mensagens de `CREATE POLICY` sem erros
- [ ] Recarreguei a página com Ctrl + Shift + R
- [ ] Verifiquei que estou logado no sistema
- [ ] Console do navegador está aberto para ver erros

---

## 🎯 PRÓXIMOS PASSOS APÓS CORREÇÃO

Quando o upload funcionar:

1. ✅ Testar upload de logo
2. ✅ Testar alteração de cores (primary, secondary, accent)
3. ✅ Testar alteração de porcentagem de cashback
4. ✅ Verificar se as mudanças aparecem na interface
5. ✅ Aplicar o branding nas páginas do cliente

---

## 📞 ME ENVIE

Para eu te ajudar melhor, me envie:

1. **Resultado do script de diagnóstico** (`diagnostic_storage.sql`)
2. **Qual script de correção você executou** (principal ou alternativo)
3. **Mensagens do console** após tentar upload
4. **Screenshot** da mensagem de erro (se possível)

---

## 🚀 CONTEXTO DO SISTEMA WHITE LABEL

Este upload faz parte do sistema **White Label Multi-Tenant** onde:

- Cada merchant (estabelecimento) é 100% independente
- Cada merchant pode ter sua própria logo
- Cada merchant pode personalizar cores do sistema
- Cada merchant define sua porcentagem de cashback
- Clientes só veem e usam cashback do merchant onde se cadastraram

A logo é armazenada no bucket `merchant-assets` do Supabase Storage e a URL é salva na coluna `logo_url` da tabela `merchants`.

---

## 🆘 ÚLTIMA OPÇÃO: DESABILITAR RLS COMPLETAMENTE (TEMPORÁRIO)

**⚠️ SOMENTE PARA TESTES - NÃO USE EM PRODUÇÃO**

Se nada mais funcionar e você só quer testar se o código funciona:

```sql
-- DESABILITA RLS (INSEGURO!)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

Depois de testar:

```sql
-- RE-HABILITA RLS (IMPORTANTE!)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

Depois execute novamente o script `fix_storage_rls.sql`.

---

**Boa sorte! 🍀 Me avise quando testar!**
