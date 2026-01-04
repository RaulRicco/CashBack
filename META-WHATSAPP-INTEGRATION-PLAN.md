# Meta WhatsApp Business API Integration - Plano de Implementação

**Data**: 2026-01-03  
**Status**: 📋 Planejamento

---

## 🎯 OBJETIVO

Integrar a **Meta WhatsApp Business API** (Cloud API) para enviar mensagens automáticas aos clientes nas seguintes situações:

1. 💬 **Cadastro** (signup) - Mensagem de boas-vindas
2. 💰 **Recebimento de Cashback** - Notificação de valor recebido
3. 🎁 **Resgate de Cashback** - Confirmação de resgate
4. 🎂 **Aniversário** - Mensagem especial de aniversário

---

## 📚 DOCUMENTAÇÃO META WHATSAPP API

### **Links Oficiais**
- **Cloud API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Getting Started**: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- **Send Messages**: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
- **Message Templates**: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates

### **Requisitos**
1. **Meta Business Account** (criar em: https://business.facebook.com/)
2. **WhatsApp Business App** (criar no Meta Business Suite)
3. **Phone Number ID** (número de telefone verificado)
4. **Access Token** (token de acesso permanente)
5. **Message Templates** (templates pré-aprovados pela Meta)

---

## 🏗️ ARQUITETURA PROPOSTA

### **1. Backend (Node.js + Express)**

```
/home/root/webapp/server.js
└── Novos endpoints:
    ├── POST /api/whatsapp/send-template
    ├── POST /api/whatsapp/send-welcome
    ├── POST /api/whatsapp/send-cashback
    ├── POST /api/whatsapp/send-redemption
    └── POST /api/whatsapp/send-birthday
```

### **2. Frontend Integration Layer**

```
/home/root/webapp/cashback-system/src/lib/integrations/
├── whatsapp.js (novo)
└── index.js (atualizar - adicionar WhatsApp)
```

### **3. Database Schema**

Adicionar coluna na tabela `integration_configs`:

```sql
ALTER TABLE integration_configs ADD COLUMN whatsapp_phone_number_id TEXT;
ALTER TABLE integration_configs ADD COLUMN whatsapp_business_account_id TEXT;
ALTER TABLE integration_configs ADD COLUMN whatsapp_access_token TEXT;
```

---

## 🔧 IMPLEMENTAÇÃO - PASSO A PASSO

### **FASE 1: Configuração na Meta (30 minutos)**

#### **1.1 Criar Meta Business Account**
```
1. Acesse: https://business.facebook.com/
2. Clique em "Criar conta comercial"
3. Preencha nome do negócio, email, etc
4. Confirme email
```

#### **1.2 Criar WhatsApp Business App**
```
1. Meta Business Suite → Configurações
2. Apps → Adicionar → WhatsApp
3. Nome do app: "Local CashBack Notifications"
4. Selecione o Business Account
```

#### **1.3 Configurar Número de Telefone**
```
1. WhatsApp → Getting Started
2. Adicionar número de telefone
3. Verificar número via SMS
4. Copiar Phone Number ID
```

#### **1.4 Gerar Access Token Permanente**
```
1. WhatsApp → Configurações
2. Access Tokens → Gerar token permanente
3. Selecionar permissões:
   ✓ whatsapp_business_messaging
   ✓ whatsapp_business_management
4. Copiar token (salvar em local seguro)
```

---

### **FASE 2: Criar Message Templates (45 minutos)**

**IMPORTANTE**: Mensagens só podem ser enviadas usando **templates pré-aprovados** pela Meta.

#### **Template 1: Boas-vindas (Signup)**
```
Nome: welcome_cashback
Categoria: TRANSACTIONAL
Idioma: pt_BR

Mensagem:
Olá {{1}}! 🎉

Bem-vindo ao *{{2}}*!

Você agora faz parte do nosso programa de cashback. A cada compra, você acumula créditos para usar depois!

Seu saldo atual: R$ 0,00

Boas compras! 💰
```

#### **Template 2: Cashback Recebido**
```
Nome: cashback_received
Categoria: TRANSACTIONAL
Idioma: pt_BR

Mensagem:
Olá {{1}}! 💰

Você recebeu *R$ {{2}}* em cashback na sua compra em *{{3}}*!

💳 Valor da compra: R$ {{4}}
🎁 Cashback ganho: R$ {{2}}
💎 Saldo total: R$ {{5}}

Continue comprando e acumulando! 🚀
```

#### **Template 3: Resgate Confirmado**
```
Nome: redemption_confirmed
Categoria: TRANSACTIONAL
Idioma: pt_BR

Mensagem:
Olá {{1}}! ✅

Seu resgate foi confirmado!

💰 Valor resgatado: R$ {{2}}
🏪 Estabelecimento: {{3}}
💎 Saldo restante: R$ {{4}}

Aproveite seu desconto! 🎉
```

#### **Template 4: Aniversário**
```
Nome: birthday_special
Categoria: MARKETING
Idioma: pt_BR

Mensagem:
🎂 Feliz Aniversário, {{1}}! 🎉

A equipe do *{{2}}* deseja um dia incrível!

🎁 Preparamos um presente especial: *{{3}}% de cashback extra* nas suas compras hoje!

Aproveite! 💝
```

**Como criar templates:**
```
1. Meta Business Suite → WhatsApp → Message Templates
2. Criar novo template
3. Preencher nome, categoria, idioma
4. Adicionar mensagem com variáveis {{1}}, {{2}}, etc
5. Enviar para aprovação (pode levar 1-24h)
```

---

### **FASE 3: Backend Implementation (2 horas)**

#### **3.1 Criar serviço WhatsApp (server.js)**

```javascript
// Meta WhatsApp Business API Configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Enviar mensagem via WhatsApp Business API
 */
async function sendWhatsAppTemplate(phoneNumberId, accessToken, to, templateName, templateParams) {
  try {
    const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to, // Formato: 5561999887766 (código país + DDD + número)
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'pt_BR'
        },
        components: [
          {
            type: 'body',
            parameters: templateParams.map(param => ({
              type: 'text',
              text: param
            }))
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp] Erro:', result);
      return {
        success: false,
        error: result.error?.message || 'Erro ao enviar mensagem'
      };
    }

    console.log('[WhatsApp] Mensagem enviada:', result);
    return {
      success: true,
      messageId: result.messages[0].id
    };

  } catch (error) {
    console.error('[WhatsApp] Erro:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Endpoint: Enviar mensagem de boas-vindas
 */
app.post('/api/whatsapp/send-welcome', async (req, res) => {
  try {
    const { merchantId, customerPhone, customerName } = req.body;

    // Buscar configuração WhatsApp do merchant
    const { data: config } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('provider', 'whatsapp')
      .eq('is_active', true)
      .single();

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp não configurado'
      });
    }

    // Buscar dados do merchant
    const { data: merchant } = await supabase
      .from('merchants')
      .select('name')
      .eq('id', merchantId)
      .single();

    // Enviar template de boas-vindas
    const result = await sendWhatsAppTemplate(
      config.whatsapp_phone_number_id,
      config.whatsapp_access_token,
      customerPhone,
      'welcome_cashback',
      [customerName, merchant.name]
    );

    res.json(result);

  } catch (error) {
    console.error('[WhatsApp] Erro no endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Endpoint: Enviar notificação de cashback
 */
app.post('/api/whatsapp/send-cashback', async (req, res) => {
  try {
    const { 
      merchantId, 
      customerPhone, 
      customerName,
      cashbackValue,
      purchaseValue,
      totalBalance,
      merchantName
    } = req.body;

    // Buscar configuração WhatsApp
    const { data: config } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('provider', 'whatsapp')
      .eq('is_active', true)
      .single();

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp não configurado'
      });
    }

    // Enviar template de cashback
    const result = await sendWhatsAppTemplate(
      config.whatsapp_phone_number_id,
      config.whatsapp_access_token,
      customerPhone,
      'cashback_received',
      [
        customerName,
        cashbackValue.toFixed(2),
        merchantName,
        purchaseValue.toFixed(2),
        totalBalance.toFixed(2)
      ]
    );

    res.json(result);

  } catch (error) {
    console.error('[WhatsApp] Erro no endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Endpoint: Enviar confirmação de resgate
 */
app.post('/api/whatsapp/send-redemption', async (req, res) => {
  try {
    const { 
      merchantId, 
      customerPhone, 
      customerName,
      redemptionValue,
      remainingBalance,
      merchantName
    } = req.body;

    // Buscar configuração WhatsApp
    const { data: config } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('provider', 'whatsapp')
      .eq('is_active', true)
      .single();

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp não configurado'
      });
    }

    // Enviar template de resgate
    const result = await sendWhatsAppTemplate(
      config.whatsapp_phone_number_id,
      config.whatsapp_access_token,
      customerPhone,
      'redemption_confirmed',
      [
        customerName,
        redemptionValue.toFixed(2),
        merchantName,
        remainingBalance.toFixed(2)
      ]
    );

    res.json(result);

  } catch (error) {
    console.error('[WhatsApp] Erro no endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

### **FASE 4: Frontend Integration (1 hora)**

#### **4.1 Criar lib/integrations/whatsapp.js**

```javascript
/**
 * Integração WhatsApp Business API
 */

/**
 * Sincronizar cliente com WhatsApp (apenas validação de número)
 */
export async function syncCustomerToWhatsApp(customer, config, eventType) {
  try {
    console.log('📱 Validando telefone para WhatsApp:', customer.phone);

    // Validar formato do telefone (deve ter código do país)
    const phoneClean = customer.phone.replace(/\D/g, '');
    
    if (!phoneClean.startsWith('55')) {
      console.warn('⚠️ Telefone sem código do país (+55)');
    }

    if (phoneClean.length < 12) {
      return {
        success: false,
        error: 'Número de telefone inválido'
      };
    }

    return {
      success: true,
      phone: phoneClean
    };

  } catch (error) {
    console.error('❌ Erro ao validar telefone:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Enviar mensagem via backend
 */
export async function sendWhatsAppMessage(customer, merchantId, eventType, data = {}) {
  try {
    let endpoint;
    let payload = {
      merchantId,
      customerPhone: customer.phone.replace(/\D/g, ''),
      customerName: customer.name
    };

    // Determinar endpoint e payload baseado no evento
    switch (eventType) {
      case 'signup':
        endpoint = '/api/whatsapp/send-welcome';
        break;

      case 'cashback':
      case 'purchase':
        endpoint = '/api/whatsapp/send-cashback';
        payload = {
          ...payload,
          cashbackValue: data.cashbackValue || 0,
          purchaseValue: data.purchaseValue || 0,
          totalBalance: data.totalBalance || 0,
          merchantName: data.merchantName || ''
        };
        break;

      case 'redemption':
        endpoint = '/api/whatsapp/send-redemption';
        payload = {
          ...payload,
          redemptionValue: data.redemptionValue || 0,
          remainingBalance: data.remainingBalance || 0,
          merchantName: data.merchantName || ''
        };
        break;

      default:
        return {
          success: false,
          error: 'Tipo de evento inválido'
        };
    }

    // Chamar backend
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erro ao enviar WhatsApp:', result);
      return {
        success: false,
        error: result.error
      };
    }

    console.log('✅ Mensagem WhatsApp enviada:', result);
    return result;

  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

#### **4.2 Atualizar lib/integrations/index.js**

```javascript
import { syncCustomerToWhatsApp, sendWhatsAppMessage } from './whatsapp';

// Na função syncCustomerToIntegrations, adicionar:

} else if (config.provider === 'whatsapp') {
  result = await syncCustomerToWhatsApp(customer, config, eventType);
  
  // Enviar mensagem WhatsApp automática
  if (result?.success) {
    let notificationType = eventType;
    
    if (eventType === 'purchase') {
      notificationType = 'cashback';
    }
    
    // Preparar dados extras
    const messageData = {
      cashbackValue: data?.cashbackValue,
      purchaseValue: data?.purchaseValue,
      totalBalance: data?.totalBalance,
      redemptionValue: data?.redemptionValue,
      remainingBalance: data?.remainingBalance,
      merchantName: data?.merchantName
    };
    
    console.log(`📱 Enviando WhatsApp: ${notificationType}`);
    await sendWhatsAppMessage(customer, merchantId, notificationType, messageData);
  }
}
```

---

### **FASE 5: UI Configuration (1 hora)**

Adicionar suporte para WhatsApp na página de integrações:

```javascript
// Em src/pages/Integrations.jsx

const PROVIDERS = {
  // ... outros providers
  whatsapp: {
    name: 'WhatsApp Business',
    icon: MessageCircle,
    description: 'Envie mensagens automáticas via WhatsApp',
    color: 'green',
    fields: [
      {
        name: 'whatsapp_phone_number_id',
        label: 'Phone Number ID',
        type: 'text',
        placeholder: '123456789012345',
        required: true
      },
      {
        name: 'whatsapp_access_token',
        label: 'Access Token',
        type: 'password',
        placeholder: 'EAAxxxxxxxx...',
        required: true
      },
      {
        name: 'whatsapp_business_account_id',
        label: 'Business Account ID',
        type: 'text',
        placeholder: '123456789012345',
        required: false
      }
    ]
  }
};
```

---

## 📊 SCHEMA DATABASE

```sql
-- Adicionar colunas para WhatsApp na tabela integration_configs
ALTER TABLE integration_configs 
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT;

-- Criar índice para provider whatsapp
CREATE INDEX IF NOT EXISTS idx_integration_configs_whatsapp 
ON integration_configs(merchant_id, provider) 
WHERE provider = 'whatsapp';
```

---

## 🧪 TESTES

### **Teste 1: Mensagem de Boas-vindas**
```bash
curl -X POST http://localhost:3001/api/whatsapp/send-welcome \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "uuid-merchant",
    "customerPhone": "5561999887766",
    "customerName": "João Silva"
  }'
```

### **Teste 2: Notificação de Cashback**
```bash
curl -X POST http://localhost:3001/api/whatsapp/send-cashback \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "uuid-merchant",
    "customerPhone": "5561999887766",
    "customerName": "João Silva",
    "cashbackValue": 10.50,
    "purchaseValue": 105.00,
    "totalBalance": 50.75,
    "merchantName": "Raul Bar"
  }'
```

---

## 💰 CUSTOS

**Meta WhatsApp Business API** (Cloud API):
- ✅ **Primeiras 1.000 conversas/mês**: GRÁTIS
- 💰 **Após 1.000**: ~R$ 0,10 - R$ 0,50 por conversa
- 📊 **Conversa**: Janela de 24h após envio

**Estimativa para 1.000 clientes/mês**:
- ~1.000 mensagens de boas-vindas
- ~2.000 mensagens de cashback
- ~500 mensagens de resgate
- **Total**: ~3.500 mensagens
- **Custo**: R$ 0 (primeiras 1k) + ~R$ 250 (2.5k extras)
- **Custo médio por mensagem**: ~R$ 0,07

---

## ⏱️ TIMELINE

| Fase | Tarefa | Tempo | Status |
|------|--------|-------|--------|
| 1 | Configuração Meta | 30 min | ⏳ Pendente |
| 2 | Criar Templates | 45 min | ⏳ Pendente |
| 3 | Backend Implementation | 2h | ⏳ Pendente |
| 4 | Frontend Integration | 1h | ⏳ Pendente |
| 5 | UI Configuration | 1h | ⏳ Pendente |
| 6 | Testes | 30 min | ⏳ Pendente |
| 7 | Deploy | 15 min | ⏳ Pendente |

**Total estimado**: ~5-6 horas

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Confirmar se deseja prosseguir com a implementação
2. ⏳ Criar Meta Business Account
3. ⏳ Configurar WhatsApp Business App
4. ⏳ Criar e aprovar Message Templates
5. ⏳ Implementar backend endpoints
6. ⏳ Implementar frontend integration
7. ⏳ Testar em desenvolvimento
8. ⏳ Deploy em produção

---

**Quer que eu comece a implementação? Por qual fase começamos?** 🚀
