/**
 * Integração OneSignal - Push Notifications
 * 
 * Documentação: https://documentation.onesignal.com/reference/create-user
 * 
 * Funcionalidades:
 * - Criar/Atualizar usuário no OneSignal
 * - Adicionar tags personalizadas
 * - Enviar notificações push (via dashboard OneSignal)
 */

const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1';

/**
 * Sincronizar cliente com OneSignal
 * @param {Object} customer - Dados do cliente
 * @param {Object} config - Configuração do OneSignal (app_id, api_key)
 * @param {String} eventType - Tipo de evento (signup, purchase, redemption)
 * @returns {Promise<Object>} Resultado da sincronização
 */
export async function syncCustomerToOneSignal(customer, config, eventType = 'signup') {
  try {
    console.log(`🔔 Sincronizando cliente ${customer.phone} com OneSignal...`);

    // Validar configuração
    if (!config.app_id || !config.api_key) {
      return {
        success: false,
        error: 'Configuração OneSignal incompleta (app_id ou api_key faltando)'
      };
    }

    // Preparar dados do usuário
    const userData = prepareUserData(customer, config, eventType);

    // Criar/Atualizar usuário no OneSignal
    const response = await fetch(`${ONESIGNAL_API_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${config.api_key}`
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erro OneSignal:', result);
      return {
        success: false,
        error: result.errors?.join(', ') || 'Erro ao sincronizar com OneSignal',
        data: result
      };
    }

    console.log('✅ Cliente sincronizado com OneSignal:', result);

    return {
      success: true,
      data: {
        player_id: result.id,
        external_user_id: customer.phone,
        tags: userData.tags
      }
    };

  } catch (error) {
    console.error('❌ Erro ao sincronizar com OneSignal:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido'
    };
  }
}

/**
 * Preparar dados do usuário para OneSignal
 */
function prepareUserData(customer, config, eventType) {
  // Tags baseadas no evento
  const eventTags = {
    signup: { lifecycle_stage: 'novo_cliente', last_action: 'cadastro' },
    purchase: { lifecycle_stage: 'ativo', last_action: 'compra', has_purchases: 'true' },
    redemption: { lifecycle_stage: 'engajado', last_action: 'resgate', has_redemptions: 'true' }
  };

  // Tags padrão do merchant
  const defaultTags = config.default_tags || [];
  const tagsObj = defaultTags.reduce((acc, tag) => {
    acc[tag] = 'true';
    return acc;
  }, {});

  // Combinar tags
  const tags = {
    ...tagsObj,
    ...eventTags[eventType],
    customer_name: customer.name || 'Cliente',
    customer_phone: customer.phone,
    merchant_id: customer.referred_by_merchant_id,
    created_at: customer.created_at,
    last_sync: new Date().toISOString()
  };

  // Dados do usuário
  const userData = {
    app_id: config.app_id,
    device_type: 11, // 11 = Email, usado como identificador web genérico
    identifier: customer.email || customer.phone, // Email ou telefone como identificador
    external_user_id: customer.phone, // ID único do cliente (telefone)
    tags: tags
  };

  // Adicionar email se disponível
  if (customer.email) {
    userData.email = customer.email;
  }

  return userData;
}

/**
 * Enviar notificação push para um cliente específico
 * @param {String} externalUserId - ID do usuário (telefone)
 * @param {Object} notification - Conteúdo da notificação
 * @param {Object} config - Configuração do OneSignal
 * @returns {Promise<Object>} Resultado do envio
 */
export async function sendPushNotification(externalUserId, notification, config) {
  try {
    console.log(`🔔 Enviando notificação para ${externalUserId}...`);

    if (!config.app_id || !config.api_key) {
      return {
        success: false,
        error: 'Configuração OneSignal incompleta'
      };
    }

    const payload = {
      app_id: config.app_id,
      include_external_user_ids: [externalUserId],
      headings: { en: notification.title },
      contents: { en: notification.message },
      data: notification.data || {},
      // Web push specific
      web_url: notification.url || undefined,
      chrome_web_icon: notification.icon || undefined
    };

    const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${config.api_key}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erro ao enviar notificação:', result);
      return {
        success: false,
        error: result.errors?.join(', ') || 'Erro ao enviar notificação',
        data: result
      };
    }

    console.log('✅ Notificação enviada:', result);

    return {
      success: true,
      data: {
        notification_id: result.id,
        recipients: result.recipients
      }
    };

  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido'
    };
  }
}

/**
 * Obter estatísticas de um app OneSignal
 * @param {Object} config - Configuração do OneSignal
 * @returns {Promise<Object>} Estatísticas do app
 */
export async function getOneSignalStats(config) {
  try {
    if (!config.app_id || !config.api_key) {
      return {
        success: false,
        error: 'Configuração OneSignal incompleta'
      };
    }

    const response = await fetch(`${ONESIGNAL_API_URL}/apps/${config.app_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${config.api_key}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: 'Erro ao buscar estatísticas',
        data: result
      };
    }

    return {
      success: true,
      data: {
        name: result.name,
        players: result.players,
        messageable_players: result.messageable_players,
        updated_at: result.updated_at
      }
    };

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido'
    };
  }
}
