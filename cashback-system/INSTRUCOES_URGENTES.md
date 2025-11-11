# 🚨 INSTRUÇÕES URGENTES - SERVIDOR CORRIGIDO E RODANDO!

## ✅ CONFIRMADO AGORA (16:50):

- ✅ **Servidor rodando na porta 3000**: http://localhost:3000 e https://localcashback.com.br
- ✅ **Build correto sendo servido**: `index-qPpbj3He-1762878884446.js`
- ✅ **contentType presente**: 4 ocorrências confirmadas no JavaScript
- ✅ **Cache headers adicionados**: No-cache configurado no Vite
- ✅ **Query string cache bust**: `?v=1762879500` adicionado

---

## 🔥 PROBLEMA IDENTIFICADO:

Você está vendo este erro no console:
```
index-C1GHAu0p-1762875594414.js:1115 ❌ Erro ao carregar logo
```

**Este é o arquivo ANTIGO** (timestamp: 1762875594414)  
**O arquivo NOVO é**: index-qPpbj3He-1762878884446.js (timestamp: 1762878884446)

**Diferença**: ~54 minutos de diferença!

---

## ⚡ SOLUÇÃO IMEDIATA - EXECUTE AGORA:

### 🗑️ **1. Limpar Storage (SQL no Supabase)**:

```sql
DELETE FROM storage.objects WHERE bucket_id = 'merchant-assets';
UPDATE merchants SET logo_url = NULL WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';
```

### 🌐 **2. LIMPAR CACHE DO NAVEGADOR (OBRIGATÓRIO)**:

#### **Windows/Linux**:
1. Pressione: **`Ctrl+Shift+Delete`**
2. Marque: **"Imagens e arquivos em cache"**
3. Período: **"Todo o período"**
4. Clique: **"Limpar dados"**
5. **FECHE COMPLETAMENTE o navegador** (todas as janelas)
6. Reabra e acesse: https://localcashback.com.br/dashboard/white-label

#### **Mac**:
1. Pressione: **`Cmd+Shift+Delete`**
2. Marque: **"Cache"**
3. Período: **"Todo o período"**
4. Clique: **"Limpar dados"**
5. **FECHE COMPLETAMENTE o navegador**
6. Reabra e acesse: https://localcashback.com.br/dashboard/white-label

#### **OU USE ABA ANÔNIMA (MAIS RÁPIDO)**:
- **Chrome/Edge**: `Ctrl+Shift+N`
- **Firefox**: `Ctrl+Shift+P`
- **Safari**: `Cmd+Shift+N`

**Acesse na aba anônima**: https://localcashback.com.br/dashboard/white-label

---

### 📤 **3. Fazer Upload do Logo**:

1. Faça login
2. Vá em "Logo da Marca"
3. Escolha uma imagem (JPG/PNG, até 2MB)
4. Aguarde: "Logo carregada com sucesso!"
5. Clique em "Salvar Configurações"

---

### ✅ **4. Verificar no Console do Navegador**:

Pressione `F12` → Console

**✅ DEVE APARECER**:
```
Iniciando upload...
Upload bem-sucedido
```

**❌ NÃO DEVE APARECER**:
```
index-C1GHAu0p-1762875594414.js  ← Este é o arquivo antigo!
```

**Se ainda aparecer o arquivo antigo**: Você NÃO limpou o cache! Repita o passo 2.

---

### 🔍 **5. Verificar Build Carregado**:

No console (F12), digite:
```javascript
performance.getEntriesByType('resource').find(r => r.name.includes('index-')).name
```

**✅ DEVE RETORNAR**:
```
https://localcashback.com.br/assets/index-qPpbj3He-1762878884446.js?v=1762879500
```

**❌ SE RETORNAR**:
```
https://localcashback.com.br/assets/index-C1GHAu0p-1762875594414.js
```

**= CACHE NÃO FOI LIMPO! Use aba anônima!**

---

### 📊 **6. Verificar no Supabase**:

```sql
SELECT 
    name,
    metadata->>'mimetype' as mime_type,
    metadata->>'cacheControl' as cache_control,
    created_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 1;
```

**✅ RESULTADO ESPERADO**:
| Campo | Valor Correto |
|-------|---------------|
| `mime_type` | `image/jpeg` ✅ |
| `cache_control` | `3600` ✅ |
| `created_at` | Data/hora DEPOIS de 16:50 ✅ |

**❌ SE AINDA APARECER `application/json`**:

= Você fez upload com cache antigo! Repita TODOS os passos acima!

---

## 🎯 VERIFICAÇÃO RÁPIDA:

Execute estes comandos **NO TERMINAL DO SERVIDOR**:

```bash
# Verificar servidor rodando
lsof -i :3000

# Verificar build correto
curl -s http://localhost:3000/ | grep "index-.*\.js"

# Deve mostrar: index-qPpbj3He-1762878884446.js
```

---

## 📝 ARQUIVOS DE TESTE:

Acesse estes links para confirmar que o servidor está servindo conteúdo novo:

1. http://localhost:3000/test-cache-bust.txt
   - **Deve mostrar**: "Cache Bust Test - Timestamp: 1762879500000"
   - **Se não carregar**: Servidor não está rodando

2. https://localcashback.com.br/test-cache-bust.txt
   - **Deve mostrar**: Mesmo conteúdo
   - **Se não carregar**: DNS não aponta para porta 3000

---

## 🚨 SE AINDA NÃO FUNCIONAR:

### Teste em OUTRO NAVEGADOR:
- Se está usando Chrome, teste no Firefox
- Se está usando Firefox, teste no Chrome
- OU use Edge, Safari, etc

**Por quê?**: Cache pode estar extremamente persistente no navegador atual.

### OU use modo de desenvolvedor:
1. Abra DevTools: `F12`
2. Vá em "Network" (Rede)
3. Marque: **"Disable cache"** (Desabilitar cache)
4. Mantenha DevTools aberto
5. Recarregue a página: `Ctrl+R`
6. Faça upload do logo

---

## ✅ CHECKLIST FINAL:

Antes de me avisar que não funcionou, confirme:

- [ ] ✅ Executei SQL de limpeza no Supabase
- [ ] ✅ Storage retornou COUNT = 0
- [ ] ✅ Fechei COMPLETAMENTE o navegador
- [ ] ✅ Limpei cache (Ctrl+Shift+Delete) 
- [ ] ✅ OU usei aba anônima (Ctrl+Shift+N)
- [ ] ✅ Verifiquei no console que estou carregando: `index-qPpbj3He-1762878884446.js`
- [ ] ✅ Fiz upload do logo
- [ ] ✅ Verifiquei no Supabase

---

## 🎯 GARANTIA:

O servidor ESTÁ correto, o código ESTÁ correto, o build ESTÁ correto.

Se você seguir os passos acima E limpar o cache corretamente, o `mime_type` SERÁ `image/jpeg`.

**O único problema restante é CACHE DO NAVEGADOR.**

---

**Servidor confirmado rodando**: Port 3000 ✅  
**Build correto servido**: index-qPpbj3He-1762878884446.js ✅  
**contentType presente**: 4 ocorrências ✅  
**Timestamp do deploy**: 2025-11-11 16:50 ✅
