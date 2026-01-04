# 🎂 GUIA RÁPIDO: AUTOMAÇÃO DE ANIVERSÁRIO

## ✅ O QUE FOI IMPLEMENTADO

Sistema automático que envia mensagens de WhatsApp para clientes com aniversário próximo.

---

## 🚀 COMEÇAR A USAR AGORA

### 1. Verificar Aniversariantes

```bash
# Ver clientes com aniversário nos próximos 30 dias
curl http://localhost:3001/api/birthday/upcoming?days=30

# Ver em produção
curl https://localcashback.com.br/api/birthday/upcoming?days=30
```

**Resposta:**
```json
{
  "success": true,
  "count": 2,
  "customers": [
    {
      "name": "João Silva",
      "phone": "5511999999999",
      "birthdate": "1990-05-15",
      "daysUntilBirthday": 12
    }
  ]
}
```

### 2. Testar Envio de Mensagem

```bash
# Substituir CUSTOMER-ID pelo ID real
curl -X POST http://localhost:3001/api/birthday/send-test \
  -H "Content-Type: application/json" \
  -d '{"customerId": "CUSTOMER-ID-AQUI"}'
```

---

## ⏰ FUNCIONAMENTO AUTOMÁTICO

### Cron Job

O sistema roda automaticamente **todos os dias às 9:00 AM**.

**Configuração atual:**
- ⏰ Horário: 9:00 AM (Brasília)
- 📅 Frequência: Diária
- 📊 Busca: 30 dias de antecedência
- 📱 Ação: Envia mensagem via WhatsApp (após configurar API)

### Ver Logs

```bash
# Ver logs em tempo real
pm2 logs stripe-api

# Ver apenas logs de aniversários
pm2 logs stripe-api | grep "ANIVERSÁRIO"

# Ver última execução (às 9:00 AM)
pm2 logs stripe-api --lines 100 | grep "Processando Mensagens"
```

---

## 🔧 PRÓXIMOS PASSOS (CONFIGURAÇÃO WHATSAPP)

### Opção 1: Evolution API (Recomendado - Gratuito)

**1. Instalar Evolution API:**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=SUA-CHAVE-SEGURA-AQUI \
  atendai/evolution-api
```

**2. Adicionar ao .env:**

```bash
# WhatsApp - Evolution API
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=SUA-CHAVE-SEGURA-AQUI
WHATSAPP_INSTANCE_NAME=cashback-instance
```

**3. Descomentar código no server.js:**

Procure por `// TODO: Integrar com API de WhatsApp` na função `sendBirthdayWhatsAppMessage` e descomente o código da Evolution API.

**Links:**
- Documentação: https://doc.evolution-api.com/
- GitHub: https://github.com/EvolutionAPI/evolution-api
- Vídeos: https://www.youtube.com/results?search_query=evolution+api+whatsapp

### Opção 2: Twilio (Pago)

**1. Criar conta:** https://www.twilio.com/try-twilio

**2. Adicionar ao .env:**

```bash
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**3. Instalar SDK:**

```bash
npm install twilio
```

**4. Código de integração:** Ver documentação em BIRTHDAY-AUTOMATION.md

---

## 📊 DADOS DE TESTE

### Aniversariantes Atuais (04/01/2026)

```json
{
  "count": 2,
  "customers": [
    {
      "name": "Raulera",
      "phone": "6172727272",
      "birthdate": "1989-01-24",
      "daysUntilBirthday": 20
    },
    {
      "name": "Raul testando",
      "phone": "6126262626",
      "birthdate": "2003-01-15",
      "daysUntilBirthday": 11
    }
  ]
}
```

### Adicionar Cliente de Teste

```sql
-- No Supabase SQL Editor
UPDATE customers 
SET birthdate = CURRENT_DATE + INTERVAL '10 days'
WHERE id = 'seu-customer-id';
```

---

## 🎨 MENSAGEM ENVIADA (EXEMPLO)

```
🎉 Olá João Silva!

O seu aniversário está chegando em 10 dias! 🎂

Para comemorar, preparamos uma surpresa especial pra você! 🎁

Aguardamos sua visita! ❤️

- Equipe Churrascaria Boi Dourado
```

---

## 🔍 VERIFICAÇÃO RÁPIDA

### Checklist

- [x] ✅ Sistema instalado
- [x] ✅ Cron job configurado (9:00 AM diário)
- [x] ✅ Endpoints funcionando
- [x] ✅ Banco de dados com campo `birthdate`
- [x] ✅ Testes locais passando
- [ ] ⏳ WhatsApp API configurada (pendente)
- [ ] ⏳ Teste em produção (pendente)

### Status Atual

```
✅ FUNCIONAL: Sistema detecta aniversariantes
✅ FUNCIONAL: Endpoints de teste
✅ FUNCIONAL: Cron job configurado
⏳ PENDENTE: Integração WhatsApp API
⏳ PENDENTE: Testes em produção
```

---

## 📱 TESTE MANUAL

### 1. Criar Cliente de Teste

```sql
-- Adicionar cliente com aniversário em 5 dias
INSERT INTO customers (name, phone, email, birthdate, merchant_id)
VALUES (
  'Cliente Teste Aniversário',
  '5511999999999',
  'teste@example.com',
  CURRENT_DATE + INTERVAL '5 days',
  'seu-merchant-id'
);
```

### 2. Verificar se Aparece

```bash
curl http://localhost:3001/api/birthday/upcoming?days=30
```

### 3. Testar Envio

```bash
curl -X POST http://localhost:3001/api/birthday/send-test \
  -H "Content-Type: application/json" \
  -d '{"customerId": "id-do-cliente-teste"}'
```

### 4. Ver Log

```bash
pm2 logs stripe-api --lines 50
```

---

## 🐛 PROBLEMAS COMUNS

### Nenhum cliente aparece

**Solução:**
1. Verificar se há clientes com `birthdate` preenchido
2. Verificar formato da data: `YYYY-MM-DD`
3. Aumentar `days` no endpoint: `?days=90`

### Cron não executa

**Solução:**
1. Reiniciar servidor: `pm2 restart stripe-api`
2. Verificar logs: `pm2 logs stripe-api`
3. Testar manualmente: chamar endpoint de teste

### Mensagem não envia

**Solução:**
1. Verificar se WhatsApp API está configurada
2. Ver logs de erro: `pm2 logs stripe-api --err`
3. Testar com `send-test` endpoint

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, ver: **BIRTHDAY-AUTOMATION.md**

Inclui:
- Instruções de integração WhatsApp (Evolution API, Twilio, etc)
- Personalização de mensagens
- Conformidade LGPD
- Monitoramento e logs
- Troubleshooting avançado

---

## ✅ RESUMO

**O QUE FUNCIONA AGORA:**
- ✅ Detecção automática de aniversários
- ✅ Cron job diário (9:00 AM)
- ✅ Endpoints de teste e listagem
- ✅ Logs detalhados

**O QUE FALTA:**
- ⏳ Configurar WhatsApp API (Evolution API ou Twilio)
- ⏳ Testar envio real de mensagens
- ⏳ Adicionar campo de consentimento LGPD (opcional)

**TEMPO ESTIMADO:**
- Configurar Evolution API: **15-30 minutos**
- Primeiro teste em produção: **5 minutos**

---

**Status**: ✅ **IMPLEMENTADO - AGUARDANDO CONFIGURAÇÃO WHATSAPP**

**Próximo passo**: Escolher e configurar API de WhatsApp (Evolution API recomendada)

**Data**: 04/01/2026  
**Commit**: 67099e2  
**Branch**: genspark_ai_developer
