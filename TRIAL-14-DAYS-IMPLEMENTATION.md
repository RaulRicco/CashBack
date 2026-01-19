# Trial de 14 Dias + Pagamento Único - Implementação

**Data**: 2026-01-03  
**Status**: Planejamento Completo  
**Autor**: GenSpark AI Developer  

---

## 🎯 **Novo Modelo de Negócio**

### **Antes:**
- ❌ Página de vendas complexa
- ❌ Múltiplos planos
- ❌ Checkout separado
- ❌ Bloqueio manual

### **Depois:**
- ✅ **1 único produto**: `price_1SluhgAev6mInEFVzGTKjPoV`
- ✅ **Trial de 14 dias grátis**
- ✅ **Bloqueio automático** se não pagar
- ✅ **Checkout direto no cadastro**

---

## 🔄 **Fluxo Completo**

```
1. CADASTRO
   ↓
   [Merchant preenche formulário]
   ↓
   ✅ Trial iniciado (14 dias)
   ↓
   Dashboard liberado 100%

2. DURANTE O TRIAL (dias 1-14)
   ↓
   [Usa todas as funcionalidades]
   ↓
   Banner: "Trial: 12 dias restantes"
   ↓
   Dia 10: Email "Faltam 4 dias"

3. FIM DO TRIAL (dia 15)
   ↓
   ❓ Pagou?
   ├─ SIM ✅ → Continua normal
   └─ NÃO ❌ → BLOQUEADO

4. BLOQUEADO
   ↓
   [Tela: "Trial expirou. Assine!"]
   ↓
   [Botão Stripe Checkout]
   ↓
   Pagamento realizado?
   ├─ SIM ✅ → DESBLOQUEADO
   └─ NÃO ❌ → Continua bloqueado

5. ASSINATURA ATIVA
   ↓
   [Sistema funcionando]
   ↓
   Webhook monitora cancelamentos
```

---

## 🗄️ **Alterações no Database**

### **Modificar tabela `merchants`:**

```sql
-- Adicionar colunas de trial e subscription
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial'; 
  -- Valores: 'trial', 'active', 'expired', 'cancelled', 'past_due'
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255); -- Stripe subscription ID
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255); -- Stripe customer ID
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_merchants_trial_end ON merchants(trial_end_date) WHERE subscription_status = 'trial';
CREATE INDEX IF NOT EXISTS idx_merchants_subscription_status ON merchants(subscription_status);

-- Comentário
COMMENT ON COLUMN merchants.subscription_status IS 'Status da assinatura: trial, active, expired, cancelled, past_due';
```

---

## 💻 **Backend - Modificações**

### **1. Modificar Signup (Iniciar Trial Automático)**

```javascript
// server.js - Endpoint de signup

app.post('/api/auth/signup', async (req, res) => {
  try {
    const {
      business_name,
      owner_name,
      email,
      phone,
      password,
      // ... outros campos
    } = req.body;
    
    // Validações...
    
    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);
    
    // Calcular datas do trial (14 dias)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    // Criar merchant com trial ativo
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .insert({
        business_name,
        owner_name,
        email,
        phone,
        password_hash,
        // Trial
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        subscription_status: 'trial', // ✅ Trial ativo
        // ... outros campos
      })
      .select()
      .single();
    
    if (merchantError) {
      console.error('Erro ao criar merchant:', merchantError);
      return res.status(500).json({ error: 'Erro ao criar conta' });
    }
    
    console.log(`✅ Merchant ${merchant.id} criado com trial até ${trialEndDate.toISOString()}`);
    
    // Enviar email de boas-vindas
    await sendWelcomeEmail(merchant, trialEndDate);
    
    res.json({ 
      success: true, 
      merchant,
      trialDaysRemaining: 14
    });
    
  } catch (error) {
    console.error('Erro no signup:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

---

### **2. Middleware de Verificação de Acesso**

```javascript
// server.js - Middleware para proteger rotas

