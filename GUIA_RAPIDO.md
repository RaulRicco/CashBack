# 🚀 Guia Rápido - Sistema de Cashback

## ✅ O que foi criado?

Um sistema COMPLETO de cashback com:

### 🎯 Funcionalidades Principais
- ✅ Multi-estabelecimentos
- ✅ Cashback via QR Code (cliente escaneia)
- ✅ Resgate via QR Code
- ✅ Dashboard com métricas
- ✅ Calculadora de CAC e LTV
- ✅ Gestão de funcionários
- ✅ Relatórios com gráficos
- ✅ Painel do cliente
- ✅ Google Tag Manager integrado
- ✅ Meta Pixel integrado

## 🌐 Sistema está RODANDO!

**URL Pública:** https://5173-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai

Você pode acessar agora mesmo! 🎉

## 📋 Próximos Passos para Usar

### 1️⃣ Configurar o Banco de Dados

Acesse o Supabase e execute o SQL:
1. Abra: https://supabase.com/dashboard
2. Entre no seu projeto
3. Vá em **SQL Editor** → **New Query**
4. Cole o conteúdo do arquivo `supabase-schema.sql`
5. Execute!

### 2️⃣ Criar Dados de Teste

No mesmo SQL Editor, execute:

```sql
-- Criar estabelecimento
INSERT INTO merchants (name, email, phone, cashback_percentage)
VALUES ('Minha Loja Teste', 'teste@loja.com', '11999999999', 5.00);

-- Criar funcionário
INSERT INTO employees (merchant_id, name, email, role, password_hash, is_active)
SELECT 
  id, 
  'Admin Teste', 
  'admin@teste.com', 
  'admin', 
  'temp', 
  true
FROM merchants 
WHERE email = 'teste@loja.com';
```

### 3️⃣ Fazer Login

Acesse a URL pública e faça login com:
- **Email:** admin@teste.com
- **Senha:** qualquer coisa (modo dev)

### 4️⃣ Testar o Fluxo de Cashback

1. Acesse **Cashback** no menu
2. Insira um telefone (ex: 11987654321)
3. Insira um valor (ex: 100.00)
4. Clique em "Gerar QR Code"
5. **Abra o QR Code no celular** ou clique na URL manualmente
6. Você verá a página "Obrigado" com o cashback! 🎉

### 5️⃣ Testar o Resgate

1. Acesse **Resgate** no menu
2. Busque o mesmo telefone usado antes
3. Sistema mostrará o saldo disponível
4. Insira valor para resgatar
5. Gere o QR Code
6. Cliente escaneia e confirma!

### 6️⃣ Configurar Tracking (Opcional)

No arquivo `.env`, adicione seus IDs:

```env
VITE_GTM_ID=GTM-XXXXXXX
VITE_META_PIXEL_ID=123456789
```

Depois reinicie o servidor.

## 📊 Funcionalidades Disponíveis

### Dashboard (`/dashboard`)
- Visão geral de métricas
- Total de clientes
- Transações
- Cashback distribuído
- Ticket médio
- Calculadora de CAC e LTV

### Cashback (`/cashback`)
- Gerar QR Code para cliente
- Cliente escaneia e ganha cashback
- Página "Obrigado" com tracking

### Resgate (`/redemption`)
- Validar saldo do cliente
- Gerar QR Code de resgate
- Cliente confirma resgate

### Clientes (`/customers`)
- Lista de todos os clientes
- Histórico de compras
- Saldo disponível

### Funcionários (`/employees`)
- Adicionar funcionários
- Gerenciar acessos
- Ativar/desativar

### Relatórios (`/reports`)
- Gráficos de receita
- Gráficos de transações
- Insights do período
- Filtros por data

## 🎨 Capturas de Tela

O sistema possui uma interface moderna com:
- Design responsivo (mobile-first)
- Cores vibrantes
- Animações suaves
- UX intuitiva

## 📱 URLs Importantes

### Para Estabelecimento (Dashboard)
- Login: `/login`
- Dashboard: `/dashboard`
- Gerar Cashback: `/cashback`
- Processar Resgate: `/redemption`

### Para Cliente (Público)
- Receber Cashback: `/customer/cashback/:token` (via QR Code)
- Confirmar Resgate: `/customer/redemption/:token` (via QR Code)
- Ver Saldo: `/customer/dashboard/:phone`

## 🔧 Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🎯 Eventos de Tracking

O sistema rastreia automaticamente:

### Google Tag Manager
- `CashbackGenerated` - QR Code criado
- `CashbackScanned` - Cliente escaneou QR
- `Purchase` - Conversão confirmada
- `RedemptionGenerated` - Resgate iniciado
- `RedemptionCompleted` - Resgate confirmado

### Meta Pixel
Os mesmos eventos acima são enviados para o Meta Pixel, permitindo:
- Criar públicos personalizados
- Otimizar campanhas
- Rastrear conversões
- Calcular ROAS

## 🚀 Deploy em Produção

### Vercel (Recomendado)
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Instalar CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## 📝 Variáveis de Ambiente para Deploy

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
VITE_GTM_ID=GTM-XXXXXXX (opcional)
VITE_META_PIXEL_ID=123456789 (opcional)
```

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**Erro ao conectar com Supabase:**
- Verifique se executou o schema SQL
- Confirme as credenciais no `.env`

**QR Code não funciona:**
- Certifique-se que a URL está acessível
- Teste a URL diretamente no navegador

**Tracking não aparece:**
- Verifique se adicionou os IDs no `.env`
- Use o console do navegador para ver erros
- Instale extensões: GTM Preview e Meta Pixel Helper

## 🎉 Pronto!

Seu sistema de cashback está funcionando!

Acesse agora: **https://5173-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai**

### Próximos Passos Sugeridos:
1. ✅ Configure o banco de dados (5 minutos)
2. ✅ Teste o fluxo completo (10 minutos)
3. 🔄 Adicione seus IDs de tracking
4. 🚀 Deploy em produção
5. 📈 Configure suas campanhas de marketing

---

**Desenvolvido com ❤️ para pequenos comércios**

Boa sorte com seu sistema de cashback! 🎁
