# 🎯 SOLUÇÃO DEFINITIVA - Logo Upload

## 🔴 PROBLEMA IDENTIFICADO

Olhando os resultados da query, descobri o erro real:

```
mime_type: application/json  ❌ ERRADO (deveria ser image/jpeg)
cache_control: no-cache      ❌ ERRADO (deveria ser 3600)
```

**Causa Raiz**: O código estava faltando `contentType: file.type` no upload do Supabase Storage.

## ✅ CORREÇÃO APLICADA

**Arquivo**: `src/pages/WhiteLabelSettings.jsx`

**Antes** (linha 114-119):
```javascript
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('merchant-assets')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });
```

**Depois** (CORRIGIDO):
```javascript
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('merchant-assets')
  .upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type, // ← ADICIONADO ESTA LINHA
    upsert: false
  });
```

---

## 📋 PASSOS PARA RESOLVER (EXECUTAR NESTA ORDEM)

### 🗑️ **Passo 1: Limpar Storage Corrompido**

Abra o **Supabase SQL Editor** e execute:

```sql
-- Deletar todos os arquivos corrompidos
DELETE FROM storage.objects 
WHERE bucket_id = 'merchant-assets';

-- Limpar logo_url do merchant
UPDATE merchants 
SET logo_url = NULL 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';

-- Verificar limpeza (deve retornar 0 em ambos)
SELECT 
    'Objetos no storage' as tipo,
    COUNT(*) as total
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'

UNION ALL

SELECT 
    'Logo URL no merchant' as tipo,
    COUNT(*) as total
FROM merchants 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da'
  AND logo_url IS NOT NULL;
```

**✅ Resultado Esperado**: Ambas as queries devem retornar `0`.

---

### 💻 **Passo 2: Atualizar Código Frontend**

O código já foi corrigido! Agora você precisa recarregar o dashboard:

1. **Parar o servidor** (se estiver rodando): `Ctrl+C`
2. **Iniciar novamente**:
   ```bash
   cd cashback-system
   npm run dev
   ```
3. **Limpar cache do navegador**: `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac)
4. **Ou abrir em aba anônima**: `Ctrl+Shift+N`

---

### 📤 **Passo 3: Fazer Novo Upload**

1. Acesse: http://localhost:5173/dashboard/white-label
2. Na seção **"Logo da Marca"**
3. Clique em **"Escolher logo"**
4. Selecione uma imagem (JPG, PNG, até 2MB)
5. Aguarde a mensagem: **"Logo carregada com sucesso!"**
6. Clique em **"Salvar Configurações"**

---

### ✔️ **Passo 4: Verificar Upload Correto**

Após o upload, execute esta query no **Supabase SQL Editor**:

```sql
SELECT 
    name,
    bucket_id,
    metadata->>'mimetype' as mime_type,
    metadata->>'size' as file_size_bytes,
    pg_size_pretty((metadata->>'size')::bigint) as file_size_readable,
    metadata->>'cacheControl' as cache_control,
    created_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 1;
```

**✅ Resultado Esperado**:
| Campo | Valor Esperado |
|-------|----------------|
| `mime_type` | `image/jpeg` ou `image/png` (NÃO `application/json`) |
| `cache_control` | `3600` (NÃO `no-cache`) |
| `file_size_readable` | Entre 50 KB - 500 KB (tamanho normal de logo) |

---

### 🌐 **Passo 5: Testar URL Pública**

Execute esta query para obter a URL pública:

```sql
SELECT 
    'https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/' || name as public_url
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 1;
```

**Copie a URL** e:
1. Abra em uma **aba anônima** (Ctrl+Shift+N)
2. Cole a URL na barra de endereços
3. **Deve mostrar**: A imagem do logo renderizada
4. **NÃO deve mostrar**: Texto JSON, "WebKitFormBoundary", ou erro

---

## 🔍 Se Ainda Não Funcionar

Execute o diagnóstico completo:

```sql
-- Ver configuração do bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'merchant-assets';

-- Ver políticas de acesso
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%merchant-assets%';

-- Ver merchant
SELECT id, name, logo_url
FROM merchants 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';
```

E me envie os resultados.

---

## 📊 Resumo da Solução

| Item | Status | Descrição |
|------|--------|-----------|
| **Código** | ✅ Corrigido | Adicionado `contentType: file.type` no upload |
| **Bucket** | ✅ Público | Configurado como `public = true` |
| **Políticas** | ✅ Criadas | SELECT, INSERT, UPDATE, DELETE para `public` |
| **Storage** | 🗑️ Limpeza Necessária | Deletar objetos corrompidos |
| **Merchant** | 🗑️ Limpeza Necessária | Limpar `logo_url` do banco |

---

## 🎉 Após Seguir Todos os Passos

O logo deve aparecer corretamente em:
- ✅ Dashboard de configurações (White Label Settings)
- ✅ Páginas do cliente (quando implementado)
- ✅ URL pública acessível diretamente

**Data da Correção**: 2025-11-11  
**Merchant Afetado**: `10bce3c4-6637-4e56-8792-8d815d8763da`
