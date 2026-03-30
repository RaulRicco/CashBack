/**
 * Script de diagnóstico para Stripe
 * Cole isso no DevTools Console (F12) para debugar
 */

console.log('🔍 === DIAGNÓSTICO STRIPE ===');

// 1. Verificar localStorage e sessionStorage
console.log('📦 LocalStorage keys:', Object.keys(localStorage));
console.log('📦 SessionStorage keys:', Object.keys(sessionStorage));

// 2. Verificar variáveis de ambiente
try {
  const url = new URL(window.location.href);
  console.log('🌐 URL atual:', url.href);
  console.log('📍 Hostname:', url.hostname);
  console.log('🔒 Protocolo:', url.protocol);
} catch (e) {
  console.error('Erro ao obter URL:', e);
}

// 3. Verificar se Stripe foi carregado
console.log('🔗 Verificando se Stripe foi carregado globalmente...');
if (window.Stripe) {
  console.log('✓ Stripe está em window.Stripe');
} else {
  console.log('✗ Stripe NÃO está em window.Stripe');
}

// 4. Listar todos os scripts carregados
console.log('📋 Scripts carregados:');
const scripts = document.querySelectorAll('script[src]');
scripts.forEach((script, i) => {
  console.log(`  ${i + 1}. ${script.src.substring(0, 100)}...`);
});

// 5. Monitorar requisições de rede (necessário reabrir DevTools)
console.log('🔍 Monitorando requisições de rede para m.stripe.com...');
const originalFetch = window.fetch;
let stripeRequests = 0;

window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('stripe')) {
    stripeRequests++;
    console.warn(`⚠️ REQUISIÇÃO STRIPE #${stripeRequests}:`, url);
  }
  return originalFetch.apply(this, args);
};

console.log('✓ Monitor ativado. Verifique console para requisições Stripe.');

// 6. Verificar seção de Network
console.log('💡 DICA: Abra DevTools > Network tab > Procure por "m.stripe.com"');
console.log('💡 DICA: Se aparecer lá, clique nela e verifique "Initiator" para saber qual JS a chamou');
