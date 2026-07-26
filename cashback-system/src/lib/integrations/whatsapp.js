import { supabase } from '../supabase';

/**
 * Envia uma mensagem transacional (signup, purchase, redemption) via WhatsApp,
 * espelhando o padrão de sendPushNotification (index.js) para credenciais que
 * não podem ir ao browser. Falha silenciosamente se o merchant não tem WhatsApp
 * conectado ou não há template aprovado — nunca deve bloquear o fluxo do chamador.
 */
export async function sendWhatsAppTransactional(customer, merchantId, eventType, data = {}) {
  try {
    const { data: config } = await supabase
      .from('whatsapp_configs_public')
      .select('is_active')
      .eq('merchant_id', merchantId)
      .eq('is_active', true)
      .maybeSingle();

    if (!config) {
      return { success: false, error: 'WhatsApp não conectado' };
    }

    const { data: result, error } = await supabase.functions.invoke('whatsapp-send', {
      body: { merchantId, customerId: customer.id, eventType, data },
    });

    if (error) {
      console.error('Erro ao enviar WhatsApp transacional:', error);
      return { success: false, error: error.message };
    }

    return result;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp transacional:', error);
    return { success: false, error: error.message };
  }
}
