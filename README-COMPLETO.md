# 💳 Sistema de Cashback para Pequenos Negócios

Sistema completo de cashback com QR Codes, integrações de marketing e domínio personalizado.

---

## 🚀 Acesso Rápido

### 📱 Aplicação
**URL:** https://5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai

**Login Padrão:**
- Email: `admin@cashback.com`
- Senha: qualquer senha (modo desenvolvimento)

---

## 📚 Guias e Documentação

### 🎯 Guias Principais

| Guia | Descrição | Quando Usar |
|------|-----------|-------------|
| **[INSTRUCOES-ATUALIZACAO.md](INSTRUCOES-ATUALIZACAO.md)** | Instruções das novas funcionalidades | Primeira vez usando o sistema |
| **[VERIFICACAO-URGENTE.md](VERIFICACAO-URGENTE.md)** | Solução de problemas de cache/visualização | Funcionalidades não aparecem |
| **[CORRECAO-QR-CODE.md](CORRECAO-QR-CODE.md)** | Corrigir erro ao escanear QR code | Erro "qr_scanned_at not found" |
| **[GUIA-DOMINIO-PROPRIO.md](GUIA-DOMINIO-PROPRIO.md)** | Como configurar domínio personalizado | Quer usar seu próprio domínio |

---

## ✅ Checklist de Instalação

### 1. Configuração do Banco de Dados

- [ ] Executei `supabase-schema-completo.sql` (tabelas principais)
- [ ] Executei `supabase-migration-updates.sql` (novos campos)
- [ ] Executei `supabase-fix-qr-field.sql` (correção QR code)

### 2. Configuração do Sistema

- [ ] Acessei a aplicação e fiz login
- [ ] Menu "Configurações" aparece no sidebar
- [ ] Configurei percentual de cashback
- [ ] Copiei link de cadastro de clientes
- [ ] (Opcional) Configurei GTM e Meta Pixel
- [ ] (Opcional) Configurei domínio próprio

### 3. Integrações de Marketing

- [ ] (Opcional) Configurei Mailchimp em "Integrações"
- [ ] (Opcional) Configurei RD Station em "Integrações"
- [ ] Testei sincronização de clientes

### 4. Testes

- [ ] Testei cadastro de cliente via link
- [ ] Testei gerar cashback com QR code
- [ ] Testei cliente escanear QR code
- [ ] Testei resgate de cashback
- [ ] Verificado saldo do cliente

---

## 🎯 Funcionalidades do Sistema

### Para o Merchant (Lojista)

#### 📊 Dashboard
- Visão geral de métricas
- Total de clientes
- Transações realizadas
- Cashback distribuído
- Ticket médio
- Calculadora CAC/LTV

#### 💰 Cashback
- Gerar QR code de cashback
- Cliente escaneia com celular
- Percentual configurável
- Histórico de transações

#### 🎁 Resgate
- Buscar cliente por telefone
- Ver saldo disponível
- Gerar QR de resgate
- Cliente confirma no celular

#### 👥 Clientes
- Lista de todos os clientes
- Histórico de compras
- Saldo de cashback
- Dados de contato

#### 👔 Funcionários
- Gerenciar funcionários
- Permissões de acesso
- Histórico de ações

#### 📈 Relatórios
- Gráficos e análises
- Filtros por período
- Exportação de dados
- Métricas de desempenho

#### 🔗 Integrações
- Mailchimp (email marketing)
- RD Station (automação)
- Sincronização automática
- Logs de sincronização

#### ⚙️ Configurações (NOVO!)
- **Aba Geral:** Nome e telefone
- **Aba Cashback:** Percentual personalizável
- **Aba Link de Cadastro:** URL compartilhável + domínio próprio
- **Aba Marketing:** Google Tag Manager + Meta Pixel

---

### Para o Cliente

#### 📝 Cadastro
- Link personalizado da loja
- Preenche: Nome, Email (opcional), Telefone
- Cadastro rápido e simples

#### 💳 Receber Cashback
1. Faz compra na loja
2. Merchant gera QR code
3. Cliente escaneia com celular
4. Confirma recebimento
5. Cashback creditado!

#### 🎁 Resgatar Cashback
1. Pede para resgatar na loja
2. Merchant gera QR de resgate
3. Cliente escaneia
4. Confirma resgate
5. Desconto aplicado!

