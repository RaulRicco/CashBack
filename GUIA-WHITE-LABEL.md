# 🎨 GUIA WHITE LABEL - Local CashBack

## 📖 O QUE É WHITE LABEL?

Este sistema foi desenvolvido como uma **solução white label**, o que significa que você pode personalizá-lo completamente com a sua marca, mantendo toda a funcionalidade intacta.

**White Label** = Sistema pronto que pode ser rebrandizado para qualquer cliente.

---

## ⚡ PERSONALIZAÇÃO RÁPIDA (5 minutos)

### **Passo 1: Editar Configuração**

Abra o arquivo: `/src/config/branding.js`

```javascript
export const BRAND_CONFIG = {
  // ALTERE ESTAS LINHAS:
  name: 'Sua Marca Aqui',           // ← Nome completo
  shortName: 'SuaMarca',             // ← Nome curto
  tagline: 'Seu slogan aqui',        // ← Slogan
  
  // ALTERE AS LOGOS:
  logo: {
    main: '/logo-suamarca.png',      // ← Logo principal
    icon: '/logo-suamarca-icon.png', // ← Ícone
  },
  
  // Cores já estão configuradas (verde e laranja)
  // Mantenha ou altere conforme necessário
};
```

### **Passo 2: Adicionar Logos**

Coloque suas logos na pasta `/public/`:
- `logo-suamarca.png` (logo completa)
- `logo-suamarca-icon.png` (apenas ícone)

**Formatos recomendados:**
- PNG com fundo transparente
- Tamanho: 512x512px (serão redimensionadas automaticamente)

### **Passo 3: Rebuild e Deploy**

```bash
npm run build
# Deploy para Vercel/Netlify/etc
```

✅ **Pronto! Seu sistema está personalizado!**

---

## 🎯 PERSONALIZAÇÃO COMPLETA

### **1. Identidade Visual**

#### **Nome da Marca**
```javascript
// src/config/branding.js
name: 'Local CashBack',        // Nome completo
shortName: 'LocalCash',         // Nome curto (sidebar, mobile)
tagline: 'Cashback do comércio perto de você',
```

**Onde aparece:**
- Sidebar (desktop e mobile)
- Página de login
- Títulos de páginas
- PWA (nome do app quando instalado)

---

#### **Logos**

```javascript
// src/config/branding.js
logo: {
  main: '/logo-localcashback.png',        // Logo completa
  icon: '/logo-localcashback-icon.png',   // Ícone (favicon)
  light: '/logo-localcashback-light.png', // Versão clara
  dark: '/logo-localcashback.png',        // Versão escura
},
```

**Formatos suportados:**
- PNG (recomendado)
- SVG (para melhor qualidade)
- JPG (não recomendado, sem transparência)

**Dimensões recomendadas:**
- Logo completa: 512x512px ou 1024x1024px
- Ícone: 256x256px
- Formato: Quadrado com fundo transparente

---

#### **Cores**

As cores são gerenciadas pelo Tailwind CSS:

```javascript
// tailwind.config.js (JÁ CONFIGURADO)
colors: {
  primary: {
    500: '#17A589',  // Verde turquesa
  },
  secondary: {
    400: '#FFA726',  // Laranja
  },
}
```

**Para alterar cores:**
1. Edite `tailwind.config.js`
2. Atualize `src/config/branding.js` → `colorHex`
3. Rebuild

---

### **2. Textos e Mensagens**

Todos os textos são configuráveis:

```javascript
// src/config/branding.js
messages: {
  welcome: 'Bem-vindo ao Local CashBack!',
  loginTitle: 'Entre na sua conta',
  
  customerSignup: {
    title: 'Cadastre-se',
    subtitle: 'Comece a ganhar {percentage}% de cashback',
    poweredBy: 'Powered by',
  },
  
  // ... mais mensagens
}
```

**Como usar:**
- `{percentage}` será substituído automaticamente
- Adicione novas mensagens conforme necessário

---

### **3. SEO e Meta Tags**

