/**
 * Stripe Module - Inicialização segura
 * Se chave não configurada, tudo retorna null
 */

let stripeInstance = null;
let loadingAttempted = false;
const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripeDisabled = !key || key.length === 0 || !key.startsWith('pk_');

console.log('[Stripe] Status:', stripeDisabled ? '❌ DESABILITADO' : '✓ Ativo');

/**
 * Obter instância do Stripe (lazy loading)
 */
export async function getStripePromise() {
  // Se está desabilitado, sempre retornar null
  if (stripeDisabled) {
    if (!loadingAttempted) {
      console.warn('[Stripe] Biblioteca não será carregada - chave não configurada');
      loadingAttempted = true;
    }
    return null;
  }

  // Se já tentamos e falhou, não tentar de novo
  if (loadingAttempted && stripeInstance === null) {
    return null;
  }

  // Se já carregou, retornar instância
  if (stripeInstance !== null) {
    return stripeInstance;
  }

  loadingAttempted = true;

  try {
    // Importar versão "pure" para permitir setLoadParameters antes do loadStripe.
    const { loadStripe } = await import('@stripe/stripe-js/pure').catch(error => {
      console.error('[Stripe] Erro ao importar @stripe/stripe-js/pure:', error.message);
      return { loadStripe: null };
    });

    if (!loadStripe) {
      console.error('[Stripe] loadStripe não encontrado');
      return null;
    }

    // Desativa sinais antifraude avançados para evitar chamadas para m.stripe.com
    // em redes que não resolvem esse host.
    if (typeof loadStripe.setLoadParameters === 'function') {
      loadStripe.setLoadParameters({ advancedFraudSignals: false });
    }

    console.log('[Stripe] Carregando biblioteca...');
    stripeInstance = await loadStripe(key);

    if (stripeInstance) {
      console.log('[Stripe] ✓ Carregada com sucesso');
    } else {
      console.warn('[Stripe] loadStripe retornou null');
    }

    return stripeInstance;
  } catch (error) {
    console.error('[Stripe] Erro durante inicialização:', error.message);
    stripeInstance = null;
    return null;
  }
}

/**
 * Para compatibilidade com código antigo que espera uma promise
 */
export const stripePromise = (async () => {
  return await getStripePromise();
})();

// Definição dos planos — apenas o Plano Lançamento, com tudo liberado
export const SUBSCRIPTION_PLANS = {
  launch: {
    id: 'launch',
    name: 'Plano Mensal',
    price: 97,
    priceId: 'price_1Slw77Aev6mInEFVI6INDD3B', // TEST mode
    description: 'Plano completo com todos os recursos',
    customerLimit: null, // Ilimitado
    employeeLimit: null, // Ilimitado
    features: {
      dashboard_basic: true,
      cashback_system: true,
      customer_portal: true,
      qr_code: true,
      email_support: true,
      dashboard_cac_ltv: true,
      integrations: true,
      push_notifications: true,
      advanced_reports: true,
      whitelabel: true,
      custom_domain: true,
      multiple_stores: true,
      whatsapp_support: true,
      dedicated_manager: true,
    },
    benefits: [
      '🎉 Oferta de Lançamento',
      '✅ Clientes ilimitados',
      '✅ Funcionários ilimitados',
      '✅ Sistema de Cashback completo',
      '✅ Portal do Cliente',
      '✅ QR Code para Resgate',
      '✅ Dashboard Avançado',
      '✅ Relatórios CAC/LTV',
      '✅ Integrações (Mailchimp, RD Station)',
      '✅ Push Notifications',
      '✅ Domínio Próprio',
      '✅ Whitelabel (sua marca)',
      '✅ Múltiplas lojas/unidades',
      '✅ Suporte WhatsApp prioritário',
      '🎁 14 dias de teste GRÁTIS',
    ],
  },
};

/**
 * Criar Checkout Session do Stripe
 */
export async function createCheckoutSession(priceId, merchantId, merchantEmail) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        merchantId,
        merchantEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar sessão de pagamento');
    }

    return { success: true, sessionId: data.sessionId, url: data.url };
  } catch (error) {
    console.error('Erro ao criar checkout session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Redirecionar para Checkout do Stripe
 */
export async function redirectToCheckout(priceId, merchantId, merchantEmail) {
  try {
    // Criar sessão de checkout
    const result = await createCheckoutSession(priceId, merchantId, merchantEmail);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Redirecionar diretamente para a URL do checkout (método moderno)
    if (result.url) {
      window.location.href = result.url;
      return { success: true };
    } else {
      throw new Error('URL do checkout não encontrada');
    }
  } catch (error) {
    console.error('Erro ao redirecionar para checkout:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar se merchant pode adicionar mais clientes
 * Plano único "lançamento" — sempre liberado (sem limites)
 */
export function canAddCustomer() {
  return true;
}

/**
 * Verificar se merchant pode adicionar mais funcionários
 * Plano único "lançamento" — sempre liberado (sem limites)
 */
export function canAddEmployee() {
  return true;
}

/**
 * Verificar se feature está habilitada no plano
 * Plano único "lançamento" — todas as features liberadas
 */
export function hasFeature() {
  return true;
}

/**
 * Não há upgrade — plano único
 */
export function getUpgradePlan() {
  return null;
}

/**
 * Criar Customer Portal Session (para gerenciar assinatura)
 */
export async function createPortalSession(merchantId) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/stripe/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar portal session');
    }

    // Redirecionar para portal
    window.location.href = data.url;

    return { success: true };
  } catch (error) {
    console.error('Erro ao criar portal session:', error);
    return { success: false, error: error.message };
  }
}
