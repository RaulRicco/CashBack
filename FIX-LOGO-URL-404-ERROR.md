# 🔧 CORRIGIR LOGO_URL INVÁLIDO NO BANCO

## 🎯 PROBLEMA IDENTIFICADO

**Erro no console:**
```
dourado:1 Failed to load resource: the server responded with a status of 404 ()
```

**Causa:** O campo `logo_url` na tabela `merchants` contém texto inválido (ex: "dourado") ao invés de uma URL completa.

---

## ⚡ SOLUÇÃO RÁPIDA (2 MINUTOS)

### 1. Verificar URLs inválidas

Execute no Supabase SQL Editor para ver quais merchants têm URLs inválidas:

```sql
-- Ver merchants com logo_url inválido
SELECT 
  id,
  name,
  business_name,
  logo_url,
  CASE 
    WHEN logo_url IS NULL THEN 'NULL (ok, usa fallback)'
    WHEN logo_url LIKE 'http://%' OR logo_url LIKE 'https://%' THEN 'URL válida'
    WHEN logo_url LIKE '/%' THEN 'Caminho relativo (ok)'
    ELSE '❌ INVÁLIDO'
  END as status
FROM merchants
WHERE logo_url IS NOT NULL 
  AND logo_url NOT LIKE 'http://%' 
  AND logo_url NOT LIKE 'https://%'
  AND logo_url NOT LIKE '/%';
```

### 2. Corrigir URLs inválidas

Opção A: **Remover URLs inválidas** (usar fallback do sistema)

```sql
-- Limpar logo_url inválidos (sistema usará fallback)
UPDATE merchants 
SET logo_url = NULL
WHERE logo_url IS NOT NULL 
  AND logo_url NOT LIKE 'http://%' 
  AND logo_url NOT LIKE 'https://%'
  AND logo_url NOT LIKE '/%';

-- Verificar resultado
SELECT id, name, logo_url 
FROM merchants 
WHERE logo_url IS NULL;
```

Opção B: **Atualizar com logo padrão**

```sql
-- Definir logo padrão para merchants sem logo válido
UPDATE merchants 
SET logo_url = '/logo-192x192.png'
WHERE logo_url IS NOT NULL 
  AND logo_url NOT LIKE 'http://%' 
  AND logo_url NOT LIKE 'https://%'
  AND logo_url NOT LIKE '/%';
```

Opção C: **Corrigir merchant específico** (ex: Boi Dourado)

```sql
-- Exemplo: atualizar merchant específico
UPDATE merchants 
SET logo_url = 'https://exemplo.com/logo-boi-dourado.png'
WHERE business_name ILIKE '%dourado%'
   OR name ILIKE '%dourado%';
```

---

## 📊 FORMATOS VÁLIDOS DE LOGO_URL

### ✅ URLs válidas:

| Formato | Exemplo | Status |
|---------|---------|--------|
| **HTTP/HTTPS completo** | `https://cdn.example.com/logo.png` | ✅ Válido |
| **HTTPS Supabase Storage** | `https://abc.supabase.co/storage/v1/object/public/logos/logo.png` | ✅ Válido |
| **Caminho relativo** | `/assets/logo.png` | ✅ Válido |
| **Caminho absoluto** | `/logo-192x192.png` | ✅ Válido |
| **NULL** | `NULL` | ✅ Válido (usa fallback) |

### ❌ URLs inválidas:

| Formato | Exemplo | Problema |
|---------|---------|----------|
| **Texto simples** | `dourado` | ❌ Navegador tenta acessar como domínio |
| **Nome de arquivo** | `logo.png` | ❌ Sem caminho completo |
| **Domínio incompleto** | `example.com/logo.png` | ❌ Falta protocolo (http/https) |

---

## 🔍 VERIFICAÇÃO PÓS-CORREÇÃO

### 1. No Banco de Dados

```sql
-- Ver todos os logo_url após correção
SELECT 
  id,
  name,
  business_name,
  logo_url,
  CASE 
    WHEN logo_url IS NULL THEN '✅ NULL (fallback)'
    WHEN logo_url LIKE 'http://%' OR logo_url LIKE 'https://%' THEN '✅ URL completa'
    WHEN logo_url LIKE '/%' THEN '✅ Caminho relativo'
    ELSE '❌ AINDA INVÁLIDO'
  END as status
FROM merchants
ORDER BY created_at DESC;
```

### 2. No Console do Navegador