#### 📱 Dashboard do Cliente
- Ver saldo disponível
- Histórico de cashback
- Histórico de resgates
- Total economizado

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `merchants` | Estabelecimentos/lojas |
| `employees` | Funcionários das lojas |
| `customers` | Clientes do programa |
| `transactions` | Transações de cashback |
| `redemptions` | Resgates de cashback |
| `marketing_spend` | Gastos com marketing |
| `integration_configs` | Configurações de integrações |
| `integration_sync_log` | Logs de sincronização |

### Campos Importantes

**Merchants (novos campos):**
- `cashback_percentage` - Percentual de cashback
- `custom_domain` - Domínio personalizado
- `signup_link_slug` - Slug para link de cadastro
- `gtm_id` - Google Tag Manager ID
- `meta_pixel_id` - Meta Pixel ID

**Transactions (correção):**
- `qr_scanned_at` - Data/hora que QR foi escaneado

**Customers:**
- `referred_by_merchant_id` - Merchant que referenciou

---

## 🔧 Arquivos SQL

### 1. `supabase-schema-completo.sql`
**O QUE FAZ:** Cria todas as tabelas do zero
**QUANDO USAR:** Primeira instalação ou reset completo
**IMPORTANTE:** Remove todos os dados existentes!

### 2. `supabase-migration-updates.sql`
**O QUE FAZ:** Adiciona novos campos às tabelas existentes
**QUANDO USAR:** Atualizar sistema existente
**ADICIONA:**
- Campos de domínio e marketing em merchants
- Campo referred_by_merchant_id em customers
- Funções e triggers para slugs

### 3. `supabase-fix-qr-field.sql`
**O QUE FAZ:** Adiciona campo qr_scanned_at
**QUANDO USAR:** Se QR code der erro ao escanear
**CORRIGE:** Erro "qr_scanned_at not found"

---

## 📊 Tracking e Analytics

### Google Tag Manager

**Eventos Rastreados:**
- `PageView` - Visualização de páginas
- `CustomerSignup` - Novo cadastro de cliente
- `CashbackGenerated` - QR code gerado
- `CashbackScanned` - QR code escaneado
- `Purchase` - Compra confirmada
- `RedemptionGenerated` - Resgate gerado
- `RedemptionCompleted` - Resgate confirmado

**Configurar:**
1. Vá em Configurações → Marketing
2. Cole seu GTM ID (ex: GTM-XXXXXXX)
3. Salve

### Meta Pixel (Facebook Ads)

**Conversões Rastreadas:**
- `ViewContent` - Visualização de conteúdo
- `AddToCart` - Adicionar ao carrinho (contexto)
- `InitiateCheckout` - Iniciar checkout
- `Purchase` - Compra confirmada
- `CompleteRegistration` - Cadastro completo

**Configurar:**
1. Vá em Configurações → Marketing
2. Cole seu Pixel ID (15 dígitos)
3. Salve

---

## 🔗 Integrações de Email Marketing

### Mailchimp

**Sincronização Automática:**
- ✅ Novo cadastro (signup)
- ✅ Nova compra (purchase)
- ✅ Resgate (redemption)

**Campos Sincronizados:**
- Nome (FNAME)
- Telefone (PHONE)
- Saldo de cashback (CASHBACK)
- Total gasto (TOTALSPENT)

**Configurar:**
1. Vá em Integrações → Mailchimp
2. Cole API Key
3. Digite Audience ID
4. Teste conexão
5. Ative sincronização

### RD Station

**Sincronização Automática:**
- ✅ Novo cadastro (signup)
- ✅ Nova compra (purchase)
- ✅ Resgate (redemption)

**Custom Fields:**
- `cf_saldo_cashback`
- `cf_total_gasto`
- `cf_total_cashback`

**Configurar:**
1. Vá em Integrações → RD Station
2. Cole Access Token
3. Teste conexão
4. Ative sincronização

---

## 🌐 Configurar Domínio Próprio

### Resumo Rápido

1. **No DNS do seu provedor:**
   ```
   Tipo: CNAME
   Nome: cashback
   Destino: 5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
   ```

2. **No sistema (após propagar):**
   - Configurações → Link de Cadastro
   - Campo "Domínio Personalizado": `cashback.seudominio.com.br`
   - Salvar

3. **Aguardar propagação:** 15 minutos a 2 horas

