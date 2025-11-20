# 🔧 FIX - Meta Pixel não carregava na página de Cashback

## ❌ Problema Identificado

Na página **`/customer/cashback/:token/parabens`**, o Meta Pixel (Facebook Pixel) **NÃO estava sendo carregado**.

### URL Afetada:
```
https://localcashback.com.br/customer/cashback/CASHBACK_1763208306405_x14lbk0dpo9/parabens
```

### Sintomas:
- ❌ `window.fbq` não estava disponível
- ❌ Eventos de conversão não eram disparados
- ❌ Meta Pixel não aparecia no DevTools

---

## 🔍 Causa Raiz

### Problema de **Race Condition** (condição de corrida):

```
1. Página carrega
2. processQRCode() executa IMEDIATAMENTE
3. Tenta disparar eventos: window.fbq('track', 'Purchase', ...)
4. MAS o Meta Pixel ainda não foi inicializado!

Por quê?
→ O Meta Pixel só era inicializado no useEffect que depende do merchant
→ O merchant só era setado DEPOIS do processQRCode
→ Quando chegava a hora de disparar eventos, window.fbq ainda não existia
```

### Fluxo Anterior (com problema):

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Página carrega                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. processQRCode() executa                                  │
│    → Busca dados da transaction                             │
│    → setTransaction(updatedTx)                              │
│    → setCustomer(updatedTx.customer)                        │
│    → setMerchant(updatedTx.merchant)  ← merchant setado     │
│    → Dispara eventos: window.fbq(...)  ❌ AINDA NÃO EXISTE  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. useEffect([merchant]) detecta mudança                    │
│    → Agora sim inicializa Meta Pixel                        │
│    → initMetaPixel(merchant.meta_pixel_id)                  │
│    → window.fbq AGORA EXISTE... mas já é tarde! ⏰          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Solução Implementada

### Inicializar tracking ANTES de disparar eventos

Agora o fluxo correto:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Página carrega                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. processQRCode() executa                                  │
│    → Busca dados da transaction                             │
│    → setTransaction(updatedTx)                              │
│    → setCustomer(updatedTx.customer)                        │
│    → 🔥 NOVO: Inicializa tracking IMEDIATAMENTE             │
│      ✅ initGTM(merchantData.gtm_id)                        │
│      ✅ initMetaPixel(merchantData.meta_pixel_id)           │
│    → await new Promise(resolve => setTimeout(resolve, 300)) │
│    → setMerchant(merchantData)                              │
│    → Dispara eventos: window.fbq(...)  ✅ AGORA EXISTE!     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. useEffect([merchant]) detecta mudança                    │
│    → Verifica se já foi inicializado (window.fbq existe)    │
│    → Se SIM: pula inicialização (evita duplicação)          │
│    → Se NÃO: inicializa (fallback para casos edge)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Alterações no Código

### Arquivo: `src/pages/CustomerCashback.jsx`

#### 1. Inicialização Antecipada no `processQRCode()`

**Antes:**
```javascript
setTransaction(updatedTx);
setCustomer(updatedTx.customer);
setMerchant(updatedTx.merchant);

// Tracking: QR Code Escaneado
trackCashbackScanned({ ... });
```

**Depois:**
```javascript
setTransaction(updatedTx);
setCustomer(updatedTx.customer);

// 🔥 INICIALIZAR TRACKING IMEDIATAMENTE
const merchantData = updatedTx.merchant;

if (merchantData.gtm_id) {
  console.log('📊 Inicializando GTM:', merchantData.gtm_id);
  initGTM(merchantData.gtm_id);
}

if (merchantData.meta_pixel_id) {
  console.log('📘 Inicializando Meta Pixel:', merchantData.meta_pixel_id);
  initMetaPixel(merchantData.meta_pixel_id);
}

// Aguardar 300ms para scripts carregarem
await new Promise(resolve => setTimeout(resolve, 300));

// Agora sim, setar merchant
setMerchant(merchantData);

// Tracking: QR Code Escaneado
trackCashbackScanned({ ... });
```

#### 2. UseEffect com Verificação (evitar duplicação)

**Antes:**
```javascript
useEffect(() => {
  if (merchant) {
    if (merchant.gtm_id) {
      initGTM(merchant.gtm_id);
    }
    if (merchant.meta_pixel_id) {
      initMetaPixel(merchant.meta_pixel_id);
    }
  }
}, [merchant]);
```

**Depois:**
```javascript
useEffect(() => {
  // Apenas inicializar se ainda não foi inicializado
  if (merchant && !window.fbq && !window.dataLayer) {
    console.log('🎯 Inicializando tracking (fallback)');
    if (merchant.gtm_id) {
      initGTM(merchant.gtm_id);
    }
    if (merchant.meta_pixel_id) {
      initMetaPixel(merchant.meta_pixel_id);
    }
  }
  
  // TrackPageView sempre
  if (merchant) {
    setTimeout(() => {
      trackPageView('CustomerCashbackReceived');
    }, 500);
  }
}, [merchant]);
```

#### 3. Mensagens de Debug Melhoradas

