# 🎂 CONFIGURAR CAMPO DE ANIVERSÁRIO - MAILCHIMP E RD STATION

## ✅ O QUE FOI IMPLEMENTADO

O sistema agora envia a **data de nascimento do cliente** para Mailchimp e RD Station como campo de **aniversário**, permitindo criar automações de marketing para aniversariantes.

---

## 📧 MAILCHIMP - CONFIGURAÇÃO

### 1. **Criar Campo Personalizado "BIRTHDAY"**

No Mailchimp, você precisa criar um campo personalizado para receber o aniversário:

#### Passo a Passo:

1. Acesse sua conta do Mailchimp
2. Vá em **Audience** → **Manage Audience** → **Settings**
3. Clique em **Audience fields and *|MERGE|* tags**
4. Clique em **Add A Field**
5. Preencha:
   - **Field label**: `Birthday` ou `Aniversário`
   - **Merge tag**: `BIRTHDAY` (importante!)
   - **Field type**: `Birthday` (formato MM/DD)
6. Clique em **Save Field**

#### Resultado:
```
BIRTHDAY: 03/15 (formato MM/DD)
```

### 2. **Criar Automação de Aniversário**

Agora você pode criar automações:

1. Vá em **Campaigns** → **Create** → **Email** → **Automated**
2. Escolha **Birthday**
3. Configure:
   - **Audience**: Sua lista
   - **Merge field**: `BIRTHDAY`
   - **Send**: X dias antes/depois do aniversário
4. Crie seu email de aniversário
5. Ative a automação

#### Exemplo de Automação:
```
Trigger: 1 dia antes do aniversário (BIRTHDAY)
Email: "🎂 Feliz Aniversário! Ganhe 20% de cashback extra"
```

---

## 📊 RD STATION - CONFIGURAÇÃO

### 1. **Campo Personalizado "data_nascimento"**

O sistema envia 2 campos para o RD Station:
- `data_nascimento` - Data completa (YYYY-MM-DD)
- `aniversario` - Mesma data para automações

#### Passo a Passo:

1. Acesse RD Station Marketing
2. Vá em **Ferramentas** → **Campos Personalizados**
3. Clique em **Criar Campo**
4. Preencha:
   - **Nome do campo**: `Data de Nascimento` ou `Aniversário`
   - **Identificador**: `data_nascimento`
   - **Tipo**: `Data`
5. Salve

### 2. **Criar Automação de Aniversário**

1. Vá em **Automação de Marketing** → **Criar Fluxo**
2. Escolha **Criar do Zero**
3. Defina o gatilho:
   - **Tipo**: Data específica
   - **Campo**: `data_nascimento`
   - **Quando**: Aniversário (dia/mês)
4. Adicione ações:
   - Enviar email de aniversário
   - Adicionar tag "Aniversariante"
   - Enviar notificação push
5. Ative o fluxo

#### Exemplo de Automação:
```
Trigger: data_nascimento (dia e mês)
Ação 1: Enviar email "🎉 Feliz Aniversário!"
Ação 2: Adicionar tag "aniversariante_mes_atual"
Ação 3: Enviar cupom de desconto especial
```

---

## 🔧 CÓDIGO - O QUE FOI ALTERADO

### **integration-proxy.js** (Backend)

#### Mailchimp:
```javascript
// Formatar data de nascimento para Mailchimp (MM/DD)
let birthdayField = {};
if (customer.birthdate) {
  const date = new Date(customer.birthdate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  birthdayField = {
    BIRTHDAY: `${month}/${day}` // Formato MM/DD
  };
}

merge_fields: {
  FNAME: customer.name || '',
  PHONE: customer.phone || '',
  ...birthdayField // Adiciona BIRTHDAY
}
```

#### RD Station:
```javascript
// Formatar data de nascimento para RD Station (YYYY-MM-DD)
const birthdateField = customer.birthdate ? {
  data_nascimento: customer.birthdate, // ISO format
  aniversario: customer.birthdate // Para automações
} : {};

data = {
  email: customer.email,
  nome: customer.name,
  ...birthdateField // Adiciona data_nascimento e aniversario
}
```

---

## 📅 FORMATOS UTILIZADOS

### Mailchimp:
```
Formato: MM/DD
Exemplo: 03/15 (15 de março)
Campo: BIRTHDAY
```

### RD Station:
```
Formato: YYYY-MM-DD (ISO 8601)
Exemplo: 1990-03-15 (15 de março de 1990)
Campo: data_nascimento
```

---

## 🎯 CASOS DE USO

### 1. **Email de Aniversário**
```
Assunto: 🎂 Feliz Aniversário, [NOME]!
Conteúdo: Ganhe 20% de cashback extra hoje!
Trigger: No dia do aniversário (BIRTHDAY ou data_nascimento)
```

### 2. **Campanha Aniversariantes do Mês**
```
Segmento: Clientes com aniversário no mês atual
Email: "Aniversariantes de Março - Ofertas Especiais"
Frequência: 1x por mês
```

