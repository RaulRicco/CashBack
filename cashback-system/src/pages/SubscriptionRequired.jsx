import { useState } from 'react';
import { Lock, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { getLogo, getBrandName } from '../config/branding';

export default function SubscriptionRequired() {
  const navigate = useNavigate();
  const { merchant, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  async function handleRegularize() {
    if (!merchant?.id) {
      toast.error('Não foi possível identificar o estabelecimento. Faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Se já existe um customer no Stripe, manda para o portal (atualizar
      // cartão / reativar assinatura). Caso contrário, abre um novo checkout.
      const endpoint = merchant.stripe_customer_id
        ? `${apiUrl}/api/stripe/create-portal-session`
        : `${apiUrl}/api/stripe/create-checkout`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: merchant.id })
      });

      const data = await response.json();

      const checkoutUrl = data.url || data.checkoutUrl;
      if (data.success === false || !checkoutUrl) {
        throw new Error(data.error || 'Não foi possível abrir o pagamento');
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erro ao abrir pagamento:', error);
      toast.error('Erro ao processar pagamento: ' + error.message);
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src={getLogo('icon')}
              alt={getBrandName()}
              className="object-contain w-16 h-16"
            />
          </div>

          {/* Ícone de Bloqueio */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assinatura pendente
          </h1>
          <p className="text-lg text-gray-600">
            Seu período de teste terminou ou o pagamento não foi confirmado.
          </p>
        </div>

        {/* Mensagem Principal */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 text-center mb-4">
            Para continuar usando o <strong>{getBrandName()}</strong> e ter acesso a todas as funcionalidades,
            regularize sua assinatura.
          </p>
        </div>

        {/* Features List */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            ✨ O que você continua tendo:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Cashback automatizado</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Gestão de clientes ilimitada</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Integrações (OneSignal, WhatsApp)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Relatórios completos</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Suporte prioritário</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Atualizações constantes</span>
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg p-6 mb-6 text-center">
          <p className="text-sm opacity-90 mb-2">Plano Único — Tudo Liberado</p>
          <p className="text-4xl font-bold mb-2">R$ 97<span className="text-lg font-normal">/mês</span></p>
          <p className="text-sm opacity-90">Cancele quando quiser • Sem permanência</p>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button
            onClick={handleRegularize}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                💳 Regularizar Pagamento
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Dúvidas? Entre em contato:{' '}
            <a href="mailto:suporte@localcashback.com" className="text-primary-600 hover:underline">
              suporte@localcashback.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
