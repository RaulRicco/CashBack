#!/bin/bash

# Script para configurar domínio personalizado com SSL para merchants
# Uso: bash setup-custom-domain.sh dominio.com.br

set -e  # Para na primeira falha

DOMAIN=$1
DIST_PATH="/var/www/cashback/cashback-system/dist"

if [ -z "$DOMAIN" ]; then
    echo "❌ Erro: Domínio não especificado"
    echo "Uso: bash setup-custom-domain.sh dominio.com.br"
    exit 1
fi

echo "============================================"
echo "🌐 Configurando Domínio Personalizado"
echo "============================================"
echo "Domínio: $DOMAIN"
echo "Caminho: $DIST_PATH"
echo ""

# Verificar se domínio já existe
if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
    echo "⚠️  Configuração já existe para $DOMAIN"
    read -p "Deseja sobrescrever? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Cancelado."
        exit 0
    fi
fi

# Passo 1: Verificar se DNS aponta para servidor
echo "============================================"
echo "1️⃣  Verificando DNS..."
echo "============================================"

SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(nslookup $DOMAIN | grep -A1 "Name:" | tail -n1 | awk '{print $2}' || echo "")

if [ -z "$DOMAIN_IP" ]; then
    # Tentar via dig
    DOMAIN_IP=$(dig +short $DOMAIN | tail -n1 || echo "")
fi

echo "IP do Servidor: $SERVER_IP"
echo "IP do Domínio:  $DOMAIN_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  AVISO: O DNS do domínio não aponta para este servidor!"
    echo "Configure o DNS antes de continuar:"
    echo "  Tipo A: $DOMAIN → $SERVER_IP"
    echo "  ou CNAME: $DOMAIN → localcashback.com.br"
    read -p "Deseja continuar mesmo assim? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Cancelado. Configure o DNS e tente novamente."
        exit 0
    fi
fi

echo "✅ DNS verificado"
echo ""

# Passo 2: Criar configuração Nginx (HTTP apenas, temporário para Certbot)
echo "============================================"
echo "2️⃣  Criando configuração Nginx temporária..."
echo "============================================"

cat > /etc/nginx/sites-available/$DOMAIN << EOF
# Configuração HTTP temporária para validação SSL
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    
    root $DIST_PATH;
    index index.html;
    
    # Location para validação do Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Proxy para API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "✅ Configuração criada em /etc/nginx/sites-available/$DOMAIN"
echo ""

# Passo 3: Ativar site
echo "============================================"
echo "3️⃣  Ativando site..."
echo "============================================"

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN

echo "✅ Site ativado"
echo ""

# Passo 4: Testar configuração Nginx
echo "============================================"
echo "4️⃣  Testando configuração Nginx..."
echo "============================================"

if nginx -t; then
    echo "✅ Configuração Nginx válida"
else
    echo "❌ Erro na configuração Nginx"
    exit 1
fi

echo ""

# Passo 5: Recarregar Nginx
echo "============================================"
echo "5️⃣  Recarregando Nginx..."
echo "============================================"

systemctl reload nginx

echo "✅ Nginx recarregado"
echo ""

# Passo 6: Gerar certificado SSL com Certbot
echo "============================================"
echo "6️⃣  Gerando certificado SSL..."
echo "============================================"

if certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect; then
    echo "✅ Certificado SSL gerado com sucesso!"
else
    echo "❌ Erro ao gerar certificado SSL"
    echo ""
    echo "Possíveis causas:"
    echo "1. DNS ainda não propagou (aguarde alguns minutos)"
    echo "2. Porta 80 não está acessível"
    echo "3. Domínio já tem certificado válido"
    echo ""
    echo "Tente manualmente:"
    echo "certbot --nginx -d $DOMAIN"
    exit 1
fi

echo ""

# Passo 7: Verificar certificado
echo "============================================"
echo "7️⃣  Verificando certificado SSL..."
echo "============================================"

if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "✅ Certificado instalado em /etc/letsencrypt/live/$DOMAIN"
    ls -la /etc/letsencrypt/live/$DOMAIN
else
    echo "⚠️  Diretório do certificado não encontrado"
fi

echo ""

# Passo 8: Testar configuração final
echo "============================================"
echo "8️⃣  Testando configuração final..."
echo "============================================"

nginx -t && systemctl reload nginx

echo "✅ Configuração final aplicada"
echo ""

# Resumo final
echo "============================================"
echo "✅ DOMÍNIO CONFIGURADO COM SUCESSO!"
echo "============================================"
echo ""
echo "📋 Informações:"
echo "   Domínio: https://$DOMAIN"
echo "   Certificado: /etc/letsencrypt/live/$DOMAIN"
echo "   Nginx Config: /etc/nginx/sites-available/$DOMAIN"
echo ""
echo "🔄 Renovação automática:"
echo "   O Certbot renova automaticamente os certificados"
echo "   Teste manual: certbot renew --dry-run"
echo ""
echo "🧪 Teste o site:"
echo "   curl -I https://$DOMAIN"
echo "   ou acesse no navegador: https://$DOMAIN"
echo ""
echo "============================================"
