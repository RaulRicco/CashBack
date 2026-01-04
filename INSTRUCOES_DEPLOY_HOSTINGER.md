# 🚀 DEPLOY FINAL - HOSTINGER (localcashback.com.br)

## ✅ STATUS ATUAL:

- ✅ **Build NOVO criado**: `index-Cx3ZIKna-1762882076425.js`
- ✅ **contentType presente**: Confirmado no build!
- ✅ **Timestamp do deploy**: 1762882084683
- ✅ **Local em**: `/home/user/webapp/cashback-system/dist/`
- ❌ **Hostinger servindo build ANTIGO**: `index-C1GHAu0p-1762875594414.js`

---

## 🎯 SOLUÇÃO: DEPLOY MANUAL VIA HOSTINGER

A Hostinger está servindo arquivos de um local que não conseguimos acessar via SSH.

**Você precisa fazer o upload manualmente pelo painel da Hostinger.**

---

## 📋 MÉTODO 1: PAINEL HOSTINGER (RECOMENDADO)

### **Passo 1: Baixar os arquivos do build**

No seu computador local, conecte via SFTP ou baixe os arquivos:

**Pasta para baixar**: `/home/user/webapp/cashback-system/dist/`

**OU** se estiver no servidor SSH:
```bash
cd /home/user/webapp/cashback-system
tar -czf cashback-build-novo.tar.gz dist/
```

Depois baixe o arquivo: `cashback-build-novo.tar.gz`

---

### **Passo 2: Acessar hPanel da Hostinger**

1. Acesse: https://hpanel.hostinger.com
2. Faça login
3. Selecione o site: `localcashback.com.br`

---

### **Passo 3: Usar File Manager**

1. No painel, clique em: **"Arquivos"** → **"Gerenciador de Arquivos"** (File Manager)
2. Navegue até a pasta: **`public_html`** ou **`domains/localcashback.com.br/public_html`**

---

### **Passo 4: Fazer Backup do Atual**

1. Selecione TODOS os arquivos na pasta `public_html`
2. Clique em **"Compactar"** → Criar ZIP: `backup-antigo.zip`
3. Baixe o backup para seu computador

---

### **Passo 5: Deletar Arquivos Antigos**

1. Selecione TODOS os arquivos em `public_html` (EXCETO o backup.zip)
2. Clique em **"Deletar"**
3. Confirme a deleção

---

###**Passo 6: Fazer Upload do Build Novo**

**OPÇÃO A - Via File Manager (se extraiu o tar.gz)**:
1. No File Manager, clique em **"Upload"**
2. Selecione TODOS os arquivos da pasta `dist/` (não a pasta dist inteira, só o conteúdo!)
3. Aguarde o upload completar

**OPÇÃO B - Via Upload do Arquivo TAR.GZ**:
1. Faça upload do arquivo `cashback-build-novo.tar.gz`
2. Clique direito nele → **"Extrair"**
3. Mova os arquivos da pasta `dist/` para a raiz do `public_html`

---

### **Passo 7: Verificar Estrutura**

Dentro de `public_html` deve ter:

```
public_html/
├── index.html
├── assets/
│   ├── index-Cx3ZIKna-1762882076425.js
│   └── index-DLnTEATR-1762882076425.css
├── favicon.png
├── manifest.json
├── deploy-verify.json  ← IMPORTANTE!
└── (outros arquivos...)
```

---

### **Passo 8: Limpar Cache da Hostinger**

1. No hPanel, vá em: **"Avançado"** → **"Clear Cache"** (Limpar Cache)
2. OU vá em: **"Website"** → **"Cache"** → **"Purge All"**
3. Aguarde 1-2 minutos

---

### **Passo 9: Verificar Deploy**

Acesse: https://localcashback.com.br/deploy-verify.json

**✅ DEVE MOSTRAR**:
```json
{
  "deployTime": "2025-11-11T17:28:04+00:00",
  "timestamp": 1762882084683,
  "buildFile": "index-Cx3ZIKna-1762882076425.js",
  "fixApplied": "contentType added to upload"
}
```

**❌ SE MOSTRAR 404 ou timestamp diferente**:
- Cache da Hostinger ainda não foi limpo
- Aguarde 5 minutos
- OU force reload: Ctrl+Shift+R

---

## 📋 MÉTODO 2: FTP/SFTP (FileZilla)

### **Passo 1: Conectar via SFTP**

