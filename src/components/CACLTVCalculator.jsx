import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, TrendingUp, Users, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CACLTVCalculator({ merchantId, dateRange }) {
  const [marketingSpend, setMarketingSpend] = useState(0);
  const [metrics, setMetrics] = useState({
    totalSpend: 0,
    newCustomers: 0,
    cac: 0,
    avgRevenue: 0,
    totalRevenue: 0,
    ltv: 0,
    roi: 0
  });

  // Zerar investimento ao mudar período
  useEffect(() => {
    if (merchantId) {
      setMarketingSpend(0);
    }
  }, [dateRange]);

  // Recalcular métricas quando mudar investimento ou período
  useEffect(() => {
    if (merchantId) {
      loadMetrics();
    }
  }, [merchantId, dateRange, marketingSpend]);

  const loadMetrics = async () => {
    try {
      // NÃO busca mais do banco - usa apenas o valor digitado
      // Total investido agora é dinâmico (apenas na memória)
      const totalSpend = parseFloat(marketingSpend) || 0;

      // Receita total (soma das transações) - BUSCAR PRIMEIRO
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, customer_id, created_at')
        .eq('merchant_id', merchantId)
        .eq('status', 'completed')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      // Novos clientes no período - através das transações deste merchant
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('customer_id, created_at')
        .eq('merchant_id', merchantId)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      // Identificar novos clientes (primeira transação no período)
      const uniqueCustomerIds = [...new Set(allTransactions?.map(t => t.customer_id) || [])];
      const newCustomersInPeriod = uniqueCustomerIds.filter(customerId => {
        const firstTransaction = allTransactions.find(t => t.customer_id === customerId);
        if (firstTransaction) {
          const firstDate = new Date(firstTransaction.created_at);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end + 'T23:59:59');
          return firstDate >= startDate && firstDate <= endDate;
        }
        return false;
      });
      
      const newCustomers = newCustomersInPeriod.length;

      const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const uniqueCustomers = new Set(transactions?.map(t => t.customer_id)).size || 1;
      
      // Cálculos
      const cac = newCustomers > 0 ? totalSpend / newCustomers : 0;
      const avgRevenue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
      
      // LTV: Receita total dividida por novos clientes (não por clientes únicos)
      const ltv = newCustomers > 0 ? totalRevenue / newCustomers : 0;
      
      // ROI: (Receita - Custo) / Custo (SEM multiplicar por 100, já mostramos com %)
      const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) : 0;

      setMetrics({
        totalSpend,
        newCustomers: newCustomers || 0,
        cac,
        avgRevenue,
        totalRevenue,
        ltv,
        roi
      });
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
    }
  };

  const handleUpdateSpend = () => {
    // Apenas recalcula as métricas com o novo valor
    // Não salva no banco, é apenas dinâmico
    loadMetrics();
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Calculadora de CAC e LTV
        </h2>
      </div>

      {/* Campo dinâmico de investimento */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adicionar Investimento em Tráfego
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={marketingSpend || ''}
              onChange={(e) => {
                setMarketingSpend(parseFloat(e.target.value) || 0);
                // Recalcula automaticamente ao digitar
                setTimeout(() => handleUpdateSpend(), 300);
              }}
              placeholder="0,00"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="button"
            onClick={handleUpdateSpend}
            className="btn-primary whitespace-nowrap"
          >
            Calcular
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Valor dinâmico - será zerado ao atualizar a página ou trocar o período
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Investido */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Investido</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            R$ {metrics.totalSpend.toFixed(2)}
          </p>
        </div>

        {/* Novos Clientes */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-300">Novos Clientes</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {metrics.newCustomers}
          </p>
        </div>

        {/* CAC */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-300">CAC (Custo por Cliente)</span>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            R$ {metrics.cac.toFixed(2)}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Investimento / Novos Clientes
          </p>
        </div>

        {/* LTV */}
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-300">LTV (Lifetime Value)</span>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
            R$ {metrics.ltv.toFixed(2)}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Receita média por cliente
          </p>
        </div>

        {/* Receita Total */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Receita Total</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
            R$ {metrics.totalRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
            Soma de todas as transações
          </p>
        </div>

        {/* ROI */}
        <div className={`p-4 rounded-lg border ${
          metrics.roi > 0 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-5 h-5 ${metrics.roi > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            <span className={`text-sm font-medium ${metrics.roi > 0 ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'}`}>
              ROI (Retorno)
            </span>
          </div>
          <p className={`text-2xl font-bold ${metrics.roi > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {metrics.roi > 0 ? '+' : ''}{(metrics.roi * 100).toFixed(1)}%
          </p>
          <p className={`text-xs mt-1 ${metrics.roi > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            (Receita - Custo) / Custo
          </p>
        </div>
      </div>

      {/* Análise LTV/CAC */}
      {metrics.cac > 0 && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📊 Análise LTV/CAC Ratio
          </p>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary-700 dark:text-primary-400">
              {(metrics.ltv / metrics.cac).toFixed(2)}x
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metrics.ltv / metrics.cac >= 3 ? (
                <span className="text-green-600 dark:text-green-400 font-medium">✅ Excelente! Ratio acima de 3:1</span>
              ) : metrics.ltv / metrics.cac >= 1 ? (
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Bom, mas pode melhorar</span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-medium">❌ Atenção! LTV menor que CAC</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
