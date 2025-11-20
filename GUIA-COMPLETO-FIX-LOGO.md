# 🚨 GUIA COMPLETO - FIX LOGO UPLOAD (EMERGENCIAL)

## ⚠️ SITUAÇÃO ATUAL
- Upload parece funcionar (gera URL)
- Mas a imagem não carrega no navegador
- Erro no console: "❌ Erro ao carregar logo"

## 🎯 DIAGNÓSTICO PROVÁVEL
Existem 3 possibilidades:

### 1. **Políticas de Storage não configuradas** (mais provável - 80%)
   - Arquivo foi enviado ao Supabase
   - Mas não está acessível publicamente
   - Retorna erro 403 (Forbidden)

### 2. **Upload falha silenciosamente** (provável - 15%)
   - Código retorna sucesso mas não salva
   - Arquivo não existe no storage
   - Retorna erro 404 (Not Found)

### 3. **Problema de CORS ou formato** (menos provável - 5%)
   - Navegador bloqueia acesso
   - Arquivo corrompido

---

## 🔧 SOLUÇÃO PASSO-A-PASSO

### **PASSO 1: EXECUTAR SQL NO SUPABASE** (MAIS IMPORTANTE!)

1. Abra: https://supabase.com/dashboard
2. Selecione seu projeto
3. Menu lateral: **SQL Editor**
4. Clique em **New Query**
5. Cole TODO o conteúdo do arquivo: `fix-logo-upload-EMERGENCIAL.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

**O que esperar:**
```
✅ UPDATE 1
✅ SELECT mostrando public = true
⚠️ DROP POLICY podem dar erro "não existe" (NORMAL)
✅ CREATE POLICY (4x)
✅ SELECT pg_policies mostrando 4 políticas
```

**Se der erro:**
- Copie o erro completo e me envie
- Continue para o próximo passo

---

### **PASSO 2: TESTAR URL DIRETAMENTE NO NAVEGADOR**

Abra esta URL em uma nova aba:
```
https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png
```

**Resultado esperado:**

**✅ SE APARECER A IMAGEM:**
- Problema resolvido pelas políticas SQL!
- Limpe o cache do navegador (Ctrl+Shift+R)
- Tente fazer login novamente

**❌ SE DER ERRO 403 (Forbidden):**
- As políticas não foram aplicadas corretamente
- Vá para "SOLUÇÃO ALTERNATIVA" abaixo

**❌ SE DER ERRO 404 (Not Found):**
- O arquivo não existe no storage
- O upload está falhando
- Vá para o PASSO 3

---

### **PASSO 3: DIAGNOSTICAR O PROBLEMA**

Execute no servidor VPS:

```bash
cd /var/www/cashback/cashback-system
chmod +x diagnostico-logo-upload.sh
./diagnostico-logo-upload.sh > diagnostico-resultado.txt
cat diagnostico-resultado.txt
```

**Me envie o resultado completo!**

---

### **PASSO 4: ATUALIZAR O CÓDIGO JAVASCRIPT**

1. Conecte no VPS:
```bash
ssh root@31.97.167.88
cd /var/www/cashback/cashback-system
```

2. Faça backup do arquivo atual:
```bash
cp src/pages/WhiteLabelSettings.jsx src/pages/WhiteLabelSettings.jsx.backup
```

3. Edite o arquivo:
```bash
nano src/pages/WhiteLabelSettings.jsx
```

4. Procure a função `handleLogoUpload` (use Ctrl+W para buscar)

5. **SUBSTITUA** toda a função pelo código do arquivo `fix-handleLogoUpload.jsx`
   - Cole o código da função handleLogoUpload
   - Cole o código do componente <img>

6. Salve:
   - Pressione Ctrl+O (salvar)
   - Pressione Enter
   - Pressione Ctrl+X (sair)

7. Rebuilde o projeto:
```bash
npm run build
```

8. Se estiver usando PM2:
```bash
pm2 restart cashback
```

9. Se estiver usando nginx (apenas servindo arquivos estáticos):
```bash
sudo systemctl reload nginx
```

---

### **PASSO 5: TESTAR NOVAMENTE**

1. Abra o sistema no navegador
2. Pressione **Ctrl+Shift+R** (limpar cache)
3. Faça login como merchant
4. Vá em **Configurações White Label**
5. Abra o **Console do navegador** (F12)
6. Tente fazer upload de uma logo
7. **Observe os logs detalhados no console**

**O que você vai ver:**
```
🔍 DIAGNÓSTICO - Arquivo selecionado:
  Nome: logo.png
  Tipo: image/png
  Tamanho: 12345 bytes
  Merchant ID: abc-123

