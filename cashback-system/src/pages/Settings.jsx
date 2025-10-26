import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Share2, 
  Copy, 
  Check,
  Percent,
  TrendingUp,
  Code,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Save
} from 'lucide-react';

export default function Settings() {
  const { merchant, employee } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);
  const [showGTM, setShowGTM] = useState(false);
  const [showPixel, setShowPixel] = useState(false);
  
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    cashback_percentage: 5.0,
    cashback_program_name: '',
    cashback_expires: false,
    cashback_expiration_days: 180,
    cashback_available_immediately: true,
    custom_domain: '',
    gtm_id: '',
    meta_pixel_id: '',
    signup_link_slug: '',
    logo_url: '',
  });

  // Estado para perfil do usuário (employee)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  const [signupUrl, setSignupUrl] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Atualizar URL de cadastro quando o slug mudar
    if (settings.signup_link_slug) {
      const baseUrl = settings.custom_domain 
        ? `https://${settings.custom_domain}`
        : window.location.origin;
      setSignupUrl(`${baseUrl}/signup/${settings.signup_link_slug}`);
    }
  }, [settings.signup_link_slug, settings.custom_domain]);

  const loadSettings = async () => {
    try {
      if (!merchant || !merchant.id) {
        throw new Error('Merchant não encontrado. Faça login novamente.');
      }

      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchant.id)
        .single();

      if (error) throw error;

      setSettings({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        cashback_percentage: data.cashback_percentage || 5.0,
        cashback_program_name: data.cashback_program_name || (data.name + ' - Cashback'),
        cashback_expires: data.cashback_expires ?? false,
        cashback_expiration_days: data.cashback_expiration_days || 180,
        cashback_available_immediately: data.cashback_available_immediately ?? true,
        custom_domain: data.custom_domain || '',
        gtm_id: data.gtm_id || '',
        meta_pixel_id: data.meta_pixel_id || '',
        signup_link_slug: data.signup_link_slug || '',
        logo_url: data.logo_url || '',
      });

      // Carregar dados do perfil do usuário
      if (employee && employee.id) {
        setProfileData({
          name: employee.name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          role: employee.role || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error(error.message || 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      if (!employee || !employee.id) {
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }

      // Validações
      if (!profileData.name.trim()) {
        toast.error('Nome é obrigatório');
        setSaving(false);
        return;
      }

      if (!profileData.email.trim()) {
        toast.error('Email é obrigatório');
        setSaving(false);
        return;
      }

      const updateData = {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim() || null,
      };

      console.log('Salvando perfil:', { employeeId: employee.id, updateData });

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employee.id)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Perfil salvo com sucesso:', data);
      toast.success('Perfil atualizado com sucesso!');
      
      // Atualizar store com novos dados
      if (data && data[0]) {
        const updatedEmployee = { ...employee, ...data[0] };
        useAuthStore.getState().setEmployee(updatedEmployee);
      }

      // Recarregar para atualizar dados
      await loadSettings();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error(error.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (section) => {
    setSaving(true);

    try {
      if (!merchant || !merchant.id) {
        throw new Error('Merchant não encontrado. Faça login novamente.');
      }

      const updateData = {};

      if (section === 'general') {
        updateData.name = settings.name;
        updateData.phone = settings.phone;
        updateData.cashback_percentage = parseFloat(settings.cashback_percentage);
      } else if (section === 'cashback') {
        updateData.cashback_program_name = settings.cashback_program_name;
        updateData.cashback_expires = settings.cashback_expires;
        updateData.cashback_expiration_days = parseInt(settings.cashback_expiration_days);
        updateData.cashback_available_immediately = settings.cashback_available_immediately;
      } else if (section === 'domain') {
        updateData.custom_domain = settings.custom_domain || null;
        updateData.signup_link_slug = settings.signup_link_slug;
      } else if (section === 'marketing') {
        updateData.gtm_id = settings.gtm_id || null;
        updateData.meta_pixel_id = settings.meta_pixel_id || null;
      }

      console.log('Salvando dados:', { merchantId: merchant.id, updateData, section });

      const { data, error } = await supabase
        .from('merchants')
        .update(updateData)
        .eq('id', merchant.id)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Dados salvos com sucesso:', data);
      toast.success('Configurações salvas com sucesso!');
      
      // Recarregar para atualizar dados
      await loadSettings();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const validateCashbackPercentage = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0.1 || num > 100) {
      return false;
    }
    return true;
  };

  const handleCashbackChange = (e) => {
    const value = e.target.value;
    setSettings({ ...settings, cashback_percentage: value });
  };

  const handleCashbackBlur = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0.1) {
      setSettings({ ...settings, cashback_percentage: 0.1 });
    } else if (value > 100) {
      setSettings({ ...settings, cashback_percentage: 100 });
    } else {
      setSettings({ ...settings, cashback_percentage: value.toFixed(2) });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        </div>
        <p className="text-gray-600">Gerencie as configurações da sua conta e cashback</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Meu Perfil
            </div>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveTab('cashback')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'cashback'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Cashback
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'signup'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Link de Cadastro
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'marketing'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Marketing
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Meu Perfil
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Gerencie suas informações pessoais e de contato
              </p>
              
              <div className="space-y-4 max-w-2xl">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Este nome será exibido no sistema
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Usado para login e notificações
                  </p>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Número de contato (opcional)
                  </p>
                </div>

                {/* Função/Cargo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Função no Sistema
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 capitalize">
                      {profileData.role === 'owner' && '👑 Proprietário'}
                      {profileData.role === 'manager' && '👔 Gerente'}
                      {profileData.role === 'employee' && '👤 Funcionário'}
                      {!profileData.role && '👤 Usuário'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Seu nível de acesso no sistema
                  </p>
                </div>

                {/* Informações adicionais */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    ℹ️ Informações
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• O email é usado para fazer login no sistema</li>
                    <li>• Apenas proprietários podem alterar configurações do estabelecimento</li>
                    <li>• Para alterar sua função, contate o proprietário</li>
                  </ul>
                </div>

                {/* Botão Salvar */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Salvar Perfil
                      </>
                    )}
                  </button>
                  
                  <p className="text-sm text-gray-500">
                    * Campos obrigatórios
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Informações Gerais</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Estabelecimento
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email não pode ser alterado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleSave('general')}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cashback Settings */}
        {activeTab === 'cashback' && (
          <div className="space-y-6">
            {/* Nome do Programa */}
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Nome do Programa de Cashback
              </h2>
              <p className="text-gray-600 mb-4">
                Nome personalizado que aparecerá para seus clientes
              </p>
              <input
                type="text"
                value={settings.cashback_program_name}
                onChange={(e) => setSettings({ ...settings, cashback_program_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Programa Fidelidade João"
              />
            </div>

            {/* Percentual de Cashback */}
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                Percentual de Cashback
              </h2>
              <p className="text-gray-600 mb-4">
                Defina o percentual de cashback que seus clientes vão ganhar em cada compra
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Percentual Atual</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-blue-600">
                        {parseFloat(settings.cashback_percentage).toFixed(2)}
                      </span>
                      <span className="text-2xl text-blue-600">%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-full">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Clientes ganham R$ {(parseFloat(settings.cashback_percentage) / 100 * 100).toFixed(2)} 
                  {' '}a cada R$ 100,00 em compras
                </p>
              </div>

              <div className="relative mb-4">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="100"
                  value={settings.cashback_percentage}
                  onChange={(e) => setSettings({ ...settings, cashback_percentage: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="5.00"
                />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Disponibilidade Imediata */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-2">
                Disponibilidade do Cashback
              </h2>
              <p className="text-gray-600 mb-4">
                Defina quando o cashback fica disponível para uso
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cashback_available_immediately}
                    onChange={(e) => setSettings({ ...settings, cashback_available_immediately: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Disponível imediatamente</p>
                    <p className="text-sm text-gray-600">
                      O cashback fica disponível assim que a compra é registrada
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Expiração do Cashback */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-2">
                Expiração do Cashback
              </h2>
              <p className="text-gray-600 mb-4">
                Defina se o cashback tem validade
              </p>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cashback_expires}
                    onChange={(e) => setSettings({ ...settings, cashback_expires: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Cashback expira após um período</p>
                    <p className="text-sm text-gray-600">
                      Defina um prazo de validade para o cashback acumulado
                    </p>
                  </div>
                </label>

                {settings.cashback_expires && (
                  <div className="ml-8 space-y-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prazo de Validade (em dias)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="3650"
                        value={settings.cashback_expiration_days}
                        onChange={(e) => setSettings({ ...settings, cashback_expiration_days: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="180"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Sugerido: 180 dias (6 meses) | 365 dias (1 ano)
                      </p>
                    </div>

                    {settings.cashback_expiration_days && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Resumo:</strong> O cashback expirará {settings.cashback_expiration_days} dias 
                          após a compra ({Math.floor(settings.cashback_expiration_days / 30)} meses 
                          {settings.cashback_expiration_days % 30 > 0 && ` e ${settings.cashback_expiration_days % 30} dias`})
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Botão Salvar */}
            <button
              onClick={() => handleSave('cashback')}
              disabled={saving}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações de Cashback'}
            </button>
          </div>
        )}

        {/* Signup Link Settings */}
        {activeTab === 'signup' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Link de Cadastro de Clientes
              </h2>
              <p className="text-gray-600 mb-6">
                Compartilhe este link para que novos clientes se cadastrem no seu programa de cashback
              </p>

              {/* Link de Cadastro Atual */}
              {signupUrl && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Seu Link de Cadastro:</p>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-3 border-2 border-green-200">
                    <code className="flex-1 text-sm text-green-700 font-mono break-all">
                      {signupUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(signupUrl)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      title="Copiar link"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 Compartilhe nas redes sociais, WhatsApp ou coloque no seu site
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Domínio Personalizado (opcional)
                  </label>
                  <input
                    type="text"
                    value={settings.custom_domain}
                    onChange={(e) => setSettings({ ...settings, custom_domain: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="cashback.minhaloja.com.br"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Configure um domínio personalizado para usar nos links de cashback. 
                    Ex: cashback.seusite.com.br
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug do Link (identificador único)
                  </label>
                  <input
                    type="text"
                    value={settings.signup_link_slug}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      signup_link_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="minha-loja"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Use apenas letras minúsculas, números e hífens. 
                    Gerado automaticamente se deixado em branco.
                  </p>
                </div>

                <button
                  onClick={() => handleSave('domain')}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>

              {/* Instruções de Configuração DNS */}
              <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Como Configurar Seu Domínio Próprio
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">📝 Passo 1: Acessar o Painel de DNS</p>
                    <p className="text-gray-700">
                      Entre no painel do provedor onde você registrou seu domínio (Registro.br, Hostgator, Locaweb, GoDaddy, etc.)
                      e procure por "DNS", "Zona DNS" ou "Gerenciar DNS".
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">⚙️ Passo 2: Criar Registro CNAME</p>
                    <div className="bg-gray-50 rounded p-3 font-mono text-xs mt-2">
                      <p className="text-gray-600 mb-1">Tipo: <span className="text-blue-600 font-semibold">CNAME</span></p>
                      <p className="text-gray-600 mb-1">Nome/Host: <span className="text-blue-600 font-semibold">cashback</span></p>
                      <p className="text-gray-600">Destino/Aponta para: <span className="text-blue-600 font-semibold">5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai</span></p>
                    </div>
                    <p className="text-gray-600 mt-2 text-xs">
                      ⚠️ Não adicione http://, https:// ou / no destino
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">⏱️ Passo 3: Aguardar Propagação</p>
                    <p className="text-gray-700">
                      Após salvar o registro DNS, aguarde de <strong>15 minutos a 2 horas</strong> para que a configuração
                      se propague pela internet.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">✅ Passo 4: Configurar Aqui</p>
                    <p className="text-gray-700">
                      Após a propagação, volte aqui e digite seu domínio completo no campo acima
                      (ex: <code className="bg-gray-100 px-2 py-1 rounded">cashback.seudominio.com.br</code>)
                      e clique em Salvar.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">🧪 Passo 5: Testar</p>
                    <p className="text-gray-700 mb-2">
                      Teste se está funcionando acessando seu domínio no navegador:
                    </p>
                    <code className="block bg-gray-100 px-3 py-2 rounded text-blue-600">
                      https://cashback.seudominio.com.br
                    </code>
                  </div>
                </div>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">💡 Dica Importante:</p>
                  <p className="text-sm text-yellow-700">
                    Use um <strong>subdomínio</strong> (como cashback.seudominio.com.br) ao invés do domínio principal.
                    Assim seu site principal não é afetado.
                  </p>
                </div>

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-2">🆘 Precisa de Ajuda?</p>
                  <p className="text-sm text-blue-700 mb-2">
                    Entre em contato com o suporte do seu provedor e peça:
                  </p>
                  <div className="bg-white rounded p-3 text-xs font-mono text-gray-700">
                    "Olá, gostaria de adicionar um registro CNAME apontando<br />
                    cashback.meudominio.com.br para<br />
                    5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai"
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marketing Settings */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                Configurações de Marketing
              </h2>
              <p className="text-gray-600 mb-6">
                Configure o Google Tag Manager e Meta Pixel para rastrear conversões e comportamento dos clientes
              </p>

              <div className="space-y-6">
                {/* Google Tag Manager */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                      <Code className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Google Tag Manager</h3>
                      <p className="text-sm text-gray-600">
                        ID do container GTM (ex: GTM-XXXXXXX)
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showGTM ? "text" : "password"}
                      value={settings.gtm_id}
                      onChange={(e) => setSettings({ ...settings, gtm_id: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="GTM-XXXXXXX"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGTM(!showGTM)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showGTM ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="mt-3 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Eventos rastreados:</strong> PageView, CashbackGenerated, CashbackScanned, 
                      Purchase, RedemptionGenerated, RedemptionCompleted
                    </p>
                  </div>
                </div>

                {/* Meta Pixel */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Code className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Meta Pixel (Facebook)</h3>
                      <p className="text-sm text-gray-600">
                        ID do Meta Pixel (somente números)
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showPixel ? "text" : "password"}
                      value={settings.meta_pixel_id}
                      onChange={(e) => setSettings({ ...settings, meta_pixel_id: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="123456789012345"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPixel(!showPixel)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPixel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="mt-3 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Conversões rastreadas:</strong> ViewContent, AddToCart, InitiateCheckout, 
                      Purchase, CompleteRegistration
                    </p>
                  </div>
                </div>

                {/* Instruções */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">📖 Como obter os IDs:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <span className="font-semibold min-w-[50px]">GTM:</span>
                      <span>Acesse tagmanager.google.com → Seu container → ID no topo (GTM-XXXXXXX)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold min-w-[50px]">Pixel:</span>
                      <span>Acesse business.facebook.com → Eventos → Seu pixel → ID de 15 dígitos</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSave('marketing')}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? 'Salvando...' : 'Salvar Configurações de Marketing'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
