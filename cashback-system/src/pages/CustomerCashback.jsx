import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Gift, ArrowRight, Loader } from 'lucide-react';
import { trackCashbackScanned, trackCashbackCompleted, initGTM, initMetaPixel, trackPageView } from '../lib/tracking';
import { syncCustomerToIntegrations, sendPushNotification } from '../lib/integrations';
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/NotificationContainer';
import { notifyCashbackReceived } from '../lib/pushNotifications';
import MerchantSEO from '../components/MerchantSEO';

export default function CustomerCashback() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [error, setError] = useState(null);
  const { notifications, showNotification } = useNotification();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const hasParabens = currentPath.includes('/parabens');

    if (!hasParabens && token) {
      console.log('🔄 URL sem /parabens detectada! Redirecionando...');
      window.location.replace(`/customer/cashback/${token}/parabens`);
    }
  }, []);

  useEffect(() => {
    if (token) {
      processQRCode();
    }
  }, [token]);

  useEffect(() => {
    if (merchant && !window.fbq && !window.dataLayer) {
      console.log('🎯 Inicializando tracking do estabelecimento (fallback):', merchant.name);

      if (merchant.gtm_id) {
        console.log('📊 Carregando GTM:', merchant.gtm_id);
        initGTM(merchant.gtm_id);
      }

      if (merchant.meta_pixel_id) {
        console.log('📘 Carregando Meta Pixel:', merchant.meta_pixel_id);
        initMetaPixel(merchant.meta_pixel_id);
      }
    }

    if (merchant) {
      setTimeout(() => {
        trackPageView('CustomerCashbackReceived');
      }, 500);
    }
  }, [merchant]);

  const processQRCode = async () => {
    try {
      setLoading(true);

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('id, qr_scanned')
        .eq('qr_code_token', token)
        .single();

      if (txError || !txData) {
        throw new Error('QR Code inválido ou expirado');
      }

      if (!txData.qr_scanned && !window.location.pathname.includes('/parabens')) {
        console.log('🔄 Redirecionando para página de conversão /parabens...');
        window.location.replace(`/customer/cashback/${token}/parabens`);
        return;
      }

      const apiResponse = await fetch('/api/transactions/process-cashback-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const apiResult = await apiResponse.json();
      if (!apiResponse.ok || !apiResult?.success || !apiResult?.transaction) {
        throw new Error(apiResult?.error || 'Erro ao processar QR Code');
      }

      const updatedTx = apiResult.transaction;
      const merchantData = updatedTx.merchant;

      setTransaction(updatedTx);
      setCustomer(updatedTx.customer);

      if (merchantData.gtm_id) {
        console.log('📊 Inicializando GTM:', merchantData.gtm_id);
        initGTM(merchantData.gtm_id);
      }

      if (merchantData.meta_pixel_id) {
        console.log('📘 Inicializando Meta Pixel:', merchantData.meta_pixel_id);
        initMetaPixel(merchantData.meta_pixel_id);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      setMerchant(merchantData);

      if (!apiResult.alreadyProcessed) {
        trackCashbackScanned({
          amount: updatedTx.amount,
          cashbackAmount: updatedTx.cashback_amount,
          customerPhone: updatedTx.customer.phone,
          merchantId: updatedTx.merchant_id,
        });

        trackCashbackCompleted({
          amount: updatedTx.amount,
          cashbackAmount: updatedTx.cashback_amount,
          customerPhone: updatedTx.customer.phone,
          merchantId: updatedTx.merchant_id,
        });

        if (window.location.pathname.includes('/parabens')) {
          console.log('🎯 PÁGINA DE CONVERSÃO DETECTADA!');

          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value: updatedTx.amount,
              currency: 'BRL',
              content_name: 'Cashback Recebido',
              content_category: 'Conversão',
              content_ids: [updatedTx.id],
              cashback_amount: updatedTx.cashback_amount,
            });
            console.log('📘 Meta Pixel: Evento Purchase disparado');
          } else {
            console.warn('⚠️ Meta Pixel não está disponível. window.fbq não encontrado.');
          }

          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'conversion',
              event_category: 'Cashback',
              event_label: 'Conversão Completa',
              value: updatedTx.amount,
              cashback_value: updatedTx.cashback_amount,
              currency: 'BRL',
              transaction_id: updatedTx.id,
            });
            console.log('📊 GTM: Evento conversion disparado');
          } else {
            console.warn('⚠️ Google Tag Manager não está disponível. window.dataLayer não encontrado.');
          }
        }

        syncCustomerToIntegrations(updatedTx.customer, updatedTx.merchant_id, 'purchase');

        sendPushNotification(updatedTx.customer, updatedTx.merchant_id, 'cashback', {
          amount: updatedTx.cashback_amount,
          merchantName: updatedTx.merchant.name,
        });

        setTimeout(() => {
          showNotification({
            type: 'cashback',
            title: '🎉 Cashback Recebido!',
            message: `Você ganhou em ${updatedTx.merchant.name}`,
            amount: updatedTx.cashback_amount,
            duration: 6000,
          });

          notifyCashbackReceived({
            amount: updatedTx.cashback_amount,
            merchantName: updatedTx.merchant.name,
            customerPhone: updatedTx.customer.phone,
            merchantId: updatedTx.merchant_id,
          });
        }, 500);
      }

      setLoading(false);
    } catch (processError) {
      console.error('Erro ao processar QR Code:', processError);
      setError(processError.message);
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    if (customer?.phone) {
      const merchantQuery = transaction?.merchant_id || merchant?.id || customer?.referred_by_merchant_id;
      navigate(
        merchantQuery
          ? `/customer/dashboard/${customer.phone}?merchant=${merchantQuery}`
          : `/customer/dashboard/${customer.phone}`
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Processando seu cashback...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <MerchantSEO merchant={merchant} pageType="signup" />

      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-900 flex items-center justify-center p-4">
        <NotificationContainer notifications={notifications} />

        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Parabéns!</h1>
            <p className="text-gray-600">Seu cashback foi creditado com sucesso!</p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="w-6 h-6 text-primary-600" />
              <span className="text-sm font-medium text-primary-900">Você ganhou</span>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-primary-700 mb-2">
                R$ {parseFloat(transaction?.cashback_amount || 0).toFixed(2)}
              </p>
              <p className="text-sm text-primary-600">
                {transaction?.cashback_percentage}% de R$ {parseFloat(transaction?.amount || 0).toFixed(2)}
              </p>
            </div>
          </div>

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
              <span className="text-gray-600">Saldo disponível:</span>
              <span className="font-semibold text-green-600">
                R$ {parseFloat(customer?.available_cashback || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 text-center">
              💰 Continue comprando e acumulando cashback! <br />
              Você pode resgatar a qualquer momento.
            </p>
          </div>

          <button
            onClick={handleGoToDashboard}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Ver Meu Saldo Completo
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Obrigado por escolher {merchant?.name}! ❤️</p>
          </div>
        </div>

        <style jsx>{`
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </div>
    </>
  );
}
