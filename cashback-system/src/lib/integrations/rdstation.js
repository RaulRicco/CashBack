import axios from 'axios';

/**
 * Serviço de integração com RD Station
 * Documentação: https://developers.rdstation.com/
 */

export class RDStationService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.rd.services/platform';
  }

  /**
   * Headers para autenticação
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Criar ou atualizar contato
   */
  async upsertContact(customer, tags = []) {
    try {
      const data = {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          conversion_identifier: 'cashback_system',
          email: customer.email || `${customer.phone}@cashback.local`,
          name: customer.name || 'Cliente',
          mobile_phone: customer.phone || '',
          cf_saldo_cashback: parseFloat(customer.available_cashback || 0).toFixed(2),
          cf_total_gasto: parseFloat(customer.total_spent || 0).toFixed(2),
          cf_total_cashback: parseFloat(customer.total_cashback || 0).toFixed(2),
          tags: tags,
          legal_bases: [
            {
              category: 'communications',
              type: 'consent',
              status: 'granted'
            }
          ]
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/conversions`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('RD Station Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.error_message || error.message
      };
    }
  }

  /**
   * Enviar evento personalizado
   */
  async sendEvent(customer, eventType, eventData = {}) {
    try {
      const data = {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          conversion_identifier: `cashback_${eventType}`,
          email: customer.email || `${customer.phone}@cashback.local`,
          name: customer.name || 'Cliente',
          mobile_phone: customer.phone || '',
          ...eventData
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/conversions`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.error_message || error.message
      };
    }
  }

  /**
   * Buscar contato por email
   */
  async getContact(email) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/contacts/email:${encodeURIComponent(email)}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        contact: response.data
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Contato não encontrado'
        };
      }
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.error_message || error.message
      };
    }
  }

  /**
   * Adicionar tags a um contato
   */
  async addTags(email, tags = []) {
    try {
      // RD Station adiciona tags através do upsert de contato
      const data = {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          conversion_identifier: 'add_tags',
          email: email,
          tags: tags
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/conversions`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.error_message || error.message
      };
    }
  }

  /**
   * Testar conexão
   */
  async testConnection() {
    try {
      console.log('Testando RD Station:', {
        url: `${this.baseUrl}/contacts`,
        hasToken: !!this.accessToken
      });

      // Testar com uma chamada simples à API
      const response = await axios.get(
        `${this.baseUrl}/contacts`,
        { 
          headers: this.getHeaders(),
          params: { page_size: 1 },
          timeout: 10000
        }
      );

      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        totalContacts: response.data.total
      };
    } catch (error) {
      console.error('Erro RD Station:', error);
      
      // Erro de rede/CORS
      if (!error.response) {
        return {
          success: false,
          error: 'Erro de conexão. Verifique se o Access Token está correto e tente novamente.'
        };
      }

      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.error_message || error.response?.data?.error || error.message
      };
    }
  }
}

/**
 * Helper para sincronizar cliente com RD Station
 */
export async function syncCustomerToRDStation(customer, config, eventType = 'purchase') {
  const service = new RDStationService(config.api_token);

  // Tags baseadas no evento
  const tags = [...(config.default_tags || [])];
  
  if (eventType === 'signup') {
    tags.push('novo_cliente');
    tags.push('primeiro_cashback');
  } else if (eventType === 'purchase') {
    tags.push('comprou_recentemente');
    tags.push('cliente_ativo');
  } else if (eventType === 'redemption') {
    tags.push('resgatou_cashback');
    tags.push('cliente_engajado');
  }

  // Adicionar tags de segmento baseado no valor
  if (customer.total_spent > 500) {
    tags.push('vip');
    tags.push('alto_valor');
  } else if (customer.total_spent > 200) {
    tags.push('medio_valor');
  }

  // Sincronizar contato
  const result = await service.upsertContact(customer, tags);

  // Enviar evento específico
  if (result.success && eventType !== 'signup') {
    await service.sendEvent(customer, eventType, {
      cf_evento: eventType,
      cf_data_evento: new Date().toISOString()
    });
  }

  return result;
}
