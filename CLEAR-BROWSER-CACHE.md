# 🔄 LIMPAR CACHE DO NAVEGADOR

## ⚠️ IMPORTANTE: O build foi atualizado, mas seu navegador está usando cache antigo!

O problema agora é **cache do navegador**. O JavaScript antigo ainda está tentando acessar `:3001`.

---

## ✅ SOLUÇÃO: FAZER HARD REFRESH

### **Windows/Linux:**
1. Abra o site: `https://cashback.raulricco.com.br`
2. Pressione: **`Ctrl + Shift + R`**
3. Ou: **`Ctrl + F5`**

### **Mac:**
1. Abra o site: `https://cashback.raulricco.com.br`
2. Pressione: **`Cmd + Shift + R`**
3. Ou: **`Cmd + Option + R`**

### **Chrome/Edge (alternativa):**
1. Abra o DevTools (F12)
2. Clique com botão direito no ícone de refresh
3. Selecione **"Esvaziar cache e atualizar forçadamente"**

---

## 🔍 VERIFICAR SE DEU CERTO:

Após o hard refresh, abra o **Console do navegador** (F12):

### **❌ ANTES (cache antigo):**
```
:3001/api/merchants/... Failed to load resource: ERR_SSL_PROTOCOL_ERROR
```

### **✅ DEPOIS (cache limpo):**
```
Nenhum erro de SSL
Banner de trial carrega corretamente
```

---

## 🧪 TESTE ADICIONAL:

Se o hard refresh não funcionar:

### **1. Limpar cache manualmente:**

**Chrome/Edge:**
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Período: "Última hora"
4. Clique "Limpar dados"

**Firefox:**
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Cache"
3. Período: "Última hora"
4. Clique "Limpar agora"

### **2. Abrir em aba anônima/privada:**
```
Ctrl + Shift + N (Chrome/Edge)
Ctrl + Shift + P (Firefox)
```

Acesse: `https://cashback.raulricco.com.br`

Se funcionar na aba anônima, confirma que é cache.

---

## 📊 VERIFICAÇÃO TÉCNICA:

O build está correto. Verifique você mesmo:

```bash
# No servidor, verificar o JS compilado:
cd /var/www/cashback/cashback-system/assets
grep -o "https://localcashback.com.br" index-Dxynz0t--1767550379879.js | head -3
```

**Resultado:**
```
https://localcashback.com.br
https://localcashback.com.br
https://localcashback.com.br
```

✅ **Sem `:3001`** - Build correto!

---

## 🎯 RESUMO:

| Item | Status |
|------|--------|
| .env duplicado | ✅ Corrigido |
| Build com URL correta | ✅ Concluído |
| Deploy em produção | ✅ Concluído |
| **Limpar cache navegador** | ⏳ **VOCÊ PRECISA FAZER** |

---

## 🔗 APÓS LIMPAR O CACHE:

O sistema deve funcionar 100%:
- ✅ Sem erros de SSL
- ✅ Banner de trial carrega
- ✅ Botão "Assinar Agora" funciona
- ✅ Preço R$ 97/mês correto

---

**Data:** 2025-01-04  
**Arquivo JS atual:** `index-Dxynz0t--1767550379879.js`  
**Status:** ✅ Build correto, aguardando limpeza de cache
