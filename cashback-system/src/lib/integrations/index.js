import { supabase } from '../supabase';
import { syncCustomerToMailchimp } from './mailchimp';
import { syncCustomerToRDStation } from './rdstation';

/**
 * Serviço unificado de integrações de email marketing
 */

/**
 * Sincronizar cliente com todas as integrações ativas
 */
export async function syncCustomerToIntegrations(customer, merchantId, eventType = 'purchase') {
  try {
    // Buscar integrações ativas do merchant
    const { data: configs, error } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_active', true);

    if (error) {
      console.error('Erro ao buscar integrações:', error);
      return;
    }

    if (!configs || configs.length === 0) {
      console.log('Nenhuma integração ativa encontrada');
      return;
    }

    // Verificar se deve sincronizar baseado no evento
    const shouldSync = (config) => {
      if (eventType === 'signup' && config.sync_on_signup) return true;
      if (eventType === 'purchase' && config.sync_on_purchase) return true;
      if (eventType === 'redemption' && config.sync_on_redemption) return true;
      return false;
    };

    // Sincronizar com cada integração
    const results = await Promise.allSettled(
      configs
        .filter(shouldSync)
        .map(async (config) => {
          let result;

          if (config.provider === 'mailchimp') {
            result = await syncCustomerToMailchimp(customer, config, eventType);
          } else if (config.provider === 'rdstation') {
            result = await syncCustomerToRDStation(customer, config, eventType);
          }

          // Registrar log de sincronização
          await logSync(config.id, customer.id, eventType, result);

          // Atualizar contador de sincronizações
          if (result?.success) {
            await supabase
              .from('integration_configs')
              .update({
                last_sync_at: new Date().toISOString(),
                sync_count: config.sync_count + 1
              })
              .eq('id', config.id);
          }

          return result;
        })
    );

    return results;
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return null;
  }
}

/**
 * Registrar log de sincronização
 */
