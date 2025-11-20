import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import { Gift, Phone, DollarSign, QrCode, X, AlertCircle } from 'lucide-react';
import { trackRedemptionGenerated } from '../lib/tracking';

export default function Redemption() {
  const { merchant, employee } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [qrData, setQrData] = useState(null);

  const handleCheckCustomer = async () => {
    if (!phone) {
      toast.error('Insira o telefone do cliente');
      return;
    }

    setCheckingCustomer(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .eq('referred_by_merchant_id', merchant.id)
        .single();

      if (error || !data) {
        toast.error('Cliente não encontrado neste estabelecimento');
        setCustomer(null);
      } else {
        setCustomer(data);
        if (data.available_cashback <= 0) {
          toast.error('Cliente não possui saldo disponível');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast.error('Erro ao buscar cliente');
    } finally {
      setCheckingCustomer(false);
    }
  };

  const handleGenerateRedemptionQR = async (e) => {
    e.preventDefault();
    
    if (!customer) {
      toast.error('Busque o cliente primeiro');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Insira um valor válido');
      return;
    }

    const redemptionAmount = parseFloat(amount);
    
    if (redemptionAmount > customer.available_cashback) {
      toast.error('Valor maior que saldo disponível');
      return;
    }

    setLoading(true);
    try {
      // Gerar token único para o QR Code de resgate
      const qrToken = `REDEMPTION_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Criar resgate
      const { data: redemption, error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          merchant_id: merchant.id,
          customer_id: customer.id,
          employee_id: employee.id,
          amount: redemptionAmount,
          qr_code_token: qrToken,
          status: 'pending'
        })
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Tracking: Resgate Gerado
      trackRedemptionGenerated({
        amount: redemptionAmount,
        customerPhone: phone,
        merchantId: merchant.id
      });

      // Gerar URL para o QR Code (o cliente vai escanear)
      const qrUrl = `${window.location.origin}/customer/redemption/${qrToken}`;

      setQrData({
        url: qrUrl,
        token: qrToken,
        amount: redemptionAmount,
        customerPhone: phone,
        redemptionId: redemption.id,
        customerName: customer.name || phone
      });

      toast.success('QR Code de resgate gerado!');
      
      // Limpar form mas manter customer
      setAmount('');
    } catch (error) {
      console.error('Erro ao gerar resgate:', error);
      toast.error('Erro ao gerar QR Code de resgate');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQR = () => {
    setQrData(null);
    // Recarregar dados do cliente
    handleCheckCustomer();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <QrCode className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            Resgate de Cashback
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Valide o saldo do cliente e gere o QR Code para resgate
          </p>
        </div>

        {/* Buscar Cliente */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            1. Buscar Cliente
          </h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setCustomer(null);
                }}
                placeholder="(11) 99999-9999"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleCheckCustomer}
              disabled={checkingCustomer}
              className="btn-primary whitespace-nowrap"
            >
              {checkingCustomer ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Informações do Cliente */}
        {customer && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              2. Dados do Cliente
            </h2>
            
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-primary-700 dark:text-primary-400 mb-1">Nome</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {customer.name || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-primary-700 dark:text-primary-400 mb-1">Telefone</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-700 dark:text-primary-400 mb-1">Total Acumulado</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    R$ {parseFloat(customer.total_cashback).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-700 dark:text-primary-400">Saldo Disponível:</span>
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    R$ {parseFloat(customer.available_cashback).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {customer.available_cashback > 0 ? (
              <form onSubmit={handleGenerateRedemptionQR} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    3. Valor do Resgate
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={customer.available_cashback}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Máximo: R$ {parseFloat(customer.available_cashback).toFixed(2)}
                  </p>
                </div>

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
                      Gerar QR Code de Resgate
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-300">Cliente sem saldo</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Este cliente não possui saldo disponível para resgate.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-500 rounded-full mb-4">
                  <Gift className="w-8 h-8 text-orange-600 dark:text-black" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  QR Code de Resgate
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Cliente deve escanear para confirmar
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
                    <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                    <span className="font-semibold dark:text-gray-100">{qrData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Valor do resgate:</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      R$ {qrData.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    ⚠️ O cliente deve escanear o QR Code para confirmar o resgate
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
