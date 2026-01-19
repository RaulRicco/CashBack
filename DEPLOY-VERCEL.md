# 🚀 Deploy no Vercel - localcashback.com.br

## 📋 Pré-requisitos

- ✅ Código commitado no GitHub
- ✅ Domínio: **localcashback.com.br**
- ✅ Acesso ao painel de DNS do domínio

---

## 🎯 Passo a Passo Completo

### **Etapa 1: Criar Conta no Vercel (se ainda não tiver)**

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Autorize o Vercel a acessar seus repositórios
4. ✅ Conta criada!

---

### **Etapa 2: Importar Projeto do GitHub**

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Encontre o repositório: **RaulRicco/CashBack**
3. Clique em **"Import"**

---

### **Etapa 3: Configurar Variáveis de Ambiente**

**IMPORTANTE**: Antes de fazer deploy, adicione as variáveis de ambiente do Supabase:

Na tela de configuração do projeto:

1. Expanda **"Environment Variables"**
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL
mtylboaluqswdkgljgsd.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI
```

**Marque**: ☑️ Production, ☑️ Preview, ☑️ Development

---

### **Etapa 4: Configurações de Build**

Deixe as configurações padrão:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

✅ Clique em **"Deploy"**

Aguarde ~2 minutos para o primeiro deploy...

---

### **Etapa 5: Configurar Domínio Personalizado**

Após o deploy inicial ser concluído:

1. No dashboard do projeto, vá em **"Settings"** → **"Domains"**
2. Clique em **"Add"**
3. Digite: **localcashback.com.br**
4. Clique em **"Add"**

O Vercel vai mostrar as configurações de DNS necessárias:

#### **Opção A: Domínio Raiz (Recomendado)**

Adicione estes registros no seu provedor de DNS:

```
Tipo: A
Nome: @
Valor: 76.76.21.21
```

```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

#### **OU Opção B: Subdomínio (app.localcashback.com.br)**

```
Tipo: CNAME
Nome: app
Valor: cname.vercel-dns.com
```

---

### **Etapa 6: Configurar DNS no Registro.br (ou seu provedor)**

#### **Se o domínio está no Registro.br:**

1. Acesse: https://registro.br
2. Faça login
3. Vá em **"Meus Domínios"** → **localcashback.com.br**
4. Clique em **"Editar DNS"**
5. Adicione os registros mostrados pelo Vercel

#### **Se o domínio está em outro provedor:**

1. Acesse o painel do provedor (GoDaddy, Hostinger, etc.)
2. Vá em **"Gerenciar DNS"** ou **"Configurações de DNS"**
3. Adicione os registros

#### **Exemplo de configuração completa:**

| Tipo | Nome/Host | Valor/Destino |
|------|-----------|---------------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

**IMPORTANTE**: 
- Remova qualquer registro A antigo no @ (raiz)
- A propagação de DNS pode levar de 5 minutos a 48 horas

---

### **Etapa 7: Verificar Domínio**

Após adicionar os registros DNS:

1. Volte ao Vercel
2. Aguarde a verificação automática
3. Quando aparecer ✅ ao lado do domínio, está pronto!
4. O Vercel vai gerar SSL automaticamente (HTTPS)

---

### **Etapa 8: Testar o Site**

Acesse: **https://localcashback.com.br**

✅ Deve carregar o sistema de cashback
✅ HTTPS funcionando (cadeado verde)
✅ Todas as funcionalidades operando

---

## 🔄 Deploy Automático

A partir de agora, **TODA VEZ** que você fizer `git push` para o repositório:

1. ✅ Vercel detecta automaticamente
2. ✅ Faz build do projeto
3. ✅ Deploy automático
4. ✅ Seu site é atualizado em ~2 minutos

**Nada mais precisa fazer manualmente!** 🎉

---

## 🐛 Troubleshooting

### DNS não propaga
- Aguarde até 24h
- Use https://dnschecker.org para verificar
- Limpe cache DNS local: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

### Erro de build
- Verifique as variáveis de ambiente no Vercel
- Veja os logs de build na aba "Deployments"

### Site carrega mas dá erro
- Verifique se as variáveis VITE_SUPABASE_* estão corretas
- Teste localmente primeiro: `npm run build && npm run preview`

### Domínio não verifica
- Certifique-se que os registros DNS estão corretos
- Remova qualquer registro A antigo
- Aguarde propagação completa

---

## 📊 Monitoramento

Depois do deploy, você pode monitorar:

- **Analytics**: Quantas visitas o site tem
- **Logs**: Erros em tempo real
- **Performance**: Velocidade de carregamento
- **Builds**: Histórico de deploys

Tudo no dashboard do Vercel!

---

## 🎯 URLs Importantes

| URL | Descrição |
|-----|-----------|
| https://localcashback.com.br | Site em produção |
| https://vercel.com/dashboard | Dashboard Vercel |
| https://github.com/RaulRicco/CashBack | Repositório GitHub |
| https://mtylboaluqswdkgljgsd.supabase.co | Dashboard Supabase |

---

## 🔐 Segurança

✅ HTTPS automático (SSL grátis)
✅ Headers de segurança configurados
✅ Variáveis de ambiente protegidas
✅ CDN global (rápido no mundo todo)

---

## 💰 Custo

**GRÁTIS para sempre!**

Limite generoso:
- 100 GB bandwidth/mês
- Builds ilimitados
- Domínios customizados ilimitados

Se crescer muito e precisar mais, planos pagos começam em $20/mês.

---

## ✅ Checklist Final

Antes de considerar concluído:

- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Primeiro deploy concluído
- [ ] Domínio adicionado no Vercel
- [ ] DNS configurado no provedor
- [ ] Domínio verificado (✅ verde)
- [ ] HTTPS funcionando
- [ ] Site acessível via https://localcashback.com.br
- [ ] Login funcionando
- [ ] Cashback funcionando
- [ ] Resgate funcionando

---

**Pronto! Seu sistema de cashback está no ar! 🚀**

Qualquer dúvida, os logs estão em: **Vercel Dashboard → Project → Deployments**
