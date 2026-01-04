import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { UserPlus, Users, Plus, Edit, X, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSubscription } from '../hooks/useSubscription';

export default function Employees() {
  const { merchant } = useAuthStore();
  const { subscriptionData, employeeCount, checks, currentPlan } = useSubscription();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator',
    permissions: {
      dashboard: true,
      cashback: true,
      redemption: true,
      customers: true,
      employees: false,
      reports: true,
      integrations: false,
      whitelabel: false,
      settings: false
    }
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
    
    if (!formData.password || formData.password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    try {
      // 🔒 VERIFICAR LIMITE DE FUNCIONÁRIOS DO PLANO
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('subscription_plan, employee_limit')
        .eq('id', merchant.id)
        .single();

      // Se existe limite, verificar se foi atingido
      if (merchantData?.employee_limit) {
        // Contar funcionários atuais
        const { count: currentEmployeeCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchant.id);

        // Verificar se atingiu o limite
        if (currentEmployeeCount >= merchantData.employee_limit) {
          toast.error(
            `Limite de funcionários atingido (${merchantData.employee_limit}). Faça upgrade do seu plano!`,
            { duration: 5000 }
          );
          return;
        }
      }

      const { error } = await supabase
        .from('employees')
        .insert({
          merchant_id: merchant.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password, // Senha em texto plano (temporário)
          permissions: formData.permissions,
          is_active: true
        });

      if (error) throw error;

      toast.success('Funcionário adicionado com sucesso!');
      setShowAddForm(false);
      setFormData({ 
        name: '', 
        email: '', 
        password: '',
        role: 'operator',
        permissions: {
          dashboard: true,
          cashback: true,
          redemption: true,
          customers: true,
          employees: false,
          reports: true,
          integrations: false,
          whitelabel: false,
          settings: false
        }
      });
      loadEmployees();
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      toast.error('Erro ao adicionar funcionário');
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions
      };

      // Só atualizar senha se foi fornecida
      if (formData.password && formData.password.length >= 6) {
        updateData.password = formData.password;
      }

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', editingEmployee.id);

      if (error) throw error;

      toast.success('Funcionário atualizado com sucesso!');
      setEditingEmployee(null);
      setFormData({ 
        name: '', 
        email: '', 
        password: '',
        role: 'operator',
        permissions: {
          dashboard: true,
          cashback: true,
          redemption: true,
          customers: true,
          employees: false,
          reports: true,
          integrations: false,
          whitelabel: false,
          settings: false
        }
      });
      loadEmployees();
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error('Erro ao atualizar funcionário');
    }
  };

  const startEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '', // Não preencher senha ao editar
      role: employee.role,
      permissions: employee.permissions || {
        dashboard: true,
        cashback: true,
        redemption: true,
        customers: true,
        employees: false,
        reports: true,
        integrations: false,
        whitelabel: false,
        settings: false
      }
    });
    setShowAddForm(false); // Fechar form de adicionar se estiver aberto
  };

  const cancelEdit = () => {
    setEditingEmployee(null);
    setFormData({ 
      name: '', 
      email: '', 
      password: '',
      role: 'operator',
      permissions: {
        dashboard: true,
        cashback: true,
        redemption: true,
        customers: true,
        employees: false,
        reports: true,
        integrations: false,
        whitelabel: false,
        settings: false
      }
    });
  };

  const handlePermissionChange = (permission) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: !formData.permissions[permission]
      }
    });
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

  // Calcular porcentagem de uso
  const usagePercentage = subscriptionData?.employee_limit 
    ? (employeeCount / subscriptionData.employee_limit) * 100
    : 0;

  const isNearLimit = usagePercentage > 80;
  const isAtLimit = !checks.canAddEmployee && subscriptionData?.employee_limit;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <UserPlus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              Funcionários
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie os funcionários que podem acessar o sistema
            </p>
          </div>
          <button
            onClick={() => {
              // Verificar limite antes de abrir form
              if (!checks.canAddEmployee && subscriptionData?.employee_limit) {
                toast.error(
                  `Limite de funcionários atingido (${subscriptionData.employee_limit}). Faça upgrade!`,
                  { duration: 5000 }
                );
                return;
              }
              setShowAddForm(!showAddForm);
              setEditingEmployee(null);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Funcionário
          </button>
        </div>

        {/* 🔒 Alerta de Limite */}
        {isAtLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Limite de Funcionários Atingido
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  Você atingiu o limite de {subscriptionData.employee_limit} funcionário(s) do plano{' '}
                  <strong>{currentPlan?.name}</strong>. Faça upgrade para adicionar mais.
                </p>
                <Link
                  to="/dashboard/planos"
                  className="inline-flex items-center text-sm font-semibold text-red-800 hover:text-red-900"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Ver planos disponíveis
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ⚠️ Alerta Próximo do Limite */}
        {isNearLimit && !isAtLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Próximo do Limite
                </h3>
                <p className="text-sm text-yellow-700">
                  Você está usando {employeeCount} de {subscriptionData.employee_limit} funcionário(s).
                  Considere fazer upgrade para evitar interrupções.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Banner de Uso */}
        {subscriptionData?.employee_limit && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uso de Funcionários
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {employeeCount} de {subscriptionData.employee_limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAtLimit
                    ? 'bg-red-600'
                    : isNearLimit
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Formulário de Adicionar */}
        {showAddForm && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Novo Funcionário
            </h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              {/* Permissões */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissões de Acesso
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.dashboard}
                      onChange={() => handlePermissionChange('dashboard')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dashboard</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.cashback}
                      onChange={() => handlePermissionChange('cashback')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Cashback</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.redemption}
                      onChange={() => handlePermissionChange('redemption')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Resgate</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.customers}
                      onChange={() => handlePermissionChange('customers')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Clientes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.employees}
                      onChange={() => handlePermissionChange('employees')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Funcionários</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.reports}
                      onChange={() => handlePermissionChange('reports')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Relatórios</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.integrations}
                      onChange={() => handlePermissionChange('integrations')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Integrações</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.whitelabel}
                      onChange={() => handlePermissionChange('whitelabel')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Meu CashBack</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.settings}
                      onChange={() => handlePermissionChange('settings')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Configurações</span>
                  </label>
                </div>
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

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                ℹ️ <strong>Senha temporária:</strong> Por padrão, será enviada por email (funcionalidade a ser implementada)
              </p>
            </div>
          </div>
        )}

        {/* Formulário de Editar */}
        {editingEmployee && (
          <div className="card border-2 border-primary-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Editar Funcionário
              </h2>
              <button
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nova Senha (deixe em branco para manter a atual)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  minLength={6}
                  className="input"
                  placeholder="Mínimo 6 caracteres (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              {/* Permissões */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissões de Acesso
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.dashboard}
                      onChange={() => handlePermissionChange('dashboard')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dashboard</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.cashback}
                      onChange={() => handlePermissionChange('cashback')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Cashback</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.redemption}
                      onChange={() => handlePermissionChange('redemption')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Resgate</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.customers}
                      onChange={() => handlePermissionChange('customers')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Clientes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.employees}
                      onChange={() => handlePermissionChange('employees')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Funcionários</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.reports}
                      onChange={() => handlePermissionChange('reports')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Relatórios</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.integrations}
                      onChange={() => handlePermissionChange('integrations')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Integrações</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.whitelabel}
                      onChange={() => handlePermissionChange('whitelabel')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Meu CashBack</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.settings}
                      onChange={() => handlePermissionChange('settings')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Configurações</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-400">
                ⚠️ <strong>Atenção:</strong> Deixe o campo senha em branco para manter a senha atual do funcionário.
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
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhum funcionário cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-500 text-primary-800 dark:text-black capitalize">
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          employee.is_active
                            ? 'bg-green-100 dark:bg-green-500 text-green-800 dark:text-black'
                            : 'bg-red-100 dark:bg-red-500 text-red-800 dark:text-black'
                        }`}>
                          {employee.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEditEmployee(employee)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center gap-1"
                            title="Editar funcionário"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => toggleEmployeeStatus(employee.id, employee.is_active)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                            title={employee.is_active ? 'Desativar funcionário' : 'Ativar funcionário'}
                          >
                            {employee.is_active ? 'Desativar' : 'Ativar'}
                          </button>
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
