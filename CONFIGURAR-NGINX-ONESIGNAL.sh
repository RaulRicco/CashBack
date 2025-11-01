#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "  🔧 CONFIGURAR NGINX PARA PROXY ONESIGNAL"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Backup da configuração atual
echo "📦 Fazendo backup da configuração atual..."
sudo cp /etc/nginx/sites-available/localcashback /etc/nginx/sites-available/localcashback.backup.$(date +%Y%m%d_%H%M%S)

# Criar nova configuração com proxy
echo "📝 Criando nova configuração com proxy OneSignal..."
sudo tee /etc/nginx/sites-available/localcashback > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    listen [::]:80;
    
    server_name localcashback.com.br www.localcashback.com.br;
    
    root /var/www/cashback/cashback-system/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # Proxy para APIs de integração (Mailchimp, RD Station, OneSignal)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts aumentados para APIs externas
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # SPA routing - todas as rotas vão para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Desabilitar cache para index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
NGINX_CONFIG

# Testar configuração
echo ""
echo "🔍 Testando configuração do Nginx..."
if sudo nginx -t; then
    echo "✅ Configuração válida!"
    echo ""
    echo "🔄 Recarregando Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx recarregado!"
else
    echo "❌ ERRO na configuração do Nginx!"
    echo "Restaurando backup..."
    sudo cp /etc/nginx/sites-available/localcashback.backup.* /etc/nginx/sites-available/localcashback
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ NGINX CONFIGURADO COM SUCESSO!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 O que foi configurado:"
echo "   ✅ Proxy /api/* → http://localhost:3001"
echo "   ✅ Timeout de 60 segundos para APIs"
echo "   ✅ Headers necessários para CORS"
echo ""
echo "🔍 Verificar se proxy está rodando:"
echo "   curl http://localhost:3001/health"
echo ""
echo "Se retornar erro, inicie o proxy:"
echo "   cd /var/www/cashback/cashback-system"
echo "   pm2 restart integration-proxy"
echo ""
echo "════════════════════════════════════════════════════════════════"