### 3. **Série de Aniversário**
```
Email 1: 7 dias antes - "Seu aniversário está chegando!"
Email 2: No dia - "Feliz Aniversário! Aqui está seu presente"
Email 3: 7 dias depois - "Aproveitou sua promoção de aniversário?"
```

### 4. **Segmentação por Idade**
```
RD Station - Campo Personalizado "idade"
Cálculo: Ano atual - Ano de nascimento
Segmentos: 18-25, 26-35, 36-45, 46+
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### Mailchimp:
- [ ] Criar campo personalizado `BIRTHDAY` (tipo Birthday)
- [ ] Testar sincronização de cliente com data de nascimento
- [ ] Verificar se campo `BIRTHDAY` aparece no contato (formato MM/DD)
- [ ] Criar automação de aniversário
- [ ] Testar automação com data fictícia
- [ ] Ativar automação

### RD Station:
- [ ] Criar campo personalizado `data_nascimento` (tipo Data)
- [ ] Testar sincronização de cliente com data de nascimento
- [ ] Verificar se campo aparece no lead (formato YYYY-MM-DD)
- [ ] Criar fluxo de automação de aniversário
- [ ] Testar fluxo com data fictícia
- [ ] Ativar fluxo

---

## 🧪 COMO TESTAR

### 1. **Cadastrar Cliente com Data de Nascimento**
```
Nome: João Teste
Email: joao@teste.com
Telefone: (11) 99999-9999
Data de Nascimento: 1990-03-15
```

### 2. **Verificar no Mailchimp**
- Acesse sua lista
- Procure por `joao@teste.com`
- Verifique campo `BIRTHDAY`: deve mostrar `03/15`

### 3. **Verificar no RD Station**
- Acesse Contatos
- Procure por `joao@teste.com`
- Verifique campo `data_nascimento`: deve mostrar `15/03/1990`

### 4. **Testar Automação**
- Crie um contato com aniversário para amanhã
- Aguarde a automação disparar
- Verifique se o email foi enviado

---

## 📊 RELATÓRIOS E INSIGHTS

### Mailchimp:
```
Reports → Automation → Birthday Campaign
- Total de emails enviados
- Taxa de abertura
- Taxa de cliques
- Conversões
```

### RD Station:
```
Marketing → Relatórios → Fluxos de Automação
- Contatos que entraram no fluxo
- Taxa de abertura
- Taxa de cliques
- ROI da campanha
```

---

## 🚀 EXEMPLOS DE CAMPANHAS DE SUCESSO

### 1. **Cashback Extra de Aniversário**
```
Email: "🎂 Hoje é seu dia! Ganhe 20% de cashback extra"
CTA: "Resgatar Meu Presente"
Resultado esperado: +30% em vendas
```

### 2. **Cupom de Desconto**
```
Email: "🎁 Feliz Aniversário! R$ 50 OFF na sua próxima compra"
Código: ANIVER2025
Validade: 7 dias
```

### 3. **Presente Surpresa**
```
Email: "🎉 Preparamos uma surpresa para você!"
Conteúdo: Resgate automático de R$ 20 em cashback
```

---

## 🔄 SINCRONIZAÇÃO AUTOMÁTICA

O sistema sincroniza automaticamente a data de nascimento quando:

✅ Cliente se cadastra (CustomerSignup)  
✅ Cliente recebe cashback (CustomerCashback)  
✅ Cliente resgata cashback (CustomerRedemption)  
✅ Merchant atualiza dados do cliente (Customers page)

---

## 📝 CAMPOS ENVIADOS PARA INTEGRAÇÕES

### Mailchimp:
```javascript
{
  email_address: "cliente@email.com",
  status: "subscribed",
  merge_fields: {
    FNAME: "João",
    PHONE: "(11) 99999-9999",
    BIRTHDAY: "03/15", // ← NOVO!
    CASHBACK: "50.00",
    TOTALSPENT: "500.00"
  },
  tags: ["Novo Cliente", "Alto Cashback"]
}
```

### RD Station:
```javascript
{
  token_rdstation: "xxx",
  email: "cliente@email.com",
  nome: "João",
  telefone: "(11) 99999-9999",
  data_nascimento: "1990-03-15", // ← NOVO!
  aniversario: "1990-03-15", // ← NOVO!
  saldo_cashback: "50.00",
  total_gasto: "500.00",
  tags: "novo_cliente,alto_cashback"
}
```

---

## 🎯 PRÓXIMOS PASSOS

### Sugestões de melhorias:

1. **Segmentação por Signo**
   - Calcular signo baseado na data de nascimento
   - Criar campanhas por signo

2. **Idade do Cliente**
   - Calcular idade atual
   - Segmentar por faixa etária

3. **Mês de Aniversário**
   - Criar campanhas mensais
   - "Aniversariantes de Março"

4. **Promoções Progressivas**
   - +10% de cashback 7 dias antes
   - +20% no dia
   - +15% 7 dias depois

---

**Data:** 07/11/2024  
**Status:** ✅ Implementado  
**Próximo passo:** Configurar campos personalizados no Mailchimp e RD Station
