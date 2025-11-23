import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Settings, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Eye, 
  EyeOff,
  Zap,
  RefreshCw,
  Save,
  Bell,
  Lock,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubscription } from '../hooks/useSubscription';
import {
  getIntegrationConfigs,
  saveIntegrationConfig,
  toggleIntegration,
  testIntegration,
  getSyncLogs,
  bulkSyncCustomers
} from '../lib/integrations';

export default function Integrations() {
  const { merchant } = useAuthStore();
  const { checkFeature, currentPlan } = useSubscription();
  const [loading, setLoading] = useState(true);
  
  // Verificar se tem acesso a integrações
  const hasIntegrationsAccess = checkFeature('integrations');
  const [configs, setConfigs] = useState([]);
  const [activeTab, setActiveTab] = useState('mailchimp');
  const [showApiKey, setShowApiKey] = useState({});
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);

  // Formulários
  const [mailchimpForm, setMailchimpForm] = useState({
    api_key: '',
    audience_id: '',
    api_token: 'us1',
    sync_on_signup: true,
    sync_on_purchase: true,
    sync_on_redemption: true,
    default_tags: ['Cashback', 'Cliente']
  });

  const [rdstationForm, setRdstationForm] = useState({
    api_token: '',
    sync_on_signup: true,
    sync_on_purchase: true,
    sync_on_redemption: true,
    default_tags: ['cashback', 'cliente']
  });

  const [onesignalForm, setOnesignalForm] = useState({
    app_id: '',
    api_key: '',
    sync_on_signup: true,
    sync_on_purchase: true,
    sync_on_redemption: true,
    default_tags: ['cashback', 'cliente']
  });

  useEffect(() => {
    if (merchant?.id) {
      loadConfigs();
      loadSyncLogs();
    }
  }, [merchant]);

  const loadConfigs = async () => {
    setLoading(true);
    const data = await getIntegrationConfigs(merchant.id);
    setConfigs(data);

    // Preencher formulários com dados existentes
    data.forEach(config => {
      if (config.provider === 'mailchimp') {
        setMailchimpForm({
          api_key: config.api_key || '',
          audience_id: config.audience_id || '',
          api_token: config.api_token || 'us1',
          sync_on_signup: config.sync_on_signup,
          sync_on_purchase: config.sync_on_purchase,
          sync_on_redemption: config.sync_on_redemption,
          default_tags: config.default_tags || []
        });
      } else if (config.provider === 'rdstation') {
        setRdstationForm({
          api_token: config.api_token || '',
          sync_on_signup: config.sync_on_signup,
          sync_on_purchase: config.sync_on_purchase,
          sync_on_redemption: config.sync_on_redemption,
          default_tags: config.default_tags || []
        });
      } else if (config.provider === 'onesignal') {
        setOnesignalForm({
          app_id: config.app_id || '',
          api_key: config.api_key || '',
          sync_on_signup: config.sync_on_signup,
          sync_on_purchase: config.sync_on_purchase,
          sync_on_redemption: config.sync_on_redemption,
          default_tags: config.default_tags || []
        });
      }
    });

    setLoading(false);
  };

  const loadSyncLogs = async () => {
    const logs = await getSyncLogs(merchant.id);
    setSyncLogs(logs);
  };

  const handleSaveMailchimp = async () => {
    console.log('🚀 Salvando Mailchimp:', {
      merchant_id: merchant.id,
      provider: 'mailchimp',
      config: mailchimpForm
    });

    const result = await saveIntegrationConfig(merchant.id, 'mailchimp', mailchimpForm);
    
    console.log('📥 Resultado do save:', result);
    
    if (result.success) {
      toast.success('✅ Configuração do Mailchimp salva com sucesso!');
      loadConfigs();
    } else {
      const errorMsg = result.details 
        ? `${result.error} - ${result.details}` 
        : result.error;
      
      toast.error(`❌ Erro ao salvar: ${errorMsg}`, {
        duration: 6000
      });
      
      console.error('💥 Erro detalhado completo:', {
        error: result.error,
        details: result.details,
        hint: result.hint,
        code: result.code,
        stack: result.stack
      });
    }
  };

  const handleSaveRDStation = async () => {
    console.log('🚀 Salvando RD Station:', {
      merchant_id: merchant.id,
      provider: 'rdstation',
      config: rdstationForm
    });

    const result = await saveIntegrationConfig(merchant.id, 'rdstation', rdstationForm);
    
    console.log('📥 Resultado do save:', result);
    
    if (result.success) {
      toast.success('✅ Configuração do RD Station salva com sucesso!');
      loadConfigs();
    } else {
      const errorMsg = result.details 
        ? `${result.error} - ${result.details}` 
        : result.error;
      
      toast.error(`❌ Erro ao salvar: ${errorMsg}`, {
        duration: 6000
      });
      
      console.error('💥 Erro detalhado completo:', {
        error: result.error,
        details: result.details,
        hint: result.hint,
        code: result.code,
        stack: result.stack
      });
    }
  };

  const handleSaveOneSignal = async () => {
    console.log('🚀 Salvando OneSignal:', {
      merchant_id: merchant.id,
      provider: 'onesignal',
      config: onesignalForm
    });

    const result = await saveIntegrationConfig(merchant.id, 'onesignal', onesignalForm);
    
    console.log('📥 Resultado do save:', result);
    
    if (result.success) {
      toast.success('✅ Configuração do OneSignal salva com sucesso!');
      loadConfigs();
    } else {
      const errorMsg = result.details 
        ? `${result.error} - ${result.details}` 
        : result.error;
      
      toast.error(`❌ Erro ao salvar: ${errorMsg}`, {
        duration: 6000
      });
      
      console.error('💥 Erro detalhado completo:', {
        error: result.error,
        details: result.details,
        hint: result.hint,
        code: result.code,
        stack: result.stack
      });
    }
  };

  const handleTestConnection = async (provider) => {
    setTesting(true);
    
    const credentials = provider === 'mailchimp' ? mailchimpForm : 
                       provider === 'rdstation' ? rdstationForm : onesignalForm;
    const result = await testIntegration(provider, credentials);
    
    if (result.success) {
      const providerName = provider === 'mailchimp' ? 'Mailchimp' : 
                          provider === 'rdstation' ? 'RD Station' : 'OneSignal';
      toast.success(`✅ Conexão com ${providerName} estabelecida!`);
    } else {
      toast.error(`❌ Erro: ${result.error}`);
    }
    
    setTesting(false);
  };

  const handleToggleIntegration = async (configId, currentStatus) => {
    const result = await toggleIntegration(configId, !currentStatus);
    
    if (result.success) {
      toast.success(`Integração ${!currentStatus ? 'ativada' : 'desativada'}`);
      loadConfigs();
    } else {
      toast.error('Erro ao atualizar integração');
    }
  };

  const handleBulkSync = async () => {
    setSyncing(true);
    toast.loading('Sincronizando clientes...', { id: 'bulk-sync' });
    
    const result = await bulkSyncCustomers(merchant.id);
    
    toast.dismiss('bulk-sync');
    
    if (result.success) {
      toast.success(`✅ ${result.successCount} clientes sincronizados!`);
      loadSyncLogs();
    } else {
      toast.error(`❌ Erro: ${result.error}`);
    }
    
    setSyncing(false);
  };

  const getConfigByProvider = (provider) => {
    return configs.find(c => c.provider === provider);
  };

  // Se não tem acesso, mostrar página de upgrade
  if (!hasIntegrationsAccess) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-12 overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-sm bg-white/40"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Integrações Premium
              </h1>
              
              <p className="text-xl text-gray-700 mb-2 max-w-2xl mx-auto leading-relaxed">
                Conecte seu sistema com ferramentas de Email Marketing e Push Notifications
                para automatizar a comunicação com seus clientes.
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-xl mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Integrações Disponíveis:</h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Mailchimp</strong> - Email marketing automatizado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700"><strong>RD Station</strong> - Automação de marketing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700"><strong>OneSignal</strong> - Push notifications</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 text-lg text-gray-600 mb-8">
                <span className="font-semibold">Seu plano atual:</span>
                <span className="px-4 py-2 bg-white rounded-full border-2 border-gray-300 font-bold">
                  {currentPlan?.name || 'Starter'}
                </span>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>Disponível nos planos Business e Premium</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Automatize suas campanhas de marketing e aumente suas vendas
                </p>
              </div>
              
              <Link
                to="/dashboard/planos"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl"
              >
                <TrendingUp className="w-6 h-6" />
                Fazer Upgrade Agora
              </Link>
              
              <p className="text-sm text-gray-500 mt-6">
                Plano Business: <strong>R$ 297/mês</strong> | Plano Premium: <strong>R$ 497/mês</strong>
              </p>
            </div>
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              Integrações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Conecte com Email Marketing (Mailchimp, RD Station) e Push Notifications (OneSignal)
            </p>
          </div>

          <button
            onClick={handleBulkSync}
            disabled={syncing || configs.filter(c => c.is_active).length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {syncing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Sincronizar Todos os Clientes
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('mailchimp')}
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'mailchimp'
                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src="https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg" 
                    alt="Mailchimp"
                    className="w-6 h-6"
                  />
                  Mailchimp
                  {getConfigByProvider('mailchimp')?.is_active && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('rdstation')}
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'rdstation'
                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  RD Station
                  {getConfigByProvider('rdstation')?.is_active && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('onesignal')}
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'onesignal'
                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  OneSignal
                  {getConfigByProvider('onesignal')?.is_active && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'logs'
                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Logs
                </div>
              </button>
            </nav>
          </div>

          {/* Mailchimp Form */}
          {activeTab === 'mailchimp' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Configurar Mailchimp
                </h2>
                {getConfigByProvider('mailchimp') && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getConfigByProvider('mailchimp')?.is_active}
                      onChange={(e) => handleToggleIntegration(
                        getConfigByProvider('mailchimp').id,
                        getConfigByProvider('mailchimp').is_active
                      )}
                      className="w-5 h-5 text-primary-600"
                    />
                    <span className="font-medium">Ativada</span>
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey.mailchimp ? 'text' : 'password'}
                      value={mailchimpForm.api_key}
                      onChange={(e) => setMailchimpForm({ ...mailchimpForm, api_key: e.target.value })}
                      className="input pr-10"
                      placeholder="sua-api-key-aqui"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey({ ...showApiKey, mailchimp: !showApiKey.mailchimp })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    >
                      {showApiKey.mailchimp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Encontre em: Account → Extras → API Keys
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Audience ID (List ID)
                  </label>
                  <input
                    type="text"
                    value={mailchimpForm.audience_id}
                    onChange={(e) => setMailchimpForm({ ...mailchimpForm, audience_id: e.target.value })}
                    className="input"
                    placeholder="abc123def"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Encontre em: Audience → Settings → Audience name and defaults
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Server Prefix
                  </label>
                  <input
                    type="text"
                    value={mailchimpForm.api_token}
                    onChange={(e) => setMailchimpForm({ ...mailchimpForm, api_token: e.target.value })}
                    className="input"
                    placeholder="us1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemplo: us1, us2, us3 (encontrado no final da sua API Key)
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Sincronização Automática
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mailchimpForm.sync_on_signup}
                        onChange={(e) => setMailchimpForm({ ...mailchimpForm, sync_on_signup: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao cadastrar novo cliente</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mailchimpForm.sync_on_purchase}
                        onChange={(e) => setMailchimpForm({ ...mailchimpForm, sync_on_purchase: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao fazer compra (gerar cashback)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mailchimpForm.sync_on_redemption}
                        onChange={(e) => setMailchimpForm({ ...mailchimpForm, sync_on_redemption: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao resgatar cashback</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection('mailchimp')}
                    disabled={testing || !mailchimpForm.api_key || !mailchimpForm.audience_id}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {testing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Testar Conexão
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveMailchimp}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Configuração
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RD Station Form */}
          {activeTab === 'rdstation' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Configurar RD Station
                </h2>
                {getConfigByProvider('rdstation') && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getConfigByProvider('rdstation')?.is_active}
                      onChange={(e) => handleToggleIntegration(
                        getConfigByProvider('rdstation').id,
                        getConfigByProvider('rdstation').is_active
                      )}
                      className="w-5 h-5 text-primary-600"
                    />
                    <span className="font-medium">Ativada</span>
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey.rdstation ? 'text' : 'password'}
                      value={rdstationForm.api_token}
                      onChange={(e) => setRdstationForm({ ...rdstationForm, api_token: e.target.value })}
                      className="input pr-10"
                      placeholder="seu-access-token-aqui"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey({ ...showApiKey, rdstation: !showApiKey.rdstation })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    >
                      {showApiKey.rdstation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Gere em: Integrações → Private Token
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Sincronização Automática
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rdstationForm.sync_on_signup}
                        onChange={(e) => setRdstationForm({ ...rdstationForm, sync_on_signup: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao cadastrar novo cliente</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rdstationForm.sync_on_purchase}
                        onChange={(e) => setRdstationForm({ ...rdstationForm, sync_on_purchase: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao fazer compra (gerar cashback)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rdstationForm.sync_on_redemption}
                        onChange={(e) => setRdstationForm({ ...rdstationForm, sync_on_redemption: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao resgatar cashback</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection('rdstation')}
                    disabled={testing || !rdstationForm.api_token}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {testing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Testar Conexão
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveRDStation}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Configuração
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OneSignal Form */}
          {activeTab === 'onesignal' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Configurar OneSignal (Push Notifications)
                </h2>
                {getConfigByProvider('onesignal') && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getConfigByProvider('onesignal')?.is_active}
                      onChange={(e) => handleToggleIntegration(
                        getConfigByProvider('onesignal').id,
                        getConfigByProvider('onesignal').is_active
                      )}
                      className="w-5 h-5 text-primary-600"
                    />
                    <span className="font-medium">Ativada</span>
                  </label>
                )}
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      📱 Como configurar o OneSignal
                    </h3>
                    <button
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {showInstructions ? '▼ Ocultar instruções' : '▶ Ver instruções detalhadas'}
                    </button>
                    
                    {showInstructions && (
                      <ol className="text-sm text-blue-800 dark:text-blue-400 mt-3 space-y-2 list-decimal list-inside">
                        <li>Acesse <a href="https://onesignal.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">onesignal.com</a> e crie uma conta gratuita</li>
                        <li>Crie um novo App (ou use um existente)</li>
                        <li>No dashboard, vá em <strong>Settings → Keys & IDs</strong></li>
                        <li>Copie o <strong>App ID</strong> (OneSignal App ID)</li>
                        <li>Copie a <strong>REST API Key</strong></li>
                        <li>Cole as credenciais nos campos abaixo</li>
                        <li>Configure quando sincronizar (cadastro, compra, resgate)</li>
                        <li>Salve a configuração e teste com "Sincronizar Todos os Clientes"</li>
                      </ol>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OneSignal App ID
                  </label>
                  <input
                    type="text"
                    value={onesignalForm.app_id}
                    onChange={(e) => setOnesignalForm({ ...onesignalForm, app_id: e.target.value })}
                    className="input"
                    placeholder="12345678-1234-1234-1234-123456789012"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Encontre em: Settings → Keys & IDs → OneSignal App ID
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    REST API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey.onesignal ? 'text' : 'password'}
                      value={onesignalForm.api_key}
                      onChange={(e) => setOnesignalForm({ ...onesignalForm, api_key: e.target.value })}
                      className="input pr-10"
                      placeholder="sua-rest-api-key-aqui"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey({ ...showApiKey, onesignal: !showApiKey.onesignal })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    >
                      {showApiKey.onesignal ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Encontre em: Settings → Keys & IDs → REST API Key
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Sincronização Automática
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={onesignalForm.sync_on_signup}
                        onChange={(e) => setOnesignalForm({ ...onesignalForm, sync_on_signup: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao cadastrar novo cliente</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={onesignalForm.sync_on_purchase}
                        onChange={(e) => setOnesignalForm({ ...onesignalForm, sync_on_purchase: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao fazer compra (gerar cashback)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={onesignalForm.sync_on_redemption}
                        onChange={(e) => setOnesignalForm({ ...onesignalForm, sync_on_redemption: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm dark:text-gray-300">Ao resgatar cashback</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection('onesignal')}
                    disabled={testing || !onesignalForm.app_id || !onesignalForm.api_key}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {testing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Testar Conexão
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveOneSignal}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Configuração
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Últimas Sincronizações
              </h2>

              {syncLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Nenhum log de sincronização ainda
                </div>
              ) : (
                <div className="space-y-2">
                  {syncLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {log.customers?.name || log.customers?.phone || 'Cliente'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {log.integration_configs.provider} • {log.action}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {log.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📧 Como funcionam as integrações?
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• <strong>Email Marketing:</strong> Configure Mailchimp ou RD Station para enviar campanhas</li>
            <li>• <strong>Push Notifications:</strong> Configure OneSignal para enviar notificações push</li>
            <li>• O botão "Testar Conexão" valida apenas o formato das credenciais</li>
            <li>• <strong>Para testar de verdade:</strong> Salve a configuração e use "Sincronizar Todos os Clientes"</li>
            <li>• Ative a sincronização automática para os eventos desejados</li>
            <li>• Os clientes serão automaticamente sincronizados com suas integrações</li>
            <li>• Tags personalizadas são adicionadas baseadas no comportamento (novo, ativo, engajado)</li>
          </ul>
        </div>

        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
            ⚠️ Importante sobre Teste de Conexão
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            Devido a restrições de segurança do navegador (CORS), não é possível testar a conexão diretamente com as APIs do Mailchimp e RD Station.
            <br /><br />
            <strong>Recomendação:</strong> Salve as configurações e clique em "Sincronizar Todos os Clientes". Se houver erro, ele aparecerá na aba "Logs".
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
