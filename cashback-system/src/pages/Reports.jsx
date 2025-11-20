import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { TrendingUp, Calendar, Download } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reports() {
  const { merchant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [chartData, setChartData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    totalCashback: 0,
    totalRedemptions: 0
  });

  useEffect(() => {
    if (merchant?.id) {
      loadReportData();
    }
  }, [merchant, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Buscar transações
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      // Buscar resgates
      const { data: redemptions } = await supabase
        .from('redemptions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      // Calcular resumo
      const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const totalCashback = transactions?.reduce((sum, t) => sum + parseFloat(t.cashback_amount), 0) || 0;
      const totalRedemptions = redemptions?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

      setSummaryData({
        totalTransactions: transactions?.length || 0,
        totalRevenue,
        totalCashback,
        totalRedemptions
      });

      // Preparar dados para gráfico (por dia)
      const days = eachDayOfInterval({
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      });

      const chartDataByDay = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayTransactions = transactions?.filter(t => 
          t.created_at.startsWith(dayStr)
        ) || [];
        const dayRedemptions = redemptions?.filter(r => 
          r.created_at.startsWith(dayStr)
        ) || [];

        return {
          date: format(day, 'dd/MM'),
          transacoes: dayTransactions.length,
          receita: dayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0),
          cashback: dayTransactions.reduce((sum, t) => sum + parseFloat(t.cashback_amount), 0),
          resgates: dayRedemptions.reduce((sum, r) => sum + parseFloat(r.amount), 0)
        };
      });

      setChartData(chartDataByDay);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implementar exportação para CSV/Excel
    alert('Exportação em desenvolvimento');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              Relatórios e Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análise detalhada do desempenho do seu cashback
            </p>
          </div>

          <div className="flex gap-2">
            {/* Filtro de Data */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-500 dark:text-gray-400">até</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Transações</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{summaryData.totalTransactions}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Receita Total</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">R$ {summaryData.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cashback Distribuído</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">R$ {summaryData.totalCashback.toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Resgatado</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">R$ {summaryData.totalRedemptions.toFixed(2)}</p>
          </div>
        </div>

        {/* Gráfico de Receita e Cashback */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Receita vs Cashback
          </h2>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `R$ ${parseFloat(value).toFixed(2)}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Receita"
                />
                <Line 
                  type="monotone" 
                  dataKey="cashback" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Cashback"
                />
                <Line 
                  type="monotone" 
                  dataKey="resgates" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Resgates"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico de Transações */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Número de Transações por Dia
          </h2>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="transacoes" fill="#0ea5e9" name="Transações" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Insights */}
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800">
          <h2 className="text-xl font-bold text-primary-900 dark:text-primary-300 mb-4">
            📊 Insights do Período
          </h2>
          <div className="space-y-2 text-primary-800 dark:text-primary-300">
            <p>
              • <strong>Ticket Médio:</strong> R$ {
                summaryData.totalTransactions > 0 
                  ? (summaryData.totalRevenue / summaryData.totalTransactions).toFixed(2)
                  : '0.00'
              }
            </p>
            <p>
              • <strong>Cashback Médio:</strong> R$ {
                summaryData.totalTransactions > 0 
                  ? (summaryData.totalCashback / summaryData.totalTransactions).toFixed(2)
                  : '0.00'
              }
            </p>
            <p>
              • <strong>Taxa de Resgate:</strong> {
                summaryData.totalCashback > 0 
                  ? ((summaryData.totalRedemptions / summaryData.totalCashback) * 100).toFixed(1)
                  : '0'
              }%
            </p>
            <p>
              • <strong>Cashback Pendente:</strong> R$ {
                (summaryData.totalCashback - summaryData.totalRedemptions).toFixed(2)
              }
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
