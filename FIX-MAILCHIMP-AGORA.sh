#!/bin/bash

echo "🔥 SCRIPT DE CORREÇÃO MAILCHIMP - EXECUÇÃO IMEDIATA"
echo "=================================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/var/www/cashback/cashback-system"

echo "📂 Navegando para o diretório do projeto..."
cd $PROJECT_DIR || { echo "❌ Erro: Diretório não encontrado!"; exit 1; }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  VERIFICANDO CONFIGURAÇÃO DO NGINX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NGINX_CONFIG=$(grep -r "location /api/" /etc/nginx/sites-enabled/ 2>/dev/null)

if [ -z "$NGINX_CONFIG" ]; then
    echo -e "${RED}❌ PROBLEMA ENCONTRADO: Nginx NÃO tem configuração /api/!${NC}"
    echo ""
    echo "🔧 Vou adicionar agora..."
    
    SITE_CONFIG=$(ls /etc/nginx/sites-enabled/ | head -1)
    
    if [ -z "$SITE_CONFIG" ]; then
        echo -e "${RED}❌ Nenhum site habilitado no nginx!${NC}"
        exit 1
    fi
    
    echo "📝 Adicionando configuração ao arquivo: $SITE_CONFIG"
    
    # Backup do arquivo
    cp /etc/nginx/sites-enabled/$SITE_CONFIG /etc/nginx/sites-enabled/$SITE_CONFIG.backup
    
    # Adicionar configuração antes do último }
    sed -i '/^}$/i \
    # Proxy para Integration Server\
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
' /etc/nginx/sites-enabled/$SITE_CONFIG
    
    echo -e "${GREEN}✅ Configuração adicionada!${NC}"
    
    # Testar nginx
    echo "🧪 Testando configuração do nginx..."
    if nginx -t 2>&1; then
        echo -e "${GREEN}✅ Configuração do nginx válida!${NC}"
        echo "🔄 Recarregando nginx..."
        systemctl reload nginx
        echo -e "${GREEN}✅ Nginx recarregado!${NC}"
    else
        echo -e "${RED}❌ Erro na configuração do nginx!${NC}"
        echo "🔙 Restaurando backup..."
        mv /etc/nginx/sites-enabled/$SITE_CONFIG.backup /etc/nginx/sites-enabled/$SITE_CONFIG
        exit 1
    fi
else
    echo -e "${GREEN}✅ Nginx já tem configuração /api/!${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  VERIFICANDO INTEGRATION PROXY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if pm2 list | grep -q "integration-proxy"; then
    echo -e "${GREEN}✅ Integration proxy está no PM2${NC}"
    
    # Verificar se está rodando
    if pm2 list | grep "integration-proxy" | grep -q "online"; then
        echo -e "${GREEN}✅ Integration proxy está ONLINE${NC}"
    else
        echo -e "${YELLOW}⚠️  Integration proxy está OFFLINE! Iniciando...${NC}"
        pm2 restart integration-proxy
    fi
else
    echo -e "${RED}❌ Integration proxy NÃO está no PM2!${NC}"
    echo "🚀 Iniciando integration proxy..."
    pm2 start integration-proxy.js --name "integration-proxy"
    pm2 save
fi

# Testar se responde
echo ""
echo "🧪 Testando health check do proxy..."
HEALTH_CHECK=$(curl -s http://localhost:3001/health)

if [ -n "$HEALTH_CHECK" ]; then
    echo -e "${GREEN}✅ Proxy respondendo: $HEALTH_CHECK${NC}"
else
    echo -e "${RED}❌ Proxy NÃO está respondendo!${NC}"
    echo "📋 Logs do PM2:"
    pm2 logs integration-proxy --lines 20 --nostream
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  ATUALIZANDO CÓDIGO DO FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "📥 Baixando últimas alterações..."
git fetch origin genspark_ai_developer

echo "🔄 Aplicando alterações..."
git pull origin genspark_ai_developer

echo "🏗️  Reconstruindo frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro no build!${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  REINICIANDO SERVIÇOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔄 Reiniciando integration proxy..."
pm2 restart integration-proxy

echo "🔄 Recarregando nginx..."
systemctl reload nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  TESTANDO INTEGRAÇÃO MAILCHIMP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🧪 Testando endpoint /api/mailchimp/test através do nginx..."

# Obter o domínio do nginx
DOMAIN=$(grep -r "server_name" /etc/nginx/sites-enabled/ | head -1 | awk '{print $2}' | sed 's/;//g')

if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "_" ]; then
    echo "📡 Testando em: https://$DOMAIN/api/mailchimp/test"
    
    RESPONSE=$(curl -s -X POST https://$DOMAIN/api/mailchimp/test \
        -H "Content-Type: application/json" \
        -d '{"apiKey":"teste","audienceId":"teste","serverPrefix":"us1"}' \
        --max-time 10 \
        --insecure)
    
    if [ -n "$RESPONSE" ]; then
        echo -e "${GREEN}✅ Endpoint respondendo!${NC}"
        echo "📊 Resposta: $RESPONSE"
    else
        echo -e "${RED}❌ Endpoint não respondeu!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Não foi possível determinar o domínio${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CORREÇÃO CONCLUÍDA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo ""
echo "1. Acesse o sistema em: https://$DOMAIN"
echo "2. Vá em Admin > Integrações > Mailchimp"
echo "3. Cole suas credenciais do Mailchimp"
echo "4. Clique em 'Testar Conexão'"
echo "5. Deve aparecer ✅ SUCESSO!"
echo ""
echo "📋 Se ainda tiver erro, execute:"
echo "   pm2 logs integration-proxy"
echo ""
echo "🔍 E abra o console do navegador (F12) para ver os erros"
echo ""
