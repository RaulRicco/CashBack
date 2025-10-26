import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Wallet, Gift, History, TrendingUp, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CustomerDashboard() {
  const { phone } = useParams();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);

  useEffect(() => {
    if (phone) {
      loadCustomerData();
    }
  }, [phone]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);

      // Buscar cliente
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (customerError) throw customerError;

      setCustomer(customerData);

      // Buscar transações
      const { data: txData } = await supabase
        .from('transactions')
        .select('*, merchant:merchants(name, cashback_program_name)')
        .eq('customer_id', customerData.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(txData || []);

      // Pegar o merchant principal (do primeiro transaction ou mais recente)
      if (txData && txData.length > 0 && txData[0].merchant_id) {
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('name, cashback_program_name')
          .eq('id', txData[0].merchant_id)
          .single();
        
        setMerchant(merchantData);
      }

      // Buscar resgates
      const { data: redemptionData } = await supabase
        .from('redemptions')
        .select('*, merchant:merchants(name)')
        .eq('customer_id', customerData.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      setRedemptions(redemptionData || []);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cliente não encontrado
          </h1>
          <p className="text-gray-600">
            Verifique o número de telefone
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {merchant?.cashback_program_name || 'Meu Cashback'}
              </h1>
              <p className="text-primary-100">
                {merchant?.name || customer.phone}
              </p>
            </div>
          </div>

          {/* Saldo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5" />
                <span className="text-sm">Disponível</span>
              </div>
              <p className="text-3xl font-bold">
                R$ {parseFloat(customer.available_cashback || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Total Acumulado</span>
              </div>
              <p className="text-3xl font-bold">
                R$ {parseFloat(customer.total_cashback || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm">Total Gasto</span>
              </div>
              <p className="text-3xl font-bold">
                R$ {parseFloat(customer.total_spent || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Histórico de Cashbacks */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Histórico de Cashback
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação ainda
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {tx.merchant?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(tx.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Compra: R$ {parseFloat(tx.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +R$ {parseFloat(tx.cashback_amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.cashback_percentage}% cashback
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico de Resgates */}
        {redemptions.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Histórico de Resgates
              </h2>
            </div>

            <div className="space-y-3">
              {redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {redemption.merchant?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(redemption.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      -R$ {parseFloat(redemption.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Resgatado
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dica */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-800 text-center">
            💡 <strong>Dica:</strong> Continue comprando para acumular mais cashback e resgatar quando quiser!
          </p>
        </div>
      </div>
    </div>
  );
}
