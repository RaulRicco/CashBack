/**
 * Servidor de API para integração Stripe
 * LocalCashback - Processamento de Pagamentos e Assinaturas
 * 
 * IMPORTANTE: Este servidor roda separadamente do frontend Vite
 * Porta padrão: 3001 (frontend usa 5173)
 */

import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import mailchimp from '@mailchimp/mailchimp_marketing';
import OneSignal from 'onesignal-node';
import https from 'https';
import cron from 'node-cron';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Stripe (modo teste)
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Inicializar Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Inicializar Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

// Inicializar OneSignal
const oneSignalClient = new OneSignal.Client({
  userAuthKey: process.env.ONESIGNAL_REST_API_KEY,
  app: {
    appAuthKey: process.env.ONESIGNAL_REST_API_KEY,
    appId: process.env.ONESIGNAL_APP_ID
  }
});

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS para aceitar requisições do frontend
const allowedOrigins = [
  'http://localhost:5173', // DEV
  'http://localhost:8080', // DEV server
  'https://localcashback.com.br', // Produção
  'https://www.localcashback.com.br', // Produção www
  'https://cashback.raulricco.com.br', // Produção alternativa
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Webhook precisa do body raw, então configuramos ANTES do express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Erro na verificação do webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar evento
  console.log('📨 Webhook recebido:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar evento' });
  }
});

// Parser JSON para outras rotas
app.use(express.json());

// ============================================
// 🔔 ONESIGNAL: ENVIAR WEB PUSH NOTIFICATIONS
// ============================================

/**
 * Enviar notificação Web Push para um merchant específico
 * @param {String} merchantId - UUID do merchant
 * @param {String} title - Título da notificação
 * @param {String} message - Mensagem da notificação
 * @param {String} url - URL para redirecionar ao clicar (opcional)
 * @returns {Promise<Object>} Resultado do envio
 */
async function sendWebPushNotification(merchantId, title, message, url = null) {
  return new Promise((resolve) => {
    try {
      console.log(`[OneSignal] Enviando notificação para merchant ${merchantId}...`);
      
      if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
        console.error('[OneSignal] Credenciais não configuradas!');
        resolve({ success: false, error: 'Credenciais OneSignal não configuradas' });
        return;
      }

      const postData = JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['Subscribed Users'], // Envia para todos os inscritos
        headings: { en: title },
        contents: { en: message },
        url: url || 'https://localcashback.com.br/dashboard',
        chrome_web_icon: 'https://localcashback.com.br/logo-localcashback.png'
      });

      const options = {
        hostname: 'onesignal.com',
        port: 443,
        path: '/api/v1/notifications',
        method: 'POST',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log('[OneSignal] ✅ Notificação enviada:', result.id, '| Destinatários:', result.recipients || 0);
            resolve({ 
              success: true, 
              data: result,
              recipients: result.recipients || 0
            });
          } else {
            console.error('[OneSignal] ❌ Erro:', res.statusCode, data);
            resolve({ success: false, error: data });
          }
        });
      });

      req.on('error', (error) => {
        console.error('[OneSignal] ❌ Erro de conexão:', error.message);
        resolve({ success: false, error: error.message });
      });

      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error('[OneSignal] ❌ Erro ao enviar notificação:', error);
      resolve({ 
        success: false, 
        error: error.message || 'Erro ao enviar notificação OneSignal' 
      });
    }
  });
}

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor Stripe API funcionando!',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/stripe/create-checkout-session
 * Cria uma sessão de checkout do Stripe
 */
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, merchantId, merchantEmail } = req.body;

    // Validar dados
    if (!priceId || !merchantId || !merchantEmail) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios faltando: priceId, merchantId, merchantEmail' 
      });
    }

    console.log('🛒 Criando checkout session:', { priceId, merchantId, merchantEmail });

    // Verificar se já tem cliente Stripe
    const { data: merchant } = await supabase
      .from('merchants')
      .select('stripe_customer_id')
      .eq('id', merchantId)
      .single();

    let customerId = merchant?.stripe_customer_id;

    // Criar cliente Stripe se não existir
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: merchantEmail,
        metadata: {
          merchant_id: merchantId,
        },
      });
      customerId = customer.id;

      // Salvar ID do cliente no banco
      await supabase
        .from('merchants')
        .update({ stripe_customer_id: customerId })
        .eq('id', merchantId);

      console.log('✅ Cliente Stripe criado:', customerId);
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14, // 🎁 14 dias grátis
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel', // Cancela se não tiver cartão após trial
          },
        },
      },
      success_url: `${req.headers.origin || 'https://localcashback.com.br'}/dashboard/assinatura?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://localcashback.com.br'}/dashboard/assinatura?canceled=true`,
      metadata: {
        merchant_id: merchantId,
      },
      allow_promotion_codes: true, // Permitir cupons de desconto
      billing_address_collection: 'required',
      locale: 'pt-BR',
    });

    console.log('✅ Checkout session criada:', session.id);

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Erro ao criar checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/stripe/create-portal-session
 * Cria uma sessão do portal do cliente para gerenciar assinatura
 */
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { merchantId } = req.body;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId é obrigatório' });
    }

    // Buscar stripe_customer_id
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('stripe_customer_id')
      .eq('id', merchantId)
      .single();

    if (error || !merchant?.stripe_customer_id) {
      return res.status(404).json({ error: 'Cliente Stripe não encontrado' });
    }

    // Criar sessão do portal
    const session = await stripe.billingPortal.sessions.create({
      customer: merchant.stripe_customer_id,
      return_url: `${req.headers.origin || 'https://localcashback.com.br'}/dashboard/assinatura`,
    });

    console.log('✅ Portal session criada:', session.id);

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Erro ao criar portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe/subscription-status/:merchantId
 * Busca status atual da assinatura
 */
