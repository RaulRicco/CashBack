#!/bin/bash

# 🚀 Script de Deploy Automatizado - Cashback System
# Autor: GenSpark AI Developer
# Data: 2025-10-30

set -e  # Exit on error

echo "=========================================="
echo "🚀 DEPLOY - Sistema Cashback"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado!${NC}"
    echo "Execute este script na raiz do projeto."
    exit 1
fi

echo -e "${BLUE}📂 Diretório atual:${NC} $(pwd)"
echo ""

# Verificar mudanças não commitadas
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Você tem mudanças não commitadas!${NC}"
    echo -e "${YELLOW}   Recomendado: commit antes de fazer deploy${NC}"
    read -p "Continuar mesmo assim? (s/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Limpar builds antigos
echo -e "${BLUE}🧹 Limpando builds antigos...${NC}"
rm -rf dist node_modules/.vite
echo -e "${GREEN}✅ Build antigo removido${NC}"
echo ""

# Build de produção
echo -e "${BLUE}🔨 Criando build de produção...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build criado com sucesso!${NC}"
echo ""

# Verificar se "Meu CashBack" está no build
echo -e "${BLUE}🔍 Verificando conteúdo do build...${NC}"
if grep -q "Meu CashBack" dist/assets/*.js 2>/dev/null; then
    echo -e "${GREEN}✅ 'Meu CashBack' encontrado no build!${NC}"
else
    echo -e "${RED}❌ ATENÇÃO: 'Meu CashBack' NÃO encontrado no build!${NC}"
    echo -e "${YELLOW}   Algo pode estar errado...${NC}"
    exit 1
fi
echo ""

# Mostrar tamanho do build
BUILD_SIZE=$(du -sh dist | cut -f1)
echo -e "${BLUE}📦 Tamanho do build:${NC} $BUILD_SIZE"
echo ""

# Menu de deploy
echo "=========================================="
echo -e "${YELLOW}Escolha a plataforma de deploy:${NC}"
echo "=========================================="
echo "1) Vercel"
echo "2) Netlify"
echo "3) Criar arquivo compactado (deploy manual)"
echo "4) Cancelar"
echo ""
read -p "Opção [1-4]: " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        echo -e "${BLUE}🚀 Iniciando deploy no Vercel...${NC}"
        
        # Verificar se Vercel CLI está instalado
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}⚠️  Vercel CLI não encontrado. Instalando...${NC}"
            npm install -g vercel
        fi
        
        echo ""
        echo -e "${GREEN}Executando: vercel --prod${NC}"
        echo -e "${YELLOW}Siga as instruções do Vercel CLI abaixo:${NC}"
        echo ""
        
        vercel --prod
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}=========================================="
            echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
            echo -e "==========================================${NC}"
        else
            echo ""
            echo -e "${RED}❌ Erro no deploy!${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}🚀 Iniciando deploy no Netlify...${NC}"
        
        # Verificar se Netlify CLI está instalado
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}⚠️  Netlify CLI não encontrado. Instalando...${NC}"
            npm install -g netlify-cli
        fi
        
        echo ""
        echo -e "${GREEN}Executando: netlify deploy --prod${NC}"
        echo -e "${YELLOW}Siga as instruções do Netlify CLI abaixo:${NC}"
        echo ""
        
        netlify deploy --prod
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}=========================================="
            echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
            echo -e "==========================================${NC}"
        else
            echo ""
            echo -e "${RED}❌ Erro no deploy!${NC}"
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}📦 Criando arquivo compactado...${NC}"
        
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        FILENAME="cashback-deploy-${TIMESTAMP}.tar.gz"
        
        tar -czf "$FILENAME" dist/
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Arquivo criado: $FILENAME${NC}"
            echo ""
            echo -e "${YELLOW}📋 Próximos passos:${NC}"
            echo "1. Faça upload deste arquivo para seu servidor"
            echo "2. Extraia: tar -xzf $FILENAME"
            echo "3. Mova os arquivos: mv dist/* /caminho/do/site/"
            echo ""
            echo -e "${BLUE}Tamanho do arquivo:${NC} $(du -sh $FILENAME | cut -f1)"
        else
            echo -e "${RED}❌ Erro ao criar arquivo!${NC}"
            exit 1
        fi
        ;;
        
    4)
        echo ""
        echo -e "${YELLOW}❌ Deploy cancelado.${NC}"
        exit 0
        ;;
        
    *)
        echo ""
        echo -e "${RED}❌ Opção inválida!${NC}"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 PROCESSO CONCLUÍDO!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "1. Acesse sua URL de produção"
echo "2. Verifique se o menu mostra 'Meu CashBack'"
echo "3. Teste a funcionalidade de upload de logo"
echo "4. Limpe o cache do navegador se necessário (Ctrl+F5)"
echo ""
echo -e "${BLUE}Build location:${NC} $(pwd)/dist/"
echo ""
