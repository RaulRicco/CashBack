/**
 * Proxy Server para Integrações (Mailchimp, RD Station, OneSignal, Resend)
 * Resolve CORS e mantém segredos no servidor.
 *
 * Como usar:
 * 1. Instalar dependências: npm install express cors axios
 * 2. Executar: node integration-proxy.js
 * 3. O servidor roda na porta 3001
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

// Leitura de variáveis de ambiente (não expor no cliente)
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || process.env.VITE_ONESIGNAL_REST_API_KEY;

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
        timeout: 30000
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

    // Formatar data de nascimento para Mailchimp (MM/DD)
    let birthdayField = {};
    if (customer.birthdate) {
      try {
        const date = new Date(customer.birthdate);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        birthdayField = { BIRTHDAY: `${month}/${day}` };
      } catch (e) {
        console.log('[Mailchimp] Erro ao formatar birthdate:', e);
      }
    }

    const data = {
      email_address: customer.email || `${customer.phone}@cashback.local`,
      status: 'subscribed',
      merge_fields: {
        FNAME: customer.name || '',
        PHONE: customer.phone || '',
        CASHBACK: parseFloat(customer.available_cashback || 0).toFixed(2),
        TOTALSPENT: parseFloat(customer.total_spent || 0).toFixed(2),
        ...birthdayField
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

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Mailchimp sync error:', error.response?.data || error.message);
    res.json({ success: false, error: error.response?.data?.detail || error.message });
  }
});

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
    console.log('[RD Station Test] Token recebido:', accessToken ? accessToken.substring(0, 6) + '…' : 'VAZIO');
    // Não logar body/header completo para evitar vazamento de dados
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

    console.log('[RD Station Sync] Sincronizando cliente:', (customer?.email || customer?.phone || '').toString().replace(/.(?=.{4})/g, '*'));

    // Formatar data de nascimento para RD Station (YYYY-MM-DD formato ISO para aniversário)
    const birthdateField = customer.birthdate ? {
      data_nascimento: customer.birthdate, // Formato YYYY-MM-DD
      aniversario: customer.birthdate // Campo adicional para automações
    } : {};

    const data = {
      token_rdstation: accessToken,
      identificador: 'cashback_system',
      email: customer.email || `${customer.phone}@cashback.local`,
      nome: customer.name || 'Cliente',
      telefone: customer.phone || '',
      saldo_cashback: parseFloat(customer.available_cashback || 0).toFixed(2),
      total_gasto: parseFloat(customer.total_spent || 0).toFixed(2),
      total_cashback: parseFloat(customer.total_cashback || 0).toFixed(2),
      tags: (tags || []).join(','),
      ...birthdateField // Adiciona data_nascimento e aniversario se existir
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
    const { notification } = req.body;

    console.log('[OneSignal] Recebeu requisição de envio para todos');

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.error('[OneSignal] ERRO: Variáveis de ambiente não configuradas');
      return res.json({ success: false, error: 'ONESIGNAL_APP_ID/ONESIGNAL_REST_API_KEY não configuradas' });
    }

    // OneSignal v2 REST API Key começa com 'os_v2_' e usa formato diferente
    const authHeader = ONESIGNAL_REST_API_KEY.startsWith('os_v2_') 
      ? `Key ${ONESIGNAL_REST_API_KEY}`
      : `Basic ${ONESIGNAL_REST_API_KEY}`;

    console.log('[OneSignal] Auth header format:', authHeader.substring(0, 20) + '...');

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: ONESIGNAL_APP_ID,
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
          'Authorization': authHeader
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
    const { userId, notification } = req.body;

    console.log('[OneSignal] Enviando para usuário:', userId);

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.error('[OneSignal] ERRO: Variáveis de ambiente não configuradas');
      return res.json({ success: false, error: 'ONESIGNAL_APP_ID/ONESIGNAL_REST_API_KEY não configuradas' });
    }

    // OneSignal v2 REST API Key usa formato diferente
    const authHeader = ONESIGNAL_REST_API_KEY.startsWith('os_v2_') 
      ? `Key ${ONESIGNAL_REST_API_KEY}`
      : `Basic ${ONESIGNAL_REST_API_KEY}`;

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: ONESIGNAL_APP_ID,
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
          'Authorization': authHeader
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
// CUSTOM DOMAINS MANAGEMENT
// ========================================

/**
 * Verificar DNS do domínio
 */
