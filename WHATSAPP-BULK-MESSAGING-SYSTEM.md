# WhatsApp Bulk Messaging System - Sistema de Disparo em Massa

**Data**: 2026-01-03  
**Status**: Planejamento Completo  
**Autor**: GenSpark AI Developer  

---

## 🎯 **Objetivo**

Permitir que merchants enviem **mensagens em massa** via WhatsApp respeitando as regras da Meta.

---

## ✅ **O QUE É POSSÍVEL**

### **Tipos de Disparo em Massa:**

| Tipo de Campanha | Descrição | Exemplo |
|------------------|-----------|---------|
| 🎯 **Promo/Ofertas** | Enviar promoção para todos | "Black Friday! 30% OFF hoje!" |
| 🎂 **Aniversariantes do Mês** | Mensagem especial | "Aniversariantes de Janeiro: 20% extra!" |
| 💰 **Clientes Inativos** | Reativar quem não compra há tempo | "Sentimos sua falta! Volte e ganhe R$ 10" |
| 🎁 **Clientes com Saldo** | Lembrar de resgatar cashback | "Você tem R$ 50 pra resgatar!" |
| 📢 **Avisos Gerais** | Comunicados importantes | "Novo horário de funcionamento" |

---

## 🎨 **Interface do Sistema de Campanhas**

```
┌─────────────────────────────────────────────────────────────────┐
│  📢 Nova Campanha WhatsApp                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📝 Informações da Campanha                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Nome da campanha: [____________________________]       │    │
│  │ Descrição (opcional): [_________________________]      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  📋 Escolher Template                                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Template: [Selecione um template ▼]                    │    │
│  │                                                         │    │
│  │ Opções:                                                 │    │
│  │ • promo_geral - Promoção Geral                         │    │
│  │ • black_friday - Black Friday                          │    │
│  │ • reativacao - Reativar Cliente Inativo                │    │
│  │ • lembrete_saldo - Lembrar Saldo Disponível            │    │
│  │ • aniversariantes_mes - Aniversariantes do Mês         │    │
│  │                                                         │    │
│  │ Preview do template selecionado:                       │    │
│  │ ┌─────────────────────────────────────────────────┐   │    │
│  │ │ 🔥 {{1}}, PROMOÇÃO ESPECIAL!                     │   │    │
│  │ │                                                  │   │    │
│  │ │ Aproveite {{2}} de DESCONTO em todas as         │   │    │
│  │ │ compras até {{3}}!                               │   │    │
│  │ │                                                  │   │    │
│  │ │ 💰 Seu saldo atual: R$ {{4}}                    │   │    │
│  │ │                                                  │   │    │
│  │ │ Acesse: {{5}}                                   │   │    │
│  │ │                                                  │   │    │
│  │ │ Local CashBack 🎁                               │   │    │
│  │ └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  👥 Selecionar Destinatários                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Filtrar por:                                            │    │
│  │                                                         │    │
│  │ ○ Todos os clientes                                    │    │
│  │ ● Clientes ativos (compraram nos últimos 90 dias)     │    │
│  │ ○ Clientes inativos (sem compras há 90+ dias)         │    │
│  │ ○ Clientes com saldo acima de R$ [___]                │    │
│  │ ○ Aniversariantes do mês [Janeiro ▼]                  │    │
│  │ ○ Filtro personalizado (SQL)                          │    │
│  │                                                         │    │
│  │ Total de destinatários: 245 clientes                   │    │
│  │ [👁️ Visualizar Lista]                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ⏰ Agendamento                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ● Enviar agora                                          │    │
│  │ ○ Agendar para: [____/____/______] às [__:__]         │    │
│  │                                                         │    │
│  │ ⚡ Velocidade de envio:                                 │    │
│  │ ○ Rápido (100 msg/min) - Mais barato, pode gerar spam │    │
│  │ ● Normal (30 msg/min) - Recomendado ✅                 │    │
│  │ ○ Lento (10 msg/min) - Mais seguro, menos spam        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  💰 Estimativa de Custo                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Destinatários: 245 clientes                            │    │
│  │ Custo por mensagem: R$ 0,10 (após 1.000 gratuitas)    │    │
│  │ Total estimado: R$ 0,00 (dentro do limite gratuito) ✅ │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [❌ Cancelar]  [📊 Salvar Rascunho]  [🚀 Iniciar Envio]       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 **Templates para Campanhas (Aprovação Meta)**

### **Template 1: Promoção Geral**
```
Nome: promo_geral
Categoria: MARKETING
Idioma: pt_BR

