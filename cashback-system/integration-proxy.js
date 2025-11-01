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

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';

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

    const subscriberHash = crypto.createHash('md5').update((customer.email || customer.phone).toLowerCase().trim()).digest('hex');

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
 * Usa API 1.3 antiga com token_rdstation no body
 */
app.post('/api/rdstation/test', async (req, res) => {
  try {
    const { accessToken } = req.body;

    console.log('[RD Station Test] Recebeu requisição!');
    console.log('[RD Station Test] Token recebido:', accessToken ? accessToken.substring(0, 10) + '...' : 'VAZIO');
    console.log('[RD Station Test] Body completo:', JSON.stringify(req.body));
    console.log('[RD Station Test] Headers:', JSON.stringify(req.headers));
    console.log('[RD Station Test] Testando conexão com API 1.3...');

    // Faz uma conversão de teste para validar o token
    const testData = {
      token_rdstation: accessToken,
      identificador: 'teste_conexao_cashback',
      email: 'teste@cashback.local',
      nome: 'Teste de Conexão'
    };

    const response = await axios.post(
      'https://www.rdstation.com.br/api/1.3/conversions',
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('[RD Station Test] Sucesso!', response.data);

    res.json({
      success: true,
      message: 'Conexão estabelecida com sucesso com RD Station',
      data: response.data
    });
  } catch (error) {
    console.error('[RD Station Test Error] Status:', error.response?.status);
    console.error('[RD Station Test Error] Data:', error.response?.data);
    console.error('[RD Station Test Error] Message:', error.message);
    
    res.json({
      success: false,
      error: error.response?.data?.msg || error.response?.data || error.message
    });
  }
});

/**
 * Sincronizar contato com RD Station
 * Usa API 1.3 antiga com token_rdstation no body
 */
app.post('/api/rdstation/sync', async (req, res) => {
  try {
    const { accessToken, customer, tags } = req.body;

    console.log('[RD Station Sync] Sincronizando cliente:', customer.email || customer.phone);

    const data = {
      token_rdstation: accessToken,
      identificador: 'cashback_system',
      email: customer.email || `${customer.phone}@cashback.local`,
      nome: customer.name || 'Cliente',
      telefone: customer.phone || '',
      saldo_cashback: parseFloat(customer.available_cashback || 0).toFixed(2),
      total_gasto: parseFloat(customer.total_spent || 0).toFixed(2),
      total_cashback: parseFloat(customer.total_cashback || 0).toFixed(2),
      tags: (tags || []).join(',')
    };

    const response = await axios.post(
      'https://www.rdstation.com.br/api/1.3/conversions',
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[RD Station Sync] Sucesso!', response.data);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[RD Station Sync Error]', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data?.msg || error.response?.data || error.message
    });
  }
});

// ========================================
// ONESIGNAL ROUTES
// ========================================

/**
 * Enviar notificação para todos via OneSignal
 */
app.post('/api/onesignal/send-to-all', async (req, res) => {
  try {
    const { appId, restApiKey, notification } = req.body;

    console.log('[OneSignal] Recebeu requisição');
    console.log('[OneSignal] appId:', appId);
    console.log('[OneSignal] restApiKey:', restApiKey ? `${restApiKey.substring(0, 20)}...` : 'VAZIO');
    console.log('[OneSignal] notification:', notification);

    if (!restApiKey || restApiKey.trim() === '') {
      console.error('[OneSignal] ERRO: restApiKey está vazio!');
      return res.json({
        success: false,
        error: 'REST API Key não foi enviada'
      });
    }

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: appId,
        included_segments: ['All'],
        headings: { en: notification.title },
        contents: { en: notification.message },
        url: notification.url || 'https://localcashback.com.br',
        big_picture: notification.image,
        chrome_web_icon: notification.icon || '/icon-192.png',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${restApiKey}`
        }
      }
    );

    console.log('[OneSignal] Sucesso! Recipients:', response.data.recipients);

    res.json({
      success: true,
      recipients: response.data.recipients,
      id: response.data.id
    });
  } catch (error) {
    console.error('[OneSignal Error]', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data?.errors || error.message
    });
  }
});

/**
 * Enviar notificação para usuário específico via OneSignal
 */
app.post('/api/onesignal/send-to-user', async (req, res) => {
  try {
    const { appId, restApiKey, userId, notification } = req.body;

    console.log('[OneSignal] Enviando para usuário:', userId);

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: appId,
        include_external_user_ids: [userId],
        headings: { en: notification.title },
        contents: { en: notification.message },
        url: notification.url || 'https://localcashback.com.br',
        big_picture: notification.image,
        chrome_web_icon: notification.icon || '/icon-192.png',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${restApiKey}`
        }
      }
    );

    console.log('[OneSignal] Sucesso!', response.data);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[OneSignal Error]', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data?.errors || error.message
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
  console.log(`   POST /api/onesignal/send-to-all`);
  console.log(`   POST /api/onesignal/send-to-user`);
});

export default app;
