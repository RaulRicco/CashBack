# 🐛 SOLUÇÃO - Erro ao Carregar Logo no Perfil do Estabelecimento

## 📋 Problema Identificado

```
❌ Erro ao carregar logo: 
https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/logos/9c4de359-4327-47c0-9ae5-bc87323dc2d3-1762905470653.png
```

### 🔍 Diagnóstico

O erro ocorre porque:

1. ✅ **Upload funciona** - A imagem está sendo enviada ao Supabase
2. ❌ **Acesso público bloqueado** - O bucket não está configurado como público OU as políticas RLS estão bloqueando

A URL mostra que a imagem foi salva com sucesso em:
- **Bucket:** `merchant-assets`
- **Path:** `logos/9c4de359-4327-47c0-9ae5-bc87323dc2d3-1762905470653.png`

Mas quando o navegador tenta acessá-la, recebe erro 403 (Forbidden) ou 404 (Not Found).

---

## 🚀 SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Executar SQL no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo do arquivo **`FIX-LOGO-UPLOAD-DEFINITIVO.sql`**
5. Clique em **Run** (Ctrl/Cmd + Enter)

### Passo 2: Verificar Resultado

Você deve ver mensagens como:

```
✅ BUCKET CONFIGURADO
  - name: merchant-assets
  - is_public: true
  - max_size: 2 MB
  - allowed_mime_types: {image/png, image/jpeg, image/jpg}

✅ POLÍTICAS CRIADAS
  - merchant_assets_public_read (SELECT) → public
  - merchant_assets_authenticated_insert (INSERT) → authenticated
  - merchant_assets_authenticated_update (UPDATE) → authenticated
  - merchant_assets_authenticated_delete (DELETE) → authenticated

✅ RLS STATUS
  - rls_enabled: Habilitado ✓
```

### Passo 3: Testar Upload

1. Acesse o sistema (faça login se necessário)
2. Vá até **Meu CashBack** (menu lateral)
3. Faça upload de uma nova logo
4. Clique em **Salvar Configurações**
5. A logo deve aparecer corretamente! ✅

---

## 🔧 SOLUÇÃO DETALHADA

### O que o Script SQL Faz?

#### 1. **Cria/Atualiza o Bucket**
```sql
-- Bucket público, 2MB máximo, apenas PNG/JPG
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'merchant-assets',
    'merchant-assets',
    true, -- PÚBLICO!
    2097152, -- 2MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg']
);
```

#### 2. **Remove Políticas Antigas**
```sql
-- Limpa políticas conflitantes
DROP POLICY IF EXISTS "merchant_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "merchant_assets_select" ON storage.objects;
-- ... etc
```

#### 3. **Cria Políticas RLS Corretas**

**Leitura Pública (SELECT):**
```sql
CREATE POLICY "merchant_assets_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'merchant-assets');
```
→ Qualquer pessoa pode **VER** as logos (necessário para clientes)

**Upload Autenticado (INSERT):**
```sql
CREATE POLICY "merchant_assets_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-assets');
```
→ Apenas merchants **logados** podem fazer upload

**Atualização/Exclusão:**
```sql
-- UPDATE e DELETE também apenas para authenticated
```

---

## 🧪 Verificação Pós-Correção

### Método 1: SQL Editor

Execute o script **`verify_storage_fix.sql`** no Supabase SQL Editor.

Você deve ver:

```
1. BUCKET STATUS
   ✅ Bucket merchant-assets existe
   
2. RLS STATUS
   ✅ RLS está habilitado
   
3. POLICIES COUNT
   ✅ 4 políticas encontradas (esperado: 4+)
   
4. USER AUTH
   ✅ Usuário autenticado: <uuid>
   
5. FILES IN BUCKET
   ✅ X arquivo(s) no bucket
```

### Método 2: Teste Manual no Navegador

1. Abra o **Console do navegador** (F12)
2. Vá até a aba **Network**
3. Faça upload de uma logo
4. Procure pela requisição para `storage.v1/object/public/merchant-assets/...`
5. Deve retornar **Status: 200 OK** ✅