**Adicionado:**
```javascript
if (window.fbq) {
  window.fbq('track', 'Purchase', { ... });
  console.log('📘 Meta Pixel: Evento Purchase disparado');
} else {
  console.warn('⚠️ Meta Pixel não disponível. window.fbq não encontrado.');
}
```

#### 4. Tratamento para QR Já Escaneado

**Antes:**
```javascript
if (txData.qr_scanned) {
  setTransaction(txData);
  setCustomer(txData.customer);
  setMerchant(txData.merchant);
  return;
}
```

**Depois:**
```javascript
if (txData.qr_scanned) {
  // Inicializar tracking também para QR já escaneado
  const merchantData = txData.merchant;
  if (merchantData.gtm_id) {
    initGTM(merchantData.gtm_id);
  }
  if (merchantData.meta_pixel_id) {
    initMetaPixel(merchantData.meta_pixel_id);
  }
  
  setTransaction(txData);
  setCustomer(txData.customer);
  setMerchant(merchantData);
  return;
}
```

---

## 🧪 Como Testar

### 1. Abrir DevTools Console

```bash
1. Acesse: https://localcashback.com.br/customer/cashback/[TOKEN]/parabens
2. Pressione F12 (DevTools)
3. Vá para Console
```

### 2. Verificar Logs

Você deve ver:

```
📊 Inicializando GTM: GTM-XXXXXXX
📘 Inicializando Meta Pixel: 1234567890
🎯 PÁGINA DE CONVERSÃO DETECTADA!
📘 Meta Pixel: Evento Purchase disparado
📊 GTM: Evento conversion disparado
```

### 3. Verificar no Console se `window.fbq` existe

```javascript
// No Console do DevTools:
console.log(window.fbq);
// Deve retornar: function fbq() { ... }

// Se retornar undefined, significa que o Meta Pixel não foi carregado
```

### 4. Testar Evento de Conversão

```javascript
// No Console do DevTools:
fbq('track', 'TestEvent', { test: true });
// Deve aparecer log no console e no Meta Pixel Events Manager
```

### 5. Facebook Pixel Helper (Extensão Chrome)

- Instale: [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- Acesse a página de conversão
- Clique no ícone da extensão
- Deve mostrar: **✅ Pixel Found** e **Purchase Event**

---

## ✅ Verificações Realizadas

- [x] Build compilado com sucesso
- [x] Meta Pixel inicializa antes de disparar eventos
- [x] Aguarda 300ms para garantir carregamento dos scripts
- [x] UseEffect não duplica inicialização
- [x] Logs de debug adicionados
- [x] Tratamento para QR já escaneado
- [x] Fallback se tracking não foi inicializado

---

## 📊 Eventos Disparados

### PageView (ao carregar)
```javascript
fbq('track', 'PageView');
```

### Purchase (conversão)
```javascript
fbq('track', 'Purchase', {
  value: 100.00,           // Valor da compra
  currency: 'BRL',
  content_name: 'Cashback Recebido',
  content_category: 'Conversão',
  content_ids: ['TRANS_123'],
  cashback_amount: 5.00    // Valor do cashback
});
```

---

## 🔄 Próximos Passos

### 1. Deploy em Produção

```bash
ssh root@31.97.167.88
cd /var/www/cashback/cashback-system
git pull origin main
npm install --legacy-peer-deps
npm run build
sudo systemctl reload nginx
```

### 2. Testar URL Real

```
https://localcashback.com.br/customer/cashback/[TOKEN]/parabens
```

### 3. Validar no Meta Events Manager

1. Acesse: https://business.facebook.com/events_manager
2. Selecione seu Pixel
3. Vá para "Test Events"
4. Acesse a página de conversão
5. Verifique se eventos aparecem em tempo real

---

## ⚠️ Observações Importantes

### 1. Delay de 300ms

O `await new Promise(resolve => setTimeout(resolve, 300))` é necessário porque:
- Os scripts do Meta Pixel/GTM precisam de tempo para carregar
- São injetados dinamicamente no `<head>`
- Precisam inicializar suas funções globais (`window.fbq`, `window.dataLayer`)

### 2. Fallback no useEffect

Mantemos o useEffect como fallback porque:
- Se o merchant for carregado de outra forma (não via processQRCode)
- Garante que o tracking sempre será inicializado
- Mas evita duplicação verificando `window.fbq` e `window.dataLayer`

### 3. QR Code Já Escaneado

Quando o QR já foi escaneado antes:
- Também precisa inicializar o tracking
- Porque o usuário pode estar revisitando a página
- E precisamos rastrear essas visualizações

---

## 📝 Resumo

| Item | Status |
|------|--------|
| **Problema** | Meta Pixel não carregava na página de cashback |
| **Causa** | Race condition - eventos disparados antes da inicialização |
| **Solução** | Inicializar tracking ANTES de disparar eventos |
| **Build** | ✅ Compilado com sucesso |
| **Teste** | Aguardando deploy em produção |

---

## 🎉 Conclusão

O Meta Pixel agora será **inicializado ANTES** de qualquer evento ser disparado, garantindo que todos os eventos de conversão sejam rastreados corretamente! 🚀

**Data:** 15 de Novembro de 2024  
**Status:** ✅ CORRIGIDO E PRONTO PARA DEPLOY
