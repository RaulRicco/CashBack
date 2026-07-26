import { useEffect, useState } from 'react';
import { Send, Loader, Plus, FileText, Cake, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { toE164BR } from '../utils/phoneUtils';

const BATCH_SIZE = 15;
const BATCH_INTERVAL_MS = 1500;

const AUTOMATION_CATALOG = [
  {
    trigger_type: 'birthday',
    label: 'Aniversário do cliente',
    description: 'Envia uma mensagem no dia do aniversário do cliente.',
    icon: Cake,
    hasConfig: false,
  },
  {
    trigger_type: 'inactive_customer',
    label: 'Cliente inativo',
    description: 'Envia uma mensagem quando o cliente fica X dias sem comprar.',
    icon: UserX,
    hasConfig: true,
    configLabel: 'Dias sem comprar',
    configKey: 'inactive_days',
    configDefault: 30,
  },
];

async function getCampaignAudience(merchantId, audienceFilter) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('customer_id')
    .eq('merchant_id', merchantId)
    .eq('status', 'completed');

  const customerIds = [...new Set((transactions || []).map((t) => t.customer_id))];
  if (customerIds.length === 0) return [];

  let query = supabase.from('customers').select('id, phone, available_cashback').in('id', customerIds);

  if (audienceFilter === 'with_balance') {
    query = query.gt('available_cashback', 0);
  }

  const { data: customers } = await query;
  return customers || [];
}

function AutomationCard({ catalogItem, automation, templates, saving, onSave }) {
  const [templateId, setTemplateId] = useState(automation?.whatsapp_template_id || '');
  const [configValue, setConfigValue] = useState(
    automation?.config?.[catalogItem.configKey] ?? catalogItem.configDefault
  );
  const Icon = catalogItem.icon;

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{catalogItem.label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{catalogItem.description}</p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={automation?.is_active || false}
            disabled={!automation?.whatsapp_template_id && !templateId}
            onChange={(e) =>
              onSave(catalogItem, { templateId, isActive: e.target.checked, configValue })
            }
            className="w-5 h-5 text-primary-600"
          />
          <span className="text-sm">Ativa</span>
        </label>
      </div>

      <select
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        className="input"
      >
        <option value="">Selecione um template aprovado</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>

      {catalogItem.hasConfig && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {catalogItem.configLabel}
          </label>
          <input
            type="number"
            min="1"
            className="input"
            value={configValue}
            onChange={(e) => setConfigValue(e.target.value)}
          />
        </div>
      )}

      <button
        onClick={() =>
          onSave(catalogItem, { templateId, isActive: automation?.is_active || false, configValue })
        }
        disabled={saving === catalogItem.trigger_type || !templateId}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        {saving === catalogItem.trigger_type && <Loader className="w-4 h-4 animate-spin" />}
        Salvar automação
      </button>
    </div>
  );
}

