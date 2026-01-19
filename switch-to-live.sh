#!/bin/bash

# Script para atualizar para LIVE MODE
# Execute este script com suas chaves de LIVE

echo "🔴 ATUALIZANDO PARA LIVE MODE"
echo "================================"
echo ""

# Solicitar chaves
read -p "Cole sua Publishable Key (pk_live_...): " PK_LIVE
read -p "Cole sua Secret Key (sk_live_...): " SK_LIVE

# Validar formato
if [[ ! $PK_LIVE =~ ^pk_live_ ]]; then
    echo "❌ Erro: Publishable key deve começar com pk_live_"
    exit 1
fi

if [[ ! $SK_LIVE =~ ^sk_live_ ]]; then
    echo "❌ Erro: Secret key deve começar com sk_live_"
    exit 1
fi

echo ""
echo "✅ Chaves validadas!"
echo ""

# Atualizar .env do frontend
echo "📝 Atualizando .env do frontend..."
cd /home/root/webapp/cashback-system

# Fazer backup
cp .env .env.backup.before_live_$(date +%Y%m%d_%H%M%S)

# Atualizar chaves
sed -i "s|VITE_STRIPE_PUBLISHABLE_KEY=.*|VITE_STRIPE_PUBLISHABLE_KEY=$PK_LIVE|g" .env
sed -i "s|VITE_STRIPE_SECRET_KEY=.*|VITE_STRIPE_SECRET_KEY=$SK_LIVE|g" .env

echo "✅ Frontend .env atualizado"

# Atualizar .env do backend
echo "📝 Atualizando .env do backend..."
cd /home/root/webapp

# Fazer backup
cp .env .env.backup.before_live_$(date +%Y%m%d_%H%M%S)

# Atualizar chaves
sed -i "s|VITE_STRIPE_PUBLISHABLE_KEY=.*|VITE_STRIPE_PUBLISHABLE_KEY=$PK_LIVE|g" .env
sed -i "s|VITE_STRIPE_SECRET_KEY=.*|VITE_STRIPE_SECRET_KEY=$SK_LIVE|g" .env

echo "✅ Backend .env atualizado"
echo ""

# Rebuild
echo "🔨 Rebuilding frontend..."
cd /home/root/webapp/cashback-system
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

echo "✅ Build concluído"
echo ""

# Deploy
echo "📦 Deploying para produção..."
cd /home/root/webapp
rsync -av --delete cashback-system/dist/ /var/www/cashback/cashback-system/

echo "✅ Deploy concluído"
echo ""

# Restart servidor
echo "🔄 Reiniciando servidor..."
pm2 restart stripe-api

echo "✅ Servidor reiniciado"
echo ""

echo "🎉 ================================"
echo "🎉 LIVE MODE ATIVADO COM SUCESSO!"
echo "🎉 ================================"
echo ""
echo "⚠️  ATENÇÃO: Sistema agora cobra DINHEIRO REAL!"
echo ""
echo "🧪 Para testar:"
echo "   1. Acesse: https://cashback.raulricco.com.br"
echo "   2. Limpe cache: Ctrl+Shift+R"
echo "   3. Use cartão REAL (não 4242...)"
echo "   4. Valor: R$ 97,00/mês"
echo ""
echo "📊 Monitorar:"
echo "   - Stripe: https://dashboard.stripe.com/payments"
echo "   - Logs: pm2 logs stripe-api"
echo ""
