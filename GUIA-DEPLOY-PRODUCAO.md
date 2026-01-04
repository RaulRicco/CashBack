# 🚀 Guia Completo de Deploy para Produção

## 📋 Opções de Deploy (Recomendadas)

### 🥇 **Opção 1: Vercel** (MAIS RECOMENDADO)
**Vantagens:**
- ✅ Deploy automático via GitHub
- ✅ HTTPS grátis e automático
- ✅ CDN global
- ✅ Domínio customizado grátis
- ✅ Zero configuração necessária
- ✅ Builds automáticos em cada push
- ✅ Preview de PRs

**Plano Free:**
- 100 GB bandwidth/mês
- Projetos ilimitados
- SSL automático

**Tempo de setup:** ~5 minutos

---

### 🥈 **Opção 2: Netlify**
**Vantagens:**
- ✅ Deploy via GitHub
- ✅ HTTPS grátis
- ✅ Formulários integrados
- ✅ Funções serverless
- ✅ Configuração simples

**Plano Free:**
- 100 GB bandwidth/mês
- Builds ilimitados

**Tempo de setup:** ~5 minutos

---

### 🥉 **Opção 3: Cloudflare Pages**
**Vantagens:**
- ✅ CDN global da Cloudflare
- ✅ Ilimitado bandwidth
- ✅ HTTPS grátis
- ✅ Workers integrados

**Plano Free:**
- Bandwidth ilimitado
- Builds ilimitados

**Tempo de setup:** ~7 minutos

---

### 🔧 **Opção 4: VPS (Digital Ocean, AWS, etc)**
**Vantagens:**
- ✅ Controle total
- ✅ Pode rodar outros serviços
- ✅ Escalável

**Desvantagens:**
- ❌ Requer configuração manual
- ❌ Manutenção necessária
- ❌ Custo mensal (~$5-10)

**Tempo de setup:** ~30 minutos

---

## 🎯 Deploy na Vercel (Recomendado)

### **Passo 1: Criar Conta na Vercel**

1. Acesse: https://vercel.com/signup
2. Escolha **"Continue with GitHub"**
3. Autorize a Vercel a acessar seus repositórios

---

### **Passo 2: Importar Projeto**

1. No dashboard da Vercel, clique em **"Add New Project"**
2. Selecione o repositório **"RaulRicco/CashBack"**
3. Clique em **"Import"**

---

### **Passo 3: Configurar Build**

A Vercel detecta automaticamente projetos Vite. Confirme as configurações:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

### **Passo 4: Adicionar Variáveis de Ambiente**

Antes de fazer deploy, adicione suas variáveis do Supabase:

1. Na tela de configuração, clique em **"Environment Variables"**
2. Adicione:

```
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

**Onde encontrar:**
- Acesse seu projeto no Supabase
- Vá em **Settings** → **API**
- Copie **"URL"** e **"anon/public key"**

---

### **Passo 5: Deploy!**

1. Clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. ✅ Seu site estará no ar!

**URL de produção:** `https://seu-projeto.vercel.app`

---

### **Passo 6: Domínio Customizado (Opcional)**

Para usar seu próprio domínio (ex: cashback.minhaloja.com.br):

1. No dashboard da Vercel, vá em **"Settings"** → **"Domains"**
2. Adicione seu domínio
3. Configure os DNS conforme instruções da Vercel:

```
Type: CNAME
Name: cashback (ou @)
Value: cname.vercel-dns.com
```

---

## 🌐 Deploy na Netlify

### **Passo 1: Criar Conta**
1. Acesse: https://app.netlify.com/signup
2. Conecte com GitHub

### **Passo 2: New Site from Git**
1. Clique em **"Add new site"** → **"Import an existing project"**
2. Escolha **"GitHub"**
3. Selecione **"RaulRicco/CashBack"**

### **Passo 3: Build Settings**
```
Build command: npm run build
Publish directory: dist
```

### **Passo 4: Environment Variables**
Adicione as mesmas variáveis do Supabase:
```
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_ANON_KEY=sua-chave
```

### **Passo 5: Deploy**
Clique em **"Deploy site"**

---

## ☁️ Deploy na Cloudflare Pages

### **Passo 1: Criar Conta**
1. Acesse: https://pages.cloudflare.com
2. Faça login ou crie conta

