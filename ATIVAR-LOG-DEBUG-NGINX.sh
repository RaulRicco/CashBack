#!/bin/bash

echo "🔧 ATIVANDO LOGS DETALHADOS NO NGINX PARA /api/"
echo ""

# Backup da configuração atual
echo "📦 Fazendo backup da configuração atual..."
sudo cp /etc/nginx/sites-available/localcashback /etc/nginx/sites-available/localcashback.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup criado!"
echo ""

# Adicionar logs específicos para /api/
echo "📝 Adicionando logs detalhados ao bloco /api/..."

sudo tee /tmp/nginx-api-with-logs.conf > /dev/null << 'EOF'
    location /api/ {
        # LOGS DETALHADOS PARA DEBUG
        access_log /var/log/nginx/api-access.log combined;
        error_log /var/log/nginx/api-error.log debug;
        
        # Headers de debug
        add_header X-Debug-Proxy "Passou pelo nginx" always;
        add_header X-Proxy-Pass "http://localhost:3001" always;
        
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts aumentados
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
EOF

echo ""
echo "📋 Nova configuração criada em /tmp/nginx-api-with-logs.conf"
echo ""
echo "⚠️  ATENÇÃO: Agora você precisa:"
echo ""
echo "1️⃣  Editar o arquivo nginx:"
echo "    sudo nano /etc/nginx/sites-available/localcashback"
echo ""
echo "2️⃣  Substituir o bloco 'location /api/' pelo conteúdo de:"
echo "    cat /tmp/nginx-api-with-logs.conf"
echo ""
echo "3️⃣  Testar configuração:"
echo "    sudo nginx -t"
echo ""
echo "4️⃣  Recarregar nginx:"
echo "    sudo systemctl reload nginx"
echo ""
echo "5️⃣  Monitorar logs em tempo real:"
echo "    sudo tail -f /var/log/nginx/api-access.log"
echo "    sudo tail -f /var/log/nginx/api-error.log"
echo ""
echo "═══════════════════════════════════════════════════"
