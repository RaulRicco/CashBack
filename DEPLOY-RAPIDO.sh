#!/bin/bash
# Script de Deploy Rápido para o Servidor VPS

echo "================================================"
echo "🚀 DEPLOY RÁPIDO - LocalCashback"
echo "================================================"
echo ""
echo "Execute estes comandos no servidor VPS (SSH):"
echo ""
echo "ssh root@31.97.167.88"
echo ""
echo "# Comandos de deploy (copie e cole tudo):"
cat << 'COMMANDS'
cd /var/www/cashback/cashback-system && \
git pull origin main && \
npm install && \
npm run build && \
systemctl reload nginx && \
echo "" && \
echo "✅ DEPLOY COMPLETO!" && \
echo "Teste agora: https://localcashback.com.br/signup"
COMMANDS