### **Passo 2: Create a Project**
1. Clique em **"Create a project"**
2. Conecte com GitHub
3. Selecione **"RaulRicco/CashBack"**

### **Passo 3: Build Settings**
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

### **Passo 4: Environment Variables**
Adicione:
```
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_ANON_KEY=sua-chave
```

### **Passo 5: Deploy**
Clique em **"Save and Deploy"**

---

## 🖥️ Deploy em VPS (Digital Ocean / AWS)

### **Requisitos:**
- Servidor Ubuntu 22.04
- Node.js 18+
- Nginx
- PM2

### **Script de Instalação:**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Clonar repositório
cd /var/www
sudo git clone https://github.com/RaulRicco/CashBack.git cashback
cd cashback/cashback-system

# Instalar dependências
npm install

# Criar arquivo .env
sudo nano .env
```

**Conteúdo do .env:**
```
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

```bash
# Build do projeto
npm run build

# Configurar Nginx
sudo nano /etc/nginx/sites-available/cashback
```

**Conteúdo do arquivo Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    root /var/www/cashback/cashback-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/cashback /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar SSL (opcional mas recomendado)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com.br
```

---

## 🔒 Segurança em Produção

### **1. Configurar CORS no Supabase**
1. Acesse seu projeto no Supabase
2. Vá em **Settings** → **API**
3. Em **"CORS"**, adicione sua URL de produção:
```
https://seu-dominio.vercel.app
```

### **2. Row Level Security (RLS)**
Certifique-se de que todas as políticas RLS estão ativas:
```sql
-- Verificar políticas
SELECT * FROM pg_policies;
```

### **3. Rate Limiting**
Configure no Supabase:
- Settings → API → Rate Limiting
- Defina limites apropriados

---

## 📊 Monitoramento

### **Vercel:**
- Dashboard integrado com métricas
- Logs em tempo real
- Alertas automáticos

### **Analytics (Opcional):**
- Google Analytics
- Vercel Analytics (grátis)
- Plausible (privacy-friendly)

---

## 🔄 CI/CD Automático

Depois do primeiro deploy, **cada push para main** dispara:
1. ✅ Build automático
2. ✅ Testes (se configurados)
3. ✅ Deploy automático
4. ✅ Preview URLs para PRs

---

## 📝 Checklist Pré-Deploy

Antes de fazer deploy, certifique-se:

- [ ] Executou os scripts SQL no Supabase
- [ ] Todas as tabelas existem e estão corretas
- [ ] Row Level Security (RLS) está configurado
- [ ] Variáveis de ambiente estão corretas
- [ ] Build local funciona (`npm run build`)
- [ ] Testou em desenvolvimento
- [ ] Commits estão no GitHub
- [ ] CORS configurado no Supabase

---

## 🚀 Comando Build Local (Teste antes do deploy)

```bash
# Limpar cache
rm -rf node_modules/.vite dist .vite

# Reinstalar dependências
npm install

# Build de produção
npm run build

# Testar build localmente
npm run preview
```

Se o preview funcionar perfeitamente, o deploy também funcionará! ✅

---

## 🆘 Troubleshooting

### **Erro: "Module not found"**
```bash
# Limpar tudo e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Erro: "Environment variables undefined"**
- Verifique se adicionou `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Na Vercel/Netlify, as variáveis devem começar com `VITE_`

### **Erro: "404 on refresh"**
Configure redirect rules:

**Vercel** - criar `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** - criar `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📈 Após Deploy

1. **Teste todas as funcionalidades:**
   - Login de merchant
   - Cadastro de clientes
   - Geração de QR Code
   - Cashback
   - Resgate
   - Relatórios

2. **Configure domínio customizado**

3. **Ative HTTPS** (automático na Vercel/Netlify)

4. **Configure backup do Supabase:**
   - Settings → Database → Backups

5. **Monitore logs e erros**

---

## 🎉 Pronto!

Seu sistema de cashback estará no ar, acessível 24/7, com HTTPS, CDN global e deploys automáticos!

**Recomendação final:** Use a **Vercel** pela simplicidade e recursos gratuitos excelentes.

---

**📅 Última atualização:** 2025-10-26  
**✅ Status:** Pronto para produção
