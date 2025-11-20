# ⚡ TESTE RÁPIDO - EXECUTE AGORA (2 MINUTOS)

## 🎯 OBJETIVO
Descobrir se o problema é:
- ❌ Políticas de Storage (Supabase bloqueando acesso)
- ❌ Arquivo não existe (Upload falhou)
- ❌ Outro problema

---

## 🔴 TESTE 1: A IMAGEM EXISTE NO STORAGE?

### Passo 1: Abra o Supabase Dashboard
1. Vá em: https://supabase.com/dashboard
2. Selecione seu projeto
3. Menu lateral: **Storage**
4. Clique no bucket: **merchant-assets**
5. Abra a pasta: **logos**

### Pergunta:
**Você vê arquivos lá dentro?**

**✅ SIM, vejo arquivos:**
- Copie o nome de um arquivo (ex: `d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png`)
- Vá para o TESTE 2

**❌ NÃO, está vazio:**
- **PROBLEMA IDENTIFICADO:** Upload está falhando!
- Vá para "SOLUÇÃO A" abaixo

---

## 🔴 TESTE 2: A IMAGEM É ACESSÍVEL PUBLICAMENTE?

### Passo 1: Copie esta URL e abra no navegador
```
https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png
```

**OU use a URL do arquivo que você viu no TESTE 1:**
```
https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/[NOME-DO-SEU-ARQUIVO]
```

### O que aconteceu?

**✅ A IMAGEM APARECEU:**
- **PROBLEMA IDENTIFICADO:** Cache do navegador ou código desatualizado
- Vá para "SOLUÇÃO B" abaixo

**❌ ERRO 403 (Forbidden):**
- **PROBLEMA IDENTIFICADO:** Políticas de Storage não configuradas
- Vá para "SOLUÇÃO C" abaixo

**❌ ERRO 404 (Not Found):**
- **PROBLEMA IDENTIFICADO:** Arquivo não existe ou nome errado
- Vá para "SOLUÇÃO A" abaixo

**❌ ERRO DE REDE ou outro:**
- **PROBLEMA IDENTIFICADO:** Problema de conectividade ou CORS
- Vá para "SOLUÇÃO D" abaixo

---

## ✅ SOLUÇÕES

### SOLUÇÃO A: Upload está falhando (arquivo não existe)

**Execute este SQL no Supabase:**

1. Vá em **SQL Editor**
2. Cole e execute:

```sql
-- Ver últimas tentativas de upload
SELECT 
  id,
  name,
  bucket_id,
  created_at,
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 10;

-- Se retornar vazio, o upload NUNCA funcionou
-- Precisamos verificar o código JavaScript
```

**Se retornou vazio:** Me avise e vou te enviar o código JavaScript corrigido.

**Se retornou algo:** O upload funcionou antes! Tente fazer upload novamente.

---

### SOLUÇÃO B: Cache ou código desatualizado

**Execute estes comandos no VPS:**

```bash
# Conectar ao VPS
ssh root@31.97.167.88

# Ir para o projeto
cd /var/www/cashback/cashback-system

# Limpar cache e rebuildar
rm -rf dist/
npm run build

# Reiniciar servidor (se usar PM2)
pm2 restart cashback

# OU reiniciar nginx
sudo systemctl reload nginx
```

**No navegador:**
1. Pressione **Ctrl+Shift+Delete**
2. Marque: Cookies, Cache, Histórico
3. Clique "Limpar dados"
4. Pressione **Ctrl+Shift+R** na página do sistema
5. Faça login novamente
6. Tente fazer upload

---

### SOLUÇÃO C: Políticas de Storage não configuradas (MAIS COMUM!)

**Execute este SQL no Supabase:**

1. Vá em **SQL Editor**
2. Cole e execute:

```sql
-- PASSO 1: Tornar o bucket público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'merchant-assets';

-- PASSO 2: Criar política de leitura pública
DROP POLICY IF EXISTS "Public read all" ON storage.objects;

CREATE POLICY "Public read all"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'merchant-assets');

-- PASSO 3: Verificar se foi criada
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname = 'Public read all';
```

**Resultado esperado:**
```
UPDATE 1
DROP POLICY
CREATE POLICY
(1 linha retornada mostrando a política)
```

**Depois, teste a URL novamente no navegador!**

---

### SOLUÇÃO D: Problema de CORS ou rede

**Execute este teste no Console do navegador (F12):**

```javascript
// Cole isto no Console e pressione Enter:
fetch('https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png', { method: 'HEAD' })
  .then(res => {
    console.log('✅ Status:', res.status);
    console.log('✅ Headers:', Object.fromEntries(res.headers.entries()));
  })
  .catch(err => console.error('❌ Erro:', err));
```

**Me envie o resultado que aparecer no console!**

---

## 🚨 AÇÃO IMEDIATA (30 SEGUNDOS)

**FAÇA AGORA:**

1. **Abra:** https://supabase.com/dashboard
2. **Vá em:** Storage → merchant-assets → logos
3. **TIRE UM SCREENSHOT** do que você vê
4. **Abra esta URL no navegador:**
   ```
   https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png
   ```
5. **TIRE UM SCREENSHOT** do que aparece
6. **ME ENVIE OS 2 SCREENSHOTS**

Com isso vou saber EXATAMENTE qual é o problema!

---

## 📊 DIAGNÓSTICO RÁPIDO

| O que você vê | Problema | Solução |
|---------------|----------|---------|
| Pasta vazia no Storage | Upload falha | Código JavaScript |
| Arquivo existe + URL dá 403 | Sem política | SQL (Solução C) |
| Arquivo existe + URL dá 404 | Nome errado | Verificar path |
| Arquivo existe + URL mostra imagem | Cache | Ctrl+Shift+R |

---

⏰ **TEMPO TOTAL: 2 MINUTOS**

🚀 **EXECUTE AGORA E ME DIGA O RESULTADO!**