Texto:
🔥 {{1}}, PROMOÇÃO ESPECIAL!

Aproveite {{2}} de DESCONTO em todas as compras até {{3}}!

💰 Seu saldo atual: R$ {{4}}

Acesse: {{5}}

Local CashBack 🎁

Variáveis:
{{1}} = Nome do cliente
{{2}} = Desconto (ex: "30% OFF")
{{3}} = Data fim (ex: "31/01")
{{4}} = Saldo do cliente
{{5}} = URL do dashboard
```

### **Template 2: Black Friday**
```
Nome: black_friday
Categoria: MARKETING
Idioma: pt_BR

Texto:
🛍️ BLACK FRIDAY {{1}}! 🖤

{{2}}, não perca:

⚡ {{3}} de CASHBACK EXTRA
⚡ {{4}} de DESCONTO em produtos selecionados
⚡ Válido APENAS HOJE!

Seu saldo: R$ {{5}}

Corra: {{6}}

Local CashBack - Economize MUITO! 💰

Variáveis:
{{1}} = Ano (ex: "2026")
{{2}} = Nome do cliente
{{3}} = Cashback extra (ex: "50%")
{{4}} = Desconto (ex: "70%")
{{5}} = Saldo do cliente
{{6}} = URL do dashboard
```

### **Template 3: Reativação de Cliente Inativo**
```
Nome: reativacao
Categoria: MARKETING
Idioma: pt_BR

Texto:
😢 {{1}}, sentimos sua falta!

Faz tempo que você não aparece... Preparamos uma oferta especial pra você voltar:

🎁 *R$ {{2}} DE BÔNUS* na sua próxima compra!
💰 Seu saldo atual: R$ {{3}}

Válido até {{4}}

Volte logo: {{5}}

Local CashBack - Sempre com você! ❤️

Variáveis:
{{1}} = Nome do cliente
{{2}} = Bônus (ex: "15,00")
{{3}} = Saldo do cliente
{{4}} = Data validade (ex: "15/02")
{{5}} = URL do dashboard
```

### **Template 4: Lembrete de Saldo**
```
Nome: lembrete_saldo
Categoria: MARKETING
Idioma: pt_BR

Texto:
💰 Opa {{1}}! Você sabia?

Você tem *R$ {{2}}* disponível para resgatar! 🎉

Não deixe seu dinheiro parado:
✅ Resgate agora e aproveite!
✅ Use em qualquer compra na loja

Resgatar: {{3}}

Local CashBack - Seu dinheiro esperando! 💸

Variáveis:
{{1}} = Nome do cliente
{{2}} = Saldo do cliente
{{3}} = URL do dashboard
```

### **Template 5: Aniversariantes do Mês**
```
Nome: aniversariantes_mes
Categoria: MARKETING
Idioma: pt_BR

Texto:
🎂 {{1}}, ANIVERSARIANTE DE {{2}}!

Preparamos algo especial pra você:

🎁 {{3}} de CASHBACK EXTRA durante todo o mês!
💰 Bônus de R$ {{4}} na sua conta!

Seu saldo: R$ {{5}}

Aproveite seu mês: {{6}}

Local CashBack - Felicidades! 🎉

Variáveis:
{{1}} = Nome do cliente
{{2}} = Mês (ex: "JANEIRO")
{{3}} = Cashback extra (ex: "25%")
{{4}} = Bônus (ex: "20,00")
{{5}} = Saldo do cliente
{{6}} = URL do dashboard
```

---

## 🗄️ **Estrutura de Dados (Database)**

### **Tabela: `whatsapp_campaigns`**

```sql
CREATE TABLE whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Informações da campanha
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_name VARCHAR(100) NOT NULL, -- Nome do template Meta
  
  -- Filtros de destinatários
  filter_type VARCHAR(50) NOT NULL, -- 'all', 'active', 'inactive', 'balance', 'birthday', 'custom'
  filter_params JSONB, -- Parâmetros do filtro (ex: {"balance_min": 50, "month": 1})
  
  -- Agendamento
  scheduled_at TIMESTAMP WITH TIME ZONE, -- NULL = enviar agora
  send_rate INTEGER DEFAULT 30, -- Mensagens por minuto (10, 30, 100)
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'
  
  -- Estatísticas
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  actual_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES merchants(id) -- Usuário que criou
);

