# Meta WhatsApp Business API - FAQ e Explicação Detalhada

**Data**: 2026-01-03  
**Status**: 📚 Documentação Explicativa

---

## ❓ PERGUNTAS E RESPOSTAS

### **1. Como serão os disparos?**

**Resposta**: Os disparos são feitos **via API oficial da Meta** (Cloud API).

**Fluxo técnico:**
```
1. Cliente faz ação (cadastro, recebe cashback, faz resgate)
2. Frontend chama backend (/api/whatsapp/send-welcome, etc)
3. Backend chama Meta API: https://graph.facebook.com/v18.0/{phone-number-id}/messages
4. Meta API valida e envia a mensagem
5. Cliente recebe mensagem no WhatsApp dele
```

**Características:**
- ✅ **Oficial e confiável**: API oficial da Meta (não é bot ou automação não autorizada)
- ✅ **Rápido**: Mensagem chega em segundos
- ✅ **Profissional**: Aparece com selo verde "WhatsApp Business"
- ✅ **Escalável**: Suporta milhares de mensagens por dia
- ❌ **Não é gratuito ilimitado**: Após 1.000 conversas/mês, cobra ~R$ 0,10-0,50 por conversa

---

### **2. Serão feitos pela conta do WhatsApp Business?**

**SIM!** Mas é importante entender como funciona:

#### **Como funciona o WhatsApp Business API:**

**NÃO é o app WhatsApp Business (verde)**  
- ❌ Não é o aplicativo que você baixa no celular
- ❌ Não tem interface de conversa manual
- ❌ Não precisa deixar o celular conectado

**É a WhatsApp Business API (Cloud API)**  
- ✅ É uma API pura (código para código)
- ✅ Funciona 24/7 automaticamente
- ✅ Você configura uma vez e esquece
- ✅ As mensagens saem de um **número de telefone verificado** pela Meta
- ✅ Cliente vê: "Raul Bar" (ou nome do seu negócio) com selo verde de verificado

#### **Configuração da conta:**

1. **Você cria uma Meta Business Account** (gratuito)
2. **Adiciona um número de telefone** (pode ser novo ou existente)
3. **Meta verifica o número** (via SMS/ligação)
4. **Você recebe as credenciais**:
   - Phone Number ID
   - Access Token
5. **Sistema usa essas credenciais** para enviar mensagens

**IMPORTANTE**: O número precisa ser **exclusivo** para a API. Se você já usa o mesmo número no WhatsApp pessoal ou WhatsApp Business app, precisará migrar ou usar outro número.

---

### **3. Teremos mensagens automáticas?**

**SIM!** Totalmente automático. Veja os cenários:

#### **Cenário 1: Cadastro de Cliente**

**Quando acontece:**
- Cliente acessa: https://cashback.raulricco.com.br/signup/bardoraul
- Preenche nome, telefone, email
- Clica em "Cadastrar"

**O que acontece automaticamente:**
```
1. Sistema salva cliente no banco
2. Sistema chama syncCustomerToIntegrations(customer, merchantId, 'signup')
3. Integração WhatsApp detecta evento 'signup'
4. Backend chama Meta API
5. Cliente recebe no WhatsApp dele:

   ┌────────────────────────────────────┐
   │ 🟢 Raul Bar (Verificado)           │
   ├────────────────────────────────────┤
   │ Olá João! 🎉                       │
   │                                    │
   │ Bem-vindo ao *Raul Bar*!           │
   │                                    │
   │ Você agora faz parte do nosso      │
   │ programa de cashback. A cada       │
   │ compra, você acumula créditos      │
   │ para usar depois!                  │
   │                                    │
   │ Seu saldo atual: R$ 0,00           │
   │                                    │
   │ Boas compras! 💰                   │
   └────────────────────────────────────┘
```

**Tempo**: 2-5 segundos após o cadastro  
**Custo**: Grátis (dentro das primeiras 1.000 conversas)

---

#### **Cenário 2: Recebimento de Cashback**

**Quando acontece:**
- Merchant registra uma compra do cliente
- Valor: R$ 100,00
- Cashback: 5% = R$ 5,00