**Host**: `31.97.167.88` (ou `ssh.hostinger.com`)
**Usuário**: `user` (ou usuário SSH da Hostinger)
**Porta**: `22` (SFTP) ou `21` (FTP)
**Senha**: Sua senha SSH/FTP

### **Passo 2: Navegar até public_html**

Pasta remota: `/domains/localcashback.com.br/public_html/`
OU: `/public_html/`

### **Passo 3: Deletar arquivos antigos**

Selecione tudo em `public_html` e delete.

### **Passo 4: Fazer Upload**

Pasta local: `/home/user/webapp/cashback-system/dist/`
Arraste TODOS os arquivos de `dist/` para `public_html/`

---

## 📋 MÉTODO 3: SSH/SCP (Avançado)

Se você tem acesso SSH E sabe o caminho correto do `public_html`:

```bash
# No seu computador local
scp -r /home/user/webapp/cashback-system/dist/* user@31.97.167.88:/caminho/para/public_html/

# OU no próprio servidor
cp -r /home/user/webapp/cashback-system/dist/* /caminho/correto/public_html/
```

**⚠️ Você precisa descobrir o caminho correto primeiro!**

Possíveis caminhos na Hostinger:
- `/home/user/domains/localcashback.com.br/public_html`
- `/home/u123456789/domains/localcashback.com.br/public_html`
- `/home/user/public_html`

---

## ✅ APÓS O DEPLOY:

### **1. Limpar Cache do Navegador**

**⚠️ OBRIGATÓRIO!**

- Pressione: `Ctrl+Shift+Delete`
- Marque: "Imagens e arquivos em cache"
- Período: "Todo o período"
- Clique: "Limpar dados"

**OU use aba anônima**: `Ctrl+Shift+N`

---

### **2. Verificar Build Carregado**

Pressione `F12` → Console → Cole:
```javascript
performance.getEntriesByType('resource').find(r => r.name.includes('index-')).name
```

**✅ DEVE RETORNAR**:
```
'https://localcashback.com.br/assets/index-Cx3ZIKna-1762882076425.js?v=1762882084683'
```

**❌ SE RETORNAR** `index-C1GHAu0p-1762875594414.js`:
- Você não limpou o cache!
- Use aba anônima

---

### **3. Limpar Storage e Fazer Upload**

**SQL no Supabase**:
```sql
DELETE FROM storage.objects WHERE bucket_id = 'merchant-assets';
UPDATE merchants SET logo_url = NULL WHERE id = '9c4de359-4327-47c0-9ae5-bc87323dc2d3';
```

**Fazer Upload**:
1. Acesse (em aba anônima): https://localcashback.com.br/dashboard/white-label
2. Upload do logo
3. Salvar configurações

---

### **4. Verificar Resultado Final**

**SQL no Supabase**:
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

**✅ DEVE MOSTRAR**:
| Campo | Valor Correto |
|-------|---------------|
| `mime_type` | `image/jpeg` ✅ |
| `cache_control` | `3600` ✅ |
| `created_at` | Hora DEPOIS do upload |

---

## 🔍 TROUBLESHOOTING:

### **Se deploy-verify.json retornar 404**:
- Arquivos não foram para o local correto
- Verifique a estrutura da pasta
- Certifique-se que não criou `public_html/dist/` (ERRADO)
- Deve ser `public_html/index.html` (CORRETO)

### **Se ainda carregar arquivo antigo**:
- Cache da Hostinger não foi limpo
- Aguarde 5-10 minutos
- Purge cache no hPanel novamente
- Use aba anônima no navegador

### **Se mime_type continuar application/json**:
- Você fez upload com o build ANTIGO
- Verifique se o timestamp no `deploy-verify.json` é: 1762882084683
- Se for diferente, refaça o deploy

---

## 📞 SUPORTE:

Se após seguir TODOS os passos o problema persistir, envie:

1. Screenshot do File Manager da Hostinger (estrutura de pastas)
2. Conteúdo de: https://localcashback.com.br/deploy-verify.json
3. Resultado do comando no console: `performance.getEntriesByType('resource').find(r => r.name.includes('index-')).name`
4. Resultado da query SQL de verificação

---

**Build pronto em**: `/home/user/webapp/cashback-system/dist/`
**Timestamp**: 1762882084683
**Arquivo JS**: index-Cx3ZIKna-1762882076425.js
**contentType**: ✅ Presente no código
