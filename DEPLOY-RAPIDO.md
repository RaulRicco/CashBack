# 🚀 Deploy Rápido - 5 Minutos

## 📱 Acesse pelo Celular

Abra a câmera do seu celular e escaneie este QR Code:

*(Será gerado após deploy no Vercel)*

---

## ⚡ Passos Resumidos

### 1. Vercel (2 min)
1. Acesse: https://vercel.com/signup
2. **"Continue with GitHub"**
3. Import: **RaulRicco/CashBack**
4. Adicionar variáveis:
   - `VITE_SUPABASE_URL` = `https://mtylboaluqswdkgljgsd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (a chave longa)
5. **Deploy**

### 2. Domínio (2 min)
1. No Vercel: **Settings → Domains**
2. Add: **localcashback.com.br**
3. Copiar registros DNS

### 3. DNS (1 min)
No seu provedor de DNS, adicione:

```
A @ 76.76.21.21
CNAME www cname.vercel-dns.com
```

### 4. Aguardar (5-30 min)
- DNS propagar
- SSL ser gerado
- ✅ Pronto!

---

## 🎯 Resultado

Seu site ficará em:
- https://localcashback.com.br
- https://www.localcashback.com.br

Com:
- ✅ HTTPS (cadeado verde)
- ✅ Deploy automático do GitHub
- ✅ Grátis para sempre

---

## 📞 Precisa de Ajuda?

Veja o guia completo: **DEPLOY-VERCEL.md**
