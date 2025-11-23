#!/bin/bash
# Deploy Script - LocalCashback v1.5.0 Dark Mode Complete
# Execute este script no servidor de produção: 31.92.167.88

set -e  # Parar em caso de erro

echo "=========================================="
echo "🚀 Deploy LocalCashback v1.5.0"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/var/www/cashback/cashback-system"
cd $PROJECT_DIR

echo "📍 Diretório: $PROJECT_DIR"
echo ""

# 1. Backup
echo "📦 Criando backup do dist atual..."
BACKUP_NAME="dist.backup.$(date +%Y%m%d_%H%M%S)"
cp -r dist $BACKUP_NAME
echo -e "${GREEN}✅ Backup criado: $BACKUP_NAME${NC}"
echo ""

# 2. Atualizar código
echo "⬇️  Atualizando código do repositório..."
git fetch origin --tags
git checkout main
git reset --hard f924c9e
echo -e "${GREEN}✅ Código atualizado para versão v1.5.0${NC}"
echo ""

# 3. Verificar versão
echo "🔍 Verificando versão atual..."
echo "Commit:"
git log --oneline -1
echo ""
echo "Tag:"
git describe --tags 2>/dev/null || echo "v1.5.0-dark-mode-complete"
echo ""

# 4. Instalar dependências
echo "📚 Instalando dependências..."
npm install --production
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 5. Build
echo "🔨 Gerando build de produção..."
npm run build
echo -e "${GREEN}✅ Build gerado com sucesso${NC}"
echo ""

# 6. Verificar build
echo "📋 Verificando arquivos gerados..."
ls -lh dist/ | head -10
echo ""

# 7. Recarregar nginx
echo "🔄 Recarregando nginx..."
systemctl reload nginx
echo -e "${GREEN}✅ Nginx recarregado${NC}"
echo ""

# 8. Verificar status nginx
echo "🔍 Verificando status do nginx..."
systemctl status nginx --no-pager | head -10
echo ""

# 9. Teste final
echo "🧪 Testando acesso ao site..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://cashback.churrascariaboidourado.com.br)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Site respondendo corretamente (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  Site respondendo com status: HTTP $HTTP_STATUS${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "=========================================="
echo ""
echo "📦 Versão: v1.5.0-dark-mode-complete"
echo "📍 Commit: f924c9e"
echo "🌐 URL: https://cashback.churrascariaboidourado.com.br"
echo ""
echo "💡 Backup disponível em: $BACKUP_NAME"
echo ""
echo "🔄 Para reverter caso necessário:"
echo "   rm -rf dist && cp -r $BACKUP_NAME dist && systemctl reload nginx"
echo ""
