const express = require('express');
const cors = require('cors');
const axios = require('axios');
const md5 = require('md5');

const app = express();
const PORT = 3002; // Porta 3002 para evitar conflito com ssl-api

// Middleware
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * POST /api/mailchimp/sync ou /mailchimp/sync
 * Sincronizar contato com Mailchimp
 */
app.post(['/api/mailchimp/sync', '/mailchimp/sync'], async (req, res) => {
  try {
    const { apiKey, audienceId, serverPrefix, customer, tags = [] } = req.body;

    if (!apiKey || !audienceId || !serverPrefix || !customer) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros obrigatórios: apiKey, audienceId, serverPrefix, customer'
      });
    }

    // Validar email do cliente
    if (!customer.email) {
      return res.status(400).json({
        success: false,
        error: 'Email do cliente é obrigatório'
      });
    }

    const subscriberHash = md5(customer.email.toLowerCase().trim());
    const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;

    // Dados do contato
    const memberData = {
      email_address: customer.email,
      status_if_new: 'subscribed',
      status: 'subscribed',
      merge_fields: {}
    };

    // Adicionar merge fields apenas se tiverem valores
    // Isso evita enviar campos vazios que podem estar marcados como obrigatórios
    if (customer.name && customer.name.trim()) {
      memberData.merge_fields.FNAME = customer.name.trim();
    }

    if (customer.phone && customer.phone.trim()) {
      memberData.merge_fields.PHONE = customer.phone.trim();
    }

    // BIRTHDAY deve estar no formato MM/DD conforme documentação Mailchimp
    if (customer.birthdate && customer.birthdate.trim()) {
      try {
        // Se vier no formato YYYY-MM-DD ou DD/MM/YYYY, converter para MM/DD
        let birthdayFormatted = customer.birthdate.trim();
        
        // Detectar formato YYYY-MM-DD (ex: 1990-03-15)
        if (/^\d{4}-\d{2}-\d{2}$/.test(birthdayFormatted)) {
          const [year, month, day] = birthdayFormatted.split('-');
          birthdayFormatted = `${month}/${day}`;
        }
        // Detectar formato DD/MM/YYYY (ex: 15/03/1990)
        else if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthdayFormatted)) {
          const [day, month, year] = birthdayFormatted.split('/');
          birthdayFormatted = `${month}/${day}`;
        }
        // Detectar formato MM/DD/YYYY (ex: 03/15/1990)
        else if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthdayFormatted) && birthdayFormatted.indexOf('/') === 2) {
          const [month, day, year] = birthdayFormatted.split('/');
          birthdayFormatted = `${month}/${day}`;
        }
        // Se já estiver em MM/DD, manter
        else if (!/^\d{2}\/\d{2}$/.test(birthdayFormatted)) {
          console.warn(`⚠️ Formato de data de nascimento não reconhecido: ${birthdayFormatted}`);
          birthdayFormatted = null;
        }
        
        if (birthdayFormatted) {
          memberData.merge_fields.BIRTHDAY = birthdayFormatted;
        }
      } catch (e) {
        console.warn(`⚠️ Erro ao formatar data de nascimento: ${customer.birthdate}`, e.message);
      }
    }

    // ADDRESS field - Se o Mailchimp tem esse campo como obrigatório
    // Enviar um endereço válido se disponível, senão enviar estrutura mínima
    if (customer.address) {
      memberData.merge_fields.ADDRESS = {
        addr1: customer.address.street || customer.address.addr1 || 'N/A',
        city: customer.address.city || 'N/A',
        state: customer.address.state || 'N/A',
        zip: customer.address.zip || customer.address.zipcode || '00000',
        country: customer.address.country || 'BR'
      };
    }

    console.log('📤 Enviando merge_fields:', JSON.stringify(memberData.merge_fields, null, 2));

    // Adicionar ou atualizar contato
    // Se campos obrigatórios estão faltando, usar skip_merge_validation
    const skipValidation = req.body.skipMergeValidation || false;
    const url = skipValidation 
      ? `${baseUrl}/lists/${audienceId}/members/${subscriberHash}?skip_merge_validation=true`
      : `${baseUrl}/lists/${audienceId}/members/${subscriberHash}`;
    
    if (skipValidation) {
      console.log('⚠️ Pulando validação de merge fields (skip_merge_validation=true)');
    }
    
    const response = await axios.put(
      url,
      memberData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Adicionar tags se fornecidas
    if (tags.length > 0) {
      await axios.post(
        `${baseUrl}/lists/${audienceId}/members/${subscriberHash}/tags`,
        {
          tags: tags.map(tag => ({ name: tag, status: 'active' }))
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log(`✅ Contato sincronizado: ${customer.email}`);

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('❌ Erro Mailchimp Sync:', JSON.stringify(error.response?.data || error.message, null, 2));
    
    // Extrair detalhes dos erros de validação de merge fields
    const errorDetails = error.response?.data;
    let errorMessage = error.response?.data?.detail || error.message;
    
    if (errorDetails?.errors) {
      console.error('❌ Erros de validação detalhados:');
      errorDetails.errors.forEach(err => {
        console.error(`   - Campo: ${err.field || 'desconhecido'}`);
        console.error(`   - Mensagem: ${err.message || 'sem mensagem'}`);
      });
      
      // Adicionar detalhes dos erros à mensagem de resposta
      errorMessage += '\n\nDetalhes dos erros:\n' + 
        errorDetails.errors.map(err => `- ${err.field}: ${err.message}`).join('\n');
    }
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: errorMessage,
      details: errorDetails
    });
  }
});

/**
 * POST /api/mailchimp/test ou /mailchimp/test
 * Testar conexão com Mailchimp
 */
app.post(['/api/mailchimp/test', '/mailchimp/test'], async (req, res) => {
  try {
    const { apiKey, audienceId, serverPrefix } = req.body;

    if (!apiKey || !audienceId || !serverPrefix) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros obrigatórios: apiKey, audienceId, serverPrefix'
      });
    }

    const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;

    // Testar buscar informações da lista
    const response = await axios.get(
      `${baseUrl}/lists/${audienceId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Conexão testada com sucesso: ${response.data.name}`);

    res.json({
      success: true,
      message: `Conectado com sucesso à lista: ${response.data.name}`,
      data: {
        listName: response.data.name,
        memberCount: response.data.stats?.member_count
      }
    });

  } catch (error) {
    console.error('❌ Erro Mailchimp Test:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.detail || error.message
    });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mailchimp-proxy',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mailchimp Proxy Server rodando na porta ${PORT}`);
  console.log(`📍 Endpoints disponíveis:`);
  console.log(`   - POST http://localhost:${PORT}/api/mailchimp/sync`);
  console.log(`   - POST http://localhost:${PORT}/api/mailchimp/test`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});
