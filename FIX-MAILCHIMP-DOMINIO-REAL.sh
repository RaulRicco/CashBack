#!/bin/bash
set -e

echo "🔥 CORREÇÃO MAILCHIMP - DOMÍNIO REAL (localcashback.com.br)"
echo "============================================================="

DOMAIN="localcashback.com.br"
PROJECT_DIR="/var/www/cashback/cashback-system"

cd $PROJECT_DIR

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  VERIFICANDO/CORRIGINDO NGINX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! grep -q "location /api/" /etc/nginx/sites-enabled/*; then
    echo "❌ Nginx NÃO tem location /api/ - ADICIONANDO AGORA..."
    
    SITE=$(ls /etc/nginx/sites-enabled/ | head -1)
    echo "📝 Arquivo: /etc/nginx/sites-enabled/$SITE"
    
    # Backup
    cp /etc/nginx/sites-enabled/$SITE /etc/nginx/sites-enabled/$SITE.backup-$(date +%s)
    
    # Adicionar location /api/ ANTES do último }
    sed -i '/^}$/i \
    # Proxy para Integration Server (Mailchimp/RD Station)\
    location /api/ {\
        proxy_pass http://localhost:3001/api/;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection "upgrade";\
        proxy_set_header Host $host;\
        proxy_cache_bypass $http_upgrade;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_read_timeout 60s;\
        proxy_connect_timeout 60s;\
        proxy_send_timeout 60s;\
    }\
' /etc/nginx/sites-enabled/$SITE
    
    echo "🧪 Testando configuração..."
    if nginx -t; then
        echo "✅ Config válida! Recarregando nginx..."
        systemctl reload nginx
        echo "✅ Nginx recarregado!"
    else
        echo "❌ ERRO na config! Restaurando backup..."
        mv /etc/nginx/sites-enabled/$SITE.backup-* /etc/nginx/sites-enabled/$SITE
        exit 1
    fi
else
    echo "✅ Nginx JÁ tem location /api/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  VERIFICANDO INTEGRATION PROXY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if pm2 list | grep -q "integration-proxy.*online"; then
    echo "✅ Proxy está ONLINE"
else
    echo "❌ Proxy OFFLINE - Iniciando..."
    if pm2 list | grep -q "integration-proxy"; then
        pm2 restart integration-proxy
    else
        pm2 start integration-proxy.js --name "integration-proxy"
        pm2 save
    fi
    sleep 2
    echo "✅ Proxy iniciado!"
fi

echo ""
echo "🧪 Testando proxy localmente..."
HEALTH=$(curl -s http://localhost:3001/health)
if [ -n "$HEALTH" ]; then
    echo "✅ Proxy local OK: $HEALTH"
else
    echo "❌ Proxy local NÃO responde!"
    echo "📋 Logs:"
    pm2 logs integration-proxy --lines 10 --nostream
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  ATUALIZANDO CÓDIGO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "📥 Git fetch..."
git fetch origin genspark_ai_developer

echo "🔄 Git pull..."
git pull origin genspark_ai_developer

echo "🏗️  Build do frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído!"
else
    echo "❌ Erro no build!"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  REINICIANDO SERVIÇOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 restart integration-proxy
systemctl reload nginx
sleep 2

echo "✅ Serviços reiniciados!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  TESTANDO NO DOMÍNIO REAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🌐 Testando: https://$DOMAIN/api/mailchimp/test"
echo ""

RESPONSE=$(curl -s -X POST https://$DOMAIN/api/mailchimp/test \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"teste123","audienceId":"teste123","serverPrefix":"us1"}' \
    --max-time 10 \
    --insecure \
    -w "\nHTTP_CODE: %{http_code}\n")

echo "📊 RESPOSTA:"
echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "HTTP_CODE: 200"; then
    echo "✅✅✅ ENDPOINT FUNCIONANDO!"
elif echo "$RESPONSE" | grep -q "HTTP_CODE: 404"; then
    echo "❌ ERRO 404 - Nginx NÃO está redirecionando /api/"
    echo "📋 Config atual do nginx:"
    grep -A 5 "location /api/" /etc/nginx/sites-enabled/* || echo "NÃO ENCONTRADO!"
elif echo "$RESPONSE" | grep -q "HTTP_CODE: 502"; then
    echo "❌ ERRO 502 - Nginx não consegue conectar ao proxy na porta 3001"
    echo "📋 Status do proxy:"
    pm2 list | grep integration
elif echo "$RESPONSE" | grep -q "HTTP_CODE: 504"; then
    echo "❌ ERRO 504 - Timeout no proxy"
else
    echo "⚠️  Resposta inesperada"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  TESTE ADICIONAL - HEALTH CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🌐 Testando: https://$DOMAIN/api/health"
echo ""

HEALTH_RESPONSE=$(curl -s https://$DOMAIN/api/health -w "\nHTTP_CODE: %{http_code}\n" --max-time 5 --insecure)

echo "📊 RESPOSTA:"
echo "$HEALTH_RESPONSE"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SCRIPT CONCLUÍDO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo ""
echo "1. Se viu ✅✅✅ acima, TESTE NO NAVEGADOR:"
echo "   - Acesse: https://$DOMAIN"
echo "   - Vá em: Admin > Integrações > Mailchimp"
echo "   - Cole suas credenciais"
echo "   - Clique em 'Testar Conexão'"
echo ""
echo "2. Se viu ❌ acima:"
echo "   - Copie TODA a saída deste script"
echo "   - Me envie para análise"
echo ""
echo "3. Para ver logs em tempo real:"
echo "   pm2 logs integration-proxy"
echo ""
