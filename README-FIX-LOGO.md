# 🎯 SOLUÇÃO COMPLETA - Erro no Upload de Logo

## 🔍 Problema Identificado

**Erro no console:**
```
❌ Erro ao carregar logo: 
https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/logos/9c4de359-4327-47c0-9ae5-bc87323dc2d3-1762905470653.png
```

**Causa:**
- ✅ Upload funciona (arquivo é salvo no Supabase)
- ❌ Bucket não está público ou políticas RLS bloqueiam acesso
- ❌ Imagem retorna erro 403/404 ao tentar carregar

---

## ✅ O Que Foi Feito

### 1. **Melhorias no Código**

**Arquivo:** `src/pages/WhiteLabelSettings.jsx`

```jsx
// ANTES: Imagem quebrava silenciosamente
<img src={settings.logo_url} alt="Logo" />

// DEPOIS: Mostra erro amigável ao usuário
<img 
  src={settings.logo_url} 
  alt="Logo"
  onError={(e) => {
    console.log('❌ Erro ao carregar logo:', e.target.src);
    e.target.style.display = 'none';
    toast.error('Erro ao carregar logo. Verifique as permissões do Storage.');
  }}
/>
```

### 2. **Script SQL de Correção**

**Arquivo:** `FIX-LOGO-UPLOAD-DEFINITIVO.sql`

O script faz:
1. ✅ Cria/atualiza bucket `merchant-assets` como **PÚBLICO**
2. ✅ Remove políticas antigas conflitantes
3. ✅ Cria 4 políticas RLS corretas:
   - **SELECT (leitura):** Público - qualquer um pode ver
   - **INSERT (upload):** Apenas autenticados
   - **UPDATE:** Apenas autenticados
   - **DELETE:** Apenas autenticados

### 3. **Documentação Completa**

**Arquivo:** `SOLUCAO-LOGO-UPLOAD.md`

Guia detalhado com:
- Diagnóstico do problema
- Solução passo a passo
- Verificações pós-correção
- Troubleshooting
- Explicações técnicas

---

## 🚀 COMO APLICAR A CORREÇÃO

### ✅ PASSO 1: Push do Código

```bash
cd /home/root/webapp/cashback-system
git status
git push origin main
```

**Se der erro de autenticação:**
- Use GitHub Desktop para fazer push, OU
- Configure token manualmente no git

---

### ✅ PASSO 2: Executar SQL no Supabase

1. Acesse **Supabase Dashboard:** https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. **Cole o conteúdo completo de:** `FIX-LOGO-UPLOAD-DEFINITIVO.sql`
6. Clique em **Run** (ou Ctrl/Cmd + Enter)

**Resultado esperado:**
```sql
✅ BUCKET CONFIGURADO
   - name: merchant-assets
   - is_public: true
   - max_size: 2 MB

✅ POLÍTICAS CRIADAS
   - merchant_assets_public_read (SELECT)
   - merchant_assets_authenticated_insert (INSERT)
   - merchant_assets_authenticated_update (UPDATE)
   - merchant_assets_authenticated_delete (DELETE)

✅ RLS STATUS
   - rls_enabled: Habilitado ✓
```

---

### ✅ PASSO 3: Deploy no Servidor

```bash
# Conectar no servidor
ssh root@31.97.167.88

# Atualizar código
cd /var/www/cashback/cashback-system
git pull origin main

# Rebuild
npm run build

# Recarregar Nginx
systemctl reload nginx

# Sair
exit
```

---

### ✅ PASSO 4: Testar

1. Abra o sistema no navegador
2. Faça login como merchant
3. Vá em **"Meu CashBack"** (menu lateral)
4. Faça upload de uma logo (PNG ou JPG, máximo 2MB)
5. Clique em **"Salvar Configurações"**
6. ✅ **A logo deve aparecer corretamente!**

---

## 🧪 Verificação Pós-Correção

### Método 1: Via Console do Navegador

1. Abra o Console (F12)
2. Vá para aba **Network**
3. Faça upload de uma logo
4. Procure pela requisição para `storage/v1/object/public/merchant-assets/...`
5. Deve retornar **Status: 200 OK** ✅

### Método 2: Via SQL

Execute no Supabase SQL Editor:

