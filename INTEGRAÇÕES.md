# 📧 Guia de Integrações - Email Marketing

## 🎯 O que são as Integrações?

O sistema de cashback está integrado com as principais ferramentas de email marketing do mercado:
- **Mailchimp** 📮
- **RD Station** ⚡

Isso permite que seus clientes sejam automaticamente adicionados às suas listas/bases de contatos, facilitando campanhas de marketing e comunicação.

## 🚀 Como Funciona?

### Sincronização Automática

Quando você ativa uma integração, o sistema sincroniza automaticamente os clientes nos seguintes momentos:

1. **Ao cadastrar novo cliente** (signup)
2. **Ao fazer compra** (gerar cashback)
3. **Ao resgatar cashback** (redemption)

Você pode configurar quais eventos deseja sincronizar!

### Tags Inteligentes

O sistema adiciona automaticamente tags baseadas no comportamento do cliente:

#### Mailchimp
- `Novo Cliente` - Cliente acabou de se cadastrar
- `Comprou Recentemente` - Fez compra nos últimos dias
- `Resgatou Cashback` - Cliente engajado
- `Alto Cashback` - Saldo > R$ 50
- `Médio Cashback` - Saldo entre R$ 20 e R$ 50

#### RD Station
- `novo_cliente` / `primeiro_cashback`
- `comprou_recentemente` / `cliente_ativo`
- `resgatou_cashback` / `cliente_engajado`
- `vip` / `alto_valor` - Total gasto > R$ 500
- `medio_valor` - Total gasto > R$ 200

### Campos Personalizados

Os seguintes dados são sincronizados:

**Mailchimp (Merge Fields):**
- `FNAME` - Nome do cliente
- `PHONE` - Telefone
- `CASHBACK` - Saldo de cashback disponível
- `TOTALSPENT` - Total gasto

**RD Station (Custom Fields):**
- `cf_saldo_cashback` - Saldo disponível
- `cf_total_gasto` - Total gasto
- `cf_total_cashback` - Total acumulado

---

## 🔧 Configuração

### 1️⃣ Mailchimp

#### Passo 1: Obter API Key

1. Acesse sua conta Mailchimp
2. Vá em **Account** → **Extras** → **API Keys**
3. Clique em **Create A Key**
4. Copie a API Key gerada

#### Passo 2: Obter Audience ID (List ID)

1. Vá em **Audience** → **All Contacts**
2. Clique em **Settings** → **Audience name and defaults**
3. Copie o **Audience ID** (algo como `abc123def`)

#### Passo 3: Identificar Server Prefix

A API Key tem formato: `xxxxxxxxxxxxxxxxxxxx-us1`

O **us1** (ou us2, us3, etc.) é o seu server prefix.

#### Passo 4: Configurar no Sistema

1. Acesse **Integrações** no menu
2. Aba **Mailchimp**
3. Cole sua API Key
4. Cole seu Audience ID
5. Informe o Server Prefix
6. Configure a sincronização automática
7. Clique em **Testar Conexão**
8. Se sucesso, clique em **Salvar Configuração**
9. Ative a integração com o toggle

---

### 2️⃣ RD Station

#### Passo 1: Obter Access Token

1. Acesse sua conta RD Station
2. Vá em **Integrações** → **Tokens de integração**
3. Clique em **Gerar token** ou use um existente
4. Selecione as permissões necessárias:
   - Leitura de contatos
   - Escrita de contatos
   - Conversões
5. Copie o Access Token

#### Passo 2: Configurar no Sistema

1. Acesse **Integrações** no menu
2. Aba **RD Station**
3. Cole seu Access Token
4. Configure a sincronização automática
5. Clique em **Testar Conexão**
6. Se sucesso, clique em **Salvar Configuração**
7. Ative a integração com o toggle

---

## 🔄 Sincronização Manual

### Importar Todos os Clientes

Depois de configurar a integração, você pode importar todos os clientes existentes:

1. Acesse **Integrações**
2. Clique em **Sincronizar Todos os Clientes**
3. Aguarde a sincronização (pode levar alguns minutos)

### Verificar Logs

Para ver o status das sincronizações:

