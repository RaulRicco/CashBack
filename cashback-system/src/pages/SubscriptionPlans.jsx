import { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { redirectToCheckout, SUBSCRIPTION_PLANS } from '../lib/stripe';
import toast from 'react-hot-toast';

export default function SubscriptionPlans() {
  const { merchant } = useAuthStore();
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (plan) => {
    if (!merchant?.id || !merchant?.email) {
      toast.error('Erro ao identificar comerciante');
      return;
    }

    setLoading(plan.id);
    
    try {
      await redirectToCheckout(
        plan.priceId,
        merchant.id,
        merchant.email
      );
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
      setLoading(null);
    }
  };

  const plans = [
    {
      ...SUBSCRIPTION_PLANS.starter,
      icon: Zap,
      color: 'blue',
      popular: false,
    },
    {
      ...SUBSCRIPTION_PLANS.business,
      icon: Sparkles,
      color: 'purple',
      popular: true,
    },
    {
      ...SUBSCRIPTION_PLANS.premium,
      icon: Crown,
      color: 'amber',
      popular: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano ideal para o seu negócio e comece a crescer hoje mesmo
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loading === plan.id;

            return (
              <div
                key={plan.id}
                className={`
                  relative bg-white rounded-2xl shadow-lg overflow-hidden
                  ${plan.popular ? 'ring-4 ring-purple-500 scale-105' : 'hover:shadow-xl'}
                  transition-all duration-300
                `}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                    MAIS POPULAR
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-${plan.color}-100 mb-4`}>
                    <Icon className={`w-8 h-8 text-${plan.color}-600`} />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">
                        R$ {plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">/mês</span>
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center text-sm">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-gray-900">
                        {plan.customerLimit ? `Até ${plan.customerLimit.toLocaleString('pt-BR')} clientes` : 'Clientes ilimitados'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-gray-900">
                        {plan.employeeLimit ? `Até ${plan.employeeLimit} funcionário${plan.employeeLimit > 1 ? 's' : ''}` : 'Funcionários ilimitados'}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading}
                    className={`
                      w-full py-4 px-6 rounded-xl font-semibold text-lg
                      transition-all duration-200
                      ${plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center
                    `}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Assinar Agora'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              Cancele quando quiser
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              Pagamento seguro com Stripe
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              Suporte em português
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso mudar de plano depois?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                As mudanças são aplicadas imediatamente.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Como funciona o pagamento?
              </h3>
              <p className="text-gray-600">
                O pagamento é processado mensalmente de forma automática através do Stripe,
                uma das plataformas de pagamento mais seguras do mundo.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                O que acontece se eu cancelar?
              </h3>
              <p className="text-gray-600">
                Você pode cancelar a qualquer momento. Seu plano continuará ativo até o
                final do período já pago, depois voltará para o plano Starter gratuito.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