async function checkSubscriptionAccess(req, res, next) {
  try {
    const merchantId = req.body.merchantId || req.params.merchantId || req.query.merchantId;
    
    if (!merchantId) {
      return res.status(401).json({ error: 'merchantId não fornecido' });
    }
    
    // Buscar merchant
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('subscription_status, trial_end_date')
      .eq('id', merchantId)
      .single();
    
    if (error || !merchant) {
      return res.status(404).json({ error: 'Merchant não encontrado' });
    }
    
    // Verificar status
    const status = merchant.subscription_status;
    
    if (status === 'active') {
      // ✅ Assinatura ativa - pode continuar
      return next();
    }
    
    if (status === 'trial') {
      // ✅ Trial - verificar se ainda é válido
      const now = new Date();
      const trialEnd = new Date(merchant.trial_end_date);
      
      if (now <= trialEnd) {
        // ✅ Trial ainda válido
        return next();
      } else {
        // ❌ Trial expirou - bloquear e atualizar status
        await supabase
          .from('merchants')
          .update({ subscription_status: 'expired' })
          .eq('id', merchantId);
        
        return res.status(403).json({ 
          error: 'Trial expirado',
          code: 'TRIAL_EXPIRED',
          message: 'Seu período de teste expirou. Assine agora para continuar usando.'
        });
      }
    }
    
    // ❌ Status: expired, cancelled, past_due
    return res.status(403).json({ 
      error: 'Acesso bloqueado',
      code: 'SUBSCRIPTION_REQUIRED',
      message: 'Sua assinatura está inativa. Renove para continuar usando.'
    });
    
  } catch (error) {
    console.error('Erro no middleware de subscription:', error);
    res.status(500).json({ error: 'Erro ao verificar acesso' });
  }
}

// Aplicar middleware em rotas protegidas
app.get('/api/merchants/:merchantId/dashboard', checkSubscriptionAccess, async (req, res) => {
  // ... lógica do dashboard
});

app.post('/api/customers', checkSubscriptionAccess, async (req, res) => {
  // ... criar cliente
});

app.post('/api/transactions', checkSubscriptionAccess, async (req, res) => {
  // ... criar transação
});

// Aplicar em TODAS as rotas de funcionalidade (exceto login/signup)
```

---

### **3. Endpoint de Checkout Stripe**

```javascript
// server.js - Criar Checkout Session

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
          price: 'price_1SluhgAev6mInEFVzGTKjPoV', // ✅ SEU PRICE ID
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?cancelled=true`,
      metadata: {
        merchant_id: merchantId
      },
      allow_promotion_codes: true, // Permite cupons de desconto
      billing_address_collection: 'required'
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
```

---

### **4. Webhook Stripe (Desbloquear Após Pagamento)**

