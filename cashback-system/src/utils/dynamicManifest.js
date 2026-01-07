/**
 * 🎯 DYNAMIC PWA MANIFEST GENERATOR
 * 
 * Gera manifest.json personalizado para cada estabelecimento
 * Permite que o cliente salve o app na tela inicial com:
 * - Logo do estabelecimento
 * - Nome do estabelecimento
 * - Cores personalizadas
 */

import { supabase } from '../lib/supabase';

/**
 * Valida e retorna URL de logo ou fallback
 */
function getValidLogoUrl(logoUrl) {
  // Se não tiver logo_url, usar fallback
  if (!logoUrl) {
    return '/logo-192x192.png';
  }
  
  // Se for uma URL válida (http/https)
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }
  
  // Se for um caminho relativo válido (começa com /)
  if (logoUrl.startsWith('/')) {
    return logoUrl;
  }
  
  // Se for apenas um nome/texto inválido, usar fallback
  console.warn(`Invalid logo URL: "${logoUrl}", using fallback`);
  return '/logo-192x192.png';
}

/**
 * Gera manifest.json dinâmico baseado no merchant_id
 * @param {string} merchantId - ID do estabelecimento
 * @returns {Promise<Object>} - Objeto manifest.json
 */
export async function generateDynamicManifest(merchantId) {
  try {
    // Buscar dados do estabelecimento no Supabase
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('business_name, logo_url, primary_color, cashback_percentage')
      .eq('id', merchantId)
      .single();

    if (error || !merchant) {
      console.error('Merchant not found:', error);
      return getDefaultManifest();
    }

    // Validar logo URL
    const validLogoUrl = getValidLogoUrl(merchant.logo_url);

    // Gerar manifest personalizado
    return {
      name: merchant.business_name || 'Meu Cashback',
      short_name: merchant.business_name?.substring(0, 12) || 'Cashback',
      description: `Programa de fidelidade - ${merchant.business_name}. Ganhe ${merchant.cashback_percentage}% de cashback!`,
      start_url: `/customer/${merchantId}`,
      display: 'standalone',
      background_color: '#FFFFFF',
      theme_color: merchant.primary_color || '#17A589',
      orientation: 'portrait-primary',
      scope: '/',
      
      icons: [
        {
          src: validLogoUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: validLogoUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      
      categories: ['business', 'finance', 'shopping'],
      
      shortcuts: [
        {
          name: 'Meu Cashback',
          short_name: 'Cashback',
          description: 'Ver saldo de cashback',
          url: `/customer/${merchantId}/cashback`,
          icons: [{ 
            src: validLogoUrl, 
            sizes: '96x96' 
          }]
        },
        {
          name: 'Resgatar',
          short_name: 'Resgatar',
          description: 'Resgatar cashback',
          url: `/customer/${merchantId}/redemption`,
          icons: [{ 
            src: validLogoUrl, 
            sizes: '96x96' 
          }]
        }
      ],
      
      // Metadata adicional
      merchant_id: merchantId,
      generated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error generating manifest:', error);
    return getDefaultManifest();
  }
}

/**
 * Retorna manifest padrão (fallback)
 */
function getDefaultManifest() {
  return {
    name: 'Local CashBack',
    short_name: 'LocalCash',
    description: 'Sistema de cashback para comércio local',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#17A589',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logo-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    categories: ['business', 'finance', 'shopping']
  };
}

/**
 * Injeta manifest dinâmico no HTML
 * @param {string} merchantId - ID do estabelecimento
 */
export async function injectDynamicManifest(merchantId) {
  if (!merchantId) return;
  
  try {
    const manifest = await generateDynamicManifest(merchantId);
    
    // Criar blob URL para o manifest
    const manifestBlob = new Blob(
      [JSON.stringify(manifest, null, 2)], 
      { type: 'application/json' }
    );
    const manifestURL = URL.createObjectURL(manifestBlob);
    
    // Remover manifest antigo se existir
    const oldLink = document.querySelector('link[rel="manifest"]');
    if (oldLink) {
      oldLink.remove();
    }
    
    // Adicionar novo manifest
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestURL;
    document.head.appendChild(manifestLink);
    
    // Atualizar theme-color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = manifest.theme_color;
    
    // Atualizar apple-mobile-web-app-title
    let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitleMeta) {
      appleTitleMeta = document.createElement('meta');
      appleTitleMeta.name = 'apple-mobile-web-app-title';
      document.head.appendChild(appleTitleMeta);
    }
    appleTitleMeta.content = manifest.short_name;
    
    console.log('✅ Dynamic manifest injected for merchant:', merchantId);
    
  } catch (error) {
    console.error('❌ Error injecting dynamic manifest:', error);
  }
}

/**
 * Detecta merchant_id da URL
 * Suporta formatos:
 * - /customer/:merchantId
 * - /cadastro/:merchantId
 * - /?merchant=:merchantId
 */
export function detectMerchantId() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  
  // Via URL path
  const pathMatch = path.match(/\/(customer|cadastro)\/([a-f0-9-]+)/i);
  if (pathMatch) {
    return pathMatch[2];
  }
  
  // Via query param
  const merchantParam = params.get('merchant') || params.get('m');
  if (merchantParam) {
    return merchantParam;
  }
  
  // Via localStorage (sessão ativa)
  const storedMerchantId = localStorage.getItem('current_merchant_id');
  if (storedMerchantId) {
    return storedMerchantId;
  }
  
  return null;
}

/**
 * Inicializa manifest dinâmico automaticamente
 */
export function initDynamicManifest() {
  const merchantId = detectMerchantId();
  
  if (merchantId) {
    console.log('🎯 Detected merchant ID:', merchantId);
    injectDynamicManifest(merchantId);
    
    // Salvar em localStorage para próximas visitas
    localStorage.setItem('current_merchant_id', merchantId);
  } else {
    console.log('ℹ️ No merchant ID detected, using default manifest');
  }
}