**O que acontece automaticamente:**
```
1. Sistema registra transação
2. Sistema adiciona R$ 5,00 ao saldo do cliente
3. Sistema chama syncCustomerToIntegrations(customer, merchantId, 'purchase')
4. Integração WhatsApp detecta evento 'purchase' → envia 'cashback'
5. Backend chama Meta API
6. Cliente recebe no WhatsApp dele:

   ┌────────────────────────────────────┐
   │ 🟢 Raul Bar (Verificado)           │
   ├────────────────────────────────────┤
   │ Olá João! 💰                       │
   │                                    │
   │ Você recebeu *R$ 5,00* em          │
   │ cashback na sua compra em          │
   │ *Raul Bar*!                        │
   │                                    │
   │ 💳 Valor da compra: R$ 100,00      │
   │ 🎁 Cashback ganho: R$ 5,00         │
   │ 💎 Saldo total: R$ 35,00           │
   │                                    │
   │ Continue comprando e acumulando!🚀 │
   └────────────────────────────────────┘
```

**Tempo**: 2-5 segundos após registrar a compra  
**Custo**: Grátis (dentro das primeiras 1.000 conversas)

---

#### **Cenário 3: Resgate de Cashback**

**Quando acontece:**
- Cliente tem R$ 35,00 de saldo
- Cliente acessa: https://cashback.raulricco.com.br/customer/dashboard/61999887766
- Clica em "Resgatar R$ 20,00"
- Confirma resgate

**O que acontece automaticamente:**
```
1. Sistema deduz R$ 20,00 do saldo
2. Sistema registra redemption
3. Sistema chama syncCustomerToIntegrations(customer, merchantId, 'redemption')
4. Integração WhatsApp detecta evento 'redemption'
5. Backend chama Meta API
6. Cliente recebe no WhatsApp dele:

   ┌────────────────────────────────────┐
   │ 🟢 Raul Bar (Verificado)           │
   ├────────────────────────────────────┤
   │ Olá João! ✅                       │
   │                                    │
   │ Seu resgate foi confirmado!        │
   │                                    │
   │ 💰 Valor resgatado: R$ 20,00       │
   │ 🏪 Estabelecimento: Raul Bar       │
   │ 💎 Saldo restante: R$ 15,00        │
   │                                    │
   │ Aproveite seu desconto! 🎉         │
   └────────────────────────────────────┘
```

**Tempo**: 2-5 segundos após confirmar resgate  
**Custo**: Grátis (dentro das primeiras 1.000 conversas)

---

#### **Cenário 4: Aniversário (BÔNUS)**

**Quando acontece:**
- Sistema roda rotina diária (cron job)
- Busca clientes que fazem aniversário hoje
- Envia mensagem especial

**O que acontece automaticamente:**
```
1. Cron job roda às 9h da manhã
2. Busca clientes com birthdate = hoje
3. Para cada cliente, chama backend
4. Backend chama Meta API
5. Cliente recebe no WhatsApp dele:

   ┌────────────────────────────────────┐
   │ 🟢 Raul Bar (Verificado)           │
   ├────────────────────────────────────┤
   │ 🎂 Feliz Aniversário, João! 🎉    │
   │                                    │
   │ A equipe do *Raul Bar* deseja     │
   │ um dia incrível!                   │
   │                                    │
   │ 🎁 Preparamos um presente          │
   │ especial: *10% de cashback         │
   │ extra* nas suas compras hoje!      │
   │                                    │
   │ Aproveite! 💝                      │
   └────────────────────────────────────┘
```

**Tempo**: 9h da manhã do dia do aniversário  
**Custo**: Grátis (dentro das primeiras 1.000 conversas)

---

## 🎯 RESUMO: O QUE É AUTOMÁTICO

