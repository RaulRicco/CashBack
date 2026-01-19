# 🎨 Paleta de Cores - PertoCash

## 🎯 Cores Principais da Logo

### Verde Turquesa (Primary)
**Uso:** Cor principal do sistema, elementos primários, botões principais
```
Base: #17A589
```

**Escala Completa:**
```css
primary-50:  #e8f8f5  /* Fundos suaves */
primary-100: #d1f2eb  /* Fundos claros */
primary-200: #a3e4d7  /* Borders hover */
primary-300: #76d7c4  /* Elementos secundários */
primary-400: #48c9b0  /* Hover states */
primary-500: #17A589  /* ⭐ COR PRINCIPAL */
primary-600: #138d75  /* Botões hover */
primary-700: #117864  /* Estados pressed */
primary-800: #0e6251  /* Textos escuros */
primary-900: #0b5345  /* Headers escuros */
```

---

### Laranja (Secondary)
**Uso:** Destaques, CTAs secundários, ícones de dinheiro/cashback
```
Base: #FFA726
```

**Escala Completa:**
```css
secondary-50:  #fff3e0  /* Fundos suaves */
secondary-100: #ffe0b2  /* Badges claros */
secondary-200: #ffcc80  /* Borders */
secondary-300: #ffb74d  /* Elementos hover */
secondary-400: #FFA726  /* ⭐ COR SECUNDÁRIA */
secondary-500: #ff9800  /* Estados ativos */
secondary-600: #fb8c00  /* Hover */
secondary-700: #f57c00  /* Pressed */
secondary-800: #ef6c00  /* Textos */
secondary-900: #e65100  /* Escuro */
```

---

### Cinza/Azulado (Accent)
**Uso:** Textos, borders, elementos neutros
```
Base: #607d8b
```

**Escala Completa:**
```css
accent-50:  #eceff1  /* Fundos */
accent-100: #cfd8dc  /* Divisores */
accent-200: #b0bec5  /* Borders suaves */
accent-300: #90a4ae  /* Placeholders */
accent-400: #78909c  /* Texto secundário */
accent-500: #607d8b  /* ⭐ COR DE APOIO */
accent-600: #546e7a  /* Texto ativo */
accent-700: #455a64  /* Texto principal */
accent-800: #37474f  /* Títulos */
accent-900: #263238  /* Preto suave */
```

---

## 📱 Aplicações por Componente

### Botões

**Botão Principal:**
```css
bg-gradient-to-r from-primary-600 to-primary-700
hover:from-primary-700 hover:to-primary-800
shadow-lg shadow-primary-500/50
```

**Botão Secundário:**
```css
bg-secondary-500
hover:bg-secondary-600
text-white
```

**Botão Outline:**
```css
border-2 border-primary-500
text-primary-600
hover:bg-primary-50
```

---

### Cards

**Card Padrão:**
```css
bg-white
border border-gray-200
hover:border-primary-300
shadow-sm
```

**Card com Destaque:**
```css
bg-gradient-to-br from-primary-50 to-primary-100
border border-primary-200
```

**Card de Cashback:**
```css
bg-gradient-to-br from-secondary-50 to-secondary-100
border border-secondary-200
```

---

### Inputs

**Input Normal:**
```css
border border-gray-300
focus:ring-2 focus:ring-primary-500
focus:border-transparent
```

**Input com Erro:**
```css
border border-red-300
focus:ring-2 focus:ring-red-500
```

**Input com Sucesso:**
```css
border border-primary-300
focus:ring-2 focus:ring-primary-500
```

---

### Badges

**Badge Sucesso:**
```css
bg-primary-100 text-primary-800
```

**Badge Aviso:**
```css
bg-secondary-100 text-secondary-800
```

**Badge Informação:**
```css
bg-accent-100 text-accent-800
```

**Badge Erro:**
```css
bg-red-100 text-red-800
```

---

### Gradientes

**Gradiente Principal (Headers, Hero):**
```css
bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900
```

**Gradiente Suave (Fundos):**
```css
bg-gradient-to-br from-primary-50 to-primary-100
```

**Gradiente de Destaque (CTAs):**
```css
bg-gradient-to-r from-secondary-400 to-secondary-600
```

**Gradiente de Sucesso (Notificações):**
```css
bg-gradient-to-r from-primary-500 to-primary-600
```

