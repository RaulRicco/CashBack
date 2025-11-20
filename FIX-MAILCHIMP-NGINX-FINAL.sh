#!/bin/bash
set -e

echo "🔥 FIX MAILCHIMP - CONFIGURAÇÃO NGINX REVERSE PROXY"
echo "===================================================="
echo ""
echo "📋 PROBLEMA: Network Error ao tentar acessar :3001"
echo "✅ SOLUÇÃO: Usar nginx como reverse proxy para /api/"
echo ""

PROJECT_DIR="/var/www/cashback/cashback-system"
cd $PROJECT_DIR

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  ATUALIZANDO CÓDIGO (usar nginx reverse proxy)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

git fetch origin genspark_ai_developer
git pull origin genspark_ai_developer

# Verificar se código usa URL vazia (proxy via nginx)
if grep -q "proxyUrl = '';" src/lib/integrations/mailchimp.js; then
    echo "✅ Código configurado para usar nginx reverse proxy"
else
    echo "❌ Código NÃO está correto!"
    echo "Verificando..."
    grep -A 2 "const proxyUrl" src/lib/integrations/mailchimp.js
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  CONFIGURANDO NGINX REVERSE PROXY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Encontrar arquivo de configuração do site
NGINX_SITE=$(ls /etc/nginx/sites-enabled/ | head -1)

if [ -z "$NGINX_SITE" ]; then
    echo "❌ Nenhum site habilitado no nginx!"
    exit 1
fi

NGINX_FILE="/etc/nginx/sites-enabled/$NGINX_SITE"
echo "📝 Arquivo nginx: $NGINX_FILE"

# Verificar se já tem location /api/
if grep -q "location /api/" "$NGINX_FILE"; then
    echo "✅ Nginx JÁ tem location /api/ configurado"
    echo ""
    echo "📋 Configuração atual:"
    grep -A 10 "location /api/" "$NGINX_FILE" | head -15
else
    echo "❌ Nginx NÃO tem location /api/"
    echo "⚠️  ADICIONANDO AGORA..."
    echo ""
    
    # Backup
    cp "$NGINX_FILE" "${NGINX_FILE}.backup-$(date +%s)"
    
    # Encontrar onde adicionar (antes do último })
    # Adicionar location /api/ dentro do bloco server
    
    # Criar bloco de configuração
    CONFIG_BLOCK='
    # Integration Proxy (Mailchimp/RD Station)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
'
    
    # Adicionar antes do último }
    # Usar perl para inserir antes do último }
    perl -i -pe 'BEGIN{undef $/;} s/(.*)\}(\s*)$/$1'"$CONFIG_BLOCK"'\n}$2/smg' "$NGINX_FILE"
    
    echo "✅ Configuração adicionada!"
fi

# Testar configuração nginx
echo ""
echo "🧪 Testando configuração do nginx..."
if nginx -t; then
    echo "✅ Configuração válida!"
    echo ""
    echo "🔄 Recarregando nginx..."
    systemctl reload nginx
    echo "✅ Nginx recarregado!"
else
    echo "❌ ERRO na configuração do nginx!"
    echo "🔙 Restaurando backup..."
    if [ -f "${NGINX_FILE}.backup-"* ]; then
        mv ${NGINX_FILE}.backup-* "$NGINX_FILE"
    fi
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  VERIFICANDO INTEGRATION PROXY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if pm2 list | grep -q "integration-proxy.*online"; then
    echo "✅ Integration proxy está ONLINE"
else
    echo "⚠️  Iniciando integration proxy..."
    if pm2 list | grep -q "integration-proxy"; then
        pm2 restart integration-proxy
    else
        pm2 start integration-proxy.js --name integration-proxy
        pm2 save
    fi
    sleep 2
    echo "✅ Proxy iniciado!"
fi

# Testar proxy local
echo ""
echo "🧪 Testando proxy localmente..."
HEALTH=$(curl -s http://localhost:3001/health)
if [ -n "$HEALTH" ]; then
    echo "✅ Proxy local OK: $HEALTH"
else
    echo "❌ Proxy local NÃO responde!"
    pm2 logs integration-proxy --lines 10 --nostream
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  BUILD DO FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf dist/
rm -rf node_modules/.vite
echo "✅ Cache limpo"

npm run build
echo "✅ Build concluído!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  VERIFICANDO BUNDLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BUNDLE=$(ls -t dist/assets/index-*.js | head -1)
echo "📦 Bundle: $BUNDLE"

# Verificar se usa URL vazia (proxy via nginx)
if grep -q 'proxyUrl=""' "$BUNDLE"; then
    echo "✅✅✅ Bundle configurado para usar nginx reverse proxy!"
else
    echo "⚠️  Verificando configuração no bundle..."
    grep -o 'proxyUrl="[^"]*"' "$BUNDLE" | head -3
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  REINICIANDO SERVIÇOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 restart integration-proxy
systemctl reload nginx
sleep 2
echo "✅ Serviços reiniciados!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  TESTANDO ENDPOINT ATRAVÉS DO NGINX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🌐 URL: https://localcashback.com.br/api/mailchimp/test"
echo ""

RESPONSE=$(curl -s -X POST https://localcashback.com.br/api/mailchimp/test \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"teste123","audienceId":"teste123","serverPrefix":"us1"}' \
    -w "\nHTTP_CODE: %{http_code}\n" \
    --max-time 20)

echo "📊 RESPOSTA:"
echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "HTTP_CODE: 200"; then
    echo "✅✅✅ FUNCIONANDO! Endpoint acessível através do nginx!"
elif echo "$RESPONSE" | grep -q "HTTP_CODE: 404"; then
    echo "❌ ERRO 404 - Nginx não está redirecionando /api/"
    echo ""
    echo "📋 Verificando configuração atual:"
    grep -A 5 "location /api/" /etc/nginx/sites-enabled/*
elif echo "$RESPONSE" | grep -q "HTTP_CODE: 502"; then
    echo "❌ ERRO 502 - Nginx não consegue conectar ao proxy"
    echo "📋 Status do proxy:"
    pm2 list | grep integration
elif echo "$RESPONSE" | grep -q "HTTP_CODE: 504"; then
    echo "❌ ERRO 504 - Timeout"
else
    echo "⚠️  Status inesperado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SCRIPT CONCLUÍDO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 COMO FUNCIONA AGORA:"
echo ""
echo "Frontend → https://localcashback.com.br/api/mailchimp/test"
echo "         ↓"
echo "Nginx    → http://localhost:3001/api/mailchimp/test"
echo "         ↓"
echo "Proxy    → https://us1.api.mailchimp.com/..."
echo ""
echo "🔴 PRÓXIMOS PASSOS OBRIGATÓRIOS:"
echo ""
echo "1. Limpar cache do navegador:"
echo "   Ctrl+Shift+Delete → Todo o período → Limpar"
echo ""
echo "2. Fechar e reabrir navegador completamente"
echo ""
echo "3. Testar em ABA ANÔNIMA (recomendado):"
echo "   Ctrl+Shift+N (Chrome) ou Ctrl+Shift+P (Firefox)"
echo ""
echo "4. Acessar: https://localcashback.com.br"
echo "   Admin → Integrações → Mailchimp"
echo "   Colar credenciais reais"
echo "   Clicar 'Testar Conexão'"
echo ""
echo "⚠️  Se não limpar cache, vai continuar tentando :3001!"
echo ""
