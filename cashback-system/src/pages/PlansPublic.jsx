import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { getLogo, getBrandName } from '../config/branding';

const PLANS = [
  {
    id: 'launch',
    label: 'Oferta de Lançamento',
    name: 'Plano Mensal',
    price: 97,
    color: 'purple',
    badge: 'Tudo incluso',
    popular: true,
    benefits: [
      'Clientes ilimitados',
      'Funcionários ilimitados',
      'Sistema completo de cashback',
      'Portal do cliente + QR Code',
      'Dashboard avançado + relatórios CAC/LTV',
      'Integrações e push notifications',
      'Whitelabel e domínio próprio',
      'Múltiplas lojas/unidades',
      'Suporte prioritário',
      '14 dias grátis',
    ],
  },
];

const COLOR_STYLES = {
  purple: {
    ring: 'ring-purple-500',
    gradient: 'from-purple-600 to-violet-600',
    gradientHover: 'hover:from-purple-700 hover:to-violet-700',
    badge: 'bg-purple-600',
    benefitIcon: 'text-purple-500',
  },
};

export default function PlansPublic() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = new URLSearchParams(location.search).get('email') || '';

  const handleGoToCheckout = (plan) => {
    const params = new URLSearchParams();
    if (prefilledEmail) {
      params.set('email', prefilledEmail);
    }

    const queryString = params.toString();
    navigate(`/stripe-checkout/${plan.id}${queryString ? `?${queryString}` : ''}`);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Um único plano, tudo liberado</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sem pegadinhas nem limites escondidos. Comece a usar agora e veja os resultados no seu caixa antes de pagar qualquer mensalidade.
          </p>
        </div>

        <div className="grid grid-cols-1 max-w-md mx-auto gap-6 items-stretch">
          {PLANS.map((plan) => {
            const style = COLOR_STYLES[plan.color] || COLOR_STYLES.purple;

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
                    onClick={() => handleGoToCheckout(plan)}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-base bg-gradient-to-r ${style.gradient} ${style.gradientHover} text-white shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}
                  >
                    Iniciar Avaliação Gratuita
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    Acesso imediato às ferramentas. Você só será cobrado após o período de 14 dias de teste.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
