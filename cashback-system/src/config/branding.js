/**
 * 🎨 WHITE LABEL CONFIGURATION
 * 
 * Este arquivo centraliza TODA a identidade visual do sistema.
 * Para personalizar para um novo cliente, edite apenas este arquivo!
 * 
 * INSTRUÇÕES:
 * 1. Altere os valores abaixo com a marca do cliente
 * 2. Coloque as logos do cliente em /public/
 * 3. Rebuild o projeto (npm run build)
 * 4. Deploy!
 */

export const BRAND_CONFIG = {
  // ==========================================
  // IDENTIDADE DA MARCA
  // ==========================================
  
  /**
   * Nome da marca (aparece em todos os lugares)
   */
  name: 'Local CashBack',
  
  /**
   * Nome curto (usado em espaços limitados)
   */
  shortName: 'LocalCash',
  
  /**
   * Tagline / Slogan
   */
  tagline: 'Gerencie seu programa de cashback',
  
  /**
   * Descrição completa (SEO)
   */
  description: 'Sistema de cashback para fortalecer o comércio local. Ganhe recompensas comprando perto de você!',
  
  // ==========================================
  // LOGOS E IMAGENS
  // ==========================================
  
  /**
   * Logo principal (PNG ou SVG)
   * Caminho relativo a /public/
   */
  logo: {
    main: '/logo-light.png',        // Logo completa com texto (fundo claro)
    icon: '/logo-icon.png',         // Apenas ícone circular (para favicons)
    light: '/logo-light.png',       // Versão clara (fundos claros)
    dark: '/logo-dark.png',         // Versão escura (fundos escuros)
  },
  
  /**
   * Dimensões da logo em diferentes contextos
   */
  logoSizes: {
    sidebar: 'h-10',                // Sidebar desktop (logo horizontal)
    mobileHeader: 'h-8',            // Header mobile (logo horizontal)
    login: 'h-24',                  // Página de login (logo horizontal)
    customerSignup: 'h-20',         // Cadastro de cliente (logo horizontal)
    favicon: 'w-8 h-8',             // Favicon (icon apenas)
  },
  
  // ==========================================
  // CORES (Tailwind classes)
  // ==========================================
  
  /**
   * Cores principais do sistema
   * Use as classes Tailwind configuradas
   */
  colors: {
    primary: {
      // Cor principal (botões, links, elementos primários)
      base: 'primary-500',
      light: 'primary-100',
      dark: 'primary-700',
      text: 'primary-600',
      hover: 'primary-700',
      
      // Gradientes
      gradient: 'from-primary-600 to-primary-700',
      gradientHover: 'from-primary-700 to-primary-800',
    },
    
    secondary: {
      // Cor secundária (destaques, cashback)
      base: 'secondary-400',
      light: 'secondary-100',
      dark: 'secondary-700',
      text: 'secondary-600',
      
      // Para badges de cashback
      badge: 'bg-secondary-100 text-secondary-800',
    },
    
    accent: {
      // Cor de apoio (elementos neutros)
      base: 'accent-500',
      light: 'accent-100',
      dark: 'accent-700',
    },
    
    // Cores para estados
    success: 'green-500',
    warning: 'yellow-500',
    error: 'red-500',
    info: 'blue-500',
  },
  
  /**
   * Códigos HEX das cores (para meta tags, manifest, etc)
   */
  colorHex: {
    primary: '#17A589',      // Verde turquesa
    secondary: '#FFA726',    // Laranja
    accent: '#607d8b',       // Cinza azulado
    background: '#FFFFFF',   // Branco
  },
  
  // ==========================================
  // ESTILOS DE COMPONENTES
  // ==========================================
  
  /**
   * Classes CSS para botões
   */
  buttons: {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/50',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
    ghost: 'text-primary-600 hover:bg-primary-50',
  },
  
  /**
   * Classes CSS para cards
   */
  cards: {
    default: 'bg-white border border-gray-200 hover:border-primary-300 shadow-sm',
    highlighted: 'bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200',
    cashback: 'bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200',
  },
  
  /**
   * Classes CSS para inputs
   */
  inputs: {
    default: 'border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    error: 'border border-red-300 focus:ring-2 focus:ring-red-500',
    success: 'border border-primary-300 focus:ring-2 focus:ring-primary-500',
  },
  
  /**
   * Classes CSS para badges
   */
  badges: {
    success: 'bg-primary-100 text-primary-800',
    warning: 'bg-secondary-100 text-secondary-800',
    info: 'bg-accent-100 text-accent-800',
    error: 'bg-red-100 text-red-800',
  },
  
  /**
   * Gradientes de fundo
   */
  backgrounds: {
    hero: 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900',
    light: 'bg-gradient-to-br from-primary-50 to-primary-100',
    page: 'bg-gray-50',
  },
  
  // ==========================================
  // PWA (Progressive Web App)
  // ==========================================
  
  pwa: {
    name: 'Local CashBack',
    shortName: 'LocalCash',
    description: 'Sistema de cashback para comércio local',
    themeColor: '#17A589',
    backgroundColor: '#FFFFFF',
    display: 'standalone',
    orientation: 'portrait-primary',
  },
  
  // ==========================================
  // SEO E META TAGS
  // ==========================================
  
  seo: {
    title: 'Local CashBack - Cashback do Comércio Local',
    titleTemplate: '%s | Local CashBack',
    description: 'Sistema de cashback para fortalecer o comércio local. Ganhe recompensas comprando perto de você!',
    keywords: 'cashback, comércio local, recompensas, fidelidade, programa de pontos',
    author: 'Local CashBack',
    
    // Open Graph (Facebook, WhatsApp)
    og: {
      type: 'website',
      siteName: 'Local CashBack',
      title: 'Local CashBack - Cashback Local',
      description: 'Ganhe cashback comprando no comércio local',
      image: '/logo-localcashback.png',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@localcashback',
      creator: '@localcashback',
    },
  },
  
  // ==========================================
  // TEXTOS E MENSAGENS
  // ==========================================
  
  messages: {
    welcome: 'Bem-vindo ao Local CashBack!',
    loginTitle: 'Entre na sua conta',
    loginSubtitle: 'Faça login para continuar',
    signupTitle: 'Cadastre-se',
    signupSubtitle: 'Comece a ganhar cashback hoje!',
    
    // Customer signup
    customerSignup: {
      title: 'Cadastre-se',
      subtitle: 'Comece a ganhar {percentage}% de cashback',
      poweredBy: 'Powered by',
    },
    
    // Dashboard
    dashboard: {
      welcome: 'Bem-vindo de volta!',
      noData: 'Nenhum dado disponível',
    },
    
    // Erros
    errors: {
      generic: 'Algo deu errado. Tente novamente.',
      network: 'Erro de conexão. Verifique sua internet.',
      unauthorized: 'Você não tem permissão para acessar.',
    },
    
    // Sucesso
    success: {
      saved: 'Salvo com sucesso!',
      updated: 'Atualizado com sucesso!',
      deleted: 'Removido com sucesso!',
    },
  },
  
  // ==========================================
  // LINKS E REDES SOCIAIS
  // ==========================================
  
  social: {
    website: 'https://localcashback.com.br',
    support: 'https://suporte.localcashback.com.br',
    privacy: 'https://localcashback.com.br/privacidade',
    terms: 'https://localcashback.com.br/termos',
    
    // Redes sociais (opcional)
    instagram: 'https://instagram.com/localcashback',
    facebook: 'https://facebook.com/localcashback',
    twitter: 'https://twitter.com/localcashback',
    linkedin: 'https://linkedin.com/company/localcashback',
  },
  
  // ==========================================
  // FUNCIONALIDADES
  // ==========================================
  
  features: {
    // Mostrar "Powered by [marca]" nas páginas públicas
    showPoweredBy: true,
    
    // Permitir merchant personalizar cores (futuro)
    allowMerchantBranding: false,
    
    // Mostrar logo na página de cadastro de cliente
    showLogoOnCustomerSignup: true,
    
    // Modo de demonstração
    demoMode: false,
  },
  
  // ==========================================
  // CONTATO E SUPORTE
  // ==========================================
  
  contact: {
    email: 'contato@localcashback.com.br',
    phone: '+55 (11) 99999-9999',
    whatsapp: '+5511999999999',
    address: 'São Paulo, Brasil',
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Retorna a URL completa da logo
 */
export const getLogo = (type = 'main') => {
  return BRAND_CONFIG.logo[type] || BRAND_CONFIG.logo.main;
};

/**
 * Retorna o nome da marca
 */
export const getBrandName = (short = false) => {
  return short ? BRAND_CONFIG.shortName : BRAND_CONFIG.name;
};

/**
 * Retorna a classe CSS de cor
 */
export const getColor = (type = 'primary', variant = 'base') => {
  return BRAND_CONFIG.colors[type]?.[variant] || BRAND_CONFIG.colors.primary.base;
};

/**
 * Retorna o código HEX de uma cor
 */
export const getColorHex = (type = 'primary') => {
  return BRAND_CONFIG.colorHex[type] || BRAND_CONFIG.colorHex.primary;
};

/**
 * Retorna a classe CSS de um botão
 */
export const getButtonClass = (type = 'primary') => {
  return BRAND_CONFIG.buttons[type] || BRAND_CONFIG.buttons.primary;
};

/**
 * Retorna a classe CSS de um card
 */
export const getCardClass = (type = 'default') => {
  return BRAND_CONFIG.cards[type] || BRAND_CONFIG.cards.default;
};

/**
 * Retorna a classe CSS de um input
 */
export const getInputClass = (type = 'default') => {
  return BRAND_CONFIG.inputs[type] || BRAND_CONFIG.inputs.default;
};

/**
 * Retorna a classe CSS de um badge
 */
export const getBadgeClass = (type = 'success') => {
  return BRAND_CONFIG.badges[type] || BRAND_CONFIG.badges.success;
};

/**
 * Retorna uma mensagem do sistema
 */
export const getMessage = (path) => {
  const parts = path.split('.');
  let value = BRAND_CONFIG.messages;
  
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) return '';
  }
  
  return value || '';
};

// Export como padrão também
export default BRAND_CONFIG;