| Evento | Automático? | Quando? | Mensagem |
|--------|-------------|---------|----------|
| 🎯 **Cadastro** | ✅ SIM | 2-5s após cadastro | Boas-vindas + saldo R$ 0,00 |
| 💰 **Cashback** | ✅ SIM | 2-5s após registrar compra | Valor ganho + saldo total |
| 🎁 **Resgate** | ✅ SIM | 2-5s após confirmar resgate | Valor resgatado + saldo restante |
| 🎂 **Aniversário** | ✅ SIM | 9h da manhã do aniversário | Feliz aniversário + oferta especial |

---

## 📱 COMO O CLIENTE VÊ

### **No WhatsApp do cliente:**

1. **Primeiro contato** (cadastro):
   - Aparece nova conversa: "Raul Bar" com selo verde
   - Mensagem de boas-vindas
   - Cliente pode responder (mas resposta não vai para você por padrão)

2. **Mensagens seguintes** (cashback, resgate):
   - Mesma conversa "Raul Bar"
   - Cliente vê histórico de todas as mensagens

3. **Aparência profissional**:
   - ✅ Selo verde "Verificado" da Meta
   - ✅ Nome do estabelecimento
   - ✅ Formatação rica (negrito, emojis)
   - ✅ Não parece spam

---

## 🔐 SEGURANÇA E LIMITAÇÕES

### **Limitações da Meta (importantes!):**

1. **Somente templates pré-aprovados**
   - ❌ Você NÃO pode enviar texto livre
   - ✅ Você SÓ pode usar templates aprovados pela Meta
   - ⏱️ Aprovação leva 1-24 horas
   - 📝 Templates precisam ser TRANSACTIONAL ou MARKETING

2. **Janela de 24 horas**
   - Se cliente responde → você tem 24h para conversar livremente
   - Se cliente NÃO responde → só pode enviar templates

3. **Limite de mensagens**
   - Primeiras 1.000 conversas/mês: GRÁTIS
   - Após 1.000: ~R$ 0,10-0,50 por conversa
   - "Conversa" = janela de 24h (várias mensagens = 1 conversa)

4. **Número único**
   - Número precisa ser dedicado à API
   - Se você usa o número no WhatsApp pessoal/business app, precisa migrar

---

## 💡 EXEMPLO REAL DO FLUXO COMPLETO

### **Cliente: João Silva**
**Telefone**: (61) 99988-7766  
**Merchant**: Raul Bar

---

#### **DIA 1 - Segunda-feira, 10h00**

**João acessa o link de cadastro:**
```
https://cashback.raulricco.com.br/signup/bardoraul
```

**João preenche:**
- Nome: João Silva
- Telefone: (61) 99988-7766
- Email: joao@example.com
- Data Nascimento: 15/03/1990
- Senha: ••••••

**João clica em "Cadastrar"**

**⏱️ 3 segundos depois...**

**WhatsApp do João:**
```
🟢 Raul Bar (Verificado)
Agora

Olá João Silva! 🎉

Bem-vindo ao *Raul Bar*!

Você agora faz parte do nosso programa 
de cashback. A cada compra, você acumula 
créditos para usar depois!

Seu saldo atual: R$ 0,00

Boas compras! 💰
```

---

#### **DIA 1 - Segunda-feira, 19h30**

**João vai ao Raul Bar e gasta R$ 150,00**

**Merchant (você) registra a compra no sistema:**
- Cliente: João Silva (61) 99988-7766
- Valor: R$ 150,00
- Cashback: 5% = R$ 7,50

**Clica em "Registrar"**

**⏱️ 3 segundos depois...**

**WhatsApp do João:**
```
🟢 Raul Bar (Verificado)
Agora

Olá João Silva! 💰

Você recebeu *R$ 7,50* em cashback 
na sua compra em *Raul Bar*!

💳 Valor da compra: R$ 150,00
🎁 Cashback ganho: R$ 7,50
💎 Saldo total: R$ 7,50

Continue comprando e acumulando! 🚀
```

---

#### **DIA 5 - Sexta-feira, 20h15**

**João vai novamente ao Raul Bar e gasta R$ 200,00**

**Merchant registra:**
- Cliente: João Silva
- Valor: R$ 200,00
- Cashback: 5% = R$ 10,00

**⏱️ 3 segundos depois...**

