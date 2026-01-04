import { loadStripe } from '@stripe/stripe-js';

// Inicializar Stripe com a chave pública
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Definição dos planos
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
      '✅ Clientes ILIMITADOS',
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
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 147,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER,
    description: 'Para quem está começando',
    customerLimit: 2000,
    employeeLimit: 1,
    features: {
      dashboard_basic: true,
      cashback_system: true,
      customer_portal: true,
      qr_code: true,
      email_support: true,
      // Features desabilitadas
      dashboard_cac_ltv: false,
      integrations: false,
      push_notifications: false,
      advanced_reports: false,
      whitelabel: false,
      custom_domain: false,
      multiple_stores: false,
      whatsapp_support: false,
      dedicated_manager: false,
    },
    benefits: [
      'Até 2.000 clientes',
      'Sistema de Cashback',
      'Portal do Cliente',
      'QR Code Resgate',
      'Dashboard Básico',
      '1 funcionário',
      'Suporte por email',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 297,
    priceId: import.meta.env.VITE_STRIPE_PRICE_BUSINESS,
    description: 'Para crescer rápido',
    popular: true,
    customerLimit: 10000,
    employeeLimit: 5,
    features: {
      // Todas do Starter
      dashboard_basic: true,
      cashback_system: true,
      customer_portal: true,
      qr_code: true,
      email_support: true,
      // Features Business
      dashboard_cac_ltv: true,
      integrations: true,
      push_notifications: true,
      advanced_reports: true,
      whitelabel: true,
      custom_domain: true,
      whatsapp_support: true,
      // Features desabilitadas
      multiple_stores: false,
      dedicated_manager: false,
    },
    benefits: [
      'Tudo do Starter +',
      'Até 10.000 clientes',
      'Dashboard CAC/LTV',
      'Integrações (Mailchimp, RD)',
      'Push Notifications',
      'Domínio Próprio',
      'Até 5 funcionários',
      'Whitelabel (sua marca)',
      'Suporte WhatsApp prioritário',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 497,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM,
    description: 'Para dominar o mercado',
    customerLimit: null, // Ilimitado
    employeeLimit: null, // Ilimitado
    features: {
      // Todas do Business
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
      whatsapp_support: true,
      // Features Premium
      multiple_stores: true,
      dedicated_manager: true,
    },
    benefits: [
      'Tudo do Business +',
      'Clientes ILIMITADOS',
      'Funcionários ilimitados',
      'Múltiplas lojas/unidades',
      'Atendimento VIP',
      'Integrações personalizadas',
      'Suporte prioritário 24/7',
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
 */
export function canAddCustomer(currentCount, plan) {
  const planConfig = SUBSCRIPTION_PLANS[plan];
  if (!planConfig) return false;
  
  // Se limite é null, é ilimitado
  if (planConfig.customerLimit === null) return true;
  
  return currentCount < planConfig.customerLimit;
}

/**
 * Verificar se merchant pode adicionar mais funcionários
 */
export function canAddEmployee(currentCount, plan) {
  const planConfig = SUBSCRIPTION_PLANS[plan];
  if (!planConfig) return false;
  
  // Se limite é null, é ilimitado
  if (planConfig.employeeLimit === null) return true;
  
  return currentCount < planConfig.employeeLimit;
}

/**
 * Verificar se feature está habilitada no plano
 */
export function hasFeature(plan, featureName) {
  const planConfig = SUBSCRIPTION_PLANS[plan];
  if (!planConfig) return false;
  
  return planConfig.features[featureName] === true;
}

/**
 * Obter próximo plano recomendado para upgrade
 */
export function getUpgradePlan(currentPlan) {
  if (currentPlan === 'starter') return 'business';
  if (currentPlan === 'business') return 'premium';
  return null; // Já está no máximo
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
