import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Gift, ArrowRight, Loader } from 'lucide-react';
import { trackCashbackScanned, trackCashbackCompleted } from '../lib/tracking';
import { syncCustomerToIntegrations } from '../lib/integrations';

export default function CustomerCashback() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      processQRCode();
    }
  }, [token]);

  const processQRCode = async () => {
    try {
      setLoading(true);

      // Buscar transação pelo token
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*, customer:customers(*), merchant:merchants(*)')
        .eq('qr_code_token', token)
        .single();

      if (txError || !txData) {
        throw new Error('QR Code inválido ou expirado');
      }

      // Verificar se já foi escaneado
      if (txData.qr_scanned) {
        setTransaction(txData);
        setCustomer(txData.customer);
        setMerchant(txData.merchant);
        setLoading(false);
        return;
      }

      // Marcar como escaneado e completado
      const { data: updatedTx, error: updateError } = await supabase
        .from('transactions')
        .update({
          qr_scanned: true,
          qr_scanned_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', txData.id)
        .select('*, customer:customers(*), merchant:merchants(*)')
        .single();

      if (updateError) throw updateError;

      setTransaction(updatedTx);
      setCustomer(updatedTx.customer);
      setMerchant(updatedTx.merchant);

      // Tracking: QR Code Escaneado
      trackCashbackScanned({
        amount: updatedTx.amount,
        cashbackAmount: updatedTx.cashback_amount,
        customerPhone: updatedTx.customer.phone,
        merchantId: updatedTx.merchant_id
      });

      // Tracking: Cashback Completado (conversão)
      trackCashbackCompleted({
        amount: updatedTx.amount,
        cashbackAmount: updatedTx.cashback_amount,
        customerPhone: updatedTx.customer.phone,
        merchantId: updatedTx.merchant_id
      });

      // Sincronizar com integrações de email marketing
      syncCustomerToIntegrations(updatedTx.customer, updatedTx.merchant_id, 'purchase');

      setLoading(false);
    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Ícone de Sucesso */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Parabéns!
          </h1>
          <p className="text-gray-600">
            Seu cashback foi creditado com sucesso!
          </p>
        </div>

        {/* Detalhes do Cashback */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gift className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium text-primary-900">
              Você ganhou
            </span>
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
            <span className="text-gray-600">Saldo disponível:</span>
            <span className="font-semibold text-green-600">
              R$ {parseFloat(customer?.available_cashback || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 text-center">
            💰 Continue comprando e acumulando cashback! <br />
            Você pode resgatar a qualquer momento.
          </p>
        </div>

        {/* Botão para ver saldo */}
        <button
          onClick={handleGoToDashboard}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Ver Meu Saldo Completo
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Obrigado por escolher {merchant?.name}! ❤️
          </p>
        </div>
      </div>

      {/* Confete Animation (opcional) */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
