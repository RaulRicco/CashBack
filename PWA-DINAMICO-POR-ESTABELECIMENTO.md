# 🎯 PWA DINÂMICO POR ESTABELECIMENTO

## 📱 O QUE FOI IMPLEMENTADO

Sistema de **manifest.json dinâmico** que personaliza o PWA para cada estabelecimento. Quando o cliente salva o app na tela inicial do celular, aparece:

✅ **Logo do estabelecimento** (não logo genérica)  
✅ **Nome do estabelecimento** (ex: "Pizzaria do João")  
✅ **Cores personalizadas** do estabelecimento  
✅ **Atalhos específicos** (Ver Cashback, Resgatar)

---

## 🔧 COMO FUNCIONA

### 1. **Detecção Automática do Estabelecimento**

O sistema detecta o `merchant_id` de várias formas:

```javascript
// Via URL path
/customer/cashback/:merchantId
/cadastro/:slug (busca merchant_id via slug)

// Via query param
/?merchant=abc123
/?m=abc123

// Via localStorage (sessão ativa)
current_merchant_id
```

### 2. **Geração do Manifest Dinâmico**

Quando o merchant é detectado, o sistema:

1. Busca dados do estabelecimento no Supabase
2. Gera manifest.json personalizado em memória
3. Injeta no `<head>` via JavaScript
4. Atualiza `theme-color` e `apple-mobile-web-app-title`

```javascript
{
  "name": "Pizzaria do João",
  "short_name": "Pizzaria",
  "description": "Programa de fidelidade - Pizzaria do João. Ganhe 5% de cashback!",
  "theme_color": "#ff6b35",  // Cor do estabelecimento
  "icons": [
    {
      "src": "https://...logo-pizzaria.png",  // Logo do estabelecimento
      "sizes": "192x192"
    }
  ]
}
```

### 3. **Cache em localStorage**

O `merchant_id` fica salvo em `localStorage` para:
- ✅ Próximas visitas (não precisa detectar novamente)
- ✅ Funcionar offline
- ✅ Manter PWA personalizado após instalação

---

## 📁 ARQUIVOS CRIADOS

### `/src/utils/dynamicManifest.js`
Funções principais:
- `generateDynamicManifest(merchantId)` - Gera manifest personalizado
- `injectDynamicManifest(merchantId)` - Injeta no HTML
- `detectMerchantId()` - Detecta merchant da URL
- `initDynamicManifest()` - Inicialização automática

### `/src/hooks/useDynamicManifest.js`
Hook React para uso em componentes:
```javascript
// Uso automático (detecta da URL)
useDynamicManifest();

// Uso com merchant_id
useDynamicManifest(merchantId);

// Uso com objeto merchant
useDynamicManifest(merchant);
```

---

## 🎨 PÁGINAS ATUALIZADAS

Todas as páginas de customer agora injetam manifest dinâmico:

### ✅ `CustomerSignup.jsx`
- Injeta quando merchant é carregado via `slug`
- Cliente vê logo/nome do estabelecimento ao cadastrar

### ✅ `CustomerCashback.jsx`
- Injeta quando transaction/merchant é carregado
- PWA personalizado após receber cashback

### ✅ `CustomerRedemption.jsx`
- Injeta quando redemption/merchant é carregado
- PWA personalizado ao resgatar

---

## 🚀 COMO TESTAR

### 1. **Acesse uma página de customer**
```
https://seusite.com/cadastro/pizzaria-joao
ou
https://seusite.com/customer/cashback/abc123
```

### 2. **Abra DevTools → Console**
Deve aparecer:
```
🎯 Detected merchant ID: xyz789
✅ Dynamic manifest injected for merchant: xyz789
```

### 3. **Inspecione o `<head>`**
```html
<link rel="manifest" href="blob:https://...">
<meta name="theme-color" content="#ff6b35">
<meta name="apple-mobile-web-app-title" content="Pizzaria">
```

### 4. **No celular: Salvar na Tela Inicial**

**Android (Chrome):**
1. Menu → Adicionar à tela inicial
2. Verá: Logo e nome do estabelecimento
3. Ao abrir: PWA personalizado

**iOS (Safari):**
1. Compartilhar → Adicionar à Tela Inicial
2. Verá: Logo e nome do estabelecimento
3. Ao abrir: PWA personalizado

