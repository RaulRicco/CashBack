import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import { Gift, Phone, DollarSign, QrCode, X } from 'lucide-react';
import { trackCashbackGenerated } from '../lib/tracking';

export default function Cashback() {
  const { merchant, user } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar inputs
      if (!phone || !amount || parseFloat(amount) <= 0) {
        toast.error('Preencha todos os campos corretamente');
        setLoading(false);
        return;
      }

      // Buscar ou criar cliente
      let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError;
      }

      if (!customer) {
        // Criar novo cliente
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            phone: phone,
            name: null
          })
          .select()
          .single();

        if (createError) throw createError;
        customer = newCustomer;
      }

      // Calcular cashback
      const purchaseAmount = parseFloat(amount);
      const cashbackPercentage = merchant.cashback_percentage || 5;
      const cashbackAmount = (purchaseAmount * cashbackPercentage) / 100;

      // Gerar token único para o QR Code
      const qrToken = `CASHBACK_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Criar transação (AGORA JÁ COMO COMPLETED)
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          merchant_id: merchant.id,
          customer_id: customer.id,
          employee_id: user?.id || null,  // Usar user.id em vez de employee.id
          transaction_type: 'cashback',
          amount: purchaseAmount,
          cashback_amount: cashbackAmount,
          cashback_percentage: cashbackPercentage,
          qr_code_token: qrToken,
          status: 'completed',  // ✅ JÁ COMPLETO - CASHBACK IMEDIATO
          qr_scanned: true,
          qr_scanned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // ℹ️ O saldo do cliente é atualizado AUTOMATICAMENTE pelo trigger do banco de dados
      // quando uma transação com status='completed' é inserida.
      // Se o trigger não estiver ativo, execute: URGENTE-FIX-TRIGGER.sql no Supabase

      // Tracking: Cashback Gerado
      trackCashbackGenerated({
        amount: purchaseAmount,
        cashbackAmount: cashbackAmount,
        customerPhone: phone,
        merchantId: merchant.id
      });

      // Gerar URL para o QR Code (o cliente vai escanear) - URL de conversão
      const qrUrl = `${window.location.origin}/customer/cashback/${qrToken}/parabens`;

      setQrData({
        url: qrUrl,
        token: qrToken,
        amount: purchaseAmount,
        cashbackAmount: cashbackAmount,
        cashbackPercentage: cashbackPercentage,
        customerPhone: phone,
        transactionId: transaction.id
      });

      toast.success('QR Code gerado com sucesso!');
      
      // Limpar form
      setPhone('');
      setAmount('');
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQR = () => {
    setQrData(null);
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleaned;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-8 h-8 text-primary-600" />
            Gerar Cashback
          </h1>
          <p className="text-gray-600 mt-2">
            Insira os dados da compra para gerar o QR Code de cashback para o cliente
          </p>
        </div>

        {/* Formulário */}
        <div className="card">
          <form onSubmit={handleGenerateQR} className="space-y-6">
            {/* Telefone do Cliente */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone do Cliente
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Digite apenas números (DDD + número)
              </p>
            </div>

            {/* Valor da Compra */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Valor da Compra
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Info do Cashback */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-900">
                    Cashback calculado
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-700">
                  R$ {((parseFloat(amount) * (merchant?.cashback_percentage || 5)) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-primary-600 mt-1">
                  {merchant?.cashback_percentage || 5}% de R$ {parseFloat(amount).toFixed(2)}
                </p>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <QrCode className="w-6 h-6" />
                  Gerar QR Code
                </>
              )}
            </button>
          </form>
        </div>

        {/* Modal QR Code */}
        {qrData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={handleCloseQR}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <QrCode className="w-8 h-8 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  QR Code Gerado!
                </h2>
                <p className="text-gray-600 mb-6">
                  Cliente deve escanear este código
                </p>

                {/* QR Code */}
                <div className="bg-white p-6 rounded-xl shadow-inner mb-6">
                  <QRCodeSVG
                    value={qrData.url}
                    size={256}
                    level="H"
                    includeMargin={true}
                    className="mx-auto"
                  />
                </div>

                {/* Detalhes */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor da compra:</span>
                    <span className="font-semibold">R$ {qrData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cashback:</span>
                    <span className="font-semibold text-green-600">
                      R$ {qrData.cashbackAmount.toFixed(2)} ({qrData.cashbackPercentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-semibold">{qrData.customerPhone}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-yellow-800">
                    ⚠️ O cliente deve escanear o QR Code para confirmar e receber o cashback
                  </p>
                </div>

                <button
                  onClick={handleCloseQR}
                  className="w-full btn-primary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
