# 🚀 Deploy Rápido - 5 Minutos

## ⚡ Método Mais Rápido: Vercel

### **1️⃣ Acessar Vercel (30 segundos)**
1. Vá para: https://vercel.com/new
2. Faça login com GitHub
3. Autorize acesso aos repositórios

### **2️⃣ Importar Projeto (1 minuto)**
1. Na lista, encontre **"RaulRicco/CashBack"**
2. Clique em **"Import"**
3. Selecione a pasta: **"cashback-system"** (IMPORTANTE!)

### **3️⃣ Configurar Variáveis (2 minutos)**

Antes de clicar em Deploy, adicione estas variáveis:

**Clique em "Environment Variables"** e adicione:

```
Nome: VITE_SUPABASE_URL
Valor: [sua URL do Supabase]

Nome: VITE_SUPABASE_ANON_KEY
Valor: [sua chave anônima do Supabase]
```

**Onde pegar essas informações:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### **4️⃣ Deploy! (2 minutos)**
1. Clique no botão **"Deploy"**
2. Aguarde o build (~2 minutos)
3. ✅ **PRONTO!** Seu site está no ar!

**Você receberá uma URL tipo:**
```
https://cashback-xxx.vercel.app
```

---

## 🔧 Configuração Pós-Deploy

### **Atualizar CORS no Supabase** (IMPORTANTE!)

1. Acesse seu projeto no Supabase
2. Vá em **Settings** → **API** → **CORS**
3. Adicione sua URL da Vercel:
```
https://seu-projeto.vercel.app
```

### **Configurar Domínio Próprio** (Opcional)

Se quiser usar `cashback.minhaloja.com.br`:

1. Na Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure no seu provedor de DNS:

```
Tipo: CNAME
Nome: cashback
Valor: cname.vercel-dns.com
TTL: 300
```

Aguarde propagação (~5-10 minutos)

---

## ✅ Teste Final

Acesse sua URL e teste:
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] QR Code é gerado
- [ ] Link de cadastro funciona
- [ ] Configurações salvam

---

## 🔄 Deploys Automáticos

A partir de agora, **cada push no GitHub** vai:
1. Fazer build automático
2. Deploy automático
3. Sem downtime

Para atualizar o site:
```bash
git add .
git commit -m "Atualização"
git push
```

Pronto! Em ~2 minutos a atualização está no ar! ✨

---

## 📱 Compartilhar com Clientes

Seu link de cadastro será:
```
https://seu-projeto.vercel.app/signup/seu-slug
```

Configure no painel **Configurações** → **Link de Cadastro**

---

## 🆘 Problemas?

### Erro: "Cannot connect to Supabase"
✅ Verifique se adicionou as variáveis de ambiente corretamente

### Erro: "404 Page Not Found"
✅ Certifique-se de que selecionou a pasta **"cashback-system"** no import

### Site não atualiza
✅ Limpe cache do navegador (Ctrl + Shift + Delete)

---

## 📊 Monitoramento

Acesse o dashboard da Vercel para ver:
- Número de visitantes
- Performance
- Logs de erros
- Tempo de resposta

---

**Tempo total: ~5-7 minutos** ⚡

**Próximo passo:** Testar tudo e começar a usar! 🎉
