#!/bin/bash
# Script de Instalação Automática - VPS Hostinger
# LocalCashback.com.br

set -e  # Para se houver erro

echo "=================================="
echo "🚀 Setup VPS - LocalCashback"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Atualizar sistema
echo -e "${BLUE}[1/9]${NC} Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js 20 LTS
echo -e "${BLUE}[2/9]${NC} Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Instalar Nginx
echo -e "${BLUE}[3/9]${NC} Instalando Nginx..."
apt install -y nginx

# 4. Instalar Certbot (SSL)
echo -e "${BLUE}[4/9]${NC} Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# 5. Instalar Git
echo -e "${BLUE}[5/9]${NC} Instalando Git..."
apt install -y git

# 6. Clonar repositório
echo -e "${BLUE}[6/9]${NC} Clonando repositório..."
cd /var/www
if [ -d "cashback" ]; then
    echo "Diretório já existe, removendo..."
    rm -rf cashback
fi
git clone https://github.com/RaulRicco/CashBack.git cashback

# 7. Instalar dependências e buildar
echo -e "${BLUE}[7/9]${NC} Instalando dependências..."
cd /var/www/cashback/cashback-system
npm install

echo -e "${BLUE}[8/9]${NC} Buildando aplicação..."
npm run build

# 8. Configurar Nginx
echo -e "${BLUE}[9/9]${NC} Configurando Nginx..."
cat > /etc/nginx/sites-available/localcashback << 'NGINX_EOF'
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
NGINX_EOF

# Ativar site
ln -sf /etc/nginx/sites-available/localcashback /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# 9. Configurar Firewall
echo -e "${BLUE}Configurando firewall...${NC}"
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

echo ""
echo -e "${GREEN}=================================="
echo "✅ Instalação Concluída!"
echo "==================================${NC}"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Configure o DNS do domínio:"
echo "   Tipo: A"
echo "   Nome: @"
echo "   Valor: 31.97.167.88"
echo "   TTL: 3600"
echo ""
echo "   Tipo: A"
echo "   Nome: www"
echo "   Valor: 31.97.167.88"
echo "   TTL: 3600"
echo ""
echo "2. Após DNS propagado (5-30 min), execute:"
echo "   certbot --nginx -d localcashback.com.br -d www.localcashback.com.br"
echo ""
echo "3. Verifique Node.js:"
node -v
echo ""
echo "4. Verifique Nginx:"
systemctl status nginx --no-pager
echo ""
echo "5. Site temporário disponível em: http://31.97.167.88"
echo ""