app.get('/api/stripe/subscription-status/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;

    const { data: merchant, error } = await supabase
      .from('merchants')
      .select(`
        subscription_status,
        subscription_plan,
        customer_limit,
        employee_limit,
        trial_ends_at,
        subscription_ends_at,
        features_enabled
      `)
      .eq('id', merchantId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Comerciante não encontrado' });
    }

    // Buscar contagem atual de clientes e funcionários
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId);

    const { count: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId);

    res.json({
      ...merchant,
      current_customers: customerCount || 0,
      current_employees: employeeCount || 0,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// RESEND EMAIL API
// =====================================

/**
 * POST /api/resend/send
 * Envia email através da API do Resend
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

/**
 * =====================================
 * MAILCHIMP INTEGRATION - LANDING PAGE
 * =====================================
 * Endpoint para adicionar leads da landing page à lista do Mailchimp
 */
app.post('/api/mailchimp/subscribe', async (req, res) => {
  try {
    const { email, firstName, lastName, phone, business } = req.body;

    console.log('[Mailchimp] Adicionando lead:', email);

    // Validação básica
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório'
      });
    }

    // Adicionar/atualizar contato no Mailchimp
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID,
      {
        email_address: email,
        status: 'subscribed', // 'subscribed' ou 'pending' (se quiser double opt-in)
        merge_fields: {
          FNAME: firstName || '',
          LNAME: lastName || '',
          PHONE: phone || '',
          MMERGE6: business || '', // Campo customizado para nome do comércio (ajuste conforme seu Mailchimp)
        },
        tags: ['Landing Page', 'Lead'],
      }
    );

    console.log('[Mailchimp] ✅ Lead adicionado com sucesso! ID:', response.id);

    // Enviar evento para Google Tag Manager
    console.log('[GTM] Evento: lead_captured');

    res.json({
      success: true,
      id: response.id,
      email: response.email_address,
      status: response.status,
      message: 'Lead adicionado ao Mailchimp com sucesso!'
    });

  } catch (error) {
    console.error('[Mailchimp Error]', error.response?.body || error.message);
    
    // Se o email já existe, considerar como sucesso
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      return res.json({
        success: true,
        message: 'Email já cadastrado na lista',
        alreadySubscribed: true
      });
    }

    res.status(error.status || 500).json({
      success: false,
      error: error.response?.body?.detail || error.message
    });
  }
});

