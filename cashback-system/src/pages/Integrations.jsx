import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
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
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
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
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);
  const [activeTab, setActiveTab] = useState('mailchimp');
  const [showApiKey, setShowApiKey] = useState({});
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);

  // Formulários
  const [mailchimpForm, setMailchimpForm] = useState({
    api_key: '',
    audience_id: '',
    api_token: 'us1',
    sync_on_signup: true,
    sync_on_purchase: true,
    sync_on_redemption: false,
    default_tags: ['Cashback', 'Cliente']
  });

  const [rdstationForm, setRdstationForm] = useState({
    api_token: '',
    sync_on_signup: true,
    sync_on_purchase: true,
    sync_on_redemption: false,
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
      }
    });

    setLoading(false);
  };

  const loadSyncLogs = async () => {
    const logs = await getSyncLogs(merchant.id);
    setSyncLogs(logs);
  };

  const handleSaveMailchimp = async () => {
    const result = await saveIntegrationConfig(merchant.id, 'mailchimp', mailchimpForm);
    
    if (result.success) {
      toast.success('Configuração do Mailchimp salva!');
      loadConfigs();
    } else {
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleSaveRDStation = async () => {
    const result = await saveIntegrationConfig(merchant.id, 'rdstation', rdstationForm);
    
    if (result.success) {
      toast.success('Configuração do RD Station salva!');
      loadConfigs();
    } else {
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleTestConnection = async (provider) => {
    setTesting(true);
    
    const credentials = provider === 'mailchimp' ? mailchimpForm : rdstationForm;
    const result = await testIntegration(provider, credentials);
    
    if (result.success) {
      toast.success(`✅ Conexão com ${provider === 'mailchimp' ? 'Mailchimp' : 'RD Station'} estabelecida!`);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-8 h-8 text-primary-600" />
              Integrações de Email Marketing
            </h1>
            <p className="text-gray-600 mt-1">
              Conecte seu sistema com Mailchimp ou RD Station
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
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('mailchimp')}
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'mailchimp'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
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
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
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
                onClick={() => setActiveTab('logs')}
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'logs'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
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
                <h2 className="text-xl font-bold text-gray-900">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showApiKey.mailchimp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Encontre em: Account → Extras → API Keys
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience ID (List ID)
                  </label>
                  <input
                    type="text"
                    value={mailchimpForm.audience_id}
                    onChange={(e) => setMailchimpForm({ ...mailchimpForm, audience_id: e.target.value })}
                    className="input"
                    placeholder="abc123def"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Encontre em: Audience → Settings → Audience name and defaults
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server Prefix
                  </label>
                  <input
                    type="text"
                    value={mailchimpForm.api_token}
                    onChange={(e) => setMailchimpForm({ ...mailchimpForm, api_token: e.target.value })}
                    className="input"
                    placeholder="us1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Exemplo: us1, us2, us3 (encontrado no final da sua API Key)
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">
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
                      <span className="text-sm">Ao cadastrar novo cliente</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mailchimpForm.sync_on_purchase}
                        onChange={(e) => setMailchimpForm({ ...mailchimpForm, sync_on_purchase: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm">Ao fazer compra (gerar cashback)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mailchimpForm.sync_on_redemption}
                        onChange={(e) => setMailchimpForm({ ...mailchimpForm, sync_on_redemption: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm">Ao resgatar cashback</span>
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
                <h2 className="text-xl font-bold text-gray-900">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showApiKey.rdstation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Gere em: Integrações → Private Token
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">
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
                      <span className="text-sm">Ao cadastrar novo cliente</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rdstationForm.sync_on_purchase}
                        onChange={(e) => setRdstationForm({ ...rdstationForm, sync_on_purchase: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm">Ao fazer compra (gerar cashback)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rdstationForm.sync_on_redemption}
                        onChange={(e) => setRdstationForm({ ...rdstationForm, sync_on_redemption: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm">Ao resgatar cashback</span>
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

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Últimas Sincronizações
              </h2>

              {syncLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum log de sincronização ainda
                </div>
              ) : (
                <div className="space-y-2">
                  {syncLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {log.customers?.name || log.customers?.phone || 'Cliente'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {log.integration_configs.provider} • {log.action}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-red-600 mt-1">
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
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            📧 Como funciona?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Configure suas credenciais de API do Mailchimp ou RD Station</li>
            <li>• O botão "Testar Conexão" valida apenas o formato das credenciais</li>
            <li>• <strong>Para testar de verdade:</strong> Salve a configuração e use "Sincronizar Todos os Clientes"</li>
            <li>• Ative a sincronização automática para os eventos desejados</li>
            <li>• Os clientes serão automaticamente adicionados à sua lista/base</li>
            <li>• Tags personalizadas são adicionadas baseadas no comportamento</li>
          </ul>
        </div>

        <div className="card bg-yellow-50 border border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Importante sobre Teste de Conexão
          </h3>
          <p className="text-sm text-yellow-800">
            Devido a restrições de segurança do navegador (CORS), não é possível testar a conexão diretamente com as APIs do Mailchimp e RD Station.
            <br /><br />
            <strong>Recomendação:</strong> Salve as configurações e clique em "Sincronizar Todos os Clientes". Se houver erro, ele aparecerá na aba "Logs".
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
