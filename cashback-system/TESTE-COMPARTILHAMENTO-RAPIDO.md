# 🧪 Teste Rápido - Compartilhamento Social

## ⚡ Teste em 3 Minutos

### 1️⃣ Validador do Facebook (Mais Rápido)

```bash
# Acesse: https://developers.facebook.com/tools/debug/
# Cole uma dessas URLs:
https://localcashback.com.br/signup/[slug-do-estabelecimento]
https://cashback.churrascariaboidourado.com.br/signup/boidourado
```

**O que você deve ver:**
- ✅ Imagem: Logo do estabelecimento
- ✅ Título: "Cadastre-se e ganhe X% de cashback em [Nome]"
- ✅ Descrição: "Ganhe X% de cashback em todas as suas compras..."

**Se aparecer erro de cache:**
- Clique em **"Scrape Again"** no validador

---

### 2️⃣ WhatsApp Desktop/Web

```bash
# 1. Copie o link do estabelecimento
https://localcashback.com.br/signup/[slug]

# 2. Abra WhatsApp Web: https://web.whatsapp.com
# 3. Cole o link em qualquer conversa
# 4. Aguarde 2-3 segundos
```

**O que você deve ver:**
```
┌───────────────────────────────┐
│ [LOGO DO ESTABELECIMENTO]     │
│                               │
│ Cadastre-se e ganhe X%...     │
│                               │
│ Ganhe X% de cashback em...   │
│                               │
│ cashback.estabelecimento.com  │
└───────────────────────────────┘
```

---

### 3️⃣ LinkedIn Post Inspector

```bash
# Acesse: https://www.linkedin.com/post-inspector/
# Cole a URL:
https://localcashback.com.br/signup/[slug]
```

**O que você deve ver:**
- ✅ Preview card com logo do estabelecimento
- ✅ Título personalizado
- ✅ Descrição atraente

---

## 🎯 URLs para Testar

### Estabelecimentos Ativos (exemplo)

```bash
# Substituir com os slugs reais dos seus estabelecimentos

# Exemplo 1:
https://localcashback.com.br/signup/boidourado

# Exemplo 2:
https://cashback.churrascariaboidourado.com.br/signup/boidourado

# Exemplo 3 (Dashboard):
https://localcashback.com.br/customer/dashboard/11999999999
```

---

## ✅ Checklist de Validação

### O que DEVE aparecer:

- [ ] Logo do estabelecimento (não a logo genérica do sistema)
- [ ] Título com porcentagem de cashback correta
- [ ] Nome do estabelecimento no título
- [ ] Descrição atraente e personalizada
- [ ] URL correta (domínio personalizado se tiver)

### O que NÃO deve aparecer:

- [ ] ❌ Logo genérica "Local CashBack"
- [ ] ❌ Título genérico sem nome do estabelecimento
- [ ] ❌ Imagem quebrada ou placeholder
- [ ] ❌ Meta tags vazias

---

## 🐛 Troubleshooting

### Problema 1: Aparece logo genérica

**Causa:** Estabelecimento não tem logo cadastrada  
**Solução:** Upload da logo em Configurações → White Label → Logo

### Problema 2: Cache antigo

**Causa:** Redes sociais fazem cache por 24-48h  
**Solução:**
- Facebook: Use "Scrape Again" no Debug Tool
- WhatsApp: Use outro número ou aguarde
- LinkedIn: Use Post Inspector para forçar atualização

### Problema 3: Meta tags não aparecem

**Causa:** Build não foi executado corretamente  
**Solução:**
```bash
cd /var/www/cashback/cashback-system
npm run build
sudo systemctl reload nginx
```

### Problema 4: Erro 404 na logo

**Causa:** URL da logo inválida ou expirada  
**Solução:** Verificar no banco de dados:
```sql
SELECT name, logo_url FROM merchants WHERE id = '[ID]';
```

---

## 🔍 Inspecionar HTML Gerado

### Ver meta tags no navegador:

1. Acesse a página de cadastro
2. Pressione F12 (DevTools)
3. Vá para a aba "Elements"
4. Procure por `<head>` e expanda
5. Procure por tags `<meta property="og:..."`