Configure para melhor rankeamento no Google:

```javascript
// src/config/branding.js
seo: {
  title: 'Local CashBack - Cashback do Comércio Local',
  description: 'Sistema de cashback para fortalecer o comércio local',
  keywords: 'cashback, comércio local, recompensas, fidelidade',
  
  og: {
    title: 'Local CashBack - Cashback Local',
    description: 'Ganhe cashback comprando no comércio local',
    image: '/logo-localcashback.png',
  },
}
```

**Importante:**
- Título: Máximo 60 caracteres
- Descrição: 150-160 caracteres
- Imagem OG: 1200x630px (para compartilhamento)

---

### **4. PWA (App Mobile)**

Configure como o app aparecerá no celular:

```javascript
// src/config/branding.js
pwa: {
  name: 'Local CashBack',
  shortName: 'LocalCash',
  themeColor: '#17A589',        // Cor da barra de status
  backgroundColor: '#FFFFFF',
  display: 'standalone',        // Fullscreen app
}
```

**Isso controla:**
- Nome quando instalado na tela inicial
- Cor da barra de status (Android)
- Splash screen
- Comportamento de abertura

---

### **5. Links e Redes Sociais**

```javascript
// src/config/branding.js
social: {
  website: 'https://localcashback.com.br',
  support: 'https://suporte.localcashback.com.br',
  instagram: 'https://instagram.com/localcashback',
  // ... mais links
},

contact: {
  email: 'contato@localcashback.com.br',
  phone: '+55 (11) 99999-9999',
  whatsapp: '+5511999999999',
}
```

---

## 🎨 ESTILOS PERSONALIZADOS

### **Botões**

```javascript
// src/config/branding.js
buttons: {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-700 ...',
  secondary: 'bg-secondary-500 text-white ...',
  outline: 'border-2 border-primary-500 ...',
}
```

**Como usar no código:**
```jsx
import { getButtonClass } from '../config/branding';

<button className={getButtonClass('primary')}>
  Meu Botão
</button>
```

---

### **Cards**

```javascript
// src/config/branding.js
cards: {
  default: 'bg-white border border-gray-200 ...',
  highlighted: 'bg-gradient-to-br from-primary-50 ...',
  cashback: 'bg-gradient-to-br from-secondary-50 ...',
}
```

**Como usar:**
```jsx
import { getCardClass } from '../config/branding';

<div className={getCardClass('highlighted')}>
  Conteúdo
</div>
```

---

## 🛠️ FUNCIONALIDADES WHITE LABEL

### **Mostrar/Ocultar "Powered by"**

```javascript
// src/config/branding.js
features: {
  showPoweredBy: true,  // Mostrar "Powered by Local CashBack"
}
```

**false** = Não mostra marca em páginas públicas  
**true** = Mostra "Powered by [sua marca]"

---

### **Modo Demonstração**

```javascript
// src/config/branding.js
features: {
  demoMode: false,  // true = Ativa modo demo
}
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
cashback-system/
├── src/
│   ├── config/
│   │   └── branding.js          ← ARQUIVO PRINCIPAL
│   ├── components/
│   │   └── DashboardLayout.jsx  ← Usa branding.js
│   ├── pages/
│   │   ├── Login.jsx            ← Usa branding.js
│   │   └── CustomerSignup.jsx   ← Usa branding.js
├── public/
│   ├── logo-localcashback.png   ← SUAS LOGOS AQUI
│   └── manifest.json            ← Config PWA
├── index.html                    ← Meta tags
└── tailwind.config.js            ← Cores
```

---

## 🚀 COMO APLICAR MUDANÇAS

### **Desenvolvimento:**

1. Edite `src/config/branding.js`
2. Adicione logos em `/public/`
3. Salve os arquivos
4. Hot reload automático ✅

### **Produção:**

1. Edite configurações
2. Execute `npm run build`
3. Deploy no Vercel/Netlify
4. Aguarde 2-3 minutos ✅

---

