import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { redirectToCheckout } from '../lib/stripe';
import toast from 'react-hot-toast';

const PRICE_FALLBACKS = {
  starter: 'price_1SluhgAev6mInEFVzGTKjPoV',
  business: 'price_1TEVzwAev6mInEFVFkqZkxRL',
  premium: 'price_1TEVzwAev6mInEFVfEh3ySHG',
};

const PLANS = [
  {
    id: 'starter',
    title: 'Pequenas Empresas',
    name: 'Starter',
    price: 97,
    color: 'emerald',
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER || PRICE_FALLBACKS.starter,
    benefits: ['Até 5.000 clientes', 'Até 10 funcionários', 'Cashback + portal do cliente', '14 dias grátis'],
  },
  {
    id: 'business',
    title: 'Empresas Médias',
    name: 'Business',
    price: 297,
    color: 'indigo',
    popular: true,
    priceId: import.meta.env.VITE_STRIPE_PRICE_BUSINESS || PRICE_FALLBACKS.business,
    benefits: ['Até 20.000 clientes', 'Até 30 funcionários', 'Integrações e relatórios avançados', 'Suporte prioritário'],
  },
  {
    id: 'premium',
    title: 'Empresas Grandes',
    name: 'Premium',
    price: 497,
    color: 'rose',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM || PRICE_FALLBACKS.premium,
    benefits: ['Clientes ilimitados', 'Funcionários ilimitados', 'Whitelabel + múltiplas unidades', 'Acompanhamento dedicado'],
  },
];

const COLOR_STYLES = {
  emerald: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 ring-emerald-500',
  indigo: 'from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 ring-indigo-500',
  rose: 'from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 ring-rose-500',
};

export default function SubscriptionPlans() {
  const { merchant } = useAuthStore();
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (plan) => {
    if (!merchant?.id || !merchant?.email) {
      toast.error('Erro ao identificar comerciante');
      return;
    }

    if (!plan.priceId) {
      toast.error('Plano sem preço configurado no Stripe');
      return;
    }

    setLoading(plan.id);

    try {
      const result = await redirectToCheckout(plan.priceId, merchant.id, merchant.email);
      if (!result?.success) {
        throw new Error(result?.error || 'Erro ao abrir checkout');
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
      setLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Assinatura LocalCashback</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escolha o plano de acordo com o tamanho da sua operacao e siga direto para a pagina de pagamento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isLoading = loading === plan.id;
            const color = COLOR_STYLES[plan.color] || COLOR_STYLES.emerald;

            return (
              <div key={plan.id} className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ring-4 ${color.split(' ').pop()} ${plan.popular ? 'scale-[1.01]' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-2 rounded-bl-lg text-xs font-bold">
                    Mais escolhido
                  </div>
                )}

                <div className="p-8">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">{plan.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">R$ {plan.price}</span>
                      <span className="text-gray-600 text-lg ml-2">/mes</span>
                    </div>
                    <p className="text-green-600 font-semibold mt-1">14 dias gratis</p>
                  </div>

                  <div className="space-y-3 mb-8 min-h-[132px]">
                    {plan.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r ${color.replace(/ ring-.+$/, '')} text-white shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Abrindo pagamento...
                      </>
                    ) : (
                      <>Ir para Pagamento</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