---

## 🐛 Se o Erro Persistir

### Debug 1: Verificar Bucket

```sql
SELECT * FROM storage.buckets WHERE name = 'merchant-assets';
```

**Esperado:**
- `public` = `true` ✅
- `file_size_limit` = `2097152` (2MB)

### Debug 2: Verificar Políticas

```sql
SELECT policyname, cmd, roles::text
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE 'merchant_assets%';
```

**Esperado:** 4 políticas (SELECT, INSERT, UPDATE, DELETE)

### Debug 3: Testar Acesso Direto

Cole a URL da imagem diretamente no navegador:
```
https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/logos/...
```

**Se retornar 403:** Políticas RLS bloqueando  
**Se retornar 404:** Arquivo não existe (verificar upload)  
**Se retornar 200:** Funcionou! ✅

---

## 📊 Mudanças no Código

### Antes:
```jsx
<img
  src={settings.logo_url}
  alt="Logo"
  className="max-h-32 object-contain"
/>
```

### Depois:
```jsx
<img
  src={settings.logo_url}
  alt="Logo"
  className="max-h-32 object-contain"
  onError={(e) => {
    console.log('❌ Erro ao carregar logo:', e.target.src);
    e.target.style.display = 'none';
    toast.error('Erro ao carregar logo. Verifique as permissões do Storage.');
  }}
/>
```

**Melhoria:** Agora exibe mensagem de erro amigável ao usuário.

---

## 🚀 Deploy da Correção

### 1. Commit das Mudanças

```bash
cd /home/root/webapp/cashback-system
git add src/pages/WhiteLabelSettings.jsx
git commit -m "fix: add error handling for logo image loading"
git push origin main
```

### 2. Deploy no Servidor

```bash
ssh root@31.97.167.88
cd /var/www/cashback/cashback-system
git pull origin main
npm run build
systemctl reload nginx
exit
```

### 3. Executar SQL no Supabase

- Copie o conteúdo de `FIX-LOGO-UPLOAD-DEFINITIVO.sql`
- Cole no Supabase SQL Editor
- Execute (Run)

---

## ✅ Checklist Final

- [ ] SQL executado no Supabase
- [ ] Bucket `merchant-assets` está público (`public = true`)
- [ ] 4 políticas RLS criadas
- [ ] Código atualizado com tratamento de erro
- [ ] Commit feito e pushed
- [ ] Build executado no servidor
- [ ] Teste de upload realizado
- [ ] Logo aparece corretamente
- [ ] URL da imagem acessível diretamente no navegador

---

## 💡 Explicação Técnica

### Por que o Bucket Precisa Ser Público?

O Supabase Storage tem dois tipos de buckets:

1. **Privado (private):** Acesso apenas via token autenticado
2. **Público (public):** Acesso via URL pública

Para logos de estabelecimentos que aparecem no app dos clientes, precisamos de acesso **público** para que:

- ✅ Clientes vejam o logo sem estar logados
- ✅ URLs funcionem em qualquer lugar (email, notificações, etc.)
- ✅ Não seja necessário passar token em cada requisição

### O que São as Políticas RLS?

**RLS** = Row Level Security (Segurança em Nível de Linha)

Mesmo com bucket público, o Supabase usa políticas RLS para controlar:

- **Quem pode fazer upload** (apenas merchants autenticados)
- **Quem pode ver** (público - qualquer um)
- **Quem pode atualizar/deletar** (apenas merchants autenticados)

---

## 📞 Suporte

Se após seguir todos os passos o erro persistir:

1. Execute `verify_storage_fix.sql` e envie os resultados
2. Abra o console do navegador e envie os logs
3. Tente acessar a URL da imagem diretamente e informe o código HTTP

Com essas informações, conseguirei identificar o problema rapidamente! 🎯

---

**Desenvolvido com ❤️ e ☕**
