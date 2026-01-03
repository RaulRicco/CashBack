import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Gift, ArrowRight, Loader } from 'lucide-react';
import { trackRedemptionCompleted } from '../lib/tracking';
import { syncCustomerToIntegrations, sendPushNotification } from '../lib/integrations';
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/NotificationContainer';
import { notifyRedemptionCompleted } from '../lib/pushNotifications';
import { useDynamicManifest } from '../hooks/useDynamicManifest';

export default function CustomerRedemption() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [redemption, setRedemption] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [merchant, setMerchant] = useState(null);
  
  // 🎯 PWA dinâmico por estabelecimento
  useDynamicManifest(merchant);
  const [error, setError] = useState(null);
  const { notifications, showNotification } = useNotification();

  useEffect(() => {
    if (token) {
      processRedemptionQR();
    }
  }, [token]);

  const processRedemptionQR = async () => {
    try {
      setLoading(true);

      // Buscar resgate pelo token
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('redemptions')
        .select('*, customer:customers(*), merchant:merchants(*)')
        .eq('qr_code_token', token)
        .single();

      if (redemptionError || !redemptionData) {
        throw new Error('QR Code inválido ou expirado');
      }

      // Verificar se já foi processado (status completed)
      if (redemptionData.status === 'completed') {
        setRedemption(redemptionData);
        setCustomer(redemptionData.customer);
        setMerchant(redemptionData.merchant);
        setLoading(false);
        return;
      }

      // Verificar se o cliente tem saldo suficiente
      if (redemptionData.customer.available_cashback < redemptionData.amount) {
        throw new Error('Saldo insuficiente para este resgate');
      }

      // Marcar como completado
      const { data: updatedRedemption, error: updateError } = await supabase
        .from('redemptions')
        .update({
          status: 'completed'
        })
        .eq('id', redemptionData.id)
        .select('*, customer:customers(*), merchant:merchants(*)')
        .single();

      if (updateError) throw updateError;

      setRedemption(updatedRedemption);
      setCustomer(updatedRedemption.customer);
      setMerchant(updatedRedemption.merchant);

      // Tracking: Resgate Completado
      trackRedemptionCompleted({
        amount: updatedRedemption.amount,
        customerPhone: updatedRedemption.customer.phone,
        merchantId: updatedRedemption.merchant_id
      });

      // Sincronizar com integrações de email marketing
      syncCustomerToIntegrations(updatedRedemption.customer, updatedRedemption.merchant_id, 'redemption');

      // Enviar notificação push de resgate realizado
      sendPushNotification(
        updatedRedemption.customer,
        updatedRedemption.merchant_id,
        'redemption',
        { 
          amount: updatedRedemption.amount,
          merchantName: updatedRedemption.merchant.name
        }
      );

      // Mostrar notificação de resgate
      setTimeout(() => {
        showNotification({
          type: 'redemption',
          title: '💰 Resgate Realizado!',
          message: `Você usou seu cashback em ${updatedRedemption.merchant.name}`,
          amount: updatedRedemption.amount,
          duration: 6000
        });

        // Enviar Push Notification nativa
        notifyRedemptionCompleted({
          amount: updatedRedemption.amount,
          merchantName: updatedRedemption.merchant.name,
          customerPhone: updatedRedemption.customer.phone
        });
      }, 500);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao processar resgate:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    if (customer?.phone) {
      navigate(`/customer/dashboard/${customer.phone}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Processando seu resgate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ops! Algo deu errado
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 flex items-center justify-center p-4">
      {/* Container de Notificações */}
      <NotificationContainer notifications={notifications} />
      
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Ícone de Sucesso */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎊 Resgate Confirmado!
          </h1>
          <p className="text-gray-600">
            Seu cashback foi resgatado com sucesso!
          </p>
        </div>

        {/* Detalhes do Resgate */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gift className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">
              Valor Resgatado
            </span>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-orange-700 mb-2">
              R$ {parseFloat(redemption?.amount || 0).toFixed(2)}
            </p>
            <p className="text-sm text-orange-600">
              Descontado do seu saldo
            </p>
          </div>
        </div>

        {/* Informações */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estabelecimento:</span>
            <span className="font-semibold text-gray-900">{merchant?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Seu telefone:</span>
            <span className="font-semibold text-gray-900">{customer?.phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Saldo restante:</span>
            <span className="font-semibold text-green-600">
              R$ {parseFloat(customer?.available_cashback || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mensagem */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 text-center">
            💰 Continue acumulando cashback! <br />
            Volte sempre e aproveite seus benefícios.
          </p>
        </div>

        {/* Botão para ver saldo */}
        <button
          onClick={handleGoToDashboard}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Ver Meu Saldo Completo
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Obrigado por utilizar {merchant?.name}! ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
