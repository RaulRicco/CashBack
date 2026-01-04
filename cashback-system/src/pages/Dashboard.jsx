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
  Calendar,
  Lock
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import CACLTVCalculator from '../components/CACLTVCalculator';
import TrialBanner from '../components/TrialBanner';
import { useSubscription } from '../hooks/useSubscription';

export default function Dashboard() {
  const { merchant } = useAuthStore();
  const { checkFeature, currentPlan } = useSubscription();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalTransactions: 0,
    totalCashbackGiven: 0,
    totalRedemptions: 0,
    newCustomersThisMonth: 0,
    averageTicket: 0,
    totalRevenue: 0
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

      // Buscar TODAS as transações deste merchant (para calcular total de clientes)
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('customer_id, created_at')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      // Total de clientes únicos deste merchant
      const uniqueCustomerIds = [...new Set(allTransactions?.map(t => t.customer_id) || [])];
      const totalCustomers = uniqueCustomerIds.length;

      // Transações no período selecionado
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

      // Novos clientes do período (clientes cuja PRIMEIRA transação foi neste período)
      const newCustomersSet = new Set();
      uniqueCustomerIds.forEach(customerId => {
        // Primeira transação deste cliente
        const firstTransaction = allTransactions.find(t => t.customer_id === customerId);
        
        // Verificar se a primeira transação foi no período selecionado
        if (firstTransaction) {
          const firstDate = new Date(firstTransaction.created_at);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end + 'T23:59:59');
          
          if (firstDate >= startDate && firstDate <= endDate) {
            newCustomersSet.add(customerId);
          }
        }
      });
      
      const newCustomersThisMonth = newCustomersSet.size;

      const totalTransactions = transactions?.length || 0;
      const totalCashbackGiven = transactions?.reduce((sum, t) => sum + parseFloat(t.cashback_amount), 0) || 0;
      const totalRedemptions = redemptions?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
      const totalAmount = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const averageTicket = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

      setStats({
        totalCustomers: totalCustomers,
        totalTransactions,
        totalCashbackGiven,
        totalRedemptions,
        newCustomersThisMonth: newCustomersThisMonth,
        averageTicket,
        totalRevenue: totalAmount
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
        {/* Trial Banner */}
        {merchant?.id && <TrialBanner merchantId={merchant.id} />}
        
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
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="indigo"
          />
          
          <StatsCard
            title="Ticket Médio"
            value={`R$ ${stats.averageTicket.toFixed(2)}`}
            icon={DollarSign}
            color="orange"
          />
        </div>

        {/* CAC & LTV Calculator - Feature Premium */}
        {checkFeature('dashboard_cac_ltv') ? (
          <CACLTVCalculator 
            merchantId={merchant?.id}
            dateRange={dateRange}
          />
        ) : (
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-8 overflow-hidden">
            {/* Blur Background */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/40"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Dashboard CAC/LTV Exclusivo
              </h3>
              
              <p className="text-gray-700 mb-1 max-w-2xl mx-auto">
                Descubra quanto custa conquistar cada cliente (CAC) e quanto ele vale ao longo do tempo (LTV).
                <br />
                <strong>Disponível nos planos Business e Premium.</strong>
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
                <span className="font-semibold">Seu plano atual:</span>
                <span className="px-3 py-1 bg-white rounded-full border border-gray-300">
                  {currentPlan?.name || 'Starter'}
                </span>
              </div>
              
              <Link
                to="/dashboard/planos"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-5 h-5" />
                Fazer Upgrade Agora
              </Link>
              
              <p className="text-xs text-gray-500 mt-4">
                A partir de <strong>R$ 297/mês</strong> no plano Business
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cashback Pendente */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Cashback Ativo
              </h3>
              <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              R$ {stats.totalCashbackGiven.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total distribuído no período
            </p>
          </div>

          {/* Resgates */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Resgates Realizados
              </h3>
              <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              R$ {stats.totalRedemptions.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total resgatado no período
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
