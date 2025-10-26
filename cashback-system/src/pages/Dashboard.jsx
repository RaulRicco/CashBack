import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import CACLTVCalculator from '../components/CACLTVCalculator';

export default function Dashboard() {
  const { merchant } = useAuthStore();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalTransactions: 0,
    totalCashbackGiven: 0,
    totalRedemptions: 0,
    newCustomersThisMonth: 0,
    averageTicket: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (merchant?.id) {
      loadDashboardData();
    }
  }, [merchant, dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Total de clientes únicos
      const { count: totalCustomers } = await supabase
        .from('transactions')
        .select('customer_id', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id);

      // Transações no período
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('transaction_type', 'cashback')
        .eq('status', 'completed')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      // Resgates no período
      const { data: redemptions } = await supabase
        .from('redemptions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      // Novos clientes do mês
      const { count: newCustomersThisMonth } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      const totalTransactions = transactions?.length || 0;
      const totalCashbackGiven = transactions?.reduce((sum, t) => sum + parseFloat(t.cashback_amount), 0) || 0;
      const totalRedemptions = redemptions?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
      const totalAmount = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const averageTicket = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

      setStats({
        totalCustomers: totalCustomers || 0,
        totalTransactions,
        totalCashbackGiven,
        totalRedemptions,
        newCustomersThisMonth: newCustomersThisMonth || 0,
        averageTicket
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo ao painel de controle do {merchant?.name}
            </p>
          </div>

          {/* Filtro de Data */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Clientes"
            value={stats.totalCustomers}
            icon={Users}
            color="blue"
            trend={stats.newCustomersThisMonth > 0 ? `+${stats.newCustomersThisMonth} este mês` : undefined}
          />
          
          <StatsCard
            title="Transações"
            value={stats.totalTransactions}
            icon={TrendingUp}
            color="green"
          />
          
          <StatsCard
            title="Cashback Distribuído"
            value={`R$ ${stats.totalCashbackGiven.toFixed(2)}`}
            icon={Gift}
            color="purple"
          />
          
          <StatsCard
            title="Ticket Médio"
            value={`R$ ${stats.averageTicket.toFixed(2)}`}
            icon={DollarSign}
            color="orange"
          />
        </div>

        {/* CAC & LTV Calculator */}
        <CACLTVCalculator 
          merchantId={merchant?.id}
          dateRange={dateRange}
        />

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cashback Pendente */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cashback Ativo
              </h3>
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              R$ {stats.totalCashbackGiven.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              Total distribuído no período
            </p>
          </div>

          {/* Resgates */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Resgates Realizados
              </h3>
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              R$ {stats.totalRedemptions.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              Total resgatado no período
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
