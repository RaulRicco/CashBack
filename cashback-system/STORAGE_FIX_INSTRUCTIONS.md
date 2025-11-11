# 🔧 Instruções para Corrigir o Upload de Logo

## ❌ Problema Identificado

Os objetos no Supabase Storage estão **corrompidos** - contêm dados brutos do formulário multipart em vez do arquivo de imagem processado.

**Sintoma**: Ao acessar a URL da imagem, o navegador mostra:
```
WebKitFormBoundaryiDcgjPBCyiDcx2oE
Content-Disposition: form-data; name="cacheControl"
...
```

## ✅ Solução Completa

### Passo 1: Executar SQL de Limpeza

Abra o **SQL Editor** do Supabase e execute o arquivo `cleanup_corrupted_storage.sql`:

```sql
-- 1. Ver objetos antes de deletar
SELECT 
    name,
    bucket_id,
    metadata->>'mimetype' as mime_type,
    created_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC;

-- 2. Deletar objetos corrompidos
DELETE FROM storage.objects 
WHERE bucket_id = 'merchant-assets';

-- 3. Limpar referência no banco
UPDATE merchants 
SET logo_url = NULL 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';

-- 4. Verificar limpeza
SELECT COUNT(*) as total_objects
FROM storage.objects 
WHERE bucket_id = 'merchant-assets';
-- Deve retornar: 0
```

### Passo 2: Limpar Cache do Navegador

**IMPORTANTE**: Antes de re-upload, limpe o cache!

**Chrome/Edge/Brave**:
1. Abra DevTools (F12)
2. Clique direito no botão de refresh
3. Selecione "Limpar cache e recarregar"

**Firefox**:
1. Abra DevTools (F12)
2. Clique direito no botão de refresh
3. Selecione "Limpar cache e recarregar"

**Ou use**:
- Chrome: `Ctrl+Shift+Delete` → Limpar "Imagens e arquivos em cache"
- Firefox: `Ctrl+Shift+Delete` → Limpar "Cache"

### Passo 3: Recarregar a Página

1. Feche completamente o navegador
2. Reabra e acesse: http://localhost:5173/dashboard/white-label
3. **Ou force reload**: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)

### Passo 4: Fazer Novo Upload

1. Na seção **"Logo da Marca"**
2. Clique em **"Escolher logo"**
3. Selecione uma imagem válida:
   - Formato: JPG, PNG, SVG ou WebP
   - Tamanho máximo: 2MB
   - Recomendado: 200x200px ou maior
4. Aguarde a mensagem: **"Logo carregada com sucesso! Clique em Salvar para confirmar."**
5. Clique em **"Salvar Configurações"**

### Passo 5: Verificar Resultado

Abra o **Console do Navegador** (F12 → Console) e verifique:

✅ **Sucesso** - Deve aparecer:
```
✅ Logo carregada com sucesso: https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/logos/...
```

❌ **Erro** - Se aparecer:
```
❌ Erro ao carregar logo: ...
```

Significa que ainda há problema. Neste caso:
1. Verifique se executou o SQL de limpeza
2. Confirme que limpou o cache do navegador
3. Teste acessar a URL da imagem diretamente em uma aba anônima

### Passo 6: Validar a URL da Imagem

Copie a URL da imagem e abra em uma **nova aba anônita** (Ctrl+Shift+N):

✅ **Deve mostrar**: A imagem do logo renderizada
❌ **NÃO deve mostrar**: Texto "WebKitFormBoundary..."

---

## 🔍 Diagnóstico Adicional (Se Ainda Houver Problema)

Se após seguir todos os passos ainda não funcionar, execute este SQL de diagnóstico:

```sql
-- Ver estado do bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'merchant-assets';

-- Ver políticas de acesso
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Ver objetos armazenados
SELECT 
    name,
    bucket_id,
    owner,
    metadata,
    path_tokens,
    created_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 5;

-- Ver configuração do merchant
SELECT 
    id,
    name,
    logo_url,
    primary_color,
    secondary_color
FROM merchants 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';
```

---

## ⚙️ Configuração Atual (Já Aplicada)

✅ **Bucket configurado como público**
✅ **Políticas de acesso criadas** (SELECT, INSERT, UPDATE, DELETE)
✅ **Código de upload correto** em `WhiteLabelSettings.jsx`

**Problema era**: Objetos corrompidos no storage que precisam ser deletados e re-uploaded.

---

## 📞 Suporte

Se o problema persistir após seguir TODOS os passos:

1. Envie o resultado dos comandos SQL de diagnóstico
2. Envie screenshot do Console do navegador (F12 → Console)
3. Envie screenshot da aba Network (F12 → Network) durante o upload
4. Informe a URL completa da imagem que está tentando acessar

---

**Última atualização**: 2025-11-11
**Status**: Aguardando execução do SQL de limpeza e re-upload
