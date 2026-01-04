# 📱 PASSO A PASSO VISUAL - Deploy do Sistema de Cashback

## ✅ STATUS DO PROJETO

**Build de Produção:** ✅ Testado e Funcionando  
**Tamanho:** 963 KB (otimizado)  
**Pronto para:** Vercel, Netlify, Cloudflare Pages

---

## 🎯 ESCOLHA SUA PLATAFORMA

### 🥇 **VERCEL** (Mais Fácil - Recomendado)
⏱️ **Tempo:** 5 minutos  
💰 **Custo:** Grátis  
🚀 **Deploy automático:** Sim  
🔒 **HTTPS:** Automático  

👉 **[GUIA VERCEL - Clique aqui](#deploy-na-vercel)**

---

### 🥈 **NETLIFY** (Alternativa Excelente)
⏱️ **Tempo:** 5 minutos  
💰 **Custo:** Grátis  
🚀 **Deploy automático:** Sim  
🔒 **HTTPS:** Automático  

👉 **[GUIA NETLIFY - Clique aqui](#deploy-na-netlify)**

---

### 🥉 **CLOUDFLARE PAGES** (Bandwidth Ilimitado)
⏱️ **Tempo:** 7 minutos  
💰 **Custo:** Grátis  
🚀 **Deploy automático:** Sim  
🔒 **HTTPS:** Automático  

👉 **[GUIA CLOUDFLARE - Clique aqui](#deploy-na-cloudflare-pages)**

---

---

# 🔵 Deploy na Vercel

## **PASSO 1: Preparar Informações do Supabase**

Antes de começar, pegue suas credenciais do Supabase:

1. 🌐 Acesse: https://supabase.com/dashboard
2. 🎯 Clique no seu projeto
3. ⚙️ Vá em **Settings** (engrenagem no menu) → **API**
4. 📋 Copie e salve em um bloco de notas:

```
Project URL: https://xxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:** Você vai precisar dessas informações no Passo 4!

---

## **PASSO 2: Acessar Vercel**

1. 🌐 Abra: https://vercel.com/signup
2. 🔐 Clique em **"Continue with GitHub"**
3. ✅ Faça login com sua conta do GitHub
4. ✅ Autorize a Vercel a acessar seus repositórios (clique em "Authorize Vercel")

---

## **PASSO 3: Importar o Projeto**

1. 🏠 No dashboard da Vercel, clique em **"Add New..."** → **"Project"**
2. 🔍 Na lista de repositórios, encontre **"RaulRicco/CashBack"**
   - Se não aparecer, clique em "Adjust GitHub App Permissions" e autorize
3. 📥 Clique no botão **"Import"** ao lado do repositório

---

## **PASSO 4: Configurar o Projeto**

### **4.1 - Configurar Pasta Raiz**
⚠️ **MUITO IMPORTANTE:**

Na seção **"Configure Project"**, você verá:

```
Root Directory: ./
```

🎯 Clique em **"Edit"** e selecione: **`cashback-system`**

Ou digite manualmente: `cashback-system`

✅ Isso garante que a Vercel vai construir a pasta correta!

### **4.2 - Framework Preset**
A Vercel detecta automaticamente:
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

✅ **Deixe como está!** (não precisa alterar nada)

### **4.3 - Variáveis de Ambiente**
🔐 **ATENÇÃO:** Esta é a parte mais importante!

1. Expanda a seção **"Environment Variables"**
2. Adicione a **primeira variável:**

```
NAME: VITE_SUPABASE_URL
VALUE: [Cole aqui a Project URL que você copiou no Passo 1]
```

Exemplo: `https://xnopqrst.supabase.co`

3. Clique em **"Add"**

4. Adicione a **segunda variável:**

```
NAME: VITE_SUPABASE_ANON_KEY
VALUE: [Cole aqui a chave anon/public que você copiou no Passo 1]
```

Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...`

5. Clique em **"Add"**

✅ **Verifique:** Você deve ter 2 variáveis configuradas!

---

## **PASSO 5: Deploy!**

1. 🚀 Clique no botão azul grande **"Deploy"**
2. ⏳ Aguarde o build (cerca de 2-3 minutos)
3. 🎉 Quando ver **"Congratulations!"** → Deploy completo!

**Sua URL será algo tipo:**
```
https://cashback-abc123.vercel.app
```

---

## **PASSO 6: Configurar CORS no Supabase**

⚠️ **ESSENCIAL para o sistema funcionar:**

1. Copie sua URL da Vercel (exemplo: `https://cashback-abc123.vercel.app`)
2. Volte para: https://supabase.com/dashboard
3. Selecione seu projeto
4. Vá em **Settings** → **API**
5. Role até a seção **"CORS"**
6. Em **"Add custom origin"**, cole sua URL da Vercel
7. Clique em **"Save"**

✅ **Pronto!** Agora seu site pode se comunicar com o banco de dados!

---

## **PASSO 7: Teste Final**

Acesse sua URL da Vercel e teste:

- [ ] 🔐 Página de login carrega corretamente
- [ ] ✅ Consegue fazer login com suas credenciais
- [ ] 📊 Dashboard aparece com dados
- [ ] 🎁 QR Code é gerado
- [ ] 🔗 Link de cadastro funciona
- [ ] ⚙️ Configurações salvam

**Tudo funcionando?** 🎉 **PARABÉNS! SEU SISTEMA ESTÁ NO AR!**

---

## **PASSO 8 (OPCIONAL): Domínio Próprio**

Quer usar `cashback.minhaloja.com.br`?

### **8.1 - Adicionar Domínio na Vercel**
1. No projeto da Vercel, clique em **"Settings"** → **"Domains"**
2. Digite seu domínio: `cashback.minhaloja.com.br`
3. Clique em **"Add"**

### **8.2 - Configurar DNS**
A Vercel vai mostrar como configurar. No seu provedor de DNS:

```
Tipo: CNAME
Nome: cashback
Valor: cname.vercel-dns.com
TTL: 300
```

### **8.3 - Aguardar Propagação**
⏳ Leva de 5 minutos a 24 horas (geralmente ~15 minutos)

### **8.4 - Atualizar CORS**
Volte no Supabase e adicione também seu domínio próprio no CORS:
```
https://cashback.minhaloja.com.br
```

---

---

# 🟢 Deploy na Netlify

## **PASSO 1: Preparar Supabase**
(Mesmo processo da Vercel - veja [Passo 1 da Vercel](#passo-1-preparar-informações-do-supabase))

## **PASSO 2: Criar Conta Netlify**
1. 🌐 Acesse: https://app.netlify.com/signup
2. Escolha **"GitHub"**
3. Autorize o acesso

## **PASSO 3: Novo Site**
1. Clique em **"Add new site"** → **"Import an existing project"**
2. Escolha **"Deploy with GitHub"**
3. Selecione o repositório **"RaulRicco/CashBack"**

## **PASSO 4: Build Settings**

⚠️ **Configure a pasta raiz:**

```
Base directory: cashback-system
Build command: npm run build
Publish directory: cashback-system/dist
```

## **PASSO 5: Environment Variables**

Clique em **"Advanced build settings"** → **"New variable"**

Adicione:
```
VITE_SUPABASE_URL = [sua URL]
VITE_SUPABASE_ANON_KEY = [sua chave]
```

## **PASSO 6: Deploy!**
Clique em **"Deploy site"**

---

---

# 🟠 Deploy na Cloudflare Pages

## **PASSO 1: Preparar Supabase**
(Mesmo processo - veja [Passo 1 da Vercel](#passo-1-preparar-informações-do-supabase))

## **PASSO 2: Acessar Cloudflare**
1. 🌐 Acesse: https://dash.cloudflare.com
2. Faça login ou crie conta
3. No menu, vá em **"Workers & Pages"**

## **PASSO 3: Create Application**
1. Clique em **"Create application"**
2. Aba **"Pages"**
3. Clique em **"Connect to Git"**
4. Conecte com GitHub
5. Selecione **"RaulRicco/CashBack"**

## **PASSO 4: Build Settings**

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: cashback-system
```

## **PASSO 5: Environment Variables**

Role até **"Environment variables"**

Adicione:
```
VITE_SUPABASE_URL = [sua URL]
VITE_SUPABASE_ANON_KEY = [sua chave]
```

## **PASSO 6: Deploy!**
Clique em **"Save and Deploy"**

---

---

# 🔄 Deploys Automáticos

A partir de agora, **qualquer alteração** que você fizer:

```bash
# Fazer mudanças no código
git add .
git commit -m "Minha atualização"
git push origin main
```

🎯 **Vai disparar automaticamente:**
1. Build na plataforma escolhida
2. Deploy automático
3. Site atualizado em ~2 minutos

**Zero configuração adicional necessária!** ✨

---

# 🆘 Problemas Comuns

## ❌ Erro: "Failed to fetch"
**Causa:** Variáveis de ambiente não configuradas ou CORS não configurado  
**Solução:** 
1. Verifique as variáveis na plataforma
2. Adicione a URL de produção no CORS do Supabase

## ❌ Erro: "404 Page Not Found" ao recarregar
**Causa:** Redirect rules não configuradas  
**Solução:** Já incluído nos arquivos `vercel.json` e `netlify.toml` do projeto

## ❌ Erro: "Build failed"
**Causa:** Pasta raiz incorreta  
**Solução:** Certifique-se de configurar `cashback-system` como pasta raiz

---

# 📊 Recursos do Plano Free

| Recurso | Vercel | Netlify | Cloudflare |
|---------|--------|---------|------------|
| Bandwidth | 100 GB/mês | 100 GB/mês | ♾️ Ilimitado |
| Build minutes | 6,000 min/mês | 300 min/mês | 500 builds/mês |
| Projetos | ♾️ Ilimitado | ♾️ Ilimitado | ♾️ Ilimitado |
| HTTPS | ✅ Grátis | ✅ Grátis | ✅ Grátis |
| Custom Domain | ✅ Grátis | ✅ Grátis | ✅ Grátis |

**Todos são excelentes!** Escolha o que você preferir. 🎯

---

# 🎉 Próximos Passos

Depois do deploy:

1. ✅ Execute os scripts SQL de correção no Supabase
2. ✅ Teste todas as funcionalidades
3. ✅ Configure seu domínio próprio (opcional)
4. ✅ Compartilhe o link de cadastro com clientes
5. ✅ Comece a usar o sistema!

---

**📱 Link de Cadastro dos Clientes:**
```
https://seu-site.vercel.app/signup/seu-slug
```

Configure em: **Configurações** → **Link de Cadastro**

---

**🎊 PARABÉNS! SEU SISTEMA DE CASHBACK ESTÁ NO AR! 🎊**

---

**📅 Última atualização:** 2025-10-26  
**✅ Build testado:** OK  
**✅ Pronto para produção:** SIM