**WhatsApp do João:**
```
🟢 Raul Bar (Verificado)
Agora

Olá João Silva! 💰

Você recebeu *R$ 10,00* em cashback 
na sua compra em *Raul Bar*!

💳 Valor da compra: R$ 200,00
🎁 Cashback ganho: R$ 10,00
💎 Saldo total: R$ 17,50

Continue comprando e acumulando! 🚀
```

---

#### **DIA 7 - Domingo, 14h00**

**João decide usar o cashback**

**João acessa:**
```
https://cashback.raulricco.com.br/customer/dashboard/61999887766
```

**João vê:**
- Saldo disponível: R$ 17,50

**João clica em "Resgatar R$ 17,50"**

**⏱️ 3 segundos depois...**

**WhatsApp do João:**
```
🟢 Raul Bar (Verificado)
Agora

Olá João Silva! ✅

Seu resgate foi confirmado!

💰 Valor resgatado: R$ 17,50
🏪 Estabelecimento: Raul Bar
💎 Saldo restante: R$ 0,00

Aproveite seu desconto! 🎉
```

---

#### **DIA 45 - 15 de Março, 9h00 (Aniversário do João)**

**Sistema roda rotina diária:**
- Busca clientes com aniversário hoje
- Encontra João Silva (15/03/1990)
- Envia mensagem automática

**⏱️ Às 9h00 da manhã...**

**WhatsApp do João:**
```
🟢 Raul Bar (Verificado)
Agora

🎂 Feliz Aniversário, João Silva! 🎉

A equipe do *Raul Bar* deseja um dia 
incrível!

🎁 Preparamos um presente especial: 
*10% de cashback extra* nas suas 
compras hoje!

Aproveite! 💝
```

---

## ✅ VANTAGENS DO WHATSAPP BUSINESS API

1. **Profissional**
   - Selo verde "Verificado"
   - Nome do estabelecimento aparece
   - Não parece spam

2. **Automático**
   - Zero intervenção manual
   - Funciona 24/7
   - Mensagens em segundos

3. **Confiável**
   - API oficial da Meta
   - Taxa de entrega ~98%
   - Cliente sempre recebe

4. **Escalável**
   - Milhares de mensagens por dia
   - Sem limite de clientes
   - Performance consistente

5. **Custo-benefício**
   - Primeiras 1.000 conversas: GRÁTIS
   - Após 1.000: ~R$ 0,10-0,50
   - ROI alto (cliente volta mais)

---

## ❌ DESVANTAGENS / LIMITAÇÕES

1. **Somente templates**
   - Não pode enviar texto livre
   - Templates precisam aprovação (1-24h)
   - Mudanças nos templates demoram

2. **Custo após 1.000 conversas**
   - Não é totalmente grátis ilimitado
   - Precisa controlar volume
   - Pode ficar caro com muitos clientes

3. **Número exclusivo**
   - Precisa número dedicado
   - Não pode usar mesmo número em outros apps
   - Migração pode ser complexa

4. **Não é chat em tempo real**
   - Mensagens são one-way (você → cliente)
   - Cliente pode responder mas você não vê (sem configuração extra)
   - Para chat bidirecional, precisa configurar webhook

---

## 🎯 CONCLUSÃO

### **Respondendo suas perguntas:**

**1. Como serão os disparos?**
→ **Via API oficial da Meta**, backend chama endpoint, Meta envia mensagem

**2. Pela conta do WhatsApp Business?**
→ **SIM**, mas via API (não é o app), precisa número verificado

**3. Teremos mensagens automáticas?**
→ **SIM, 100% automáticas**:
   - ✅ Cadastro → boas-vindas (2-5s)
   - ✅ Cashback → notificação (2-5s)
   - ✅ Resgate → confirmação (2-5s)
   - ✅ Aniversário → mensagem especial (9h manhã)

**4. Precisamos fazer algo manualmente?**
→ **NÃO**, após configurar uma vez, tudo é automático

---

**Está claro? Quer prosseguir com a implementação?** 🚀

---

**Criado**: 2026-01-03  
**Última atualização**: 2026-01-03  
**Autor**: GenSpark AI Developer
