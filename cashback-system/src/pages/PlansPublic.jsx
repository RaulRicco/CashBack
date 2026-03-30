import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { getLogo, getBrandName } from '../config/branding';
import { supabase } from '../lib/supabase';
import { fetchMerchantByEmail } from '../services/authService';
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
    label: 'Pequenas Empresas',
    name: 'Starter',
    price: 97,
    color: 'emerald',
    badge: 'Entrada',
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER || PRICE_FALLBACKS.starter,
    benefits: [
      'Até 5.000 clientes',
      'Até 10 funcionários',
      'Sistema completo de cashback',
      'Portal do cliente + QR Code',
      'Dashboard operacional',
      '14 dias grátis',
    ],
  },
  {
    id: 'business',
    label: 'Empresas Médias',
    name: 'Business',
    price: 297,
    color: 'indigo',
    badge: 'Mais escolhido',
    popular: true,
    priceId: import.meta.env.VITE_STRIPE_PRICE_BUSINESS || PRICE_FALLBACKS.business,
    benefits: [
      'Até 20.000 clientes',
      'Até 30 funcionários',
      'Tudo do Starter + relatórios avançados',
      'Integrações e automações',
      'Push notifications e campanhas',
      'Suporte prioritário',
    ],
  },
  {
    id: 'premium',
    label: 'Empresas Grandes',
    name: 'Premium',
    price: 497,
    color: 'rose',
    badge: 'Escala',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM || PRICE_FALLBACKS.premium,
    benefits: [
      'Clientes ilimitados',
      'Funcionários ilimitados',
      'Múltiplas unidades/lojas',
      'Whitelabel completo',
      'Domínio próprio e recursos enterprise',
      'Gestão dedicada de sucesso',
    ],
  },
];

const COLOR_STYLES = {
  emerald: {
    ring: 'ring-emerald-500',
    gradient: 'from-emerald-600 to-teal-600',
    gradientHover: 'hover:from-emerald-700 hover:to-teal-700',
    badge: 'bg-emerald-600',
    benefitIcon: 'text-emerald-500',
  },
  indigo: {
    ring: 'ring-indigo-500',
    gradient: 'from-indigo-600 to-violet-600',
    gradientHover: 'hover:from-indigo-700 hover:to-violet-700',
    badge: 'bg-indigo-600',
    benefitIcon: 'text-indigo-500',
  },
  rose: {
    ring: 'ring-rose-500',
    gradient: 'from-rose-600 to-pink-600',
    gradientHover: 'hover:from-rose-700 hover:to-pink-700',
    badge: 'bg-rose-600',
    benefitIcon: 'text-rose-500',
  },
};

export default function PlansPublic() {
  const navigate = useNavigate();
  const location = useLocation();
  const signupMerchant = location.state?.merchant || null;
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [merchant, setMerchant] = useState(signupMerchant);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: merchants } = await fetchMerchantByEmail(session.user.email);
        if (merchants && merchants.length > 0) {
          setMerchant(merchants[0]);
        }
      }

      setCheckingAuth(false);
    };

    checkSession();
  }, []);

  const handleSubscribe = async (plan) => {
    if (!merchant) {
      navigate('/signup');
      return;
    }

    if (!plan?.priceId) {
      toast.error('Plano indisponível no momento. Verifique a configuração Stripe.');
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      await redirectToCheckout(plan.priceId, merchant.id, merchant.email);
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={getLogo('icon')} alt={getBrandName()} className="w-10 h-10 object-contain" />
            <span className="font-bold text-gray-900 text-lg">{getBrandName()}</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ja tenho uma conta
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
            14 dias GRATIS — Sem cartao de credito
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Escolha o plano ideal para seu negocio</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Temos opcoes para empresas pequenas, medias e grandes. Ao escolher o plano, voce segue direto para a pagina de pagamento do Stripe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const style = COLOR_STYLES[plan.color] || COLOR_STYLES.emerald;
            const isLoading = loadingPlanId === plan.id;
            const buttonLabel = merchant ? `Ir para pagamento (${plan.name})` : 'Criar conta e continuar';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden ring-4 ${style.ring} ${plan.popular ? 'scale-[1.01]' : ''}`}
              >
                <div className={`absolute top-0 right-0 ${style.badge} text-white px-6 py-2 rounded-bl-xl text-sm font-bold`}>
                  {plan.badge}
                </div>

                <div className="p-8 h-full flex flex-col">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">{plan.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">R$ {plan.price}</span>
                      <span className="text-gray-500 text-lg ml-2">/mes</span>
                    </div>
                    <p className="text-green-600 font-semibold mt-1">14 dias gratis no inicio</p>
                  </div>

                  <div className="space-y-3 mb-8 flex-1">
                    {plan.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className={`w-5 h-5 ${style.benefitIcon} flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading || checkingAuth}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-base bg-gradient-to-r ${style.gradient} ${style.gradientHover} text-white shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {isLoading || checkingAuth ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {checkingAuth ? 'Verificando...' : 'Abrindo pagamento...'}
                      </>
                    ) : (
                      buttonLabel
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-3">Checkout Stripe seguro • Cancele quando quiser</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