// Endpoint para sincronização Mailchimp (usado pelo frontend)
app.post('/api/mailchimp/sync', async (req, res) => {
  try {
    const { customer, tags = [], apiKey, audienceId, serverPrefix } = req.body;

    console.log('[Mailchimp Sync] Sincronizando cliente:', customer?.email);

    // Validação básica
    if (!customer || !customer.email) {
      return res.status(400).json({
        success: false,
        error: 'Dados do cliente são obrigatórios'
      });
    }

    // Usar credenciais do request ou do ambiente
    const finalApiKey = apiKey || process.env.MAILCHIMP_API_KEY;
    const finalAudienceId = audienceId || process.env.MAILCHIMP_AUDIENCE_ID;
    const finalServerPrefix = serverPrefix || process.env.MAILCHIMP_SERVER_PREFIX;

    if (!finalApiKey || !finalAudienceId || !finalServerPrefix) {
      return res.status(500).json({
        success: false,
        error: 'Mailchimp não configurado. Credenciais ausentes.'
      });
    }

    // Criar cliente Mailchimp com as credenciais fornecidas
    const mailchimpClient = mailchimp;
    mailchimpClient.setConfig({
      apiKey: finalApiKey,
      server: finalServerPrefix,
    });

    // Preparar merge_fields
    const mergeFields = {
      FNAME: customer.name?.split(' ')[0] || '',
      LNAME: customer.name?.split(' ').slice(1).join(' ') || '',
      PHONE: customer.phone || '',
    };

    // Adicionar campo de cashback se existir
    if (customer.available_cashback !== undefined) {
      mergeFields.MMERGE7 = customer.available_cashback.toString();
    }

    // Adicionar/atualizar contato no Mailchimp
    const response = await mailchimpClient.lists.addListMember(
      finalAudienceId,
      {
        email_address: customer.email,
        status: 'subscribed',
        merge_fields: mergeFields,
        tags: tags.length > 0 ? tags : ['Cliente', 'Cadastro'],
      }
    );

    console.log('[Mailchimp Sync] ✅ Cliente sincronizado! ID:', response.id);

    res.json({
      success: true,
      id: response.id,
      email: response.email_address,
      status: response.status,
      message: 'Cliente sincronizado com sucesso!'
    });

  } catch (error) {
    console.error('[Mailchimp Sync Error]', error.response?.body || error.message);
    console.error('[Mailchimp Sync Error - Full]', {
      status: error.status,
      statusCode: error.response?.status,
      body: error.response?.body,
      message: error.message
    });
    
    // Se o email já existe, considerar como sucesso
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      return res.json({
        success: true,
        message: 'Email já cadastrado, dados atualizados',
        alreadySubscribed: true
      });
    }

    // Usar o status correto do erro
    const statusCode = error.status || error.response?.status || 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.response?.body?.detail || error.message,
      mailchimpError: error.response?.body
    });
  }
});

// =====================================
// HANDLERS DE EVENTOS WEBHOOK
// =====================================

/**
 * Checkout completado - primeira assinatura criada
 */
