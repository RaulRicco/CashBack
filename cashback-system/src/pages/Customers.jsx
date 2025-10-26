import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { Users, Search, Eye, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Customers() {
  const { merchant } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('last_purchase_at');

  useEffect(() => {
    if (merchant?.id) {
      loadCustomers();
    }
  }, [merchant]);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      // Buscar clientes únicos que compraram neste merchant
      const { data: transactions } = await supabase
        .from('transactions')
        .select('customer_id')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed');

      const customerIds = [...new Set(transactions?.map(t => t.customer_id) || [])];

      if (customerIds.length === 0) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      // Buscar dados dos clientes
      const { data: customersData, error } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds)
        .order(sortBy, { ascending: false });

      if (error) throw error;

      setCustomers(customersData || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase();
    return (
      customer.phone?.toLowerCase().includes(search) ||
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search)
    );
  });

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

          {/* Search */}
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

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                loadCustomers();
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="last_purchase_at">Última compra</option>
              <option value="total_spent">Total gasto</option>
              <option value="available_cashback">Saldo disponível</option>
              <option value="created_at">Data cadastro</option>
            </select>
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
                      Total Gasto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cashback Disponível
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Compra
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
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {parseFloat(customer.total_spent || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          R$ {parseFloat(customer.available_cashback || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.last_purchase_at
                          ? format(new Date(customer.last_purchase_at), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
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
