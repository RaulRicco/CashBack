import axios from 'axios';
import md5 from 'md5';

/**
 * Serviço de integração com Mailchimp
 * Documentação: https://mailchimp.com/developer/marketing/api/
 */

export class MailchimpService {
  constructor(apiKey, audienceId, serverPrefix = 'us1') {
    this.apiKey = apiKey;
    this.audienceId = audienceId;
    this.serverPrefix = serverPrefix;
    this.baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;
  }

  /**
   * Headers para autenticação
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Adicionar ou atualizar contato
   */
  async addOrUpdateContact(customer, tags = []) {
    try {
      // Usar proxy server para evitar CORS
      const proxyUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : 'https://' + window.location.hostname + ':3001';

      const response = await axios.post(
        `${proxyUrl}/api/mailchimp/sync`,
        {
          apiKey: this.apiKey,
          audienceId: this.audienceId,
          serverPrefix: this.serverPrefix,
          customer,
          tags
        },
        { timeout: 15000 }
      );

      return response.data;
    } catch (error) {
      console.error('Mailchimp Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Adicionar tags a um contato
   */
  async addTags(email, tags = []) {
    try {
      const subscriberHash = this.getSubscriberHash(email);

      const data = {
        tags: tags.map(tag => ({ name: tag, status: 'active' }))
      };

      const response = await axios.post(
        `${this.baseUrl}/lists/${this.audienceId}/members/${subscriberHash}/tags`,
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
        error: error.response?.data?.detail || error.message
      };
    }
  }

  /**
   * Criar campanha de email
   */
  async createCampaign(subject, fromName, replyTo, content) {
    try {
      const data = {
        type: 'regular',
        recipients: {
          list_id: this.audienceId
        },
        settings: {
          subject_line: subject,
          from_name: fromName,
          reply_to: replyTo,
          title: subject
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/campaigns`,
        data,
        { headers: this.getHeaders() }
      );

      // Adicionar conteúdo
      if (content) {
        await axios.put(
          `${this.baseUrl}/campaigns/${response.data.id}/content`,
          { html: content },
          { headers: this.getHeaders() }
        );
      }

      return {
        success: true,
        campaignId: response.data.id,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  /**
   * Testar conexão
   */
  async testConnection() {
    try {
      console.log('Testando Mailchimp via proxy:', {
        hasKey: !!this.apiKey,
        audienceId: this.audienceId,
        serverPrefix: this.serverPrefix
      });

      // Usar proxy server para evitar CORS
      const proxyUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : 'https://' + window.location.hostname + ':3001';

      const response = await axios.post(
        `${proxyUrl}/api/mailchimp/test`,
        {
          apiKey: this.apiKey,
          audienceId: this.audienceId,
          serverPrefix: this.serverPrefix
        },
        { timeout: 15000 }
      );

      return response.data;
    } catch (error) {
      console.error('Erro Mailchimp:', error);
      
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

  /**
   * Gerar hash MD5 do email (necessário para API do Mailchimp)
   */
  getSubscriberHash(email) {
    const normalizedEmail = email.toLowerCase().trim();
    return md5(normalizedEmail);
  }
}

/**
 * Helper para sincronizar cliente com Mailchimp
 */
export async function syncCustomerToMailchimp(customer, config, eventType = 'purchase') {
  const service = new MailchimpService(
    config.api_key,
    config.audience_id,
    config.api_token // server prefix
  );

  // Tags baseadas no evento
  const tags = [...(config.default_tags || [])];
  
  if (eventType === 'signup') {
    tags.push('Novo Cliente');
  } else if (eventType === 'purchase') {
    tags.push('Comprou Recentemente');
  } else if (eventType === 'redemption') {
    tags.push('Resgatou Cashback');
  }

  // Adicionar tag de segmento baseado no saldo
  if (customer.available_cashback > 50) {
    tags.push('Alto Cashback');
  } else if (customer.available_cashback > 20) {
    tags.push('Médio Cashback');
  }

  return await service.addOrUpdateContact(customer, tags);
}