async function logSync(integrationConfigId, customerId, action, result) {
  try {
    await supabase
      .from('integration_sync_log')
      .insert({
        integration_config_id: integrationConfigId,
        customer_id: customerId,
        action: action,
        status: result?.success ? 'success' : 'error',
        response_data: result?.data || null,
        error_message: result?.error || null
      });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}

/**
 * Testar conexão com uma integração
 * NOTA: Devido a restrições CORS, não é possível testar diretamente do browser.
 * A validação real acontece quando você salva e tenta sincronizar.
 */
export async function testIntegration(provider, credentials) {
  try {
    // Validação básica dos campos
    if (provider === 'mailchimp') {
      if (!credentials.api_key || credentials.api_key.length < 20) {
        return {
          success: false,
          error: 'API Key inválida. Deve ter pelo menos 20 caracteres.'
        };
      }
      if (!credentials.audience_id || credentials.audience_id.length < 5) {
        return {
          success: false,
          error: 'Audience ID inválido.'
        };
      }
      if (!credentials.api_token || credentials.api_token.length < 2) {
        return {
          success: false,
          error: 'Server Prefix inválido (exemplo: us1, us2, etc).'
        };
      }
      
      return {
        success: true,
        message: '✅ Credenciais validadas! Salve a configuração e teste sincronizando um cliente.'
      };
      
    } else if (provider === 'rdstation') {
      if (!credentials.api_token || credentials.api_token.length < 30) {
        return {
          success: false,
          error: 'Access Token inválido. Deve ter pelo menos 30 caracteres.'
        };
      }
      
      return {
        success: true,
        message: '✅ Token validado! Salve a configuração e teste sincronizando um cliente.'
      };
    }

    return {
      success: false,
      error: 'Provider não suportado'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obter configurações de integração de um merchant
 */
export async function getIntegrationConfigs(merchantId) {
  const { data, error } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('merchant_id', merchantId);

  if (error) {
    console.error('Erro ao buscar configurações:', error);
    return [];
  }

  return data || [];
}

/**
 * Salvar configuração de integração
 */
export async function saveIntegrationConfig(merchantId, provider, config) {
  try {
    console.log('🔧 saveIntegrationConfig iniciado:', {
      merchantId,
      provider,
      config
    });

    // Verificar se já existe
    console.log('🔍 Verificando se configuração já existe...');
    const existingQuery = await supabase
      .from('integration_configs')
      .select('id')
      .eq('merchant_id', merchantId)
      .eq('provider', provider)
      .single();

    console.log('📊 Resultado da busca:', {
      data: existingQuery.data,
      error: existingQuery.error,
      hasError: !!existingQuery.error
    });

    const configData = {
      merchant_id: merchantId,
      provider: provider,
      api_key: config.api_key || null,
      api_token: config.api_token || null,
      audience_id: config.audience_id || null,
      sync_on_signup: config.sync_on_signup !== undefined ? config.sync_on_signup : true,
      sync_on_purchase: config.sync_on_purchase !== undefined ? config.sync_on_purchase : true,
      sync_on_redemption: config.sync_on_redemption !== undefined ? config.sync_on_redemption : false,
      default_tags: config.default_tags || []
    };

    console.log('📦 Dados a serem salvos:', configData);

    let result;
    
    if (existingQuery.data && !existingQuery.error) {
      console.log('♻️ Atualizando configuração existente ID:', existingQuery.data.id);
      result = await supabase
        .from('integration_configs')
        .update(configData)
        .eq('id', existingQuery.data.id)
        .select()
        .single();
    } else {
      console.log('➕ Inserindo nova configuração...');
      result = await supabase
        .from('integration_configs')
        .insert(configData)
        .select()
        .single();
    }

    console.log('📤 Resultado final do Supabase:', {
      data: result.data,
      error: result.error,
      errorDetails: result.error ? {
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code
      } : null
    });

    if (result.error) {
      console.error('❌ Erro ao salvar configuração:', result.error);
      return { 
        success: false, 
        error: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code
      };
    }

    console.log('✅ Configuração salva com sucesso!');
    return { success: true, data: result.data };
  } catch (error) {
    console.error('💥 Erro geral ao salvar:', error);
    return { 
      success: false, 
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Ativar/Desativar integração
 */
export async function toggleIntegration(configId, isActive) {
  const { error } = await supabase
    .from('integration_configs')
    .update({ is_active: isActive })
    .eq('id', configId);

  if (error) {
    console.error('Erro ao atualizar integração:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Obter logs de sincronização
 */
export async function getSyncLogs(merchantId, limit = 50) {
  const { data, error } = await supabase
    .from('integration_sync_log')
    .select(`
      *,
      integration_configs!inner(merchant_id, provider),
      customers(phone, name)
    `)
    .eq('integration_configs.merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Sincronizar todos os clientes de um merchant (bulk)
 */
export async function bulkSyncCustomers(merchantId) {
  try {
    // Buscar todos os clientes que compraram do merchant
    const { data: transactions } = await supabase
      .from('transactions')
      .select('customer_id')
      .eq('merchant_id', merchantId)
      .eq('status', 'completed');

    if (!transactions || transactions.length === 0) {
      return { success: false, error: 'Nenhum cliente encontrado' };
    }

    const customerIds = [...new Set(transactions.map(t => t.customer_id))];

    // Buscar dados dos clientes
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .in('id', customerIds);

    // Sincronizar cada cliente
    let successCount = 0;
    let errorCount = 0;

    for (const customer of customers) {
      const results = await syncCustomerToIntegrations(customer, merchantId, 'bulk_sync');
      
      if (results && results.some(r => r.status === 'fulfilled' && r.value?.success)) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    return {
      success: true,
      total: customers.length,
      successCount,
      errorCount
    };
  } catch (error) {
    console.error('Erro no bulk sync:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
