# Fix Logo Display Issue - Solução Completa

## ❌ Problema Atual
O upload da logo funciona e gera uma URL, mas a imagem não carrega no navegador:
```
https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951517388.png
```

## 🔍 Diagnóstico
O erro indica que:
1. ✅ Upload está funcionando (URL gerada)
2. ❌ Arquivo não pode ser acessado/exibido
3. **Causa provável**: Falta de políticas de Storage para leitura pública

## 🛠️ Solução em 3 Passos

### PASSO 1: Verificar se o Bucket Existe e é Público

**Acesse o Supabase Dashboard:**
1. Vá em: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em "Storage" no menu lateral
4. Procure o bucket `merchant-assets`

**Se o bucket NÃO EXISTIR, crie assim:**
- Clique em "New bucket"
- Nome: `merchant-assets`
- ✅ Marque a opção: **"Public bucket"**
- File size limit: 2097152 (2MB)
- Allowed MIME types: `image/*`

**Se o bucket já existir mas não for público:**
- Clique nos 3 pontinhos ao lado do bucket
- Clique em "Edit bucket"
- ✅ Marque: **"Public bucket"**
- Salve

---

### PASSO 2: Criar Políticas de Storage (SQL)

**Copie e execute este SQL no Supabase Dashboard → SQL Editor:**

```sql
-- ============================================
-- POLÍTICAS DE STORAGE PARA MERCHANT-ASSETS
-- ============================================

-- 1. Permitir LEITURA PÚBLICA de todas as imagens
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'merchant-assets' );

-- 2. Permitir UPLOAD apenas para merchants autenticados
CREATE POLICY "Merchants can upload their own logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'merchant-assets' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'logos'
);

-- 3. Permitir UPDATE apenas para merchants autenticados
CREATE POLICY "Merchants can update their own logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'merchant-assets' 
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'merchant-assets' 
  AND auth.uid() IS NOT NULL
);

-- 4. Permitir DELETE apenas para merchants autenticados
CREATE POLICY "Merchants can delete their own logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'merchant-assets' 
  AND auth.uid() IS NOT NULL
);

-- Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%merchant%'
ORDER BY policyname;
```

**⚠️ Se der erro "policy already exists":**
Primeiro delete as políticas antigas:

```sql
-- Deletar políticas antigas (se existirem)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can upload their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can update their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can delete their own logos" ON storage.objects;
```

E depois execute novamente as políticas do PASSO 2.

---

### PASSO 3: Testar o Upload Novamente

1. Faça login como merchant no sistema
2. Vá em "Configurações White Label"
3. Faça upload de uma logo nova
4. **Teste a URL diretamente no navegador:**
   - Abra uma nova aba
   - Cole a URL gerada
   - Veja se a imagem carrega

**Exemplo de teste manual:**
```
https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/ARQUIVO.png
```

---

## 🔧 Solução Alternativa: Verificar CORS

Se ainda não funcionar, adicione políticas de CORS no bucket:

**Supabase Dashboard → Storage → merchant-assets → Configuration:**

```json
[
  {
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 🧪 Código de Teste Rápido

Se quiser testar o upload via código JavaScript no console do navegador:

```javascript
// Teste 1: Verificar se o arquivo existe
const testUrl = 'https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951517388.png';

fetch(testUrl)
  .then(response => {
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    return response.blob();
  })
  .then(blob => {
    console.log('Blob size:', blob.size);
    console.log('Blob type:', blob.type);
  })
  .catch(error => console.error('Erro:', error));

// Teste 2: Listar arquivos no bucket
const { data, error } = await supabase
  .storage
  .from('merchant-assets')
  .list('logos', {
    limit: 10,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  });

console.log('Arquivos:', data);
console.log('Erro:', error);
```

---

## ✅ Checklist Final

- [ ] Bucket `merchant-assets` existe e é PÚBLICO
- [ ] Políticas de Storage criadas (4 políticas)
- [ ] URL da logo carrega em uma nova aba do navegador
- [ ] Upload funciona e imagem aparece na página
- [ ] Não há erros no console do navegador

---

## 📝 Notas Importantes

1. **URL Pública**: A URL deve começar com `/storage/v1/object/public/` para ser acessível
2. **Formato correto**: `https://SEU-PROJECT.supabase.co/storage/v1/object/public/merchant-assets/logos/ARQUIVO.png`
3. **Bucket público**: Sem isso, nenhuma imagem será exibida
4. **Políticas de leitura**: Sem a policy "Public Access", até buckets públicos falham

---

## 🚨 Se AINDA não funcionar

Execute este SQL para debug:

```sql
-- Verificar configuração do bucket
SELECT * FROM storage.buckets WHERE name = 'merchant-assets';

-- Verificar políticas de storage
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- Verificar se arquivos existem
SELECT 
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 10;
```

---

**💡 Dica Final:** O problema mais comum é o bucket não estar marcado como "Public" no Supabase Dashboard. Verifique isso PRIMEIRO!
