/**
 * Proxy Server para Integrações de Email Marketing
 * 
 * Este servidor resolve o problema de CORS ao fazer as chamadas
 * às APIs do Mailchimp e RD Station do lado do servidor.
 * 
 * Como usar:
 * 1. Instalar dependências: npm install express cors axios md5
 * 2. Executar: node integration-proxy.js
 * 3. O servidor vai rodar na porta 3001
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const md5 = require('md5');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ========================================
// MAILCHIMP ROUTES
// ========================================

/**
 * Testar conexão com Mailchimp
 */
app.post('/api/mailchimp/test', async (req, res) => {
  try {
    const { apiKey, audienceId, serverPrefix } = req.body;

    const response = await axios.get(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    res.json({
      success: true,
      listName: response.data.name,
      memberCount: response.data.stats.member_count
    });
  } catch (error) {
    console.error('Mailchimp test error:', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data?.detail || error.response?.data?.title || error.message
    });
  }
});

/**
 * Adicionar/Atualizar contato no Mailchimp
 */
app.post('/api/mailchimp/sync', async (req, res) => {
  try {
    const { apiKey, audienceId, serverPrefix, customer, tags } = req.body;

    const subscriberHash = md5((customer.email || customer.phone).toLowerCase().trim());

    const data = {
      email_address: customer.email || `${customer.phone}@cashback.local`,
      status: 'subscribed',
      merge_fields: {
        FNAME: customer.name || '',
        PHONE: customer.phone || '',
        CASHBACK: parseFloat(customer.available_cashback || 0).toFixed(2),
        TOTALSPENT: parseFloat(customer.total_spent || 0).toFixed(2)
      },
      tags: tags || []
    };

    const response = await axios.put(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Mailchimp sync error:', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data?.detail || error.message
    });
  }
});

// ========================================
// RD STATION ROUTES
// ========================================

/**
 * Testar conexão com RD Station
 */
app.post('/api/rdstation/test', async (req, res) => {
  try {
    const { accessToken } = req.body;

    const response = await axios.get(
      'https://api.rd.services/platform/contacts',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: { page_size: 1 },
        timeout: 10000
      }
    );

    res.json({
      success: true,
      message: 'Conexão estabelecida com sucesso',
      totalContacts: response.data.total
    });
  } catch (error) {
    console.error('RD Station test error:', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data?.errors?.[0]?.error_message || error.response?.data?.error || error.message
    });
  }
});

/**
 * Sincronizar contato com RD Station
 */
app.post('/api/rdstation/sync', async (req, res) => {
  try {
    const { accessToken, customer, tags } = req.body;

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
        tags: tags || [],
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
      'https://api.rd.services/platform/conversions',
      data,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('RD Station sync error:', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data?.errors?.[0]?.error_message || error.message
    });
  }
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`🚀 Integration Proxy Server rodando na porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📧 Endpoints disponíveis:`);
  console.log(`   POST /api/mailchimp/test`);
  console.log(`   POST /api/mailchimp/sync`);
  console.log(`   POST /api/rdstation/test`);
  console.log(`   POST /api/rdstation/sync`);
});

module.exports = app;