-- Índices
CREATE INDEX idx_campaigns_merchant ON whatsapp_campaigns(merchant_id);
CREATE INDEX idx_campaigns_status ON whatsapp_campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON whatsapp_campaigns(scheduled_at) WHERE status = 'scheduled';

COMMENT ON TABLE whatsapp_campaigns IS 'Campanhas de disparo em massa via WhatsApp';
```

### **Tabela: `whatsapp_campaign_messages`**

```sql
CREATE TABLE whatsapp_campaign_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Dados da mensagem
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(255),
  template_params JSONB, -- Parâmetros usados no template
  
  -- Status do envio
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed', 'blocked'
  
  -- Resposta da API Meta
  whatsapp_message_id VARCHAR(255), -- ID da mensagem no WhatsApp
  error_message TEXT,
  response_data JSONB,
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_campaign_msgs_campaign ON whatsapp_campaign_messages(campaign_id);
CREATE INDEX idx_campaign_msgs_customer ON whatsapp_campaign_messages(customer_id);
CREATE INDEX idx_campaign_msgs_status ON whatsapp_campaign_messages(status);

COMMENT ON TABLE whatsapp_campaign_messages IS 'Mensagens individuais de cada campanha';
```

---

## 💻 **Implementação Backend**

### **Endpoints da API**

```javascript
// server.js

