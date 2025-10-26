# 🎁 Sistema de Cashback para Pequenos Comércios

Sistema completo de cashback moderno e integrado com ferramentas de marketing (Google Tag Manager e Meta Pixel).

## 🚀 Funcionalidades

### ✅ Para Estabelecimentos
- **Dashboard Completo** com métricas em tempo real
- **Geração de Cashback** via QR Code
- **Resgate de Cashback** com validação de saldo
- **Gestão de Funcionários** (múltiplos usuários por estabelecimento)
- **Relatórios e Analytics** com gráficos interativos
- **Calculadora de CAC e LTV** com filtros de data
- **Gestão de Clientes** com histórico completo

### 💰 Fluxo de Cashback
1. **Estabelecimento** insere telefone do cliente e valor da compra
2. **Sistema** gera QR Code único
3. **Cliente** escaneia o QR Code com seu celular
4. **Sistema** redireciona para página "Obrigado" com tracking (Meta Pixel)
5. **Cliente** pode acessar seu painel e ver saldo

### 🔄 Fluxo de Resgate
1. **Estabelecimento** busca cliente por telefone
2. **Sistema** valida saldo disponível
3. **Estabelecimento** gera QR Code de resgate
4. **Cliente** escaneia QR Code
5. **Sistema** confirma resgate e atualiza saldo

### 📊 Marketing & Tracking
- **Google Tag Manager** integrado
- **Meta Pixel (Facebook Ads)** integrado
- Eventos customizados para cada ação:
  - `CashbackGenerated`
  - `CashbackScanned`
  - `Purchase` (conversão)
  - `RedemptionGenerated`
  - `RedemptionCompleted`

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **QR Codes**: qrcode.react
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Date Utils**: date-fns

## 📦 Instalação

### 1. Instalar dependências
```bash
cd cashback-system
npm install
```

### 2. Configurar Variáveis de Ambiente
Edite o arquivo `.env` e adicione seus IDs de tracking:

```env
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Tag Manager ID
VITE_GTM_ID=GTM-XXXXXXX

# Meta Pixel ID
VITE_META_PIXEL_ID=123456789012345
```

### 3. Criar Tabelas no Supabase

Acesse o **SQL Editor** no Supabase e execute o arquivo:
```
supabase-schema.sql
```

Este script criará todas as tabelas necessárias:
- `merchants` (estabelecimentos)
- `employees` (funcionários)
- `customers` (clientes)
- `transactions` (transações)
- `redemptions` (resgates)
- `marketing_spend` (gastos com marketing)

### 4. Inserir Dados Iniciais

No SQL Editor do Supabase, execute:

```sql
-- Inserir um estabelecimento de teste
INSERT INTO merchants (name, email, phone, cashback_percentage)
VALUES ('Minha Loja', 'contato@minhaloja.com', '11999999999', 5.00);

-- Inserir um funcionário de teste
INSERT INTO employees (merchant_id, name, email, role, password_hash, is_active)
SELECT 
  id,
  'Admin',
  'admin@minhaloja.com',
  'admin',
  'temp_hash',
  true
FROM merchants
WHERE email = 'contato@minhaloja.com';
```

### 5. Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:5173

## 🔐 Login

**Modo Desenvolvimento**: Use qualquer email cadastrado na tabela `employees` com qualquer senha.

Exemplo:
- Email: `admin@minhaloja.com`
- Senha: `qualquer_coisa`

## 📱 Estrutura de Páginas

### Dashboard do Estabelecimento (Protegido)
- `/login` - Tela de login
- `/dashboard` - Dashboard principal
- `/cashback` - Gerar cashback
- `/redemption` - Processar resgate
- `/customers` - Lista de clientes
- `/employees` - Gestão de funcionários
- `/reports` - Relatórios e analytics

### Páginas Públicas do Cliente
- `/customer/cashback/:token` - Página "Obrigado" após escanear QR de cashback
- `/customer/redemption/:token` - Confirmação de resgate
- `/customer/dashboard/:phone` - Painel do cliente com saldo

## 🎯 Como Usar

### Para Adicionar Cashback:
1. Acesse `/cashback`
2. Digite o telefone do cliente (apenas números)
3. Digite o valor da compra
4. Clique em "Gerar QR Code"
5. Cliente escaneia o QR Code
6. Cliente é redirecionado para página "Obrigado" ✅

### Para Resgatar Cashback:
1. Acesse `/redemption`
2. Busque o cliente por telefone
3. Sistema mostra saldo disponível
4. Digite o valor do resgate
5. Gere o QR Code
6. Cliente escaneia para confirmar ✅

### Para Calcular CAC/LTV:
1. Acesse `/dashboard`
2. Adicione seus gastos com tráfego pago
3. Sistema calcula automaticamente:
   - CAC (Custo de Aquisição de Cliente)
   - LTV (Lifetime Value)
   - ROI (Retorno sobre Investimento)
   - Ratio LTV/CAC

## 📊 Tracking e Analytics

### Google Tag Manager
O sistema envia eventos automáticos para o GTM:
- `CashbackGenerated` - Quando QR é gerado
- `CashbackScanned` - Quando cliente escaneia
- `Purchase` - Conversão confirmada
- `RedemptionGenerated` - Resgate iniciado
- `RedemptionCompleted` - Resgate confirmado

### Meta Pixel
Eventos equivalentes são enviados para o Meta Pixel, permitindo:
- Criar audiências personalizadas
- Otimizar campanhas
- Rastrear conversões
- Calcular ROAS

## 🔧 Personalização

### Alterar Percentual de Cashback
No SQL Editor do Supabase:
```sql
UPDATE merchants 
SET cashback_percentage = 10.0 
WHERE id = 'seu-merchant-id';
```

### Adicionar Funcionário
Via interface em `/employees` ou SQL:
```sql
INSERT INTO employees (merchant_id, name, email, role, password_hash, is_active)
VALUES ('merchant-id', 'Nome', 'email@empresa.com', 'operator', 'hash', true);
```

## 🚀 Deploy

### Vercel / Netlify
```bash
npm run build
```

Configure as variáveis de ambiente no painel do serviço.

### Variáveis Obrigatórias
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Variáveis Opcionais
- `VITE_GTM_ID`
- `VITE_META_PIXEL_ID`

## 📝 TODO / Melhorias Futuras

- [ ] Implementar autenticação real com bcrypt
- [ ] Adicionar upload de logo do estabelecimento
- [ ] Sistema de notificações (email/SMS)
- [ ] App mobile nativo
- [ ] Sistema de cupons e promoções
- [ ] Integração com WhatsApp Business
- [ ] Gamificação (níveis, badges)
- [ ] Programa de indicação
- [ ] API pública para integrações

## 🐛 Troubleshooting

### Erro ao conectar com Supabase
- Verifique se as credenciais no `.env` estão corretas
- Confirme que as tabelas foram criadas
- Verifique as políticas de RLS no Supabase

### QR Code não funciona
- Confirme que o token está sendo gerado corretamente
- Verifique se a URL do QR Code está acessível
- Teste a rota diretamente no navegador

### Tracking não está funcionando
- Verifique se os IDs do GTM e Meta Pixel estão corretos
- Abra o console do navegador para ver erros
- Use as ferramentas de debug (GTM Preview, Meta Pixel Helper)

## 📄 Licença

MIT License - Sinta-se livre para usar e modificar!

## 🤝 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para pequenos comércios locais**
