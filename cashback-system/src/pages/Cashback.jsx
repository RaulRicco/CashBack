import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import { Gift, Phone, DollarSign, QrCode, X } from 'lucide-react';
import { trackCashbackGenerated } from '../lib/tracking';

export default function Cashback() {
  const { merchant, employee } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);

  const normalizeAmount = (value) => {
    if (typeof value !== 'string') return '';

    return value
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1');
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedAmount = normalizeAmount(amount);
      const parsedAmount = parseFloat(normalizedAmount);

      // Validar inputs
      if (!phone || !normalizedAmount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        toast.error('Preencha todos os campos corretamente');
        setLoading(false);
        return;
      }

      // Buscar cliente NESTE estabelecimento específico
      let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .eq('referred_by_merchant_id', merchant.id)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError;
      }

      // ⚠️ CLIENTE NÃO CADASTRADO - BLOQUEAR CASHBACK
      if (!customer) {
        toast.error(
          'Cliente não cadastrado! Este telefone não está registrado no seu estabelecimento. Peça para o cliente se cadastrar primeiro.',
          { duration: 6000 }
        );
        setLoading(false);
        return;
      }

      // Calcular cashback
      const purchaseAmount = parsedAmount;
      const cashbackPercentage = merchant.cashback_percentage || 5;
      const cashbackAmount = (purchaseAmount * cashbackPercentage) / 100;

      // Verificar se employee existe na tabela employees (quando merchant loga, employee pode ser mock)
      let validEmployeeId = null;
      if (employee?.id) {
        console.log('🔍 Verificando employee_id:', employee.id);
        const { data: employeeCheck, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('id', employee.id)
          .maybeSingle();  // ✅ Não lança erro se não encontrar
        
        if (employeeError) {
          console.warn('⚠️ Erro ao verificar employee:', employeeError);
        }
        
        validEmployeeId = employeeCheck?.id || null;
        console.log('✅ Employee validado:', validEmployeeId || 'NULL (merchant operando diretamente)');
      } else {
        console.log('ℹ️ Nenhum employee.id fornecido, usando NULL');
      }

      const apiResponse = await fetch('/api/transactions/create-cashback-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          customerId: customer.id,
          employeeId: validEmployeeId,
          amount: purchaseAmount,
          cashbackAmount,
          cashbackPercentage,
        }),
      });

      const apiResult = await apiResponse.json();
      if (!apiResponse.ok || !apiResult?.success) {
        throw new Error(apiResult?.error || 'Erro ao criar transação de cashback');
      }

      const transaction = apiResult.transaction;

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
      const qrUrl = `${window.location.origin}/customer/cashback/${transaction.qr_code_token}/parabens`;

      setQrData({
        url: qrUrl,
        token: transaction.qr_code_token,
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
      toast.error(error.message || 'Erro ao gerar QR Code. Tente novamente.');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Gift className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            Gerar Cashback
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Insira os dados da compra para gerar o QR Code de cashback para o cliente
          </p>
        </div>

        {/* Aviso Importante */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400 dark:text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                ⚠️ Cliente deve estar cadastrado
              </h3>
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                <p>
                  O cliente precisa ter cadastro no seu estabelecimento para receber cashback.
                  Se o telefone não estiver cadastrado, oriente o cliente a fazer o cadastro primeiro através do link:
                </p>
                <p className="mt-2 font-semibold text-amber-900 dark:text-amber-300">
                  {window.location.origin}/customer/signup/{merchant?.slug || 'seu-slug'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="card">
          <form onSubmit={handleGenerateQR} className="space-y-6">
            {/* Telefone do Cliente */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefone do Cliente
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Digite apenas números (DDD + número)
              </p>
            </div>

            {/* Valor da Compra */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor da Compra
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Info do Cashback */}
            {amount && (() => {
              const parsedPreviewAmount = parseFloat(normalizeAmount(amount));
              return Number.isFinite(parsedPreviewAmount) && parsedPreviewAmount > 0;
            })() && (
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-medium text-primary-900 dark:text-primary-300">
                    Cashback calculado
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                  R$ {((parseFloat(normalizeAmount(amount)) * (merchant?.cashback_percentage || 5)) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                  {merchant?.cashback_percentage || 5}% de R$ {parseFloat(normalizeAmount(amount)).toFixed(2)}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={handleCloseQR}
                className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-500 rounded-full mb-4">
                  <QrCode className="w-8 h-8 text-green-600 dark:text-black" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  QR Code Gerado!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Cliente deve escanear este código
                </p>

                {/* QR Code */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-inner mb-6">
                  <QRCodeSVG
                    value={qrData.url}
                    size={256}
                    level="H"
                    includeMargin={true}
                    className="mx-auto"
                  />
                </div>

                {/* Detalhes */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Valor da compra:</span>
                    <span className="font-semibold dark:text-gray-100">R$ {qrData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cashback:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      R$ {qrData.cashbackAmount.toFixed(2)} ({qrData.cashbackPercentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                    <span className="font-semibold dark:text-gray-100">{qrData.customerPhone}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
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
