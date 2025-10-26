import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { UserPlus, Users, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Employees() {
  const { merchant } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'operator'
  });

  useEffect(() => {
    if (merchant?.id) {
      loadEmployees();
    }
  }, [merchant]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('employees')
        .insert({
          merchant_id: merchant.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password_hash: 'temp_password_hash', // TODO: Implementar hash real
          is_active: true
        });

      if (error) throw error;

      toast.success('Funcionário adicionado com sucesso!');
      setShowAddForm(false);
      setFormData({ name: '', email: '', role: 'operator' });
      loadEmployees();
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      toast.error('Erro ao adicionar funcionário');
    }
  };

  const toggleEmployeeStatus = async (employeeId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: !currentStatus })
        .eq('id', employeeId);

      if (error) throw error;

      toast.success(`Funcionário ${!currentStatus ? 'ativado' : 'desativado'}`);
      loadEmployees();
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-8 h-8 text-primary-600" />
              Funcionários
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie os funcionários que podem acessar o sistema
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Funcionário
          </button>
        </div>

        {/* Formulário de Adicionar */}
        {showAddForm && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Novo Funcionário
            </h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input"
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input"
                  placeholder="joao@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input"
                >
                  <option value="operator">Operador</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', email: '', role: 'operator' });
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Senha temporária:</strong> Por padrão, será enviada por email (funcionalidade a ser implementada)
              </p>
            </div>
          </div>
        )}

        {/* Lista de Funcionários */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum funcionário cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 capitalize">
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          employee.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => toggleEmployeeStatus(employee.id, employee.is_active)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {employee.is_active ? 'Desativar' : 'Ativar'}
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
