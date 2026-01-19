# 🚀 COMANDOS DE DEPLOY - Meu CashBack

## ✅ BUILD JÁ ESTÁ PRONTO!

O build de produção foi gerado com sucesso em `/home/user/webapp/cashback-system/dist/`

**Verificado:** ✅ "Meu CashBack" está presente no build

---

## 📦 OPÇÃO 1: DEPLOY VIA VERCEL (RECOMENDADO)

### 1️⃣ Instalar Vercel CLI:
```bash
cd /home/user/webapp/cashback-system
npm install -g vercel
```

### 2️⃣ Login no Vercel:
```bash
vercel login
```

### 3️⃣ Deploy para Produção:
```bash
vercel --prod
```

**O Vercel vai perguntar:**
- Project name? → `cashback-system` (ou o nome que preferir)
- Which scope? → Escolha sua conta
- Link to existing project? → `N` (se for primeiro deploy) ou `Y` (se já existe)
- In which directory is your code located? → `./`

**Variáveis de Ambiente (se perguntado):**
- `VITE_SUPABASE_URL`: `https://mtylboaluqswdkgljgsd.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: (a key do arquivo .env)

---

## 📦 OPÇÃO 2: DEPLOY VIA NETLIFY

### 1️⃣ Instalar Netlify CLI:
```bash
cd /home/user/webapp/cashback-system
npm install -g netlify-cli
```

### 2️⃣ Login no Netlify:
```bash
netlify login
```

### 3️⃣ Inicializar projeto (primeira vez):
```bash
netlify init
```

Responda:
- Create & configure a new site? → `Yes`
- Team? → Escolha seu team
- Site name? → `cashback-system` (ou outro nome único)
- Build command? → `npm run build`
- Directory to deploy? → `dist`

### 4️⃣ Deploy para Produção:
```bash
netlify deploy --prod
```

**Variáveis de Ambiente:**
Configure no dashboard do Netlify ou via CLI:
```bash
netlify env:set VITE_SUPABASE_URL "https://mtylboaluqswdkgljgsd.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI"
```

---

## 📦 OPÇÃO 3: DEPLOY MANUAL VIA FTP/SSH

Se você tem um servidor próprio:

### 1️⃣ O diretório `dist` está pronto!
```bash
cd /home/user/webapp/cashback-system
ls -lh dist/
```

### 2️⃣ Comprimir para upload:
```bash
cd /home/user/webapp/cashback-system
tar -czf cashback-deploy.tar.gz dist/
```

### 3️⃣ Upload via SCP (exemplo):
```bash
scp cashback-deploy.tar.gz usuario@seu-servidor.com:/caminho/do/site/
```

### 4️⃣ No servidor, extrair:
```bash
ssh usuario@seu-servidor.com
cd /caminho/do/site/
tar -xzf cashback-deploy.tar.gz
mv dist/* ./
```

---

## 📦 OPÇÃO 4: GITHUB PAGES (SE NÃO USAR BACKEND)

**⚠️ Não recomendado** para este projeto pois usa Supabase com variáveis de ambiente.

---

## 🔥 DEPLOY RÁPIDO (SE JÁ TEM VERCEL/NETLIFY CONFIGURADO)

### Se já tem Vercel:
```bash
cd /home/user/webapp/cashback-system
vercel --prod
```

### Se já tem Netlify:
```bash
cd /home/user/webapp/cashback-system
netlify deploy --prod
```

---

## ✅ VERIFICAR APÓS DEPLOY

Depois do deploy, acesse sua URL de produção e verifique:

1. ✅ Menu lateral mostra **"Meu CashBack"** (não "White Label")
2. ✅ Rota `/whitelabel` funciona
3. ✅ Upload de logo funciona
4. ✅ Página tem título **"Meu CashBack"**

---

## 🆘 TROUBLESHOOTING

### Se ainda mostrar "White Label":
1. **Limpe o cache do navegador**: Ctrl+Shift+Delete
2. **Force reload**: Ctrl+F5
3. **Janela anônima**: Teste em aba privada
4. **Verifique a URL**: Certifique-se de acessar a URL correta do deploy

### Se der erro de variáveis de ambiente:
Configure no dashboard da plataforma:
- Vercel: Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

---

## 📞 PRECISA DE AJUDA?

Me diga qual plataforma você usa:
- "Uso Vercel"
- "Uso Netlify"
- "Tenho servidor próprio"
- "Não sei / primeira vez"

E eu te guio passo a passo! 🚀