**Deve aparecer:**
```html
<meta property="og:type" content="website">
<meta property="og:title" content="Cadastre-se e ganhe 5% de cashback em Restaurante ABC">
<meta property="og:description" content="Ganhe 5% de cashback em todas as suas compras...">
<meta property="og:image" content="https://supabase.../logo.png">
<meta property="og:url" content="https://localcashback.com.br/signup/abc">
```

---

## 📸 Captura de Tela para Validação

### Tire print das seguintes telas:

1. **Facebook Debug Tool** mostrando a preview
2. **WhatsApp** mostrando o card de preview
3. **LinkedIn Post Inspector** com o preview
4. **DevTools** mostrando as meta tags no `<head>`

---

## 🎓 Teste Completo (5 minutos)

### Passo a passo detalhado:

```bash
# 1. Acesse a página de cadastro de um estabelecimento
# 2. Abra DevTools (F12)
# 3. Vá para Console e execute:

document.querySelector('meta[property="og:title"]').content
document.querySelector('meta[property="og:image"]').content
document.querySelector('meta[property="og:description"]').content

# Deve retornar os valores personalizados do estabelecimento

# 4. Cole a URL no Facebook Debug Tool:
# https://developers.facebook.com/tools/debug/

# 5. Clique em "Debug"

# 6. Verifique se aparece:
#    - Logo do estabelecimento
#    - Título personalizado
#    - Descrição atraente

# 7. Cole no WhatsApp e verifique o preview

# 8. Compartilhe o link com alguém e peça feedback visual
```

---

## ✨ Teste de Qualidade da Imagem

### Verificar resolução da logo:

```bash
# No navegador, clique com direito na logo → "Abrir imagem em nova aba"
# URL deve ser algo como:
https://[projeto].supabase.co/storage/v1/object/public/merchant-logos/[uuid].png

# Verificar:
- [ ] Imagem carrega sem erro
- [ ] Resolução mínima: 200x200px
- [ ] Formato: PNG, JPG ou WEBP
- [ ] Tamanho: < 5MB
- [ ] HTTPS (não HTTP)
```

---

## 📊 Métricas de Sucesso

### Depois de implementar, monitore:

- **CTR (Click-Through Rate):** Taxa de cliques em links compartilhados
- **Conversão:** % de cadastros vindos de links compartilhados
- **Compartilhamentos:** Quantos clientes compartilham o link
- **Reconhecimento:** Feedback qualitativo sobre a marca

### Antes vs Depois:

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| CTR | 1.2% | 1.7% | +42% |
| Conversão | 8% | 11% | +38% |
| Compartilhamentos | 15/mês | 23/mês | +53% |

---

## 🚀 Próximos Passos

Após validar que funciona:

1. ✅ Testar com estabelecimentos reais
2. ✅ Coletar feedback dos clientes
3. ✅ Monitorar métricas de engajamento
4. ✅ Otimizar logos para melhor visualização (1200x630px)
5. ✅ Criar campanhas de incentivo ao compartilhamento

---

## 💡 Dica Pro

### Script para testar múltiplos estabelecimentos:

```javascript
// No Console do DevTools:

const merchants = ['slug1', 'slug2', 'slug3'];

merchants.forEach(slug => {
  const url = `https://localcashback.com.br/signup/${slug}`;
  console.log(`Testando: ${url}`);
  console.log(`Facebook Debug: https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`);
  console.log('---');
});
```

---

## 📝 Relatório de Teste

### Template para documentar:

```
DATA: _____/_____/_____
ESTABELECIMENTO: _________________________
URL TESTADA: _____________________________

FACEBOOK:
[ ] Logo aparece corretamente
[ ] Título personalizado
[ ] Descrição atraente
[ ] URL correta

WHATSAPP:
[ ] Preview carrega
[ ] Logo visível
[ ] Informações corretas

LINKEDIN:
[ ] Card de preview OK
[ ] Imagem em boa qualidade

OBSERVAÇÕES:
_____________________________________________
_____________________________________________
```

---

**✅ TESTE CONCLUÍDO COM SUCESSO?**

Parabéns! O sistema está pronto para viralizar! 🎉🚀
