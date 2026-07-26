import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSubscription } from '../../hooks/useSubscription';
import WhatsAppConnectButton from './WhatsAppConnectButton';

const STATUS_LABELS = {
  pending: { label: 'Em análise', icon: Clock, className: 'text-yellow-600 dark:text-yellow-400' },
  approved: { label: 'Aprovado', icon: CheckCircle, className: 'text-green-600 dark:text-green-400' },
  rejected: { label: 'Rejeitado', icon: XCircle, className: 'text-red-600 dark:text-red-400' },
  paused: { label: 'Pausado', icon: Clock, className: 'text-yellow-600 dark:text-yellow-400' },
  disabled: { label: 'Desativado', icon: XCircle, className: 'text-red-600 dark:text-red-400' },
};

const TEMPLATE_KIND_LABELS = {
  welcome: 'Boas-vindas',
  cashback_received: 'Cashback recebido',
  redemption_confirmed: 'Resgate confirmado',
};

export default function WhatsAppTab({ merchantId }) {
  const { checkFeature } = useSubscription();
  const hasWhatsAppAccess = checkFeature('whatsapp_business');
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [systemTemplates, setSystemTemplates] = useState([]);

  useEffect(() => {
    if (merchantId) {
      loadData();
    }
  }, [merchantId]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: configData }, { data: templatesData }] = await Promise.all([
      supabase.from('whatsapp_configs_public').select('*').eq('merchant_id', merchantId).maybeSingle(),
      supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_system_template', true)
        .order('template_kind'),
    ]);

    setConfig(configData || null);
    setSystemTemplates(templatesData || []);
    setLoading(false);
  };

  if (!hasWhatsAppAccess) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Recurso de WhatsApp não disponível no seu plano.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">WhatsApp Business (em breve)</h2>
      </div>

      {!config?.is_active ? (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Conecte sua conta oficial do WhatsApp Business para enviar mensagens automáticas de
            cashback e disparar campanhas para seus clientes.
          </p>
          <WhatsAppConnectButton merchantId={merchantId} onConnected={loadData} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {config.verified_name || 'WhatsApp conectado'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{config.display_phone_number}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Templates transacionais
            </h3>
            <div className="space-y-2">
              {systemTemplates.map((template) => {
                const status = STATUS_LABELS[template.meta_template_status] || STATUS_LABELS.pending;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {TEMPLATE_KIND_LABELS[template.template_kind] || template.name}
                    </span>
                    <span className={`flex items-center gap-1 text-sm font-medium ${status.className}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