```javascript
// server.js - Webhook Stripe

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Erro ao verificar webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  console.log(`📥 Webhook recebido: ${event.type}`);
  
  // Processar evento
  switch (event.type) {
    case 'checkout.session.completed':
      // ✅ Pagamento realizado com sucesso
      await handleCheckoutCompleted(event.data.object);
      break;
    
    case 'customer.subscription.created':
      // ✅ Assinatura criada
      await handleSubscriptionCreated(event.data.object);
      break;
    
    case 'customer.subscription.updated':
      // 🔄 Assinatura atualizada (renovação, mudança de plano)
      await handleSubscriptionUpdated(event.data.object);
      break;
    
    case 'customer.subscription.deleted':
      // ❌ Assinatura cancelada
      await handleSubscriptionDeleted(event.data.object);
      break;
    
    case 'invoice.payment_succeeded':
      // ✅ Pagamento de fatura bem-sucedido
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      // ❌ Pagamento de fatura falhou
      await handleInvoicePaymentFailed(event.data.object);
      break;
    
    default:
      console.log(`ℹ️ Evento não tratado: ${event.type}`);
  }
  
  res.json({ received: true });
});

// Handler: Checkout completado
async function handleCheckoutCompleted(session) {
  const merchantId = session.metadata.merchant_id;
  const subscriptionId = session.subscription;
  
  console.log(`✅ Checkout completado para merchant ${merchantId}`);
  
  // Atualizar merchant (desbloquear)
  const { error } = await supabase
    .from('merchants')
    .update({
      subscription_status: 'active', // ✅ Ativar assinatura
      subscription_id: subscriptionId,
      last_payment_date: new Date().toISOString()
    })
    .eq('id', merchantId);
  
  if (error) {
    console.error('Erro ao ativar assinatura:', error);
  } else {
    console.log(`✅ Merchant ${merchantId} DESBLOQUEADO`);
    
    // Enviar email de confirmação
    await sendSubscriptionActiveEmail(merchantId);
  }
}

// Handler: Assinatura criada
async function handleSubscriptionCreated(subscription) {
  const merchantId = subscription.metadata.merchant_id;
  
  console.log(`✅ Assinatura criada: ${subscription.id}`);
  
  await supabase
    .from('merchants')
    .update({
      subscription_status: 'active',
      subscription_id: subscription.id,
      next_billing_date: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('id', merchantId);
}

// Handler: Assinatura atualizada
async function handleSubscriptionUpdated(subscription) {
  const merchantId = subscription.metadata.merchant_id;
  
  console.log(`🔄 Assinatura atualizada: ${subscription.id}`);
  
  let status = 'active';
  if (subscription.status === 'past_due') status = 'past_due';
  if (subscription.status === 'canceled') status = 'cancelled';
  
  await supabase
    .from('merchants')
    .update({
      subscription_status: status,
      next_billing_date: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('id', merchantId);
}

// Handler: Assinatura deletada
async function handleSubscriptionDeleted(subscription) {
  const merchantId = subscription.metadata.merchant_id;
  
  console.log(`❌ Assinatura cancelada: ${subscription.id}`);
  
  await supabase
    .from('merchants')
    .update({
      subscription_status: 'cancelled' // ❌ Bloquear acesso
    })
    .eq('id', merchantId);
  
  console.log(`❌ Merchant ${merchantId} BLOQUEADO`);
}

// Handler: Pagamento de fatura bem-sucedido
async function handleInvoicePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  
  console.log(`✅ Pagamento bem-sucedido: ${invoice.id}`);
  
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .single();
  
  if (merchant) {
    await supabase
      .from('merchants')
      .update({
        subscription_status: 'active',
        last_payment_date: new Date().toISOString()
      })
      .eq('id', merchant.id);
  }
}

// Handler: Pagamento de fatura falhou
async function handleInvoicePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  
  console.log(`❌ Pagamento falhou: ${invoice.id}`);
  
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, email, business_name')
    .eq('subscription_id', subscriptionId)
    .single();
  
  if (merchant) {
    await supabase
      .from('merchants')
      .update({
        subscription_status: 'past_due' // ⚠️ Atraso no pagamento
      })
      .eq('id', merchant.id);
    
    // Enviar email de cobrança
    await sendPaymentFailedEmail(merchant);
  }
}
```

---

### **5. Cron Job - Verificar Trials Expirados**