1. Limpe o cache: `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac)
2. Acesse a página de cadastro do cliente
3. Abra o Console (F12)
4. **Antes do fix:** `dourado:1 Failed to load resource: 404` ❌
5. **Depois do fix:** Nenhum erro relacionado a logo ✅

Se ainda aparecer o aviso:
```javascript
console.warn('Invalid logo URL: "dourado", using fallback')
```

Isso é normal! O sistema está detectando e usando o fallback automaticamente.

---

## 🎨 UPLOAD DE LOGO CORRETO

### Opção 1: Supabase Storage (Recomendado)

1. **Criar bucket no Supabase:**
   ```sql
   -- No Supabase Dashboard: Storage → Create Bucket
   -- Nome: merchant-logos
   -- Público: Sim
   ```

2. **Upload de logo:**
   - Storage → merchant-logos → Upload
   - Escolher arquivo (PNG/JPG, recomendado 512x512px)
   - Copiar URL pública

3. **Atualizar merchant:**
   ```sql
   UPDATE merchants 
   SET logo_url = 'https://SEU-PROJETO.supabase.co/storage/v1/object/public/merchant-logos/logo-boi-dourado.png'
   WHERE id = 'merchant-id-aqui';
   ```

### Opção 2: CDN Externo

```sql
-- Usar URL de CDN (Cloudinary, AWS S3, etc)
UPDATE merchants 
SET logo_url = 'https://res.cloudinary.com/seu-cloud/image/upload/v1/logos/boi-dourado.png'
WHERE id = 'merchant-id-aqui';
```

### Opção 3: Logo no próprio servidor

```sql
-- Fazer upload do logo para /var/www/cashback/cashback-system/assets/logos/
-- Depois atualizar:
UPDATE merchants 
SET logo_url = '/assets/logos/boi-dourado.png'
WHERE id = 'merchant-id-aqui';
```

---

## 🐛 TROUBLESHOOTING

### Problema: Erro 404 ainda aparece após correção

**Solução 1:** Limpar cache do navegador
```
1. Ctrl + Shift + Delete
2. Selecionar "Cached images and files"
3. Clear data
4. Refresh: Ctrl + Shift + R
```

**Solução 2:** Verificar se o SQL foi executado
```sql
SELECT logo_url FROM merchants WHERE id = 'seu-merchant-id';
```

**Solução 3:** Verificar se o arquivo existe
```bash
# Se for caminho relativo, verificar:
ls -la /var/www/cashback/cashback-system/logo-192x192.png
```

### Problema: Logo não aparece na página

**Causa:** Arquivo não existe no caminho especificado

**Solução:** Verificar se:
1. URL está correta e acessível
2. Arquivo existe no servidor (se for caminho relativo)
3. Permissões do arquivo estão corretas (se for local)

```bash
# Verificar permissões (se for arquivo local)
ls -la /var/www/cashback/cashback-system/assets/
chmod 644 /var/www/cashback/cashback-system/assets/logo.png
```

---

## ✅ CHECKLIST DE CORREÇÃO

- [ ] SQL executado no Supabase
- [ ] Verificado que logo_url está NULL ou válido
- [ ] Cache do navegador limpo
- [ ] Página recarregada com Ctrl + Shift + R
- [ ] Console não mostra mais erro "dourado:1"
- [ ] Logo aparece corretamente (ou fallback se NULL)

---

## 📚 CÓDIGO IMPLEMENTADO

O sistema agora possui validação automática de URLs:

```javascript
// src/utils/dynamicManifest.js
function getValidLogoUrl(logoUrl) {
  if (!logoUrl) return '/logo-192x192.png';
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) return logoUrl;
  if (logoUrl.startsWith('/')) return logoUrl;
  
  // URL inválida detectada
  console.warn(`Invalid logo URL: "${logoUrl}", using fallback`);
  return '/logo-192x192.png';
}
```

**Resultado:**
- ✅ URLs válidas: usadas normalmente
- ✅ URLs inválidas: fallback automático
- ✅ Nenhum erro 404 no console
- ✅ PWA manifest sempre funcional

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Execute o SQL de correção no Supabase
2. ✅ Limpe o cache do navegador
3. ✅ Verifique que o erro desapareceu
4. 🔜 (Opcional) Faça upload de logos reais para os merchants
5. 🔜 (Opcional) Configure Supabase Storage para uploads futuros

---

**Status**: ✅ **CÓDIGO CORRIGIDO E EM PRODUÇÃO**

**Aguardando**: ⏳ Você executar SQL de limpeza no Supabase

**Commit**: c71145b  
**Branch**: genspark_ai_developer  
**Data**: 05/01/2026  
**Hora**: 21:00 (Brasília)

Execute o SQL e o erro desaparecerá! 🎉
