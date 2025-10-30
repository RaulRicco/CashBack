import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { Users, Search, Eye, TrendingUp, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Customers() {
  const { merchant } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [customersWithStats, setCustomersWithStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // Ordem alfabética por padrão

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
        .select('customer_id, amount, cashback_amount')
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
      const customersWithCalculatedStats = customersData.map(customer => {
        const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
        const frequency = customerTransactions.length;
        const totalSpent = customerTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const totalCashback = customerTransactions.reduce((sum, t) => sum + parseFloat(t.cashback_amount || 0), 0);

        return {
          ...customer,
          frequency,
          calculated_total_spent: totalSpent,
          calculated_cashback: totalCashback
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

  const filteredCustomers = customersWithStats.filter(customer => {
    const search = searchTerm.toLowerCase();
    return (
      customer.phone?.toLowerCase().includes(search) ||
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search)
    );
  });

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cashback Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponível
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {customer.name || 'Nome não informado'}
                          </div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                          {customer.email && (
                            <div className="text-xs text-gray-400">{customer.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          {customer.frequency || 0} {customer.frequency === 1 ? 'compra' : 'compras'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {(customer.calculated_total_spent || 0).toFixed(2)}
                        </div>
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => window.open(`/customer/dashboard/${customer.phone}`, '_blank')}
                          className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalhes
                        </button>
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
