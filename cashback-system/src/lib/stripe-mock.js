/**
 * Mock de @stripe/stripe-js para quando Stripe está desabilitado
 * Retorna null para não quebrar a aplicação
 */

console.warn('[Stripe-Mock] Importando mock de Stripe - Stripe desabilitado');

export async function loadStripe(publishableKey) {
  console.warn('[Stripe-Mock] loadStripe chamado com key:', publishableKey?.substring(0, 20) + '...');
  
  if (!publishableKey || publishableKey.length === 0 || !publishableKey.startsWith('pk_')) {
    console.warn('[Stripe-Mock] Chave inválida - retornando null');
    return null;
  }

  // Se tiver uma chave válida, tentar realmente carregar
  // Mas com timeout para não travar
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.error('[Stripe-Mock] Timeout ao carregar Stripe');
      resolve(null);
    }, 5000);

    try {
      // Tentar carregar dinamicamente
      import('@stripe/stripe-js').then(module => {
        clearTimeout(timeout);
        resolve(module.loadStripe(publishableKey));
      }).catch(error => {
        clearTimeout(timeout);
        console.error('[Stripe-Mock] Erro ao carregar Stripe:', error.message);
        resolve(null);
      });
    } catch (error) {
      clearTimeout(timeout);
      console.error('[Stripe-Mock] Erro durante import:', error.message);
      resolve(null);
    }
  });
}

export const Stripe = null;
