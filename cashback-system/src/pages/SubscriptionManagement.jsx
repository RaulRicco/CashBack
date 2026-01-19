import { useState } from 'react';
import { 
  CreditCard, 
  Users, 
  UserPlus, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Crown,
  Loader2
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { createPortalSession } from '../lib/stripe';
import { useSubscription } from '../hooks/useSubscription';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function SubscriptionManagement() {
  const { merchant } = useAuthStore();
  const [portalLoading, setPortalLoading] = useState(false);
  
  // Usar o hook useSubscription que já tem a lógica correta de contagem
  const { 
    loading, 
    subscriptionData, 
    currentPlan, 
    customerCount, 
    employeeCount 
  } = useSubscription();

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await createPortalSession(merchant.id);
    } catch (error) {
      console.error('Erro ao abrir portal:', error);
      toast.error('Erro ao abrir portal de gerenciamento');
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  const usagePercentageCustomers = subscriptionData?.customer_limit 
    ? (customerCount / subscriptionData.customer_limit) * 100
    : 0;
  const usagePercentageEmployees = subscriptionData?.employee_limit
    ? (employeeCount / subscriptionData.employee_limit) * 100
    : 0;

  const isNearLimit = usagePercentageCustomers > 80 || usagePercentageEmployees > 80;
  const isAtLimit = usagePercentageCustomers >= 100 || usagePercentageEmployees >= 100;

  const statusConfig = {
    trial: { label: 'Período de Teste', color: 'blue', icon: AlertCircle },
    active: { label: 'Ativo', color: 'green', icon: CheckCircle },
    past_due: { label: 'Pagamento Pendente', color: 'yellow', icon: AlertCircle },
    canceled: { label: 'Cancelado', color: 'red', icon: AlertCircle },
  };

  const status = statusConfig[subscriptionData?.subscription_status] || statusConfig.trial;
  const StatusIcon = status.icon;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minha Assinatura
          </h1>
          <p className="text-gray-600">
            Gerencie seu plano e acompanhe o uso dos recursos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Plano {currentPlan?.name || 'Starter'}
                      </h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <StatusIcon className={`w-4 h-4 text-white`} />
                        <span className="text-sm text-white/90">{status.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      R$ {currentPlan?.price || 147}
                    </div>
                    <div className="text-sm text-white/80">/mês</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Clientes</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {customerCount}
                      {subscriptionData?.customer_limit && (
                        <span className="text-sm text-gray-500 font-normal">
                          {' '}/ {subscriptionData.customer_limit.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Funcionários</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {employeeCount}
                      {subscriptionData?.employee_limit && (
                        <span className="text-sm text-gray-500 font-normal">
                          {' '}/ {subscriptionData.employee_limit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Abrindo...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Gerenciar Assinatura
                      </>
                    )}
                  </button>

                  <Link
                    to="/dashboard/planos"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Fazer Upgrade
                  </Link>
                </div>
              </div>
            </div>

            {/* Usage Alerts */}
            {isAtLimit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-red-800">
                      Limite Atingido
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      Você atingiu o limite do seu plano. Faça upgrade para continuar adicionando novos registros.
                    </p>
                    <Link
                      to="/dashboard/planos"
                      className="inline-flex items-center text-sm font-semibold text-red-800 hover:text-red-900 mt-2"
                    >
                      Ver planos disponíveis
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {isNearLimit && !isAtLimit && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-yellow-800">
                      Próximo do Limite
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Você está próximo do limite do seu plano. Considere fazer upgrade para evitar interrupções.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Bars */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Uso dos Recursos
              </h3>

              <div className="space-y-6">
                {/* Customers Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Clientes</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {customerCount}
                      {subscriptionData?.customer_limit 
                        ? ` de ${subscriptionData.customer_limit.toLocaleString('pt-BR')}`
                        : ' (Ilimitado)'
                      }
                    </span>
                  </div>
                  {subscriptionData?.customer_limit ? (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usagePercentageCustomers >= 100 
                            ? 'bg-red-600' 
                            : usagePercentageCustomers > 80 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentageCustomers, 100)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Uso ilimitado disponível</div>
                  )}
                </div>

                {/* Employees Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <UserPlus className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Funcionários</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {employeeCount}
                      {subscriptionData?.employee_limit 
                        ? ` de ${subscriptionData.employee_limit}`
                        : ' (Ilimitado)'
                      }
                    </span>
                  </div>
                  {subscriptionData?.employee_limit ? (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usagePercentageEmployees >= 100 
                            ? 'bg-red-600' 
                            : usagePercentageEmployees > 80 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentageEmployees, 100)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Uso ilimitado disponível</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recursos do Plano
              </h3>
              <div className="space-y-3">
                {currentPlan?.benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Precisa de Ajuda?
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Nossa equipe está pronta para ajudar você a aproveitar ao máximo sua assinatura.
              </p>
              <a
                href="mailto:suporte@localcashback.com.br"
                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Falar com Suporte
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