---

## 📊 DADOS DO MERCHANT NECESSÁRIOS

O sistema busca do Supabase (`merchants` table):

```javascript
{
  id: 'merchant_id',
  business_name: 'Pizzaria do João',  // Nome do estabelecimento
  logo_url: 'https://...logo.png',     // Logo (192x192 ou 512x512)
  primary_color: '#ff6b35',            // Cor principal (hex)
  cashback_percentage: 5               // Para descrição
}
```

---

## 🔄 FLUXO COMPLETO

```
1. Cliente acessa /cadastro/pizzaria-joao
   ↓
2. Sistema detecta slug "pizzaria-joao"
   ↓
3. Busca merchant no Supabase
   ↓
4. Gera manifest.json dinâmico
   ↓
5. Injeta no <head> via blob URL
   ↓
6. Salva merchant_id em localStorage
   ↓
7. Cliente vê PWA personalizado com:
   - Logo da Pizzaria
   - Nome "Pizzaria do João"
   - Cor laranja (#ff6b35)
   ↓
8. Cliente clica "Adicionar à tela inicial"
   ↓
9. Ícone personalizado aparece no celular ✅
```

---

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### Fallback (Manifest Padrão)

Se merchant não for encontrado, usa manifest padrão:
```javascript
{
  name: 'Local CashBack',
  short_name: 'LocalCash',
  icons: ['/logo-192x192.png', '/logo-512x512.png']
}
```

### Shortcuts (Atalhos)

Cada PWA tem 2 atalhos personalizados:
- **Ver Cashback** → `/customer/:merchantId/cashback`
- **Resgatar** → `/customer/:merchantId/redemption`

### Theme Color

Atualiza automaticamente:
- `<meta name="theme-color">` → Barra de endereço
- `manifest.theme_color` → Splash screen

---

## 🐛 DEBUG

### Console.log úteis:

```javascript
// Ver merchant_id detectado
localStorage.getItem('current_merchant_id')

// Ver manifest injetado
document.querySelector('link[rel="manifest"]').href

// Ver theme-color
document.querySelector('meta[name="theme-color"]').content
```

### Testar geração manual:

```javascript
import { generateDynamicManifest } from './utils/dynamicManifest';

const manifest = await generateDynamicManifest('merchant-id-aqui');
console.log(manifest);
```

---

## ✅ BENEFÍCIOS

### Para o Cliente Final:
- ✅ App personalizado com logo do estabelecimento
- ✅ Fácil identificação na tela do celular
- ✅ Acesso rápido via ícone
- ✅ Experiência nativa

### Para o Estabelecimento:
- ✅ Branding próprio no PWA
- ✅ Aumenta percepção de valor
- ✅ Cliente identifica facilmente
- ✅ Profissionalismo

### Para o Sistema:
- ✅ White label completo
- ✅ Multi-tenant real
- ✅ Escalável (funciona para N merchants)
- ✅ Sem build por merchant

---

## 🚨 IMPORTANTE

### Requisitos:

1. **Logo do merchant deve estar disponível via URL**
   - Formato: PNG (transparente)
   - Tamanho: 192x192 ou 512x512 pixels
   - Armazenado no Supabase Storage

2. **Merchant deve ter dados completos**
   - `business_name` (obrigatório)
   - `logo_url` (obrigatório)
   - `primary_color` (opcional, usa padrão)

3. **Cliente deve acessar via URL do merchant**
   - `/cadastro/:slug`
   - `/customer/cashback/:token` (que tem merchant_id)
   - Ou com query param `?merchant=xxx`

---

## 📈 PRÓXIMOS PASSOS (Opcional)

### Melhorias futuras:

1. **API route para manifest**
   ```
   GET /api/manifest/:merchantId
   ```

2. **Service Worker personalizado**
   - Cache de assets do merchant
   - Offline com logo do estabelecimento

3. **Screenshots do merchant**
   - Para App Store preview
   - Melhor experiência de instalação

4. **Update automático**
   - Quando merchant atualiza logo
   - Notification para re-instalar

---

**Data:** 07/11/2024  
**Status:** ✅ Implementado  
**Testado:** Sim  
**Compatível:** Chrome/Edge/Safari/Firefox
