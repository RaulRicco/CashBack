import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Wallet, Gift, History, TrendingUp, Loader, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CustomerDashboard() {
  const { phone } = useParams();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'in', 'out'

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

  // Criar histórico unificado (entradas + saídas)
  const getUnifiedHistory = () => {
    const history = [];

    // Adicionar entradas (cashback)
    transactions.forEach(tx => {
      history.push({
        id: `tx-${tx.id}`,
        type: 'in',
        amount: parseFloat(tx.cashback_amount),
        purchaseAmount: parseFloat(tx.amount),
        percentage: tx.cashback_percentage,
        merchantName: tx.merchant?.name,
        date: new Date(tx.created_at),
        description: 'Cashback recebido'
      });
    });

    // Adicionar saídas (resgates)
    redemptions.forEach(redemption => {
      history.push({
        id: `redemption-${redemption.id}`,
        type: 'out',
        amount: parseFloat(redemption.amount),
        merchantName: redemption.merchant?.name,
        date: new Date(redemption.created_at),
        description: 'Cashback resgatado'
      });
    });

    // Ordenar por data (mais recente primeiro)
    history.sort((a, b) => b.date - a.date);

    // Filtrar por tipo
    if (filter === 'in') {
      return history.filter(item => item.type === 'in');
    } else if (filter === 'out') {
      return history.filter(item => item.type === 'out');
    }

    return history;
  };

  const unifiedHistory = getUnifiedHistory();

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
        {/* Histórico Unificado */}
        <div className="card">
          {/* Header com Filtros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Histórico de Movimentações
              </h2>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('in')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'in'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setFilter('out')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'out'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Saídas
                </button>
              </div>
            </div>
          </div>

          {/* Histórico */}
          {unifiedHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-1">
                Nenhuma movimentação ainda
              </p>
              <p className="text-sm text-gray-400">
                {filter === 'in' && 'Nenhum cashback recebido'}
                {filter === 'out' && 'Nenhum resgate realizado'}
                {filter === 'all' && 'Faça sua primeira compra para começar!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {unifiedHistory.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${
                    item.type === 'in'
                      ? 'bg-green-50 border border-green-100 hover:bg-green-100'
                      : 'bg-orange-50 border border-orange-100 hover:bg-orange-100'
                  }`}
                >
                  {/* Lado esquerdo */}
                  <div className="flex items-center gap-4">
                    {/* Ícone */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.type === 'in'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {item.type === 'in' ? (
                        <ArrowDownCircle className="w-6 h-6" />
                      ) : (
                        <ArrowUpCircle className="w-6 h-6" />
                      )}
                    </div>

                    {/* Informações */}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.merchantName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(item.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {item.type === 'in' && item.purchaseAmount && (
                        <p className="text-xs text-gray-500 mt-1">
                          Compra de R$ {item.purchaseAmount.toFixed(2)} • {item.percentage}% cashback
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lado direito - Valor */}
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        item.type === 'in' ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {item.type === 'in' ? '+' : '-'}R$ {item.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.type === 'in' ? 'Recebido' : 'Resgatado'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumo do filtro */}
          {unifiedHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {filter === 'all' && `Total de ${unifiedHistory.length} movimentações`}
                  {filter === 'in' && `Total de ${unifiedHistory.length} entradas`}
                  {filter === 'out' && `Total de ${unifiedHistory.length} saídas`}
                </span>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Ver todas
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

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
