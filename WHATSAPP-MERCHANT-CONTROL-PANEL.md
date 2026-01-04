# WhatsApp Merchant Control Panel - Painel de Controle de Automações

**Data**: 2026-01-03  
**Status**: Planejamento - Solução para Auto-Configuração  
**Autor**: GenSpark AI Developer  

---

## 🎯 **Objetivo**

Permitir que o **merchant configure automações de WhatsApp** sem precisar mexer com a Meta diretamente.

---

## ✅ **O QUE O MERCHANT PODE CONFIGURAR**

### **Painel de Automações de Aniversário**

```
┌─────────────────────────────────────────────────────────────────┐
│  🎂 Automações de Aniversário                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚙️ Configurações Gerais                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ✅ Ativar automações de aniversário                    │    │
│  │ 🕐 Horário de envio: [09:00] ▼                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  📅 Mensagem de Pré-Aniversário                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ✅ Enviar mensagem antes do aniversário                │    │
│  │ 📆 Enviar com [30] ▼ dias de antecedência              │    │
│  │    Opções: 7, 15, 30, 60 dias                          │    │
│  │                                                         │    │
│  │ 🎁 Oferta de cashback extra: [15]% ▼                   │    │
│  │    Opções: 10%, 15%, 20%, 25%, 30%                     │    │
│  │                                                         │    │
│  │ 📝 Preview da mensagem:                                │    │
│  │ ┌─────────────────────────────────────────────────┐   │    │
│  │ │ 🎉 Olá João! Seu aniversário está chegando!      │   │    │
│  │ │                                                  │   │    │
│  │ │ Faltam apenas 30 dias para o seu grande dia      │   │    │
│  │ │ e preparamos algo especial:                      │   │    │
│  │ │                                                  │   │    │
│  │ │ 🎁 15% DE CASHBACK EXTRA em todas as suas       │   │    │
│  │ │ compras até o dia do seu aniversário!           │   │    │
│  │ │                                                  │   │    │
│  │ │ Aproveite agora: [Link Dashboard]               │   │    │
│  │ └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  🎂 Mensagem no Dia do Aniversário                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ✅ Enviar mensagem no dia do aniversário               │    │
│  │                                                         │    │
│  │ 💰 Bônus de aniversário: R$ [10,00]                    │    │
│  │    Opções: R$ 5, R$ 10, R$ 15, R$ 20, R$ 50           │    │
│  │                                                         │    │
│  │ 🎁 Cashback extra no dia: [20]% ▼                      │    │
│  │    Opções: 15%, 20%, 25%, 30%, 50%                     │    │
│  │                                                         │    │
│  │ 📝 Preview da mensagem:                                │    │
│  │ ┌─────────────────────────────────────────────────┐   │    │
│  │ │ 🎂 PARABÉNS, João! 🎉                            │   │    │
│  │ │                                                  │   │    │
│  │ │ Hoje é o SEU dia! Para comemorar, você ganhou:  │   │    │
│  │ │                                                  │   │    │
│  │ │ 🎁 R$ 10,00 de BÔNUS direto na sua conta!       │   │    │
│  │ │ 💰 20% de CASHBACK EXTRA em todas as compras    │   │    │
│  │ │ hoje!                                            │   │    │
│  │ │                                                  │   │    │
│  │ │ Seu saldo atual: R$ 45,00                       │   │    │
│  │ │                                                  │   │    │
│  │ │ Acesse: [Link Dashboard]                        │   │    │
│  │ │                                                  │   │    │
│  │ │ Feliz Aniversário! 🥳                            │   │    │
│  │ └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  📊 Estatísticas (Últimos 30 dias)                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📅 Mensagens pré-aniversário enviadas: 12             │    │
│  │  🎂 Mensagens de aniversário enviadas: 8               │    │
│  │  💰 Total em bônus concedidos: R$ 80,00                │    │
│  │  ✅ Taxa de sucesso: 100%                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [💾 Salvar Configurações]  [👁️ Ver Próximos Aniversariantes] │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ **Estrutura de Dados (Database)**

### **Nova tabela: `whatsapp_automation_settings`**

```sql
CREATE TABLE whatsapp_automation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Configurações gerais
  is_active BOOLEAN DEFAULT true,
  send_hour INTEGER DEFAULT 9, -- Horário de envio (0-23)
  
  -- Pré-aniversário
  pre_birthday_enabled BOOLEAN DEFAULT true,
  pre_birthday_days INTEGER DEFAULT 30, -- 7, 15, 30, 60
  pre_birthday_cashback_extra INTEGER DEFAULT 15, -- Porcentagem (10-50)
  
  -- Dia do aniversário
  birthday_enabled BOOLEAN DEFAULT true,
  birthday_bonus_amount DECIMAL(10,2) DEFAULT 10.00, -- Valor do bônus
  birthday_cashback_extra INTEGER DEFAULT 20, -- Porcentagem (15-50)
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE UNIQUE INDEX idx_whatsapp_auto_merchant ON whatsapp_automation_settings(merchant_id);

