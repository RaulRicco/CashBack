import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { Users, Search, Eye, TrendingUp, Download, Cake, Crown, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Customers() {
  const { merchant } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [customersWithStats, setCustomersWithStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // Ordem alfabética por padrão
  const [filterType, setFilterType] = useState('all'); // all, birthday, topBuyers, topBuyersMonth

  useEffect(() => {
    if (merchant?.id) {
      loadCustomers();
    }
  }, [merchant]);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      // Buscar todas as transações do merchant
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('customer_id, amount, cashback_amount, created_at')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed');

      if (transError) throw transError;

      const customerIds = [...new Set(transactions?.map(t => t.customer_id) || [])];

      if (customerIds.length === 0) {
        setCustomers([]);
        setCustomersWithStats([]);
        setLoading(false);
        return;
      }

      // Buscar dados dos clientes
      const { data: customersData, error } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds);

      if (error) throw error;

      // Calcular estatísticas para cada cliente
      const now = new Date();
      const startMonth = startOfMonth(now);
      const endMonth = endOfMonth(now);

      const customersWithCalculatedStats = customersData.map(customer => {
        const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
        const frequency = customerTransactions.length;
        const totalSpent = customerTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const totalCashback = customerTransactions.reduce((sum, t) => sum + parseFloat(t.cashback_amount || 0), 0);

        // Calcular compras do mês atual
        const monthTransactions = customerTransactions.filter(t => {
          const transDate = new Date(t.created_at);
          return transDate >= startMonth && transDate <= endMonth;
        });
        const monthSpent = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        return {
          ...customer,
          frequency,
          calculated_total_spent: totalSpent,
          calculated_cashback: totalCashback,
          month_spent: monthSpent,
          month_frequency: monthTransactions.length
        };
      });

      // Ordenar alfabeticamente por padrão
      const sortedCustomers = customersWithCalculatedStats.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setCustomers(customersData || []);
      setCustomersWithStats(sortedCustomers);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se é aniversariante do dia
  const isBirthdayToday = (birthdate) => {
    if (!birthdate) return false;
    const today = new Date();
    const birth = new Date(birthdate);
    return birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate();
  };

  // Aplicar filtros
  const getFilteredCustomers = () => {
    let filtered = customersWithStats;

    // Aplicar filtro de busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.phone?.toLowerCase().includes(search) ||
        customer.name?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search)
      );
    }

    // Aplicar filtros especiais
    switch (filterType) {
      case 'birthday':
        filtered = filtered.filter(customer => isBirthdayToday(customer.birthdate));
        break;
      
      case 'topBuyers':
        // Top 10 maiores compradores (total)
        filtered = [...filtered]
          .sort((a, b) => b.calculated_total_spent - a.calculated_total_spent)
          .slice(0, 10);
        break;
      
      case 'topBuyersMonth':
        // Top 10 maiores compradores do mês
        filtered = [...filtered]
          .filter(c => c.month_spent > 0)
          .sort((a, b) => b.month_spent - a.month_spent)
          .slice(0, 10);
        break;
      
      default:
        // 'all' - sem filtro adicional
        break;
    }

    return filtered;
  };

  const filteredCustomers = getFilteredCustomers();

  // Função para exportar CSV
  const exportToCSV = () => {
    try {
      // Cabeçalho do CSV
      const headers = [
        'Nome',
        'Telefone',
        'Email',
        'Valor Gasto (R$)',
        'Frequência (compras)',
        'Cashback Acumulado (R$)',
        'Cashback Disponível (R$)',
        'Data Cadastro',
        'Última Compra'
      ];

      // Dados dos clientes
      const rows = filteredCustomers.map(customer => [
        customer.name || 'Nome não informado',
        customer.phone || '',
        customer.email || '',
        customer.calculated_total_spent?.toFixed(2) || '0.00',
        customer.frequency || 0,
        customer.calculated_cashback?.toFixed(2) || '0.00',
        parseFloat(customer.available_cashback || 0).toFixed(2),
        customer.created_at ? format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '',
        customer.last_purchase_at ? format(new Date(customer.last_purchase_at), 'dd/MM/yyyy', { locale: ptBR }) : ''
      ]);

      // Criar conteúdo CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Criar Blob e baixar
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_${format(new Date(), 'dd-MM-yyyy')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar CSV');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-primary-600" />
              Clientes
            </h1>
            <p className="text-gray-600 mt-1">
              {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por telefone, nome..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 w-64"
              />
            </div>

            <button
              onClick={exportToCSV}
              disabled={filteredCustomers.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filterType === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Todos ({customersWithStats.length})
          </button>

          <button
            onClick={() => setFilterType('birthday')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filterType === 'birthday'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Cake className="w-4 h-4" />
            Aniversariantes Hoje
            {customersWithStats.filter(c => isBirthdayToday(c.birthdate)).length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                {customersWithStats.filter(c => isBirthdayToday(c.birthdate)).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterType('topBuyers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filterType === 'topBuyers'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Crown className="w-4 h-4" />
            Top 10 Compradores
          </button>

          <button
            onClick={() => setFilterType('topBuyersMonth')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filterType === 'topBuyersMonth'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Top 10 do Mês
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Cashback Ativo</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {customers.reduce((sum, c) => sum + parseFloat(c.available_cashback || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Gasto</p>
            <p className="text-2xl font-bold text-primary-600">
              R$ {customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-orange-600">
              R$ {customers.length > 0 
                ? (customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0) / customers.length).toFixed(2)
                : '0.00'}
            </p>
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando clientes...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequência
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Gasto
                    </th>
                    {filterType === 'topBuyersMonth' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gasto Mês Atual
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cashback Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponível
                    </th>
                    {filterType === 'birthday' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aniversário
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer, index) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(filterType === 'topBuyers' || filterType === 'topBuyersMonth') && (
                            <div className="flex-shrink-0">
                              {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                              {index === 1 && <Crown className="w-5 h-5 text-gray-400" />}
                              {index === 2 && <Crown className="w-5 h-5 text-orange-400" />}
                              {index > 2 && <span className="text-gray-400 font-bold">#{index + 1}</span>}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {customer.name || 'Nome não informado'}
                              {filterType === 'birthday' && isBirthdayToday(customer.birthdate) && (
                                <Cake className="w-4 h-4 text-pink-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                            {customer.email && (
                              <div className="text-xs text-gray-400">{customer.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          {customer.frequency || 0} {customer.frequency === 1 ? 'compra' : 'compras'}
                        </div>
                        {filterType === 'topBuyersMonth' && customer.month_frequency > 0 && (
                          <div className="text-xs text-gray-500">
                            {customer.month_frequency} no mês
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {(customer.calculated_total_spent || 0).toFixed(2)}
                        </div>
                      </td>
                      {filterType === 'topBuyersMonth' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-orange-600">
                            R$ {(customer.month_spent || 0).toFixed(2)}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-orange-600">
                          R$ {(customer.calculated_cashback || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          R$ {parseFloat(customer.available_cashback || 0).toFixed(2)}
                        </div>
                      </td>
                      {filterType === 'birthday' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.birthdate 
                              ? format(new Date(customer.birthdate), 'dd/MM', { locale: ptBR })
                              : '-'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          Cadastro: {customer.created_at 
                            ? format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