## 📦 EXEMPLOS DE CLIENTES

### **Cliente 1: "MeuCash"**

```javascript
// src/config/branding.js
export const BRAND_CONFIG = {
  name: 'MeuCash',
  shortName: 'MeuCash',
  tagline: 'Seu cashback, seu jeito',
  logo: {
    main: '/logo-meucash.png',
  },
  colorHex: {
    primary: '#E91E63',    // Rosa
    secondary: '#FF9800',  // Laranja
  },
};
```

---

### **Cliente 2: "CashPlus"**

```javascript
// src/config/branding.js
export const BRAND_CONFIG = {
  name: 'CashPlus',
  shortName: 'CashPlus',
  tagline: 'Cashback que vale mais',
  logo: {
    main: '/logo-cashplus.png',
  },
  colorHex: {
    primary: '#2196F3',    // Azul
    secondary: '#4CAF50',  // Verde
  },
};
```

---

## ✅ CHECKLIST DE PERSONALIZAÇÃO

### **Obrigatório:**
- [ ] Editar `name` e `shortName` em `branding.js`
- [ ] Editar `tagline` em `branding.js`
- [ ] Adicionar logo principal em `/public/`
- [ ] Atualizar `manifest.json`
- [ ] Atualizar `index.html` meta tags
- [ ] Rebuild (`npm run build`)
- [ ] Testar em desenvolvimento
- [ ] Deploy

### **Recomendado:**
- [ ] Adicionar logo icon (favicon)
- [ ] Adicionar logo light (fundo escuro)
- [ ] Configurar SEO (title, description)
- [ ] Configurar Open Graph (compartilhamento)
- [ ] Adicionar links de redes sociais
- [ ] Configurar contato (email, telefone)
- [ ] Testar PWA no mobile
- [ ] Testar em diferentes navegadores

### **Opcional:**
- [ ] Personalizar cores (Tailwind)
- [ ] Personalizar mensagens
- [ ] Adicionar logo customizada por merchant
- [ ] Criar variações de logo (monocromático)

---

## 🆘 PROBLEMAS COMUNS

### **Logo não aparece**
✅ Verifique se o arquivo está em `/public/`  
✅ Confirme o nome do arquivo em `branding.js`  
✅ Limpe cache (Ctrl+Shift+R)

### **Cores não mudam**
✅ Edite `tailwind.config.js`  
✅ Rebuild com `npm run build`  
✅ Reinicie o servidor dev

### **Nome antigo ainda aparece**
✅ Verifique `branding.js`  
✅ Procure por "PertoCash" ou "Local CashBack" no código  
✅ Use busca global (Ctrl+Shift+F)

---

## 📚 DOCUMENTAÇÃO TÉCNICA

### **Funções Helper**

```javascript
import { 
  getLogo,         // Retorna URL da logo
  getBrandName,    // Retorna nome da marca
  getColor,        // Retorna classe Tailwind
  getButtonClass,  // Retorna classe de botão
  getMessage,      // Retorna mensagem
} from '../config/branding';

// Exemplos:
const logo = getLogo('main');              // '/logo-localcashback.png'
const name = getBrandName();               // 'Local CashBack'
const shortName = getBrandName(true);      // 'LocalCash'
const btnClass = getButtonClass('primary'); // 'bg-gradient-to-r ...'
```

---

## 🎉 RESUMO

**Com este sistema white label você pode:**
- ✅ Personalizar marca completa em 5 minutos
- ✅ Manter código único para múltiplos clientes
- ✅ Aplicar cores da marca facilmente
- ✅ Configurar SEO por cliente
- ✅ Gerar PWAs personalizados
- ✅ Escalar para N clientes

**Arquivo principal:** `src/config/branding.js`  
**Documentação completa:** Este arquivo  
**Suporte:** Consulte CORES-PERTOCASH.md

---

**📅 Última atualização:** 2025-10-26  
**🎨 Versão:** 2.0.0 - White Label  
**✅ Status:** Pronto para customização