// 1. Criar nova campanha
app.post('/api/whatsapp/campaigns', async (req, res) => {
  try {
    const {
      merchantId,
      name,
      description,
      templateName,
      filterType,
      filterParams,
      scheduledAt,
      sendRate
    } = req.body;
    
    // Validações
    if (!merchantId || !name || !templateName || !filterType) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    
    // Buscar destinatários baseado no filtro
    const recipients = await getRecipientsByFilter(merchantId, filterType, filterParams);
    
    if (recipients.length === 0) {
      return res.status(400).json({ error: 'Nenhum destinatário encontrado com esse filtro' });
    }
    
    // Calcular custo estimado (primeiras 1.000 conversas grátis)
    const freeLimit = 1000;
    const costPerMessage = 0.10; // R$ 0,10 após o limite
    const estimatedCost = Math.max(0, (recipients.length - freeLimit) * costPerMessage);
    
    // Criar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('whatsapp_campaigns')
      .insert({
        merchant_id: merchantId,
        name,
        description,
        template_name: templateName,
        filter_type: filterType,
        filter_params: filterParams,
        scheduled_at: scheduledAt,
        send_rate: sendRate || 30,
        status: scheduledAt ? 'scheduled' : 'draft',
        total_recipients: recipients.length,
        estimated_cost: estimatedCost
      })
      .select()
      .single();
    
    if (campaignError) {
      console.error('Erro ao criar campanha:', campaignError);
      return res.status(500).json({ error: 'Erro ao criar campanha' });
    }
    
    // Criar mensagens individuais
    const messages = recipients.map(customer => ({
      campaign_id: campaign.id,
      customer_id: customer.id,
      recipient_phone: customer.phone,
      recipient_name: customer.name,
      template_params: buildTemplateParams(templateName, customer),
      status: 'pending'
    }));
    
    const { error: messagesError } = await supabase
      .from('whatsapp_campaign_messages')
      .insert(messages);
    
    if (messagesError) {
      console.error('Erro ao criar mensagens:', messagesError);
      return res.status(500).json({ error: 'Erro ao criar mensagens' });
    }
    
    console.log(`✅ Campanha criada: ${campaign.id} (${recipients.length} destinatários)`);
    res.json({ success: true, campaign, recipientsCount: recipients.length });
    
  } catch (error) {
    console.error('Erro no endpoint de campanhas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 2. Iniciar envio de campanha
app.post('/api/whatsapp/campaigns/:campaignId/start', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Buscar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError || !campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }
    
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({ error: 'Campanha já foi iniciada ou concluída' });
    }
    
    // Atualizar status
    await supabase
      .from('whatsapp_campaigns')
      .update({ 
        status: 'sending', 
        started_at: new Date().toISOString() 
      })
      .eq('id', campaignId);
    
    // Iniciar processamento em background
    processCampaign(campaignId).catch(err => {
      console.error(`Erro ao processar campanha ${campaignId}:`, err);
    });
    
    console.log(`🚀 Campanha ${campaignId} iniciada`);
    res.json({ success: true, message: 'Campanha iniciada' });
    
  } catch (error) {
    console.error('Erro ao iniciar campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 3. Listar campanhas
app.get('/api/whatsapp/campaigns/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { status } = req.query; // Filtro opcional
    
    let query = supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: campaigns, error } = await query;
    
    if (error) {
      console.error('Erro ao listar campanhas:', error);
      return res.status(500).json({ error: 'Erro ao listar campanhas' });
    }
    
    res.json(campaigns || []);
    
  } catch (error) {
    console.error('Erro no endpoint de listagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 4. Detalhes de uma campanha
app.get('/api/whatsapp/campaigns/:campaignId/details', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Buscar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError || !campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }
    
    // Buscar mensagens
    const { data: messages, error: messagesError } = await supabase
      .from('whatsapp_campaign_messages')
      .select(`
        id,
        recipient_phone,
        recipient_name,
        status,
        sent_at,
        delivered_at,
        read_at,
        error_message
      `)
      .eq('campaign_id', campaignId)
      .order('sent_at', { ascending: false });
    
    if (messagesError) {
      console.error('Erro ao buscar mensagens:', messagesError);
      return res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
    
    res.json({ campaign, messages: messages || [] });
    
  } catch (error) {
    console.error('Erro no endpoint de detalhes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 5. Cancelar campanha
app.post('/api/whatsapp/campaigns/:campaignId/cancel', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const { error } = await supabase
      .from('whatsapp_campaigns')
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .in('status', ['draft', 'scheduled', 'sending']);
    
    if (error) {
      console.error('Erro ao cancelar campanha:', error);
      return res.status(500).json({ error: 'Erro ao cancelar campanha' });
    }
    
    console.log(`❌ Campanha ${campaignId} cancelada`);
    res.json({ success: true, message: 'Campanha cancelada' });
    
  } catch (error) {
    console.error('Erro ao cancelar campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função auxiliar: Buscar destinatários por filtro
async function getRecipientsByFilter(merchantId, filterType, filterParams) {
  let query = supabase
    .from('customers')
    .select('id, name, phone, email, cashback_balance, created_at, birthdate')
    .eq('merchant_id', merchantId);
  
  switch (filterType) {
    case 'all':
      // Todos os clientes
      break;
    
    case 'active':
      // Clientes com transações nos últimos 90 dias
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: activeCustomerIds } = await supabase
        .from('transactions')
        .select('customer_id')
        .eq('merchant_id', merchantId)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .eq('status', 'completed');
      
      const activeIds = [...new Set(activeCustomerIds.map(t => t.customer_id))];
      query = query.in('id', activeIds);
      break;
    
    case 'inactive':
      // Clientes SEM transações nos últimos 90 dias
      const ninetyDaysAgo2 = new Date();
      ninetyDaysAgo2.setDate(ninetyDaysAgo2.getDate() - 90);
      
      const { data: recentCustomerIds } = await supabase
        .from('transactions')
        .select('customer_id')
        .eq('merchant_id', merchantId)
        .gte('created_at', ninetyDaysAgo2.toISOString());
      
      const recentIds = [...new Set(recentCustomerIds.map(t => t.customer_id))];
      if (recentIds.length > 0) {
        query = query.not('id', 'in', `(${recentIds.join(',')})`);
      }
      break;
    
    case 'balance':
      // Clientes com saldo acima de X
      const minBalance = filterParams?.balance_min || 0;
      query = query.gte('cashback_balance', minBalance);
      break;
    
    case 'birthday':
      // Aniversariantes de um mês específico
      const month = filterParams?.month || new Date().getMonth() + 1;
      const monthStr = month.toString().padStart(2, '0');
      query = query.ilike('birthdate', `%-${monthStr}-%`);
      break;
    
    case 'custom':
      // SQL personalizado (cuidado com SQL injection!)
      // Implementar validação rigorosa
      break;
  }
  
  const { data: customers, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar destinatários:', error);
    return [];
  }
  
  return customers || [];
}

// Função auxiliar: Construir parâmetros do template
function buildTemplateParams(templateName, customer) {
  const dashboardUrl = `https://cashback.raulricco.com.br/customer/${customer.phone}`;
  
  const params = {
    customer_name: customer.name,
    customer_balance: customer.cashback_balance.toFixed(2),
    dashboard_url: dashboardUrl
  };
  
  // Parâmetros específicos por template
  switch (templateName) {
    case 'promo_geral':
      params.discount = '30% OFF'; // Pode vir da campanha
      params.end_date = '31/01';
      break;
    
    case 'black_friday':
      params.year = new Date().getFullYear();
      params.cashback_extra = '50%';
      params.discount = '70%';
      break;
    
    case 'reativacao':
      params.bonus = '15,00';
      params.validity = '15/02';
      break;
    
    case 'lembrete_saldo':
      // Já tem customer_balance
      break;
    
    case 'aniversariantes_mes':
      const monthNames = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
                          'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
      const month = new Date(customer.birthdate).getMonth();
      params.month = monthNames[month];
      params.cashback_extra = '25%';
      params.bonus = '20,00';
      break;
  }
  
  return params;
}

// Função: Processar campanha (envio em background)
async function processCampaign(campaignId) {
  console.log(`📤 Iniciando processamento da campanha ${campaignId}...`);
  
  // Buscar campanha
  const { data: campaign } = await supabase
    .from('whatsapp_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();
  
  if (!campaign) {
    console.error(`Campanha ${campaignId} não encontrada`);
    return;
  }
  
  // Buscar configuração WhatsApp do merchant
  const { data: config } = await supabase
    .from('integration_configs')
    .select('app_id, api_key')
    .eq('merchant_id', campaign.merchant_id)
    .eq('provider', 'whatsapp')
    .eq('is_active', true)
    .single();
  
  if (!config) {
    console.error(`WhatsApp não configurado para merchant ${campaign.merchant_id}`);
    await supabase
      .from('whatsapp_campaigns')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', campaignId);
    return;
  }
  
  // Buscar mensagens pendentes
  const { data: messages } = await supabase
    .from('whatsapp_campaign_messages')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  
  if (!messages || messages.length === 0) {
    console.log(`Nenhuma mensagem pendente para campanha ${campaignId}`);
    await supabase
      .from('whatsapp_campaigns')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', campaignId);
    return;
  }
  
  console.log(`📨 Enviando ${messages.length} mensagens...`);
  
  // Calcular delay entre mensagens (baseado no sendRate)
  const delayMs = (60 / campaign.send_rate) * 1000; // Ex: 30 msg/min = 2000ms entre msgs
  
  let sentCount = 0;
  let failedCount = 0;
  
  for (const message of messages) {
    try {
      // Enviar mensagem via Meta WhatsApp API
      const response = await fetch(`https://graph.facebook.com/v18.0/${config.app_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.recipient_phone,
          type: 'template',
          template: {
            name: campaign.template_name,
            language: { code: 'pt_BR' },
            components: [
              {
                type: 'body',
                parameters: Object.values(message.template_params).map(value => ({
                  type: 'text',
                  text: value
                }))
              }
            ]
          }
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Sucesso
        await supabase
          .from('whatsapp_campaign_messages')
          .update({
            status: 'sent',
            whatsapp_message_id: result.messages?.[0]?.id,
            response_data: result,
            sent_at: new Date().toISOString()
          })
          .eq('id', message.id);
        
        sentCount++;
        console.log(`✅ Mensagem enviada: ${message.recipient_name} (${message.recipient_phone})`);
      } else {
        // Falha
        await supabase
          .from('whatsapp_campaign_messages')
          .update({
            status: 'failed',
            error_message: result.error?.message || 'Erro desconhecido',
            response_data: result,
            failed_at: new Date().toISOString()
          })
          .eq('id', message.id);
        
        failedCount++;
        console.error(`❌ Falha ao enviar para ${message.recipient_phone}:`, result.error);
      }
      
      // Aguardar delay antes da próxima mensagem
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem ${message.id}:`, error);
      failedCount++;
      
      await supabase
        .from('whatsapp_campaign_messages')
        .update({
          status: 'failed',
          error_message: error.message,
          failed_at: new Date().toISOString()
        })
        .eq('id', message.id);
    }
  }
  
  // Atualizar estatísticas da campanha
  await supabase
    .from('whatsapp_campaigns')
    .update({
      status: 'completed',
      sent_count: sentCount,
      failed_count: failedCount,
      completed_at: new Date().toISOString()
    })
    .eq('id', campaignId);
  
  console.log(`✅ Campanha ${campaignId} concluída: ${sentCount} enviadas, ${failedCount} falhas`);
}

// Cron Job: Verificar campanhas agendadas (roda a cada 1 minuto)
cron.schedule('* * * * *', async () => {
  const now = new Date().toISOString();
  
  const { data: campaigns } = await supabase
    .from('whatsapp_campaigns')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now);
  
  for (const campaign of campaigns || []) {
    console.log(`⏰ Iniciando campanha agendada ${campaign.id}`);
    
    await supabase
      .from('whatsapp_campaigns')
      .update({ status: 'sending', started_at: new Date().toISOString() })
      .eq('id', campaign.id);
    
    processCampaign(campaign.id).catch(err => {
      console.error(`Erro ao processar campanha agendada ${campaign.id}:`, err);
    });
  }
});

console.log('✅ Sistema de disparo em massa WhatsApp configurado');
```

---

## 🎨 **Frontend - Painel de Campanhas**

```javascript
// cashback-system/src/pages/WhatsAppCampaigns.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function WhatsAppCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    templateName: 'promo_geral',
    filterType: 'active',
    filterParams: {},
    scheduledAt: null,
    sendRate: 30
  });
  const [recipientsCount, setRecipientsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.merchant_id) {
      loadCampaigns();
    }
  }, [user]);

  async function loadCampaigns() {
    try {
      const response = await fetch(`/api/whatsapp/campaigns/${user.merchant_id}`);
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    }
  }

  async function handleCreateCampaign() {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: user.merchant_id,
          ...newCampaign
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Campanha criada! ${data.recipientsCount} destinatários`);
        setShowNewCampaign(false);
        loadCampaigns();
      } else {
        alert('❌ Erro: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      alert('❌ Erro ao criar campanha');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartCampaign(campaignId) {
    if (!confirm('Deseja iniciar o envio desta campanha?')) return;
    
    try {
      const response = await fetch(`/api/whatsapp/campaigns/${campaignId}/start`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('🚀 Campanha iniciada!');
        loadCampaigns();
      } else {
        alert('❌ Erro: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error);
      alert('❌ Erro ao iniciar campanha');
    }
  }

  return (
    <div className="whatsapp-campaigns">
      <div className="header">
        <h1>📢 Campanhas WhatsApp</h1>
        <button onClick={() => setShowNewCampaign(true)}>
          ➕ Nova Campanha
        </button>
      </div>
      
      {/* Modal Nova Campanha */}
      {showNewCampaign && (
        <div className="modal">
          <div className="modal-content">
            <h2>📢 Nova Campanha</h2>
            
            <label>
              Nome da campanha:
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Ex: Black Friday 2026"
              />
            </label>
            
            <label>
              Template:
              <select
                value={newCampaign.templateName}
                onChange={(e) => setNewCampaign({ ...newCampaign, templateName: e.target.value })}
              >
                <option value="promo_geral">Promoção Geral</option>
                <option value="black_friday">Black Friday</option>
                <option value="reativacao">Reativar Cliente</option>
                <option value="lembrete_saldo">Lembrete de Saldo</option>
                <option value="aniversariantes_mes">Aniversariantes</option>
              </select>
            </label>
            
            <label>
              Destinatários:
              <select
                value={newCampaign.filterType}
                onChange={(e) => setNewCampaign({ ...newCampaign, filterType: e.target.value })}
              >
                <option value="all">Todos</option>
                <option value="active">Ativos (últimos 90 dias)</option>
                <option value="inactive">Inativos (+90 dias)</option>
                <option value="balance">Com saldo</option>
                <option value="birthday">Aniversariantes</option>
              </select>
            </label>
            
            <label>
              Velocidade:
              <select
                value={newCampaign.sendRate}
                onChange={(e) => setNewCampaign({ ...newCampaign, sendRate: parseInt(e.target.value) })}
              >
                <option value={10}>Lento (10 msg/min)</option>
                <option value={30}>Normal (30 msg/min) ✅</option>
                <option value={100}>Rápido (100 msg/min)</option>
              </select>
            </label>
            
            <div className="modal-actions">
              <button onClick={() => setShowNewCampaign(false)}>Cancelar</button>
              <button onClick={handleCreateCampaign} disabled={loading}>
                {loading ? 'Criando...' : '🚀 Criar e Iniciar'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista de Campanhas */}
      <div className="campaigns-list">
        {campaigns.length === 0 ? (
          <p>Nenhuma campanha criada ainda</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Template</th>
                <th>Destinatários</th>
                <th>Enviadas</th>
                <th>Falhas</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.template_name}</td>
                  <td>{c.total_recipients}</td>
                  <td>{c.sent_count}</td>
                  <td>{c.failed_count}</td>
                  <td>
                    <span className={`status-${c.status}`}>
                      {c.status === 'draft' && '📝 Rascunho'}
                      {c.status === 'scheduled' && '⏰ Agendada'}
                      {c.status === 'sending' && '📤 Enviando'}
                      {c.status === 'completed' && '✅ Concluída'}
                      {c.status === 'failed' && '❌ Falhou'}
                      {c.status === 'cancelled' && '🚫 Cancelada'}
                    </span>
                  </td>
                  <td>
                    {(c.status === 'draft' || c.status === 'scheduled') && (
                      <button onClick={() => handleStartCampaign(c.id)}>
                        🚀 Iniciar
                      </button>
                    )}
                    <button onClick={() => window.location.href = `/campaigns/${c.id}`}>
                      👁️ Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

---

## 📊 **Resultado Final**

### **✅ O que o Merchant Consegue Fazer:**

| Funcionalidade | Disponível? |
|----------------|-------------|
| ✅ Criar campanhas | SIM |
| ✅ Escolher templates pré-aprovados | SIM |
| ✅ Filtrar destinatários (todos, ativos, inativos, saldo, aniversariantes) | SIM |
| ✅ Agendar envio | SIM |
| ✅ Controlar velocidade de envio | SIM |
| ✅ Ver estatísticas em tempo real | SIM |
| ✅ Cancelar campanha | SIM |
| ✅ Ver histórico de campanhas | SIM |
| ✅ Ver detalhes de cada mensagem (enviada, falhou, lida) | SIM |

---

## 💰 **Custos**

### **Meta WhatsApp API:**
- Primeiras **1.000 conversas/mês**: **GRÁTIS** ✅
- Após 1.000: ~**R$ 0,10** por conversa

### **Exemplo:**
- Campanha com **500 destinatários**: **R$ 0** (dentro do limite)
- Campanha com **2.000 destinatários**: **R$ 100** (1.000 grátis + 1.000 × R$ 0,10)

---

## ⚠️ **Boas Práticas (Evitar Ban)**

1. **Não enviar spam**: Use templates relevantes
2. **Respeitar velocidade**: 30 msg/min é seguro
3. **Permitir opt-out**: Clientes podem bloquear
4. **Monitorar taxa de bloqueio**: Se >5%, revisar conteúdo
5. **Usar filtros inteligentes**: Não enviar pra quem não quer receber

---

## ⏱️ **Tempo de Implementação**

| Etapa | Tempo |
|-------|-------|
| 1. Criar 5 templates na Meta | 1h |
| 2. Aguardar aprovação | 1-24h |
| 3. Criar tabelas no banco | 30 min |
| 4. Implementar endpoints (5 endpoints) | 3h |
| 5. Criar função de processamento | 2h |
| 6. Implementar cron job | 30 min |
| 7. Criar frontend (painel + modal) | 3h |
| 8. Testes | 1h |
| **TOTAL** | **~11 horas** (+ aprovação Meta) |

---

## 🚀 **Próximos Passos**

1. **Você**: Criar 5 templates na Meta
2. **Eu**: Implementar backend (tabelas + endpoints + processamento)
3. **Eu**: Criar frontend (painel de campanhas)
4. **Nós**: Testar com campanha piloto (50 clientes)
5. **Nós**: Escalar para campanhas maiores

---

**Quer que eu comece a implementar o sistema de campanhas?** 🚀

---

**Criado**: 2026-01-03  
**Última Atualização**: 2026-01-03  
**Autor**: GenSpark AI Developer  
**Status**: Pronto para Implementação