```javascript
// server.js - Cron job para bloquear trials expirados

const cron = require('node-cron');

// Roda a cada 1 hora
cron.schedule('0 * * * *', async () => {
  console.log('🔍 Verificando trials expirados...');
  
  const now = new Date().toISOString();
  
  // Buscar merchants com trial expirado
  const { data: expiredMerchants, error } = await supabase
    .from('merchants')
    .select('id, business_name, email, trial_end_date')
    .eq('subscription_status', 'trial')
    .lt('trial_end_date', now);
  
  if (error) {
    console.error('Erro ao buscar trials expirados:', error);
    return;
  }
  
  if (!expiredMerchants || expiredMerchants.length === 0) {
    console.log('✅ Nenhum trial expirado encontrado');
    return;
  }
  
  console.log(`⚠️ ${expiredMerchants.length} trial(s) expirado(s)`);
  
  // Bloquear cada merchant
  for (const merchant of expiredMerchants) {
    const { error: updateError } = await supabase
      .from('merchants')
      .update({ subscription_status: 'expired' })
      .eq('id', merchant.id);
    
    if (updateError) {
      console.error(`Erro ao bloquear merchant ${merchant.id}:`, updateError);
    } else {
      console.log(`❌ Merchant ${merchant.business_name} (${merchant.id}) BLOQUEADO`);
      
      // Enviar email de trial expirado
      await sendTrialExpiredEmail(merchant);
    }
  }
  
  console.log('✅ Verificação de trials concluída');
});

// Cron job: Lembrete 4 dias antes do trial expirar
cron.schedule('0 9 * * *', async () => {
  console.log('📧 Verificando lembretes de trial...');
  
  const fourDaysFromNow = new Date();
  fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);
  
  const startOfDay = new Date(fourDaysFromNow.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(fourDaysFromNow.setHours(23, 59, 59, 999)).toISOString();
  
  const { data: merchants, error } = await supabase
    .from('merchants')
    .select('id, business_name, email, trial_end_date')
    .eq('subscription_status', 'trial')
    .gte('trial_end_date', startOfDay)
    .lte('trial_end_date', endOfDay);
  
  if (error) {
    console.error('Erro ao buscar merchants para lembrete:', error);
    return;
  }
  
  if (!merchants || merchants.length === 0) {
    console.log('✅ Nenhum lembrete para enviar hoje');
    return;
  }
  
  console.log(`📧 Enviando ${merchants.length} lembrete(s) de trial`);
  
  for (const merchant of merchants) {
    await sendTrialReminderEmail(merchant, 4);
    console.log(`✅ Lembrete enviado para ${merchant.email}`);
  }
});

console.log('✅ Cron jobs de trial configurados');
```

---

## 🎨 **Frontend - Modificações**

### **1. Remover Página de Vendas**

```javascript
// cashback-system/src/App.jsx - Remover rota da landing page

// ANTES:
<Route path="/" element={<LandingPage />} />
<Route path="/signup" element={<Signup />} />

// DEPOIS:
<Route path="/" element={<Signup />} /> {/* Signup direto na home */}
```

---

### **2. Modificar Signup (Mensagem de Trial)**

```javascript
// cashback-system/src/pages/Signup.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validações
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }
      
      // Chamar API de signup
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // ✅ Conta criada com trial ativo
        alert(`✅ Conta criada! Você tem ${data.trialDaysRemaining} dias de teste grátis.`);
        navigate('/login');
      } else {
        setError(data.error || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro no signup:', error);
      setError('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1>🚀 Comece Seu Trial Grátis</h1>
        <p className="trial-info">
          ✅ 14 dias grátis<br/>
          ✅ Sem cartão de crédito<br/>
          ✅ Cancele quando quiser
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome do Estabelecimento"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            required
          />
          
          <input
            type="text"
            placeholder="Seu Nome"
            value={formData.owner_name}
            onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <input
            type="tel"
            placeholder="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          <input
            type="password"
            placeholder="Confirmar Senha"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Criando conta...' : '🚀 Iniciar Trial Grátis'}
          </button>
        </form>
        
        <p className="login-link">
          Já tem uma conta? <a href="/login">Faça login</a>
        </p>
      </div>
    </div>
  );
}
```

---

### **3. Adicionar Banner de Trial no Dashboard**

