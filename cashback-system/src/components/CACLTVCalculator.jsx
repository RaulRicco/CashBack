import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, TrendingUp, Users, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CACLTVCalculator({ merchantId, dateRange }) {
  const [marketingSpend, setMarketingSpend] = useState('');
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState({
    totalSpend: 0,
    newCustomers: 0,
    cac: 0,
    avgRevenue: 0,
    ltv: 0,
    roi: 0
  });

  useEffect(() => {
    if (merchantId) {
      loadMetrics();
    }
  }, [merchantId, dateRange]);

  const loadMetrics = async () => {
    try {
      // Total gasto em marketing no período
      const { data: spendData } = await supabase
        .from('marketing_spend')
        .select('amount')
        .eq('merchant_id', merchantId)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);

      const totalSpend = spendData?.reduce((sum, s) => sum + parseFloat(s.amount), 0) || 0;

      // Novos clientes no período
      const { count: newCustomers } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      // Receita total (soma das transações)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, customer_id')
        .eq('merchant_id', merchantId)
        .eq('status', 'completed')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const uniqueCustomers = new Set(transactions?.map(t => t.customer_id)).size || 1;
      
      // Cálculos
      const cac = newCustomers > 0 ? totalSpend / newCustomers : 0;
      const avgRevenue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
      
      // LTV simplificado: Receita média por cliente (pode ser refinado com mais dados)
      const ltv = avgRevenue;
      
      // ROI: (Receita - Custo) / Custo * 100
      const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

      setMetrics({
        totalSpend,
        newCustomers: newCustomers || 0,
        cac,
        avgRevenue,
        ltv,
        roi
      });
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
    }
  };

  const handleAddSpend = async (e) => {
    e.preventDefault();
    
    if (!merchantId) {
      toast.error('Erro: Merchant não identificado. Faça login novamente.');
      return;
    }

    if (!marketingSpend || parseFloat(marketingSpend) <= 0) {
      toast.error('Insira um valor válido');
      return;
    }

    setSaving(true);
    try {
      // Dados mínimos obrigatórios
      const spendData = {
        merchant_id: merchantId,
        amount: parseFloat(marketingSpend),
        date: new Date().toISOString().split('T')[0]
      };

      // Tentar adicionar campos opcionais se existirem na tabela
      // Isso evita erro se a tabela ainda não foi atualizada
      try {
        spendData.platform = 'manual';
      } catch (e) {
        console.warn('Campo platform não disponível:', e);
      }

      console.log('Salvando gasto em marketing:', spendData);

      const { data, error } = await supabase
        .from('marketing_spend')
        .insert(spendData)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        
        // Se o erro for sobre coluna faltando, dar mensagem mais clara
        if (error.message?.includes('column') || error.message?.includes('schema cache')) {
          toast.error('⚠️ Banco de dados precisa ser atualizado. Execute o script SQL fornecido.');
          console.error('AÇÃO NECESSÁRIA: Execute supabase-verify-and-fix-marketing-spend.sql no Supabase');
        } else {
          toast.error(error.message || 'Erro ao adicionar investimento');
        }
        throw error;
      }

      console.log('Gasto salvo com sucesso:', data);
      toast.success('Investimento adicionado com sucesso!');
      setMarketingSpend('');
      await loadMetrics();
    } catch (error) {
      console.error('Erro ao salvar gasto em marketing:', error);
      // Erro já foi tratado acima, não duplicar toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Calculadora de CAC e LTV
        </h2>
      </div>

      {/* Formulário para adicionar gasto */}
      <form onSubmit={handleAddSpend} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adicionar Investimento em Tráfego
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={marketingSpend}
              onChange={(e) => setMarketingSpend(e.target.value)}
              placeholder="0,00"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary whitespace-nowrap"
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </form>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Investido */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Investido</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            R$ {metrics.totalSpend.toFixed(2)}
          </p>
        </div>

        {/* Novos Clientes */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Novos Clientes</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {metrics.newCustomers}
          </p>
        </div>

        {/* CAC */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">CAC (Custo por Cliente)</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            R$ {metrics.cac.toFixed(2)}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Investimento / Novos Clientes
          </p>
        </div>

        {/* LTV */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">LTV (Lifetime Value)</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            R$ {metrics.ltv.toFixed(2)}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Receita média por cliente
          </p>
        </div>

        {/* Receita Média */}
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Receita Média</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            R$ {metrics.avgRevenue.toFixed(2)}
          </p>
        </div>

        {/* ROI */}
        <div className={`p-4 rounded-lg border ${
          metrics.roi > 0 
            ? 'bg-green-50 border-green-100' 
            : 'bg-red-50 border-red-100'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-5 h-5 ${metrics.roi > 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-medium ${metrics.roi > 0 ? 'text-green-900' : 'text-red-900'}`}>
              ROI (Retorno)
            </span>
          </div>
          <p className={`text-2xl font-bold ${metrics.roi > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {metrics.roi > 0 ? '+' : ''}{metrics.roi.toFixed(1)}%
          </p>
          <p className={`text-xs mt-1 ${metrics.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
            (Receita - Custo) / Custo
          </p>
        </div>
      </div>

      {/* Análise LTV/CAC */}
      {metrics.cac > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            📊 Análise LTV/CAC Ratio
          </p>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary-700">
              {(metrics.ltv / metrics.cac).toFixed(2)}x
            </div>
            <div className="text-sm text-gray-600">
              {metrics.ltv / metrics.cac >= 3 ? (
                <span className="text-green-600 font-medium">✅ Excelente! Ratio acima de 3:1</span>
              ) : metrics.ltv / metrics.cac >= 1 ? (
                <span className="text-yellow-600 font-medium">⚠️ Bom, mas pode melhorar</span>
              ) : (
                <span className="text-red-600 font-medium">❌ Atenção! LTV menor que CAC</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