📤 Iniciando upload...
  Path: logos/abc-123-1234567890.png
  Bucket: merchant-assets

📥 Resultado do upload:
  Data: { path: "logos/..." }
  Error: null

🔗 URL Pública gerada: https://...

🧪 Testando se a URL é acessível...
  Status do teste: 200
  Headers: {...}

✅ URL acessível! Arquivo carregado com sucesso.

💾 Atualizando logo_url no banco...

✅ Logo atualizada no banco!

🎉 PROCESSO COMPLETO!
```

---

## 🆘 SOLUÇÃO ALTERNATIVA (SE NADA FUNCIONAR)

Se mesmo depois de tudo isso não funcionar, vamos usar uma abordagem diferente:

### **Opção A: Criar bucket do zero via SQL**

```sql
-- Deletar bucket antigo
DELETE FROM storage.buckets WHERE id = 'merchant-assets';

-- Criar bucket novo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'merchant-assets',
  'merchant-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']::text[]
);

-- Criar política de leitura pública SUPER SIMPLES
CREATE POLICY "Allow all public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'merchant-assets');

-- Criar política de upload para autenticados
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-assets');
```

### **Opção B: Usar URL com token assinado**

Modifique a função handleLogoUpload para usar `createSignedUrl`:

```javascript
// SUBSTITUIR:
const { data: publicUrlData } = supabase.storage
  .from('merchant-assets')
  .getPublicUrl(uploadData.path);

// POR:
const { data: signedUrlData, error: signedError } = await supabase.storage
  .from('merchant-assets')
  .createSignedUrl(uploadData.path, 31536000); // 1 ano

if (signedError) throw signedError;

const publicUrl = signedUrlData?.signedUrl;
```

Isso gera uma URL com token que funciona mesmo sem políticas públicas.

### **Opção C: Recriar bucket pela UI**

1. Vá em **Storage** no Supabase Dashboard
2. Delete o bucket `merchant-assets`
3. Crie novo bucket:
   - Name: `merchant-assets`
   - ✅ Public bucket: **ATIVADO**
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/png, image/jpeg, image/jpg, image/gif`
4. Vá na aba **Policies**
5. Clique **New Policy** → **For full customization**
6. Cole:
```sql
CREATE POLICY "Public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'merchant-assets');
```

---

## 📊 CHECKLIST DE VERIFICAÇÃO

- [ ] SQL executado no Supabase (PASSO 1)
- [ ] URL testada no navegador (PASSO 2)
- [ ] Script de diagnóstico rodado (PASSO 3)
- [ ] Código JavaScript atualizado (PASSO 4)
- [ ] Build do projeto feito (PASSO 4)
- [ ] Servidor reiniciado (PASSO 4)
- [ ] Teste com upload de nova logo (PASSO 5)
- [ ] Logs do console verificados (PASSO 5)

---

## 🆘 SE NADA RESOLVER

Me envie:

1. **Resultado completo do script de diagnóstico:**
```bash
./diagnostico-logo-upload.sh
```

2. **Resultado da query SQL:**
```sql
SELECT * FROM storage.objects 
WHERE bucket_id = 'merchant-assets' 
ORDER BY created_at DESC 
LIMIT 5;
```

3. **Screenshot do console do navegador** após tentar upload

4. **Resultado de abrir a URL no navegador:**
```
https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png
```

5. **Aba Network do DevTools:**
   - Faça upload
   - Vá na aba Network (F12)
   - Procure a requisição para `merchant-assets`
   - Clique nela
   - Me envie o **Status Code** e **Response**

---

## ✅ QUANDO FUNCIONAR

Você vai ver:
- ✅ Toast verde: "Logo enviada com sucesso!"
- ✅ Imagem aparece instantaneamente
- ✅ Console mostra: "🎉 PROCESSO COMPLETO!"
- ✅ URL da logo funciona no navegador

---

**⏰ TEMPO ESTIMADO:**
- PASSO 1: 2 minutos
- PASSO 2: 30 segundos
- PASSO 3: 1 minuto
- PASSO 4: 5 minutos
- PASSO 5: 2 minutos

**TOTAL: ~10 minutos**

---

🚀 **COMECE AGORA PELO PASSO 1!** É o mais importante.