**📖 Guia completo:** Veja [GUIA-DOMINIO-PROPRIO.md](GUIA-DOMINIO-PROPRIO.md)

---

## ⚠️ Solução de Problemas

### Problema: Menu "Configurações" não aparece

**Solução:**
1. Execute `supabase-migration-updates.sql` no Supabase
2. Acesse: `/force-update` para limpar cache
3. Faça login novamente

**📖 Guia completo:** [VERIFICACAO-URGENTE.md](VERIFICACAO-URGENTE.md)

---

### Problema: Erro ao escanear QR code

**Erro:** "Could not find 'qr_scanned_at' column"

**Solução:**
1. Execute `supabase-fix-qr-field.sql` no Supabase
2. Gere novo QR code
3. Teste novamente

**📖 Guia completo:** [CORRECAO-QR-CODE.md](CORRECAO-QR-CODE.md)

---

### Problema: Não consigo salvar configurações

**Erro:** "Erro ao salvar configurações"

**Causas Comuns:**
- Sessão expirada
- Dados do merchant incompletos no localStorage

**Solução:**
1. Faça logout
2. Limpe cache (Ctrl+Shift+R)
3. Faça login novamente
4. Tente salvar

---

### Problema: Link de cadastro não funciona

**Causas:**
- SQL de atualização não foi executado
- Slug não foi gerado

**Solução:**
1. Execute `supabase-migration-updates.sql`
2. Verifique no Supabase:
   ```sql
   SELECT name, signup_link_slug FROM merchants;
   ```
3. Se slug estiver NULL, execute novamente a parte do script que atualiza merchants

---

## 📞 Stack Técnico

- **Frontend:** React 18 + Vite
- **Estilização:** TailwindCSS
- **Roteamento:** React Router v6
- **Estado:** Zustand
- **Backend:** Supabase (PostgreSQL)
- **QR Codes:** qrcode.react
- **Gráficos:** Recharts
- **Notificações:** react-hot-toast
- **Ícones:** lucide-react

---

## 🎓 Fluxos do Sistema

### Fluxo de Cadastro
```
Cliente acessa link → Preenche formulário → Salva no banco
→ Tracking (signup) → Sync com integrações → Dashboard do cliente
```

### Fluxo de Cashback
```
Merchant gera QR → Cliente escaneia → Confirma recebimento
→ Atualiza saldo → Tracking (purchase) → Sync com integrações
```

### Fluxo de Resgate
```
Cliente solicita → Merchant gera QR resgate → Cliente escaneia
→ Confirma resgate → Deduz do saldo → Tracking (redemption)
```

---

## 🔐 Segurança

### Row Level Security (RLS)
- ✅ Policies configuradas no Supabase
- ✅ Merchants só veem seus dados
- ✅ Clientes só veem seus dados

### Autenticação
- ⚠️ Atualmente em modo desenvolvimento
- ⚠️ Qualquer senha aceita para admin@cashback.com
- 🔜 Implementar bcrypt para produção

---

## 📈 Próximos Passos (Produção)

### Segurança
- [ ] Implementar hash de senhas (bcrypt)
- [ ] Autenticação real com Supabase Auth
- [ ] Rate limiting
- [ ] Validação de inputs no backend

### Funcionalidades
- [ ] Notificações por email/SMS
- [ ] Push notifications
- [ ] Programa de pontos além de cashback
- [ ] Níveis VIP de clientes
- [ ] Cupons de desconto

### Performance
- [ ] CDN para assets
- [ ] Caching de queries
- [ ] Otimização de imagens
- [ ] Service Workers

---

## 📄 Licença

Este é um projeto privado para uso comercial.

---

## 🆘 Suporte

Para dúvidas ou problemas:

1. **Leia os guias:** Todos os problemas comuns têm solução documentada
2. **Verifique o console:** F12 → Console para ver erros
3. **Teste em aba anônima:** Elimina problemas de cache
4. **SQL verificações:** Execute queries de diagnóstico

---

## 🎉 Sistema Completo e Funcional!

✅ Cashback configurável  
✅ QR Codes funcionais  
✅ Link de cadastro compartilhável  
✅ Domínio próprio  
✅ Tracking (GTM + Meta Pixel)  
✅ Integrações (Mailchimp + RD Station)  
✅ Relatórios e dashboards  
✅ CAC/LTV calculator  

**Tudo pronto para usar! 🚀**