app.post('/api/admin/verify-dns', async (req, res) => {
  try {
    const { domain } = req.body;
    
    console.log('[DNS Verification] Verificando domínio:', domain);

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execPromise = promisify(exec);

    // Obter IP do servidor
    const { stdout: serverIP } = await execPromise('curl -s ifconfig.me');
    const cleanServerIP = serverIP.trim();

    console.log('[DNS Verification] IP do servidor:', cleanServerIP);

    // Verificar DNS do domínio
    try {
      const { stdout: dnsOutput } = await execPromise(`nslookup ${domain}`);
      console.log('[DNS Verification] Output nslookup:', dnsOutput);

      // Extrair IP do domínio
      const ipMatch = dnsOutput.match(/Address: ([\d.]+)/g);
      if (!ipMatch || ipMatch.length < 2) {
        return res.json({
          success: false,
          verified: false,
          error: 'Não foi possível resolver o DNS do domínio. Verifique se está configurado corretamente.',
          serverIP: cleanServerIP
        });
      }

      // Pegar o último IP (ignora o DNS resolver)
      const domainIP = ipMatch[ipMatch.length - 1].replace('Address: ', '').trim();

      console.log('[DNS Verification] IP do domínio:', domainIP);

      if (domainIP === cleanServerIP) {
        console.log('[DNS Verification] ✅ DNS verificado com sucesso!');
        return res.json({
          success: true,
          verified: true,
          serverIP: cleanServerIP,
          domainIP: domainIP,
          message: 'DNS configurado corretamente!'
        });
      } else {
        return res.json({
          success: false,
          verified: false,
          serverIP: cleanServerIP,
          domainIP: domainIP,
          error: `DNS não aponta para este servidor. Configure o DNS para apontar para ${cleanServerIP}`
        });
      }
    } catch (dnsError) {
      console.error('[DNS Verification] Erro ao verificar DNS:', dnsError);
      return res.json({
        success: false,
        verified: false,
        error: 'Domínio não encontrado ou DNS não configurado.',
        serverIP: cleanServerIP
      });
    }
  } catch (error) {
    console.error('[DNS Verification Error]', error);
    res.json({
      success: false,
      verified: false,
      error: error.message
    });
  }
});

/**
 * Configurar SSL para domínio (executa script)
 */
app.post('/api/admin/setup-ssl', async (req, res) => {
  try {
    const { domain, domainId } = req.body;

    console.log('[SSL Setup] Configurando SSL para:', domain);

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execPromise = promisify(exec);

    // Executar script de configuração de domínio
    const scriptPath = '/var/www/cashback/setup-custom-domain.sh';
    const command = `bash ${scriptPath} ${domain}`;

    console.log('[SSL Setup] Executando comando:', command);

    try {
      const { stdout, stderr } = await execPromise(command, {
        timeout: 300000 // 5 minutos
      });

      console.log('[SSL Setup] Saída:', stdout);
      if (stderr) console.error('[SSL Setup] Erros:', stderr);

      // Verificar se teve sucesso procurando por "DOMÍNIO CONFIGURADO COM SUCESSO"
      if (stdout.includes('DOMÍNIO CONFIGURADO COM SUCESSO') || stdout.includes('Certificado SSL gerado com sucesso')) {
        console.log('[SSL Setup] ✅ SSL configurado com sucesso!');
        return res.json({
          success: true,
          message: 'SSL configurado com sucesso! O domínio está ativo.',
          output: stdout
        });
      } else {
        console.error('[SSL Setup] ❌ Falha na configuração');
        return res.json({
          success: false,
          error: 'Falha ao configurar SSL. Verifique os logs.',
          output: stdout,
          stderr: stderr
        });
      }
    } catch (execError) {
      console.error('[SSL Setup] Erro ao executar script:', execError);
      return res.json({
        success: false,
        error: execError.message,
        stderr: execError.stderr
      });
    }
  } catch (error) {
    console.error('[SSL Setup Error]', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// RESEND EMAIL API
// ========================================

/**
 * Enviar email via Resend
 */
app.post('/api/resend/send', async (req, res) => {
  try {
    const { apiKey, from, to, subject, html, text } = req.body;

    console.log('[Resend] Enviando email para:', to);
    console.log('[Resend] Assunto:', subject);

    if (!apiKey) {
      return res.json({
        success: false,
        error: 'API Key do Resend não fornecida'
      });
    }

    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: from || 'onboarding@resend.dev',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    console.log('[Resend] ✅ Email enviado com sucesso! ID:', response.data.id);

    res.json({
      success: true,
      id: response.data.id,
      data: response.data
    });
  } catch (error) {
    console.error('[Resend Error]', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data?.message || error.message
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
// ONE SIGNAL CONFIG CHECK
// ========================================

// Não expõe valores; apenas indica presença das variáveis
app.get('/api/onesignal/config', (req, res) => {
  const appIdPresent = !!ONESIGNAL_APP_ID;
  const restKeyPresent = !!ONESIGNAL_REST_API_KEY;
  res.json({
    configured: appIdPresent && restKeyPresent,
    appIdPresent,
    restKeyPresent
  });
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
  console.log(`   POST /api/resend/send`);
  console.log(`   POST /api/admin/verify-dns`);
  console.log(`   POST /api/admin/setup-ssl`);
});

export default app;
