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

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS para aceitar requisições do frontend
const allowedOrigins = [
  'http://localhost:5173', // DEV
  'http://localhost:8080', // DEV server
  'https://localcashback.com.br', // Produção
  'https://www.localcashback.com.br', // Produção www
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

  // Plano único "lançamento"
  const plan = 'launch';
  const planConfig = getPlanConfig();

  // Atualizar merchant no banco
  await supabase
    .from('merchants')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: subscription.status,
      subscription_plan: plan,
      customer_limit: planConfig.customerLimit,
      employee_limit: planConfig.employeeLimit,
      features_enabled: planConfig.features,
      subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_ends_at: null, // Remover trial quando assinar
    })
    .eq('id', merchantId);

  console.log(`✅ Merchant ${merchantId} atualizado - Plano: ${plan}`);
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

  // Plano único "lançamento"
  const plan = 'launch';
  const planConfig = getPlanConfig();

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

  // Assinatura cancelada — mantém o plano único, apenas marca o status
  await supabase
    .from('merchants')
    .update({
      subscription_status: 'canceled',
    })
    .eq('id', merchant.id);

  console.log(`✅ Merchant ${merchant.id} - Assinatura cancelada`);
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

// =====================================
// HELPER FUNCTIONS
// =====================================

function getPlanConfig() {
  // Plano único "lançamento" — tudo liberado, sem limites
  return {
    customerLimit: null,
    employeeLimit: null,
    features: {
      dashboard_cac_ltv: true,
      integrations: true,
      push_notifications: true,
      advanced_reports: true,
      whitelabel: true,
      custom_domain: true,
      multiple_stores: true,
    },
  };
}

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
  console.log(`   POST /api/stripe/create-portal-session`);
  console.log(`   GET  /api/stripe/subscription-status/:merchantId`);
  console.log(`   POST /api/stripe/webhook`);
  console.log('');
  console.log('✅ Pronto para receber requisições!');
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
