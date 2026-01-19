#!/bin/bash

#######################################################
# Deploy Stripe Integration para Produção
# Local CashBack - Sistema de Assinaturas
#######################################################

set -e

echo "🚀 ============================================"
echo "🚀 DEPLOY STRIPE INTEGRATION - PRODUÇÃO"
echo "🚀 ============================================"
echo ""

# Variáveis
DEV_DIR="/home/root/webapp/cashback-system"
PROD_DIR="/home/root/webapp"
SERVER_FILE="server.js"
ECOSYSTEM_FILE="ecosystem.config.cjs"
ENV_FILE=".env"

echo "📂 Diretórios:"
echo "   DEV:  $DEV_DIR"
echo "   PROD: $PROD_DIR"
echo ""

# 1. Build da aplicação
echo "📦 Step 1: Building aplicação..."
cd "$DEV_DIR"
npm run build
echo "✅ Build concluído"
echo ""

# 2. Sync do build para produção (mantém arquivos existentes)
echo "📤 Step 2: Sincronizando dist/ para produção..."
rsync -av --delete "$DEV_DIR/dist/" "$PROD_DIR/dist/"
echo "✅ Dist sincronizado"
echo ""

# 3. Copiar server.js e ecosystem.config.cjs
echo "📄 Step 3: Copiando arquivos do servidor..."
cp "$DEV_DIR/$SERVER_FILE" "$PROD_DIR/"
cp "$DEV_DIR/$ECOSYSTEM_FILE" "$PROD_DIR/"
echo "✅ Arquivos do servidor copiados"
echo ""

# 4. Copiar .env se não existir em produção
if [ ! -f "$PROD_DIR/$ENV_FILE" ]; then
  echo "📄 Step 4: Copiando .env para produção..."
  cp "$DEV_DIR/$ENV_FILE" "$PROD_DIR/"
  echo "✅ .env copiado"
else
  echo "⚠️  Step 4: .env já existe em produção (não sobrescrito)"
fi
echo ""

# 5. Instalar dependências do servidor (se necessário)
echo "📦 Step 5: Instalando dependências do servidor..."
cd "$PROD_DIR"

if [ ! -d "node_modules" ]; then
  echo "   Instalando todas as dependências..."
  npm install express stripe cors dotenv @supabase/supabase-js
else
  echo "   Verificando e atualizando dependências..."
  npm install express stripe cors dotenv @supabase/supabase-js --no-save
fi
echo "✅ Dependências instaladas"
echo ""

# 6. Criar diretório de logs
echo "📁 Step 6: Criando diretório de logs..."
mkdir -p "$PROD_DIR/logs"
echo "✅ Diretório de logs criado"
echo ""

# 7. Parar servidor anterior se estiver rodando
echo "🔄 Step 7: Gerenciando processo PM2..."
if pm2 list | grep -q "stripe-api"; then
  echo "   Parando servidor anterior..."
  pm2 stop stripe-api
  pm2 delete stripe-api
fi
echo "✅ Processo anterior limpo"
echo ""

# 8. Iniciar servidor com PM2
echo "🚀 Step 8: Iniciando servidor Stripe API..."
cd "$PROD_DIR"
pm2 start ecosystem.config.cjs
pm2 save
echo "✅ Servidor iniciado com PM2"
echo ""

# 9. Verificar status
echo "📊 Step 9: Status do servidor..."
pm2 status stripe-api
echo ""

# 10. Testar health endpoint
echo "🧪 Step 10: Testando health endpoint..."
sleep 3
if curl -sf http://localhost:3001/api/health > /dev/null; then
  echo "✅ Servidor respondendo corretamente!"
  curl http://localhost:3001/api/health | jq .
else
  echo "⚠️  Servidor pode estar iniciando... Verifique os logs:"
  echo "   pm2 logs stripe-api"
fi
echo ""

echo "🚀 ============================================"
echo "🚀 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "🚀 ============================================"
echo ""
echo "📋 Próximos Passos:"
echo ""
echo "1. ✅ Verificar logs do servidor:"
echo "   pm2 logs stripe-api"
echo ""
echo "2. ✅ Testar endpoints:"
echo "   curl http://localhost:3001/api/health"
echo ""
echo "3. ⚠️  CONFIGURAR WEBHOOK DO STRIPE:"
echo "   - Acesse: https://dashboard.stripe.com/test/webhooks"
echo "   - Clique em '+ Add endpoint'"
echo "   - URL: https://localcashback.com.br/api/stripe/webhook"
echo "   - Eventos: checkout.session.completed, customer.subscription.*"
echo "   - Copie o 'Signing secret' (whsec_...)"
echo "   - Adicione no .env: STRIPE_WEBHOOK_SECRET=whsec_..."
echo "   - Reinicie o servidor: pm2 restart stripe-api"
echo ""
echo "4. ✅ Testar fluxo completo:"
echo "   - Acesse: https://localcashback.com.br/dashboard/planos"
echo "   - Escolha um plano"
echo "   - Use cartão teste: 4242 4242 4242 4242"
echo "   - Verifique assinatura ativa"
echo ""
echo "5. ✅ Configurar NGINX reverse proxy (se necessário):"
echo "   - Adicionar proxy_pass para /api/stripe/*"
echo "   - Apontar para http://localhost:3001"
echo ""
echo "📞 Suporte:"
echo "   - Logs: pm2 logs stripe-api"
echo "   - Status: pm2 status"
echo "   - Restart: pm2 restart stripe-api"
echo "   - Stop: pm2 stop stripe-api"
echo ""