---

## 🎨 Exemplos de Uso

### Dashboard Header
```jsx
<header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
  {/* conteúdo */}
</header>
```

### Card de Métricas
```jsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-primary-300 transition-colors">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
      <Icon className="w-6 h-6 text-primary-600" />
    </div>
    <div>
      <p className="text-sm text-gray-600">Métrica</p>
      <p className="text-2xl font-bold text-gray-900">Valor</p>
    </div>
  </div>
</div>
```

### Botão de Ação Principal
```jsx
<button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/50">
  Confirmar
</button>
```

### Badge de Cashback
```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-100 text-secondary-800 text-sm font-semibold">
  <DollarSign className="w-4 h-4" />
  {percentage}% Cashback
</span>
```

### QR Code Container
```jsx
<div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl p-6">
  {/* QR Code */}
</div>
```

---

## 🎯 Estados de Interação

### Hover
```css
/* Botões */
hover:bg-primary-700
hover:shadow-lg
hover:scale-105

/* Cards */
hover:border-primary-300
hover:shadow-md

/* Links */
hover:text-primary-600
hover:underline
```

### Active/Pressed
```css
active:bg-primary-800
active:scale-95
```

### Focus
```css
focus:ring-2
focus:ring-primary-500
focus:ring-offset-2
focus:outline-none
```

### Disabled
```css
disabled:opacity-50
disabled:cursor-not-allowed
disabled:hover:scale-100
```

---

## 📊 Gráficos e Charts

### Cores para Recharts
```javascript
const CHART_COLORS = {
  primary: '#17A589',      // Verde principal
  secondary: '#FFA726',    // Laranja
  accent: '#607d8b',       // Cinza azulado
  success: '#48c9b0',      // Verde claro
  warning: '#ffb74d',      // Laranja claro
  danger: '#ef5350',       // Vermelho
  info: '#42a5f5',         // Azul
};
```

### Exemplo de uso:
```jsx
<LineChart data={data}>
  <Line 
    type="monotone" 
    dataKey="cashback" 
    stroke="#17A589" 
    strokeWidth={2}
  />
  <Line 
    type="monotone" 
    dataKey="resgates" 
    stroke="#FFA726" 
    strokeWidth={2}
  />
</LineChart>
```

---

## 🌐 PWA / Mobile

### Theme Color (manifest.json)
```json
{
  "theme_color": "#17A589",
  "background_color": "#FFFFFF"
}
```

### Meta Tags
```html
<meta name="theme-color" content="#17A589" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

---

## ✅ Acessibilidade

### Contraste de Textos

**Texto escuro em fundos claros:**
- primary-900 (#0b5345) em branco → ✅ WCAG AAA
- accent-800 (#37474f) em branco → ✅ WCAG AAA

**Texto claro em fundos escuros:**
- Branco em primary-600 (#138d75) → ✅ WCAG AA
- Branco em primary-700 (#117864) → ✅ WCAG AAA

**Ícones e elementos interativos:**
- Mínimo primary-500 para garantir contraste

---

## 🎨 Referência Visual

```
┌─────────────────────────────────────────┐
│  VERDE TURQUESA (#17A589)               │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │
│  • Cor principal da logo                │
│  • Botões primários                     │
│  • Headers e navegação                  │
│  • Links e elementos interativos        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  LARANJA (#FFA726)                      │
│  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒         │
│  • Cifrão da logo                       │
│  • Destaques de cashback                │
│  • CTAs secundários                     │
│  • Ícones de dinheiro                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  CINZA AZULADO (#607d8b)                │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
│  • Textos secundários                   │
│  • Borders e divisores                  │
│  • Elementos neutros                    │
│  • Placeholders                         │
└─────────────────────────────────────────┘
```

---

## 📝 Notas de Implementação

1. **Sempre use as classes Tailwind** ao invés de CSS customizado
2. **Mantenha consistência** usando sempre primary-* para ações principais
3. **Use secondary-* apenas para destaques** relacionados a dinheiro/cashback
4. **Evite misturar** muitas cores em um mesmo componente
5. **Siga a hierarquia visual:** primary > secondary > accent > gray

---

**📅 Última atualização:** 2025-10-26  
**🎨 Versão:** 1.0.0  
**✅ Status:** Implementado em produção