async function handleCheckoutCompleted(session) {
  console.log('✅ Checkout completado:', session.id);

  const merchantId = session.metadata.merchant_id;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Buscar detalhes da assinatura
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // ✅ NOVO MODELO: Apenas 1 produto (price_1SluhgAev6mInEFVzGTKjPoV)
  const priceId = subscription.items.data[0].price.id;
  console.log(`📦 Price ID: ${priceId}`);

  // Atualizar merchant no banco (ATIVAR ASSINATURA)
  await supabase
    .from('merchants')
    .update({
      stripe_customer_id: customerId,
      subscription_id: subscriptionId,
      subscription_status: 'active', // ✅ ATIVO
      last_payment_date: new Date().toISOString(),
      next_billing_date: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('id', merchantId);

  console.log(`✅ Merchant ${merchantId} ATIVADO (subscription: ${subscriptionId})`);

  // 🔔 ENVIAR NOTIFICAÇÃO WEB PUSH (CADASTRO)
  try {
    await sendWebPushNotification(
      merchantId,
      '🎉 Bem-vindo ao LocalCashback!',
      `Sua assinatura ${plan.toUpperCase()} está ativa. Comece a fidelizar seus clientes agora!`,
      'https://localcashback.com.br/dashboard'
    );
  } catch (notifError) {
    console.error('[OneSignal] Erro ao enviar notificação de boas-vindas:', notifError);
    // Não falhar o webhook por causa da notificação
  }

  // 🎁 Enviar email de boas-vindas após confirmação do pagamento
  try {
    // Buscar dados do proprietário/employee
    const { data: employee } = await supabase
      .from('employees')
      .select('id, name, email')
      .eq('merchant_id', merchantId)
      .eq('role', 'owner')
      .single();

    if (employee) {
      console.log('📧 Enviando email de boas-vindas para:', employee.email);
      
      // Enviar email através do endpoint Resend
      const emailResponse = await axios.post(
        'http://localhost:3001/api/resend/send',
        {
          apiKey: process.env.VITE_RESEND_API_KEY,
          from: process.env.VITE_RESEND_FROM_EMAIL || 'noreply@localcashback.com.br',
          to: employee.email,
          subject: '🎉 Bem-vindo ao LocalCashback!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #6366f1;">🎉 Bem-vindo ao LocalCashback!</h1>
              <p>Olá <strong>${employee.name}</strong>,</p>
              <p>Sua assinatura foi confirmada com sucesso!</p>
              <p><strong>Plano:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
              <p>Você agora tem acesso completo à plataforma por <strong>14 dias grátis</strong>.</p>
              <p>Acesse o sistema: <a href="https://localcashback.com.br/login">https://localcashback.com.br/login</a></p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Se tiver dúvidas, responda este email.<br>
                Equipe LocalCashback
              </p>
            </div>
          `,
        }
      );

      if (emailResponse.data.success) {
        console.log('✅ Email de boas-vindas enviado:', emailResponse.data.id);
      } else {
        console.error('❌ Erro ao enviar email:', emailResponse.data.error);
      }
    }
  } catch (emailError) {
    console.error('❌ Erro ao enviar email de boas-vindas:', emailError.message);
    // Não falhar o webhook por causa do email
  }
}

/**
 * Assinatura atualizada (upgrade/downgrade)
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Assinatura atualizada:', subscription.id);

  const customerId = subscription.customer;

  // Buscar merchant pelo stripe_customer_id
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!merchant) {
    console.error('❌ Merchant não encontrado para customer:', customerId);
    return;
  }

  // Determinar plano
  const priceId = subscription.items.data[0].price.id;
  let plan = 'starter';
  if (priceId === process.env.VITE_STRIPE_PRICE_BUSINESS) {
    plan = 'business';
  } else if (priceId === process.env.VITE_STRIPE_PRICE_PREMIUM) {
    plan = 'premium';
  }

  const planConfig = getPlanConfig(plan);

  // Atualizar merchant
  await supabase
    .from('merchants')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_plan: plan,
      customer_limit: planConfig.customerLimit,
      employee_limit: planConfig.employeeLimit,
      features_enabled: planConfig.features,
      subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', merchant.id);

  console.log(`✅ Merchant ${merchant.id} - Plano alterado para: ${plan}`);
}

/**
 * Assinatura cancelada
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Assinatura cancelada:', subscription.id);

  const customerId = subscription.customer;

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!merchant) return;

  // Voltar para plano Starter com limites mínimos
  await supabase
    .from('merchants')
    .update({
      subscription_status: 'canceled',
      subscription_plan: 'starter',
      customer_limit: 2000,
      employee_limit: 1,
      features_enabled: {
        dashboard_cac_ltv: false,
        integrations: false,
        push_notifications: true,
        advanced_reports: false,
        whitelabel: false,
        custom_domain: false,
        multiple_stores: false,
      },
    })
    .eq('id', merchant.id);

  console.log(`✅ Merchant ${merchant.id} - Assinatura cancelada, voltou para Starter`);
}

/**
 * Pagamento bem-sucedido
 */
async function handlePaymentSucceeded(invoice) {
  console.log('💰 Pagamento recebido:', invoice.id);

  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  // Atualizar status para active
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!merchant) return;

  await supabase
    .from('merchants')
    .update({
      subscription_status: 'active',
    })
    .eq('id', merchant.id);

  console.log(`✅ Merchant ${merchant.id} - Pagamento confirmado, status: active`);
}

/**
 * Falha no pagamento
 */
async function handlePaymentFailed(invoice) {
  console.log('⚠️ Falha no pagamento:', invoice.id);

  const customerId = invoice.customer;

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!merchant) return;

  await supabase
    .from('merchants')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', merchant.id);

  console.log(`⚠️ Merchant ${merchant.id} - Pagamento falhou, status: past_due`);
}

// ============================================
// 🔔 ENDPOINTS PARA NOTIFICAÇÕES ONESIGNAL
// ============================================

/**
 * POST /api/onesignal/notify-cashback
 * Enviar notificação quando cliente ganhar cashback
 */
app.post('/api/onesignal/notify-cashback', async (req, res) => {
  try {
    const { merchantId, customerName, cashbackAmount, totalBalance } = req.body;
    
    if (!merchantId || !customerName || !cashbackAmount) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: merchantId, customerName, cashbackAmount' 
      });
    }
    
    const result = await sendWebPushNotification(
      merchantId,
      '🎉 Novo Cashback!',
      `${customerName} ganhou R$ ${parseFloat(cashbackAmount).toFixed(2)}! Total: R$ ${parseFloat(totalBalance || cashbackAmount).toFixed(2)}`,
      'https://localcashback.com.br/cashback'
    );
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Notificação de cashback enviada',
        recipients: result.recipients 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
  } catch (error) {
    console.error('[OneSignal] Erro no endpoint notify-cashback:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/onesignal/notify-redemption
 * Enviar notificação quando cliente solicitar resgate
 */
app.post('/api/onesignal/notify-redemption', async (req, res) => {
  try {
    const { merchantId, customerName, redemptionAmount } = req.body;
    
    if (!merchantId || !customerName || !redemptionAmount) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: merchantId, customerName, redemptionAmount' 
      });
    }
    
    const result = await sendWebPushNotification(
      merchantId,
      '💰 Solicitação de Resgate',
      `${customerName} quer resgatar R$ ${parseFloat(redemptionAmount).toFixed(2)}. Aprove agora!`,
      'https://localcashback.com.br/redemption'
    );
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Notificação de resgate enviada',
        recipients: result.recipients 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
  } catch (error) {
    console.error('[OneSignal] Erro no endpoint notify-redemption:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/onesignal/notify-signup
 * Enviar notificação quando novo cliente se cadastrar
 */
app.post('/api/onesignal/notify-signup', async (req, res) => {
  try {
    const { merchantId, customerName, customerPhone } = req.body;
    
    if (!merchantId || !customerName) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: merchantId, customerName' 
      });
    }
    
    const result = await sendWebPushNotification(
      merchantId,
      '👤 Novo Cliente Cadastrado!',
      `${customerName} acabou de se cadastrar${customerPhone ? ` (${customerPhone})` : ''}. Bem-vindo!`,
      'https://localcashback.com.br/customers'
    );
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Notificação de cadastro enviada',
        recipients: result.recipients 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
  } catch (error) {
    console.error('[OneSignal] Erro no endpoint notify-signup:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// =====================================
// HELPER FUNCTIONS
// =====================================

function getPlanConfig(plan) {
  const configs = {
    starter: {
      customerLimit: 2000,
      employeeLimit: 1,
      features: {
        dashboard_cac_ltv: false,
        integrations: false,
        push_notifications: true,
        advanced_reports: false,
        whitelabel: false,
        custom_domain: false,
        multiple_stores: false,
      },
    },
    business: {
      customerLimit: 10000,
      employeeLimit: 5,
      features: {
        dashboard_cac_ltv: true,
        integrations: true,
        push_notifications: true,
        advanced_reports: true,
        whitelabel: true,
        custom_domain: false,
        multiple_stores: false,
      },
    },
    premium: {
      customerLimit: null, // ilimitado
      employeeLimit: null, // ilimitado
      features: {
        dashboard_cac_ltv: true,
        integrations: true,
        push_notifications: true,
        advanced_reports: true,
        whitelabel: true,
        custom_domain: true,
        multiple_stores: true,
      },
    },
  };

  return configs[plan] || configs.starter;
}

// ============================================
// 🎯 TRIAL DE 14 DIAS - NOVOS ENDPOINTS
// ============================================

/**
 * POST /api/stripe/create-checkout
 * Criar checkout Stripe (usado quando trial expirar)
 */
app.post('/api/stripe/create-checkout', async (req, res) => {
  try {
    const { merchantId } = req.body;
    
    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId é obrigatório' });
    }
    
    // Buscar merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('email, business_name, stripe_customer_id')
      .eq('id', merchantId)
      .single();
    
    if (merchantError || !merchant) {
      return res.status(404).json({ error: 'Merchant não encontrado' });
    }
    
    // Criar ou buscar Stripe Customer
    let stripeCustomerId = merchant.stripe_customer_id;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: merchant.email,
        name: merchant.business_name,
        metadata: {
          merchant_id: merchantId
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Salvar Stripe Customer ID
      await supabase
        .from('merchants')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', merchantId);
      
      console.log(`✅ Stripe Customer criado: ${stripeCustomerId}`);
    }
    
    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1SluhgAev6mInEFVzGTKjPoV', // ✅ PREÇO ÚNICO
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'https://cashback.raulricco.com.br'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://cashback.raulricco.com.br'}/dashboard?cancelled=true`,
      metadata: {
        merchant_id: merchantId
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR'
    });
    
    console.log(`✅ Checkout Session criada: ${session.id}`);
    
    res.json({ 
      success: true, 
      sessionId: session.id,
      checkoutUrl: session.url
    });
    
  } catch (error) {
    console.error('Erro ao criar Checkout Session:', error);
    res.status(500).json({ error: 'Erro ao criar checkout' });
  }
});

/**
 * GET /api/merchants/:merchantId/subscription-status
 * Obter status da subscription do merchant
 */
app.get('/api/merchants/:merchantId/subscription-status', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('subscription_status, trial_start_date, trial_end_date, next_billing_date')
      .eq('id', merchantId)
      .single();
    
    if (error || !merchant) {
      return res.status(404).json({ error: 'Merchant não encontrado' });
    }
    
    // Calcular dias restantes de trial
    let trialDaysRemaining = null;
    if (merchant.subscription_status === 'trial' && merchant.trial_end_date) {
      const now = new Date();
      const trialEnd = new Date(merchant.trial_end_date);
      trialDaysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      
      // Se negativo, trial expirou
      if (trialDaysRemaining <= 0) {
        await supabase
          .from('merchants')
          .update({ subscription_status: 'expired' })
          .eq('id', merchantId);
        
        merchant.subscription_status = 'expired';
        trialDaysRemaining = 0;
      }
    }
    
    res.json({
      status: merchant.subscription_status,
      trialStartDate: merchant.trial_start_date,
      trialEndDate: merchant.trial_end_date,
      trialDaysRemaining,
      nextBillingDate: merchant.next_billing_date
    });
    
  } catch (error) {
    console.error('Erro ao buscar status de subscription:', error);
    res.status(500).json({ error: 'Erro ao buscar status' });
  }
});

// ====================================
// AUTOMAÇÃO: MENSAGENS DE ANIVERSÁRIO
// ====================================

/**
 * Busca clientes com aniversário nos próximos X dias
 * @param {number} daysAhead - Quantos dias de antecedência (ex: 30 dias)
 * @returns {Array} Lista de clientes com aniversário próximo
 */
async function getUpcomingBirthdays(daysAhead = 30) {
  try {
    // Buscar todos os clientes com birthdate definido
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, phone, email, birthdate, merchant_id')
      .not('birthdate', 'is', null)
      .order('birthdate', { ascending: true });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }

    // Filtrar clientes com aniversário nos próximos X dias
    const now = new Date();
    const upcomingBirthdays = [];

    for (const customer of customers) {
      const birthdate = new Date(customer.birthdate);
      
      // Calcular próximo aniversário (ano atual)
      const thisYearBirthday = new Date(
        now.getFullYear(),
        birthdate.getMonth(),
        birthdate.getDate()
      );

      // Se já passou este ano, considerar ano que vem
      if (thisYearBirthday < now) {
        thisYearBirthday.setFullYear(now.getFullYear() + 1);
      }

      // Calcular diferença em dias
      const diffTime = thisYearBirthday - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Se o aniversário está nos próximos X dias
      if (diffDays >= 0 && diffDays <= daysAhead) {
        upcomingBirthdays.push({
          ...customer,
          daysUntilBirthday: diffDays,
          nextBirthday: thisYearBirthday
        });
      }
    }

    return upcomingBirthdays;
  } catch (error) {
    console.error('Erro ao buscar aniversários:', error);
    return [];
  }
}