```sql
-- Verificar bucket
SELECT * FROM storage.buckets WHERE name = 'merchant-assets';
-- Esperado: public = true

-- Verificar políticas
SELECT policyname, cmd, roles::text
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE 'merchant_assets%';
-- Esperado: 4 políticas
```

### Método 3: Acesso Direto

Cole a URL da imagem diretamente no navegador:
```
https://mtylboaluqswdkgljgsd.supabase.co/storage/v1/object/public/merchant-assets/logos/...
```

- **200 OK:** ✅ Funcionou!
- **403 Forbidden:** ❌ Políticas RLS bloqueando
- **404 Not Found:** ❌ Arquivo não existe

---

## 🐛 Se o Erro Persistir

### Debug 1: Console do Navegador
```
F12 → Console → Procure por mensagens de erro
```

### Debug 2: Verificar Storage no Supabase
```sql
-- Execute: verify_storage_fix.sql
-- Enviará relatório completo da configuração
```

### Debug 3: Verificar Logs do Supabase
```
Dashboard → Logs → Storage
```

---

## 📊 Arquivos Modificados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/pages/WhiteLabelSettings.jsx` | Código | Adiciona tratamento de erro na imagem |
| `FIX-LOGO-UPLOAD-DEFINITIVO.sql` | SQL | Configura bucket e políticas RLS |
| `SOLUCAO-LOGO-UPLOAD.md` | Docs | Guia completo de troubleshooting |
| `COMANDOS-FIX-LOGO.sh` | Script | Comandos prontos para copiar/colar |
| `README-FIX-LOGO.md` | Docs | Este arquivo - resumo visual |

---

## 💾 Commit Realizado

```
fix: add error handling and SQL solution for logo upload issue

- Add onError handler to logo image to display user-friendly error message
- Create FIX-LOGO-UPLOAD-DEFINITIVO.sql to configure Supabase Storage bucket and RLS policies
- Create SOLUCAO-LOGO-UPLOAD.md with complete troubleshooting guide
- Issue: Logo uploads succeed but images fail to load due to bucket permissions
- Solution: Make bucket public and configure proper RLS policies for authenticated uploads and public reads
```

---

## 📦 Estrutura da Solução

```
webapp/
├── cashback-system/
│   └── src/pages/
│       └── WhiteLabelSettings.jsx  ← Código corrigido
├── FIX-LOGO-UPLOAD-DEFINITIVO.sql  ← SQL para Supabase ⭐
├── SOLUCAO-LOGO-UPLOAD.md          ← Guia detalhado
├── COMANDOS-FIX-LOGO.sh            ← Comandos prontos
└── README-FIX-LOGO.md              ← Este arquivo
```

---

## 🎯 Checklist de Execução

- [ ] Push do código para o repositório
- [ ] SQL executado no Supabase Dashboard
- [ ] Verificação: bucket está público
- [ ] Verificação: 4 políticas RLS criadas
- [ ] Deploy no servidor VPS
- [ ] Nginx recarregado
- [ ] Teste de upload realizado
- [ ] Logo aparece corretamente
- [ ] URL da imagem acessível no navegador

---

## 📞 Precisa de Ajuda?

Se o erro persistir após seguir todos os passos:

1. **Execute:** `verify_storage_fix.sql` no Supabase
2. **Capture:** Console do navegador (F12 → Console)
3. **Teste:** URL da imagem diretamente no navegador
4. **Envie:** Resultados dos 3 itens acima

Com essas informações, conseguirei identificar o problema em minutos! 🎯

---

## 💡 Explicação Técnica

### Por que o bucket precisa ser público?

O Supabase Storage tem dois modos:
- **Privado:** Acesso apenas com token de autenticação
- **Público:** Acesso via URL pública

Para logos que aparecem no app dos clientes, precisamos de **acesso público** para que:
- ✅ Clientes vejam sem fazer login
- ✅ URLs funcionem em emails, notificações
- ✅ Não precise passar token em cada requisição

### O que são as políticas RLS?

**RLS** = Row Level Security (Segurança em Nível de Linha)

Mesmo com bucket público, controlamos:
- **Quem pode fazer upload:** Apenas merchants autenticados
- **Quem pode ver:** Todos (público)
- **Quem pode deletar:** Apenas merchants autenticados

---

**⏭️ PRÓXIMA AÇÃO: Execute o PASSO 1 (Push do código)**

---

**Desenvolvido com ❤️ e ☕**
