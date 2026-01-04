import { useState } from 'react';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { redirectToCheckout } from '../lib/stripe';
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

  // Plano único
  const plan = {
    id: 'launch',
    name: 'Plano Mensal',
    price: 97,
    priceId: 'price_1Slw77Aev6mInEFVI6INDD3B', // TEST mode
    description: 'Plano completo com todos os recursos',
    icon: Sparkles,
    color: 'purple',
    popular: true,
    customerLimit: 5000, // Limite de 5 mil clientes
    employeeLimit: 10, // Limite de 10 funcionários
    benefits: [
      '🎉 Oferta de Lançamento',
      '✅ Até 5.000 clientes',
      '✅ Até 10 funcionários',
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
      '💬 Renegociação após 5.000 clientes',
    ],
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Assinatura LocalCashback
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plano único com <strong>14 dias GRÁTIS</strong> e todos os recursos incluídos
          </p>
        </div>

        {/* Single Plan Card - Centered */}
        <div className="max-w-lg mx-auto">
          {(() => {
            const Icon = plan.icon;
            const isLoading = loading === plan.id;

            return (
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden ring-4 ring-purple-500">
                {/* Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-bl-lg text-base font-bold">
                  Plano Único
                </div>

                <div className="p-10">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-6`}>
                    <Icon className="w-12 h-12 text-purple-600" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        R$ {plan.price}
                      </span>
                      <span className="text-gray-600 text-xl ml-3">/mês</span>
                    </div>
                    <p className="text-lg text-green-600 font-semibold mt-2">
                      🎁 Primeiros 14 dias GRÁTIS
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-10">
                    {plan.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-base">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading}
                    className="
                      w-full py-5 px-8 rounded-xl font-bold text-xl
                      bg-gradient-to-r from-purple-600 to-pink-600 
                      hover:from-purple-700 hover:to-pink-700 
                      text-white shadow-2xl hover:shadow-3xl
                      transform hover:scale-105
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center
                    "
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        🚀 Começar Teste Grátis de 14 Dias
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Sem cartão de crédito necessário • Cancele quando quiser
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              14 dias grátis
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              Sem cartão necessário
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              Cancele quando quiser
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              Pagamento seguro
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
                Como funciona o teste grátis de 14 dias?
              </h3>
              <p className="text-gray-600">
                Você cria sua conta e tem 14 dias para usar TODOS os recursos da plataforma sem pagar nada.
                Não precisa cadastrar cartão de crédito. Após os 14 dias, se quiser continuar, basta assinar.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                O que está incluído na assinatura?
              </h3>
              <p className="text-gray-600">
                Tudo! Clientes ilimitados, funcionários ilimitados, sistema completo de cashback,
                integrações, relatórios avançados, domínio próprio, whitelabel e suporte prioritário.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Como funciona o pagamento?
              </h3>
              <p className="text-gray-600">
                O pagamento é processado mensalmente de forma automática através do Stripe,
                uma das plataformas de pagamento mais seguras do mundo. Você pode cancelar a qualquer momento.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                O que acontece se eu cancelar?
              </h3>
              <p className="text-gray-600">
                Você pode cancelar a qualquer momento. Seu acesso continuará ativo até o
                final do período já pago. Sem taxas de cancelamento ou multas.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Por que esta oferta de lançamento?
              </h3>
              <p className="text-gray-600">
                Estamos em fase de lançamento e queremos dar a oportunidade para empresas
                crescerem conosco. Este preço especial garante TODOS os recursos premium pelo
                melhor custo-benefício. Aproveite enquanto está disponível!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