/**
 * Enviar mensagem de aniversário via WhatsApp (simulação)
 * TODO: Integrar com API real do WhatsApp (Twilio, Evolution API, etc)
 */
async function sendBirthdayWhatsAppMessage(customer, merchant) {
  try {
    console.log(`🎉 ANIVERSÁRIO - Enviando mensagem para: ${customer.name}`);
    console.log(`   Telefone: ${customer.phone}`);
    console.log(`   Dias até aniversário: ${customer.daysUntilBirthday}`);
    console.log(`   Merchant: ${merchant?.name || 'N/A'}`);

    // Mensagem personalizada
    const message = `🎉 Olá ${customer.name}!\n\nO seu aniversário está chegando em ${customer.daysUntilBirthday} dias! 🎂\n\nPara comemorar, preparamos uma surpresa especial pra você! 🎁\n\nAguardamos sua visita! ❤️\n\n- Equipe ${merchant?.name || 'LocalCashback'}`;

    // TODO: Integrar com API de WhatsApp
    // Exemplo com Evolution API:
    /*
    const evolutionApiUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    
    const response = await axios.post(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
      number: customer.phone,
      text: message
    }, {
      headers: {
        'apikey': evolutionApiKey
      }
    });
    */

    // Por enquanto, apenas log
    console.log(`📱 Mensagem: ${message}`);
    console.log('✅ Mensagem registrada (integração WhatsApp pendente)');
    
    return { success: true, message: 'Mensagem agendada' };
  } catch (error) {
    console.error('Erro ao enviar mensagem de aniversário:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Processar envio de mensagens de aniversário
 */
async function processBirthdayMessages() {
  console.log('');
  console.log('🎂 ========================================');
  console.log('🎂 Processando Mensagens de Aniversário');
  console.log('🎂 ========================================');
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);

  try {
    // Buscar aniversários dos próximos 30 dias
    const daysAhead = parseInt(process.env.BIRTHDAY_DAYS_AHEAD || '30');
    const customers = await getUpcomingBirthdays(daysAhead);

    console.log(`📊 Encontrados: ${customers.length} aniversariantes`);

    if (customers.length === 0) {
      console.log('ℹ️  Nenhum aniversário nos próximos dias');
      return;
    }

    // Agrupar por merchant para enviar em lote
    const merchantGroups = {};
    for (const customer of customers) {
      if (!merchantGroups[customer.merchant_id]) {
        merchantGroups[customer.merchant_id] = [];
      }
      merchantGroups[customer.merchant_id].push(customer);
    }

    // Processar cada merchant
    for (const [merchantId, merchantCustomers] of Object.entries(merchantGroups)) {
      // Buscar dados do merchant
      const { data: merchant, error } = await supabase
        .from('merchants')
        .select('id, name, email')
        .eq('id', merchantId)
        .single();

      if (error) {
        console.error(`❌ Erro ao buscar merchant ${merchantId}:`, error);
        continue;
      }

      console.log(`\n📍 Merchant: ${merchant.name}`);
      console.log(`   Aniversariantes: ${merchantCustomers.length}`);

      // Enviar mensagens
      for (const customer of merchantCustomers) {
        await sendBirthdayWhatsAppMessage(customer, merchant);
        
        // Delay de 1s entre mensagens para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n✅ Processamento concluído!');
    console.log('🎂 ========================================');
    console.log('');
  } catch (error) {
    console.error('❌ Erro ao processar mensagens de aniversário:', error);
  }
}

// ====================================
// ENDPOINT: TESTE MANUAL DE ANIVERSÁRIOS
// ====================================

app.get('/api/birthday/upcoming', async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days || '30');
    const customers = await getUpcomingBirthdays(daysAhead);
    
    res.json({
      success: true,
      count: customers.length,
      daysAhead,
      customers: customers.map(c => ({
        name: c.name,
        phone: c.phone,
        birthdate: c.birthdate,
        daysUntilBirthday: c.daysUntilBirthday,
        nextBirthday: c.nextBirthday,
        merchant_id: c.merchant_id
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar aniversários:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/birthday/send-test', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ error: 'customerId é obrigatório' });
    }

    // Buscar cliente
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Buscar merchant
    const { data: merchant } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', customer.merchant_id)
      .single();

    // Enviar mensagem de teste
    const result = await sendBirthdayWhatsAppMessage({
      ...customer,
      daysUntilBirthday: 0
    }, merchant);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// CRON: EXECUTAR DIARIAMENTE ÀS 9:00
// ====================================

// Executar todo dia às 9:00 AM
cron.schedule('0 9 * * *', () => {
  console.log('⏰ Cron job ativado: Mensagens de Aniversário');
  processBirthdayMessages();
}, {
  timezone: "America/Sao_Paulo"
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 Servidor Stripe API Iniciado!');
  console.log('🚀 ========================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Stripe Mode: ${process.env.VITE_STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE'}`);
  console.log('');
  console.log('📋 Endpoints disponíveis:');
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/stripe/create-checkout-session`);
  console.log(`   POST /api/stripe/create-checkout (Trial)`);
  console.log(`   GET  /api/merchants/:merchantId/subscription-status (Trial)`);
  console.log(`   POST /api/stripe/create-portal-session`);
  console.log(`   GET  /api/stripe/subscription-status/:merchantId`);
  console.log(`   POST /api/stripe/webhook`);
  console.log(`   POST /api/resend/send`);
  console.log(`   POST /api/mailchimp/subscribe`);
  console.log(`   POST /api/mailchimp/sync`);
  console.log(`   POST /api/onesignal/notify-cashback`);
  console.log(`   POST /api/onesignal/notify-redemption`);
  console.log(`   POST /api/onesignal/notify-signup`);
  console.log(`   GET  /api/birthday/upcoming?days=30 (🎂 Aniversários)`);
  console.log(`   POST /api/birthday/send-test (🎂 Teste de Mensagem)`);
  console.log('');
  console.log('✅ Pronto para receber requisições!');
  console.log('⏰ Cron: Mensagens de Aniversário (Diariamente às 9:00 AM)');
  console.log('🚀 ========================================');
  console.log('');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});