```javascript
// cashback-system/src/components/TrialBanner.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function TrialBanner() {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.merchant_id) {
      loadTrialInfo();
    }
  }, [user]);

  async function loadTrialInfo() {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('subscription_status, trial_end_date, next_billing_date')
        .eq('id', user.merchant_id)
        .single();
      
      if (error) {
        console.error('Erro ao carregar trial info:', error);
        setLoading(false);
        return;
      }
      
      if (data.subscription_status === 'trial') {
        const now = new Date();
        const trialEnd = new Date(data.trial_end_date);
        const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        
        setTrialInfo({
          status: 'trial',
          daysRemaining,
          endDate: trialEnd
        });
      } else if (data.subscription_status === 'active') {
        setTrialInfo({
          status: 'active',
          nextBilling: new Date(data.next_billing_date)
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar trial info:', error);
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: user.merchant_id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirecionar para Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        alert('Erro ao criar checkout: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      alert('Erro ao processar pagamento');
    }
  }

  if (loading) return null;
  if (!trialInfo) return null;

  if (trialInfo.status === 'trial') {
    const urgency = trialInfo.daysRemaining <= 4 ? 'urgent' : '';
    
    return (
      <div className={`trial-banner ${urgency}`}>
        <div className="trial-content">
          <span className="trial-icon">⏰</span>
          <div className="trial-text">
            <strong>Trial: {trialInfo.daysRemaining} dias restantes</strong>
            <p>Seu trial expira em {trialInfo.endDate.toLocaleDateString('pt-BR')}</p>
          </div>
          <button onClick={handleSubscribe} className="subscribe-btn">
            💳 Assinar Agora
          </button>
        </div>
      </div>
    );
  }

  if (trialInfo.status === 'active') {
    return (
      <div className="trial-banner active">
        <div className="trial-content">
          <span className="trial-icon">✅</span>
          <div className="trial-text">
            <strong>Assinatura Ativa</strong>
            <p>Próxima cobrança: {trialInfo.nextBilling.toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
```

