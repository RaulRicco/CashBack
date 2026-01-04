# 🌐 Deploy na Hostinger Hospedagem Web (Compartilhada)

## ⚠️ AVISO IMPORTANTE

A hospedagem web compartilhada da Hostinger **NÃO SUPORTA** aplicações Node.js/React diretamente.

**MAS** podemos fazer funcionar uploadando os arquivos **buildados** (HTML/CSS/JS estáticos).

---

## ✅ Pré-requisitos

- ✅ Plano de hospedagem Hostinger ativo
- ✅ Domínio: localcashback.com.br
- ✅ Acesso ao hPanel (painel Hostinger)
- ✅ Cliente FTP (FileZilla) instalado

---

## 🎯 Passo a Passo

### **Etapa 1: Fazer Build Local do Projeto**

No seu computador, onde está o código:

```bash
cd /home/user/webapp/cashback-system

# Instalar dependências (se ainda não fez)
npm install

# Criar arquivo .env
echo "VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI" >> .env

# Fazer build de produção
npm run build
```

Após ~2 minutos, você terá uma pasta **`dist/`** com todos os arquivos prontos.

---

### **Etapa 2: Configurar Domínio na Hostinger**

1. Acesse: https://hpanel.hostinger.com
2. Vá em **Websites**
3. Selecione seu plano de hospedagem
4. Clique em **Gerenciar**
5. Vá em **Domínios** → **Adicionar Domínio**
6. Digite: **localcashback.com.br**
7. Escolha o diretório: **public_html** (padrão)
8. Clique em **Adicionar**

---

### **Etapa 3: Obter Credenciais FTP**

No hPanel:

1. Vá em **Arquivos** → **Gerenciador de Arquivos** → **FTP**
2. Ou vá direto em **Contas FTP**
3. Anote as credenciais:
   - **Host**: ftp.seusite.com.br (ou IP fornecido)
   - **Usuário**: seu-usuario@localcashback.com.br
   - **Senha**: sua-senha
   - **Porta**: 21 (FTP) ou 22 (SFTP)

---

### **Etapa 4: Conectar via FileZilla**

1. Baixe FileZilla: https://filezilla-project.org/download.php?type=client
2. Instale e abra
3. Na barra superior, preencha:
   - **Host**: ftp.seusite.com.br
   - **Usuário**: credenciais do passo 3
   - **Senha**: credenciais do passo 3
   - **Porta**: 21
4. Clique em **Conexão Rápida**

---

### **Etapa 5: Upload dos Arquivos**

No FileZilla:

1. **Lado esquerdo**: Navegue até a pasta `dist/` no seu computador
   - `/home/user/webapp/cashback-system/dist/`

2. **Lado direito**: Navegue até `public_html/` no servidor

3. **Selecione TODOS os arquivos** dentro de `dist/`
   - index.html
   - assets/
   - logo-*.png
   - manifest.json
   - etc.

4. **Arraste para** `public_html/` no lado direito

5. Aguarde upload (~2-5 minutos dependendo da velocidade)

---

### **Etapa 6: Configurar Redirecionamento SPA**

Como é uma Single Page Application (SPA), precisamos configurar o `.htaccess`:

No FileZilla, crie um arquivo `.htaccess` em `public_html/`:

1. Clique com botão direito em `public_html/` → **Criar arquivo**
2. Nome: `.htaccess`
3. Abra o arquivo para editar
4. Cole este conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirecionar www para não-www
  RewriteCond %{HTTP_HOST} ^www\.localcashback\.com\.br$ [NC]
  RewriteRule ^(.*)$ https://localcashback.com.br/$1 [R=301,L]
  
  # Forçar HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # SPA - todas as rotas para index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Desabilitar listagem de diretórios
Options -Indexes

# Headers de segurança
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Cache para assets estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/json "access plus 1 week"
  ExpiresByType application/font-woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Sem cache para index.html
<FilesMatch "index\.html">
  FileETag None
  <IfModule mod_headers.c>
    Header unset ETag
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"
  </IfModule>
</FilesMatch>

# Compressão Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE application/xml
</IfModule>
```

5. Salve o arquivo

---

### **Etapa 7: Configurar SSL (HTTPS)**

No hPanel:

1. Vá em **Segurança** → **SSL**
2. Encontre **localcashback.com.br**
3. Clique em **Instalar SSL**
4. Escolha **Let's Encrypt** (grátis)
5. Clique em **Instalar**
6. Aguarde ~5 minutos

O SSL será instalado e renovado automaticamente.

---

### **Etapa 8: Testar o Site**

1. Acesse: **https://localcashback.com.br**
2. Deve carregar o sistema de cashback
3. ✅ HTTPS (cadeado verde)
4. ✅ Login funcionando
5. ✅ Todas as funcionalidades OK

---

## 🔄 Atualizar o Site

Sempre que fizer mudanças no código:

1. **No seu computador:**
   ```bash
   cd /home/user/webapp/cashback-system
   npm run build
   ```

2. **No FileZilla:**
   - Conecte novamente
   - Delete os arquivos antigos em `public_html/`
   - Upload dos novos arquivos da pasta `dist/`

---

## ⚠️ Limitações da Hospedagem Web

| Recurso | Hospedagem Web | VPS |
|---------|----------------|-----|
| Deploy automático | ❌ Manual via FTP | ✅ Automático |
| Controle total | ❌ Limitado | ✅ Total |
| Performance | ⚠️ Compartilhada | ✅ Dedicada |
| Custo | ✅ Mais barato (~R$ 10/mês) | ⚠️ Mais caro (~R$ 30/mês) |
| Configuração | ✅ Mais simples | ⚠️ Mais complexa |

---

## 💡 Recomendação

Para um sistema de cashback em **PRODUÇÃO**, recomendo:

✅ **VPS** (veja DEPLOY-HOSTINGER-VPS.md) porque:
- Deploy automático
- Melhor performance
- Mais controle
- Escalável

Mas se quiser começar simples e barato, a hospedagem web funciona!

---

## 🐛 Troubleshooting

### Página em branco
- Verifique se todos os arquivos foram enviados
- Verifique o console do navegador (F12)
- Certifique-se que `.htaccess` está correto

### Rotas não funcionam (404)
- Verifique se `.htaccess` está em `public_html/`
- Verifique se `mod_rewrite` está ativo (normalmente está)

### CSS/JS não carrega
- Limpe cache do navegador (Ctrl+Shift+Del)
- Verifique permissões dos arquivos (644)

### SSL não instala
- Aguarde propagação DNS (até 24h)
- Tente novamente depois de algumas horas

---

## ✅ Checklist

- [ ] Build local realizado
- [ ] Domínio adicionado no hPanel
- [ ] Credenciais FTP obtidas
- [ ] FileZilla instalado e conectado
- [ ] Todos os arquivos de `dist/` enviados
- [ ] `.htaccess` criado
- [ ] SSL instalado
- [ ] Site acessível via HTTPS
- [ ] Login testado
- [ ] Funcionalidades testadas

---

## 💰 Custo

| Item | Valor |
|------|-------|
| Hospedagem Web Hostinger | ~R$ 10-20/mês |
| Domínio (se não tiver) | ~R$ 40/ano |
| SSL | GRÁTIS |
| **TOTAL** | **~R$ 10-20/mês** |

---

**Pronto! Seu sistema está no ar na Hostinger!** 🚀

Se quiser algo mais profissional depois, migre para VPS usando o outro guia.
