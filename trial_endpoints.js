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
 * Middleware: Verificar se merchant tem acesso (trial ativo ou subscription ativa)
 */
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