export default function WhatsAppCampaigns() {
  const { merchant } = useAuthStore();
  const { checkFeature } = useSubscription();
  const hasWhatsAppAccess = checkFeature('whatsapp_business');

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateVariables, setTemplateVariables] = useState({});
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState(null);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState({ name: '', bodyText: '' });
  const [submittingTemplate, setSubmittingTemplate] = useState(false);
  const [automations, setAutomations] = useState([]);
  const [savingAutomation, setSavingAutomation] = useState(null);

  useEffect(() => {
    if (merchant?.id) {
      loadData();
    }
  }, [merchant?.id]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: templatesData }, { data: campaignsData }, { data: automationsData }] = await Promise.all([
      supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('template_kind', 'campaign')
        .eq('meta_template_status', 'approved'),
      supabase
        .from('whatsapp_campaigns')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('whatsapp_automations')
        .select('*')
        .eq('merchant_id', merchant.id),
    ]);

    setTemplates(templatesData || []);
    setCampaigns(campaignsData || []);
    setAutomations(automationsData || []);
    setLoading(false);
  };

  const getAutomation = (triggerType) => automations.find((a) => a.trigger_type === triggerType);

  const handleSaveAutomation = async (catalogItem, { templateId, isActive, configValue }) => {
    setSavingAutomation(catalogItem.trigger_type);
    try {
      const existing = getAutomation(catalogItem.trigger_type);
      const payload = {
        merchant_id: merchant.id,
        trigger_type: catalogItem.trigger_type,
        whatsapp_template_id: templateId || existing?.whatsapp_template_id || null,
        is_active: isActive,
        config: catalogItem.hasConfig
          ? { [catalogItem.configKey]: Number(configValue) || catalogItem.configDefault }
          : {},
      };

      const { error } = await supabase
        .from('whatsapp_automations')
        .upsert(payload, { onConflict: 'merchant_id,trigger_type' });

      if (error) throw error;

      toast.success('Automação salva!');
      loadData();
    } catch (error) {
      console.error('Erro ao salvar automação:', error);
      toast.error(`Erro ao salvar automação: ${error.message}`);
    } finally {
      setSavingAutomation(null);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const variableCount = (selectedTemplate?.body_text.match(/{{\d+}}/g) || []).length;

  const handleCreateCampaign = async () => {
    if (!selectedTemplate) {
      toast.error('Selecione um template aprovado');
      return;
    }

    setCreating(true);
    try {
      const audience = await getCampaignAudience(merchant.id, audienceFilter);
      const recipientsWithPhone = audience
        .map((customer) => ({ customer, phoneE164: toE164BR(customer.phone) }))
        .filter((r) => r.phoneE164);

      if (recipientsWithPhone.length === 0) {
        toast.error('Nenhum cliente com telefone válido encontrado para esse público');
        return;
      }

      const { data: campaign, error: campaignError } = await supabase
        .from('whatsapp_campaigns')
        .insert({
          merchant_id: merchant.id,
          whatsapp_template_id: selectedTemplate.id,
          name: `Campanha ${selectedTemplate.name} - ${new Date().toLocaleDateString('pt-BR')}`,
          template_variables: templateVariables,
          audience_filter: { segment: audienceFilter },
          status: 'sending',
          total_recipients: recipientsWithPhone.length,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      const recipientRows = recipientsWithPhone.map((r) => ({
        campaign_id: campaign.id,
        customer_id: r.customer.id,
        phone_e164: r.phoneE164,
        status: 'pending',
      }));

      const { error: recipientsError } = await supabase
        .from('whatsapp_campaign_recipients')
        .insert(recipientRows);

      if (recipientsError) throw recipientsError;

      toast.success(`Campanha criada para ${recipientsWithPhone.length} clientes. Disparando...`);
      await loadData();
      runBatchLoop(campaign.id);
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      toast.error(`Erro ao criar campanha: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitTemplate = async () => {
    if (!newTemplateForm.name.trim() || !newTemplateForm.bodyText.trim()) {
      toast.error('Preencha nome e texto do template');
      return;
    }

    setSubmittingTemplate(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-submit-template', {
        body: {
          merchantId: merchant.id,
          name: newTemplateForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          category: 'MARKETING',
          bodyText: newTemplateForm.bodyText.trim(),
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Erro ao enviar template');
      }

      toast.success('Template enviado para aprovação da Meta!');
      setNewTemplateForm({ name: '', bodyText: '' });
      setShowNewTemplateForm(false);
      loadData();
    } catch (error) {
      console.error('Erro ao submeter template:', error);
      toast.error(`Erro ao enviar template: ${error.message}`);
    } finally {
      setSubmittingTemplate(false);
    }
  };

  const runBatchLoop = async (campaignId) => {
    setSendingCampaignId(campaignId);

    // Loop client-driven: volume baixo (~1000 contatos, uso ocasional) não
    // justifica infraestrutura de filas — ver plano da Fase 5.
    while (true) {
      const { data: pending } = await supabase
        .from('whatsapp_campaign_recipients')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('status', 'pending')
        .limit(BATCH_SIZE);

      if (!pending || pending.length === 0) break;

      await supabase.functions.invoke('whatsapp-send-batch', {
        body: { campaignId, recipientIds: pending.map((r) => r.id) },
      });

      await loadData();
      await new Promise((resolve) => setTimeout(resolve, BATCH_INTERVAL_MS));
    }

    setSendingCampaignId(null);
    toast.success('Disparo concluído!');
    loadData();
  };

  if (!hasWhatsAppAccess) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Recurso de WhatsApp não disponível no seu plano.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Campanhas de WhatsApp (em breve)</h1>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Templates de campanha
            </h2>
            <button
              onClick={() => setShowNewTemplateForm(!showNewTemplateForm)}
              className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Novo template
            </button>
          </div>

          {showNewTemplateForm && (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do template
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="promocao_aniversario"
                  value={newTemplateForm.name}
                  onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Texto (use {'{{1}}'}, {'{{2}}'}... para variáveis)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Olá {{1}}! Você tem {{2}} de cashback esperando por você."
                  value={newTemplateForm.bodyText}
                  onChange={(e) => setNewTemplateForm({ ...newTemplateForm, bodyText: e.target.value })}
                />
              </div>
              <button
                onClick={handleSubmitTemplate}
                disabled={submittingTemplate}
                className="btn-primary flex items-center gap-2"
              >
                {submittingTemplate && <Loader className="w-4 h-4 animate-spin" />}
                Enviar para aprovação
              </button>
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pt-2">Nova campanha</h2>

          {templates.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum template de campanha aprovado ainda. Crie um template acima e aguarde a
              aprovação da Meta.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setTemplateVariables({});
                  }}
                  className="input"
                >
                  <option value="">Selecione um template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplate && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTemplate.body_text}</p>
                  {Array.from({ length: variableCount }).map((_, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Variável {index + 1}
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={templateVariables[index + 1] || ''}
                        onChange={(e) =>
                          setTemplateVariables({ ...templateVariables, [index + 1]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Público
                </label>
                <select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Todos os clientes</option>
                  <option value="with_balance">Clientes com saldo de cashback</option>
                </select>
              </div>

              <button
                onClick={handleCreateCampaign}
                disabled={creating || !selectedTemplateId}
                className="btn-primary flex items-center gap-2"
              >
                {creating ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Disparar campanha
              </button>
            </>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Automações</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Disparos automáticos com base em regras prontas — sem precisar criar campanhas manuais.
            </p>
          </div>

          {templates.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Crie um template de campanha aprovado acima para poder ativar automações.
            </p>
          ) : (
            <div className="space-y-3">
              {AUTOMATION_CATALOG.map((catalogItem) => (
                <AutomationCard
                  key={catalogItem.trigger_type}
                  catalogItem={catalogItem}
                  automation={getAutomation(catalogItem.trigger_type)}
                  templates={templates}
                  saving={savingAutomation}
                  onSave={handleSaveAutomation}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Campanhas recentes
          </h2>
          {loading ? (
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          ) : campaigns.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhuma campanha disparada ainda.</p>
          ) : (
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{campaign.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {campaign.sent_count}/{campaign.total_recipients} enviados ·{' '}
                      {campaign.delivered_count} entregues · {campaign.failed_count} falhas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {campaign.status}
                    </span>
                    {campaign.status === 'sending' && sendingCampaignId !== campaign.id && (
                      <button
                        onClick={() => runBatchLoop(campaign.id)}
                        className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Retomar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
