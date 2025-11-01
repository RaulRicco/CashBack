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
      // Usar proxy server para evitar CORS
      const proxyUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : window.location.protocol + '//' + window.location.hostname;

      const response = await axios.post(
        `${proxyUrl}/api/rdstation/sync`,
        {
          accessToken: this.accessToken,
          customer,
          tags
        },
        { timeout: 15000 }
      );

      return response.data;
    } catch (error) {
      console.error('RD Station Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
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
      console.log('Testando RD Station via proxy:', {
        hasToken: !!this.accessToken
      });

      // Usar proxy server para evitar CORS
      const proxyUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : window.location.protocol + '//' + window.location.hostname;

      const response = await axios.post(
        `${proxyUrl}/api/rdstation/test`,
        {
          accessToken: this.accessToken
        },
        { timeout: 15000 }
      );

      return response.data;
    } catch (error) {
      console.error('Erro RD Station:', error);
      
      // Erro de rede
      if (!error.response) {
        return {
          success: false,
          error: 'Não foi possível conectar ao servidor proxy. Verifique se está rodando na porta 3001.'
        };
      }

      return {
        success: false,
        error: error.response?.data?.error || error.message
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