-- Comentário
COMMENT ON TABLE whatsapp_automation_settings IS 'Configurações de automações de WhatsApp por merchant';
```

---

## 💻 **Implementação Backend**

### **Endpoint para salvar configurações**

```javascript
// server.js

// Endpoint: Salvar configurações de automação
app.post('/api/whatsapp/automation/settings', async (req, res) => {
  try {
    const {
      merchantId,
      isActive,
      sendHour,
      preBirthdayEnabled,
      preBirthdayDays,
      preBirthdayCashbackExtra,
      birthdayEnabled,
      birthdayBonusAmount,
      birthdayCashbackExtra
    } = req.body;
    
    // Validações
    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId é obrigatório' });
    }
    
    if (sendHour < 0 || sendHour > 23) {
      return res.status(400).json({ error: 'sendHour deve estar entre 0 e 23' });
    }
    
    if (![7, 15, 30, 60].includes(preBirthdayDays)) {
      return res.status(400).json({ error: 'preBirthdayDays deve ser 7, 15, 30 ou 60' });
    }
    
    // Verificar se merchant existe
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id')
      .eq('id', merchantId)
      .single();
    
    if (merchantError || !merchant) {
      return res.status(404).json({ error: 'Merchant não encontrado' });
    }
    
    // Upsert (insert ou update)
    const { data, error } = await supabase
      .from('whatsapp_automation_settings')
      .upsert({
        merchant_id: merchantId,
        is_active: isActive,
        send_hour: sendHour,
        pre_birthday_enabled: preBirthdayEnabled,
        pre_birthday_days: preBirthdayDays,
        pre_birthday_cashback_extra: preBirthdayCashbackExtra,
        birthday_enabled: birthdayEnabled,
        birthday_bonus_amount: birthdayBonusAmount,
        birthday_cashback_extra: birthdayCashbackExtra,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'merchant_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar configurações:', error);
      return res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
    
    console.log(`✅ Configurações de automação salvas para merchant ${merchantId}`);
    res.json({ success: true, data });
    
  } catch (error) {
    console.error('Erro no endpoint de configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint: Buscar configurações
app.get('/api/whatsapp/automation/settings/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    const { data, error } = await supabase
      .from('whatsapp_automation_settings')
      .select('*')
      .eq('merchant_id', merchantId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
    
    // Se não existir, retornar configurações padrão
    if (!data) {
      return res.json({
        isActive: true,
        sendHour: 9,
        preBirthdayEnabled: true,
        preBirthdayDays: 30,
        preBirthdayCashbackExtra: 15,
        birthdayEnabled: true,
        birthdayBonusAmount: 10.00,
        birthdayCashbackExtra: 20
      });
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('Erro no endpoint de configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint: Estatísticas de aniversários
app.get('/api/whatsapp/automation/stats/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Buscar logs dos últimos 30 dias
    const { data: logs, error } = await supabase
      .from('whatsapp_birthday_logs')
      .select('notification_type, bonus_amount, status')
      .eq('merchant_id', merchantId)
      .gte('sent_at', thirtyDaysAgo.toISOString());
    
    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
    
    // Calcular estatísticas
    const preBirthdayCount = logs.filter(l => l.notification_type === '30_days_before').length;
    const birthdayCount = logs.filter(l => l.notification_type === 'birthday_day').length;
    const totalBonus = logs
      .filter(l => l.notification_type === 'birthday_day' && l.status === 'sent')
      .reduce((sum, l) => sum + (l.bonus_amount || 0), 0);
    const successRate = logs.length > 0 
      ? (logs.filter(l => l.status === 'sent').length / logs.length * 100).toFixed(1)
      : 0;
    
    res.json({
      preBirthdayCount,
      birthdayCount,
      totalBonus,
      successRate
    });
    
  } catch (error) {
    console.error('Erro no endpoint de estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint: Próximos aniversariantes
app.get('/api/whatsapp/automation/upcoming/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { days = 30 } = req.query; // Quantos dias à frente
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, phone, birthdate, cashback_balance')
      .eq('merchant_id', merchantId)
      .not('birthdate', 'is', null)
      .gte('birthdate', today.toISOString().split('T')[0])
      .lte('birthdate', futureDate.toISOString().split('T')[0])
      .order('birthdate', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar aniversariantes:', error);
      return res.status(500).json({ error: 'Erro ao buscar aniversariantes' });
    }
    
    res.json(customers || []);
    
  } catch (error) {
    console.error('Erro no endpoint de aniversariantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

---

## 🎨 **Frontend - Painel de Controle**

```javascript
// cashback-system/src/pages/WhatsAppAutomation.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function WhatsAppAutomation() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    isActive: true,
    sendHour: 9,
    preBirthdayEnabled: true,
    preBirthdayDays: 30,
    preBirthdayCashbackExtra: 15,
    birthdayEnabled: true,
    birthdayBonusAmount: 10.00,
    birthdayCashbackExtra: 20
  });
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.merchant_id) {
      loadSettings();
      loadStats();
      loadUpcoming();
    }
  }, [user]);

  async function loadSettings() {
    try {
      const response = await fetch(`/api/whatsapp/automation/settings/${user.merchant_id}`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const response = await fetch(`/api/whatsapp/automation/stats/${user.merchant_id}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  async function loadUpcoming() {
    try {
      const response = await fetch(`/api/whatsapp/automation/upcoming/${user.merchant_id}?days=30`);
      const data = await response.json();
      setUpcoming(data);
    } catch (error) {
      console.error('Erro ao carregar aniversariantes:', error);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch('/api/whatsapp/automation/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: user.merchant_id,
          ...settings
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Configurações salvas com sucesso!');
      } else {
        alert('❌ Erro ao salvar: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="whatsapp-automation">
      <h1>🎂 Automações de Aniversário</h1>
      
      {/* Configurações Gerais */}
      <section className="general-settings">
        <h2>⚙️ Configurações Gerais</h2>
        <label>
          <input
            type="checkbox"
            checked={settings.isActive}
            onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
          />
          Ativar automações de aniversário
        </label>
        
        <label>
          Horário de envio:
          <select
            value={settings.sendHour}
            onChange={(e) => setSettings({ ...settings, sendHour: parseInt(e.target.value) })}
          >
            {[...Array(24)].map((_, i) => (
              <option key={i} value={i}>{i}:00</option>
            ))}
          </select>
        </label>
      </section>
      
      {/* Pré-Aniversário */}
      <section className="pre-birthday">
        <h2>📅 Mensagem de Pré-Aniversário</h2>
        <label>
          <input
            type="checkbox"
            checked={settings.preBirthdayEnabled}
            onChange={(e) => setSettings({ ...settings, preBirthdayEnabled: e.target.checked })}
          />
          Enviar mensagem antes do aniversário
        </label>
        
        <label>
          Enviar com:
          <select
            value={settings.preBirthdayDays}
            onChange={(e) => setSettings({ ...settings, preBirthdayDays: parseInt(e.target.value) })}
          >
            <option value={7}>7 dias de antecedência</option>
            <option value={15}>15 dias de antecedência</option>
            <option value={30}>30 dias de antecedência</option>
            <option value={60}>60 dias de antecedência</option>
          </select>
        </label>
        
        <label>
          Cashback extra:
          <select
            value={settings.preBirthdayCashbackExtra}
            onChange={(e) => setSettings({ ...settings, preBirthdayCashbackExtra: parseInt(e.target.value) })}
          >
            {[10, 15, 20, 25, 30].map(v => (
              <option key={v} value={v}>{v}%</option>
            ))}
          </select>
        </label>
        
        <div className="preview">
          <h3>Preview da mensagem:</h3>
          <div className="message-preview">
            🎉 Olá João! Seu aniversário está chegando!<br/><br/>
            Faltam apenas {settings.preBirthdayDays} dias para o seu grande dia e preparamos algo especial:<br/><br/>
            🎁 <strong>{settings.preBirthdayCashbackExtra}% DE CASHBACK EXTRA</strong> em todas as suas compras até o dia do seu aniversário!<br/><br/>
            Aproveite agora: [Link Dashboard]<br/><br/>
            <em>Local CashBack - Seu cashback, suas vantagens! 💰</em>
          </div>
        </div>
      </section>
      
      {/* Dia do Aniversário */}
      <section className="birthday-day">
        <h2>🎂 Mensagem no Dia do Aniversário</h2>
        <label>
          <input
            type="checkbox"
            checked={settings.birthdayEnabled}
            onChange={(e) => setSettings({ ...settings, birthdayEnabled: e.target.checked })}
          />
          Enviar mensagem no dia do aniversário
        </label>
        
        <label>
          Bônus de aniversário:
          <select
            value={settings.birthdayBonusAmount}
            onChange={(e) => setSettings({ ...settings, birthdayBonusAmount: parseFloat(e.target.value) })}
          >
            {[5, 10, 15, 20, 50].map(v => (
              <option key={v} value={v}>R$ {v.toFixed(2)}</option>
            ))}
          </select>
        </label>
        
        <label>
          Cashback extra no dia:
          <select
            value={settings.birthdayCashbackExtra}
            onChange={(e) => setSettings({ ...settings, birthdayCashbackExtra: parseInt(e.target.value) })}
          >
            {[15, 20, 25, 30, 50].map(v => (
              <option key={v} value={v}>{v}%</option>
            ))}
          </select>
        </label>
        
        <div className="preview">
          <h3>Preview da mensagem:</h3>
          <div className="message-preview">
            🎂 <strong>PARABÉNS, João!</strong> 🎉<br/><br/>
            Hoje é o SEU dia! Para comemorar, você ganhou:<br/><br/>
            🎁 <strong>R$ {settings.birthdayBonusAmount.toFixed(2)} de BÔNUS</strong> direto na sua conta!<br/>
            💰 <strong>{settings.birthdayCashbackExtra}% de CASHBACK EXTRA</strong> em todas as compras hoje!<br/><br/>
            Seu saldo atual: R$ 45,00<br/><br/>
            Acesse: [Link Dashboard]<br/><br/>
            Feliz Aniversário! 🥳<br/>
            <em>Local CashBack</em>
          </div>
        </div>
      </section>
      
      {/* Estatísticas */}
      {stats && (
        <section className="stats">
          <h2>📊 Estatísticas (Últimos 30 dias)</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.preBirthdayCount}</div>
              <div className="stat-label">Mensagens pré-aniversário</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.birthdayCount}</div>
              <div className="stat-label">Mensagens de aniversário</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">R$ {stats.totalBonus.toFixed(2)}</div>
              <div className="stat-label">Total em bônus</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.successRate}%</div>
              <div className="stat-label">Taxa de sucesso</div>
            </div>
          </div>
        </section>
      )}
      
      {/* Próximos Aniversariantes */}
      <section className="upcoming">
        <h2>📅 Próximos 30 dias ({upcoming.length} aniversariantes)</h2>
        {upcoming.length === 0 ? (
          <p>Nenhum aniversariante nos próximos 30 dias</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Saldo Atual</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map(c => (
                <tr key={c.id}>
                  <td>{new Date(c.birthdate).toLocaleDateString('pt-BR')}</td>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>R$ {c.cashback_balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      
      {/* Botão Salvar */}
      <button 
        onClick={handleSave} 
        disabled={saving}
        className="save-button"
      >
        {saving ? '💾 Salvando...' : '💾 Salvar Configurações'}
      </button>
    </div>
  );
}
```

---

## 🔄 **Como o Cron Job Usa as Configurações**

```javascript
// Modificação no cron job do server.js

async function checkBirthday30Days() {
  // Buscar merchants com automação ativa
  const { data: merchantSettings } = await supabase
    .from('whatsapp_automation_settings')
    .select('merchant_id, pre_birthday_days, pre_birthday_cashback_extra')
    .eq('is_active', true)
    .eq('pre_birthday_enabled', true);
  
  for (const setting of merchantSettings || []) {
    // Calcular data baseada nas configurações
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + setting.pre_birthday_days);
    const monthDay = targetDate.toISOString().substring(5, 10);
    
    // Buscar clientes deste merchant com aniversário na data alvo
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .eq('merchant_id', setting.merchant_id)
      .not('birthdate', 'is', null)
      .ilike('birthdate', `%${monthDay}`);
    
    // Enviar mensagens usando as configurações personalizadas
    for (const customer of customers || []) {
      await sendBirthdayPromo30Days(customer, setting);
    }
  }
}
```

---

## ✅ **O QUE O MERCHANT CONTROLA**

| Configuração | Merchant Pode Alterar? | Precisa Aprovação Meta? |
|-------------|------------------------|-------------------------|
| ✅ Ativar/Desativar | SIM | NÃO |
| ✅ Horário de envio (9h, 10h, etc) | SIM | NÃO |
| ✅ Dias antes (7, 15, 30, 60) | SIM | NÃO |
| ✅ % Cashback extra (10%, 15%, 20%...) | SIM | NÃO |
| ✅ Valor do bônus (R$ 5, 10, 20...) | SIM | NÃO |
| ✅ Ver estatísticas | SIM | NÃO |
| ✅ Ver próximos aniversariantes | SIM | NÃO |
| ❌ Alterar texto da mensagem | NÃO | SIM (Meta aprova) |

---

## 🎯 **Fluxo Completo**

### **1. Configuração Inicial (Uma Vez)**
- Você cria os 2 templates na Meta (30 dias + dia do aniversário)
- Meta aprova (1-24h)
- Templates ficam disponíveis para **TODOS** os merchants

### **2. Merchant Configura (Self-Service)**
- Merchant acessa "Automações de Aniversário"
- Define:
  - Dias antes: 30 dias
  - Cashback extra antes: 15%
  - Bônus no dia: R$ 10
  - Cashback extra no dia: 20%
  - Horário: 09:00
- Clica em "Salvar"

### **3. Sistema Roda Automaticamente**
- Cron job às 09:00 (todo dia)
- Lê as configurações do merchant
- Envia mensagens personalizadas com os valores configurados

---

## 💰 **Custos**

- **Templates Meta**: GRÁTIS (precisa criar 2 vezes apenas)
- **Mensagens**: Primeiras 1.000 conversas/mês GRÁTIS
- **Self-Service**: Merchant configura sem custo adicional

---

## ⏱️ **Tempo de Implementação**

| Etapa | Tempo |
|-------|-------|
| Criar tabela `whatsapp_automation_settings` | 15 min |
| Criar endpoints backend (4 endpoints) | 1h |
| Criar painel de controle (frontend) | 2h |
| Modificar cron job para usar configurações | 30 min |
| Testes | 30 min |
| **TOTAL** | **~4 horas** |

---

## 🚀 **Resultado Final**

✅ Merchant configura tudo sozinho (sem mexer com Meta)  
✅ Valores personalizados por merchant  
✅ Preview das mensagens em tempo real  
✅ Estatísticas de envios  
✅ Lista de próximos aniversariantes  
✅ Sistema 100% automatizado  

---

**Quer que eu implemente esse painel de controle?** 🎯

---

**Criado**: 2026-01-03  
**Última Atualização**: 2026-01-03  
**Autor**: GenSpark AI Developer  
**Status**: Pronto para Implementação