```css
/* cashback-system/src/components/TrialBanner.css */

.trial-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.trial-banner.urgent {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.trial-banner.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.trial-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.trial-icon {
  font-size: 2rem;
}

.trial-text {
  flex: 1;
}

.trial-text strong {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.trial-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.subscribe-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.subscribe-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

---

### **4. Criar Página de Bloqueio**

```javascript
// cashback-system/src/pages/SubscriptionRequired.jsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SubscriptionRequired() {
  const { user } = useAuth();

  async function handleSubscribe() {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: user.merchant_id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Erro ao criar checkout: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      alert('Erro ao processar pagamento');
    }
  }

  return (
    <div className="subscription-required">
      <div className="blocked-container">
        <div className="blocked-icon">🔒</div>
        <h1>Trial Expirado</h1>
        <p>
          Seu período de teste de 14 dias expirou.<br/>
          Assine agora para continuar usando o Local CashBack!
        </p>
        
        <div className="features-list">
          <h3>✨ O que você continua tendo:</h3>
          <ul>
            <li>✅ Cashback automatizado</li>
            <li>✅ Gestão de clientes</li>
            <li>✅ Integrações (OneSignal, WhatsApp, Mailchimp)</li>
            <li>✅ Relatórios completos</li>
            <li>✅ Suporte prioritário</li>
          </ul>
        </div>
        
        <div className="pricing">
          <div className="price-card">
            <div className="price">R$ XX,XX/mês</div>
            <p>Price ID: price_1SluhgAev6mInEFVzGTKjPoV</p>
          </div>
        </div>
        
        <button onClick={handleSubscribe} className="subscribe-btn-large">
          💳 Assinar Agora
        </button>
        
        <p className="help-text">
          Dúvidas? <a href="mailto:suporte@localcashback.com">Entre em contato</a>
        </p>
      </div>
    </div>
  );
}
```

---

### **5. Modificar AuthContext (Verificar Bloqueio)**

```javascript
// cashback-system/src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      // Verificar token e buscar dados do usuário
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setSubscriptionStatus(data.user.subscription_status);
        
        // ❌ Se bloqueado, redirecionar
        if (data.user.subscription_status === 'expired' || 
            data.user.subscription_status === 'cancelled') {
          navigate('/subscription-required');
        }
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    // ... lógica de login
  }

  async function logout() {
    localStorage.removeItem('auth_token');
    setUser(null);
    setSubscriptionStatus(null);
    navigate('/login');
  }

  const value = {
    user,
    subscriptionStatus,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

---

## 📧 **Emails Automáticos**

### **1. Boas-vindas (Trial iniciado)**
```
Assunto: 🎉 Bem-vindo ao Local CashBack! Seu trial de 14 dias começou

Olá [Nome],

Sua conta foi criada com sucesso! 🚀

✅ Trial: 14 dias grátis
✅ Acesso completo a todas as funcionalidades
✅ Sem necessidade de cartão de crédito

Seu trial expira em: [Data]

Comece agora: [Link Dashboard]

Dúvidas? Responda este email!

Equipe Local CashBack
```

### **2. Lembrete (4 dias antes do fim)**
```
Assunto: ⏰ Seu trial expira em 4 dias!

Olá [Nome],

Faltam apenas 4 dias para seu trial expirar!

Para continuar usando o Local CashBack, assine agora:
👉 [Link Checkout]

O que você vai ter:
✅ Cashback automatizado
✅ Gestão de clientes
✅ Integrações completas
✅ Suporte prioritário

Plano: R$ XX,XX/mês

Assinar agora: [Link Checkout]

Equipe Local CashBack
```

### **3. Trial Expirado**
```
Assunto: 🔒 Seu trial expirou - Assine para continuar

Olá [Nome],

Seu trial de 14 dias expirou.

Para continuar usando o Local CashBack, assine agora:
👉 [Link Checkout]

Suas funcionalidades estão esperando por você!

Assinar: [Link Checkout]

Equipe Local CashBack
```

### **4. Pagamento Confirmado**
```
Assunto: ✅ Pagamento confirmado! Bem-vindo de volta!

Olá [Nome],

Seu pagamento foi confirmado! 🎉

Sua conta está ativa novamente.

Acessar dashboard: [Link]

Próxima cobrança: [Data]

Obrigado por confiar no Local CashBack!

Equipe Local CashBack
```

---

## ✅ **Checklist de Implementação**

- [ ] 1. **Database**: Adicionar colunas de trial/subscription na tabela merchants
- [ ] 2. **Backend - Signup**: Modificar para iniciar trial automático
- [ ] 3. **Backend - Middleware**: Criar verificação de acesso (bloquear se expirado)
- [ ] 4. **Backend - Checkout**: Criar endpoint Stripe Checkout
- [ ] 5. **Backend - Webhook**: Implementar webhook Stripe (desbloquear após pagamento)
- [ ] 6. **Backend - Cron Jobs**: Bloquear trials expirados + enviar lembretes
- [ ] 7. **Frontend - Signup**: Remover landing page, signup direto na home
- [ ] 8. **Frontend - Banner**: Adicionar contador de trial no dashboard
- [ ] 9. **Frontend - Bloqueio**: Criar página "Assinatura Necessária"
- [ ] 10. **Frontend - AuthContext**: Redirecionar bloqueados
- [ ] 11. **Emails**: Implementar 4 templates (boas-vindas, lembrete, expirado, confirmação)
- [ ] 12. **Testes**: Testar fluxo completo
- [ ] 13. **Deploy**: Publicar em produção

---

## ⏱️ **Tempo Estimado: ~8 horas**

| Etapa | Tempo |
|-------|-------|
| Database (SQL) | 30 min |
| Backend (signup + middleware + checkout + webhook + cron) | 4h |
| Frontend (signup + banner + bloqueio + AuthContext) | 2h 30min |
| Emails (4 templates) | 1h |
| Testes | 30 min |
| Deploy | 30 min |

---

**Status**: Planejamento completo - Pronto para implementação

**Criado**: 2026-01-03  
**Autor**: GenSpark AI Developer
