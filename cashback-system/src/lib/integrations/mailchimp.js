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
      const subscriberHash = this.getSubscriberHash(customer.email || customer.phone);
      
      const data = {
        email_address: customer.email || `${customer.phone}@cashback.local`,
        status: 'subscribed',
        merge_fields: {
          FNAME: customer.name || '',
          PHONE: customer.phone || '',
          CASHBACK: parseFloat(customer.available_cashback || 0).toFixed(2),
          TOTALSPENT: parseFloat(customer.total_spent || 0).toFixed(2)
        },
        tags: tags
      };

      const response = await axios.put(
        `${this.baseUrl}/lists/${this.audienceId}/members/${subscriberHash}`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Mailchimp Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
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
      console.log('Testando Mailchimp:', {
        url: `${this.baseUrl}/lists/${this.audienceId}`,
        hasKey: !!this.apiKey
      });

      const response = await axios.get(
        `${this.baseUrl}/lists/${this.audienceId}`,
        { 
          headers: this.getHeaders(),
          timeout: 10000
        }
      );

      return {
        success: true,
        listName: response.data.name,
        memberCount: response.data.stats.member_count
      };
    } catch (error) {
      console.error('Erro Mailchimp:', error);
      
      // Erro de rede/CORS
      if (!error.response) {
        return {
          success: false,
          error: 'Erro de conexão. Verifique se a API Key está correta e tente novamente.'
        };
      }

      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.title || error.message
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