1. Acesse **Integrações**
2. Aba **Logs**
3. Veja o histórico de sincronizações com status de sucesso/erro

---

## 📊 Casos de Uso

### 1. Campanha de Recuperação

Use a tag `Alto Cashback` para criar uma campanha:
- "Você tem R$ X em cashback disponível!"
- "Não deixe seu dinheiro parado, resgate agora!"

### 2. Programa de Fidelidade

Segmente clientes por tags:
- VIP: Ofereça benefícios exclusivos
- Médio Valor: Incentive mais compras
- Novo Cliente: Email de boas-vindas

### 3. Automação de Email

Configure automações baseadas em eventos:
- Cliente faz primeira compra → Email de agradecimento
- Cliente não compra há 30 dias → Email de reativação
- Cliente resgatou cashback → Email parabenizando

### 4. Relatórios e Análises

Use os dados sincronizados para:
- Análise de comportamento
- Segmentação avançada
- Cálculo de LTV
- Identificar clientes em risco (churn)

---

## 🔐 Segurança

### Credenciais Criptografadas

- API Keys são armazenadas de forma segura no Supabase
- Nunca expomos credenciais no frontend
- Acesso restrito por Row Level Security (RLS)

### Privacidade (LGPD)

O sistema está preparado para LGPD:
- RD Station: Enviamos `legal_bases` com consentimento
- Mailchimp: Status `subscribed` indica opt-in
- Você é responsável por obter consentimento dos clientes

---

## ❗ Troubleshooting

### Mailchimp

**Erro: "Invalid API Key"**
- Verifique se copiou a API Key completa
- Confirme o server prefix (us1, us2, etc.)
- Regenere a API Key se necessário

**Erro: "Resource Not Found"**
- Audience ID incorreto
- Verifique no painel do Mailchimp

**Contatos não aparecem**
- Pode levar alguns minutos
- Verifique se a integração está ativada
- Confira os logs de sincronização

### RD Station

**Erro: "Unauthorized"**
- Access Token expirado ou inválido
- Gere um novo token
- Verifique as permissões do token

**Erro: "Rate Limit"**
- API do RD Station tem limites
- Aguarde alguns minutos
- Use sincronização manual em lotes menores

**Contatos duplicados**
- RD Station usa email como identificador único
- Clientes sem email usam `{phone}@cashback.local`
- Configure nome e email dos clientes para evitar isso

---

## 🎓 Melhores Práticas

### 1. Configure Tags Personalizadas

Além das tags automáticas, adicione tags específicas do seu negócio:
- Nome da loja
- Cidade/região
- Tipo de produto mais comprado

### 2. Segmentação Estratégica

Crie segmentos para:
- Clientes inativos (>30 dias sem compra)
- Clientes frequentes (>5 compras/mês)
- Alto valor (>R$ 1000 gasto)

### 3. Automação Inteligente

Configure workflows automáticos:
- Sequência de boas-vindas
- Programa de pontos/gamificação
- Ofertas personalizadas baseadas em comportamento

### 4. Teste Regularmente

- Faça testes mensais da conexão
- Monitore os logs de sincronização
- Valide se os dados estão corretos

---

## 📈 Métricas de Sucesso

Acompanhe estas métricas após ativar as integrações:

- **Taxa de Abertura de Emails**: Meta >20%
- **Taxa de Clique (CTR)**: Meta >3%
- **Taxa de Conversão**: Meta >5%
- **ROI de Email Marketing**: Meta >400%

---

## 🆘 Suporte

### Documentação Oficial

- [Mailchimp API Docs](https://mailchimp.com/developer/marketing/api/)
- [RD Station API Docs](https://developers.rdstation.com/)

### Problemas Comuns

Se encontrar problemas:
1. Verifique os logs de sincronização
2. Teste a conexão manualmente
3. Confirme credenciais
4. Verifique permissões da API

---

## ✨ Recursos Futuros

Em desenvolvimento:
- [ ] Integração com Active Campaign
- [ ] Integração com SendGrid
- [ ] Webhooks personalizados
- [ ] Automação de campanhas direto do sistema
- [ ] Templates de email prontos

---

**Dúvidas?** Consulte os logs de sincronização ou teste a conexão para identificar problemas! 🚀
