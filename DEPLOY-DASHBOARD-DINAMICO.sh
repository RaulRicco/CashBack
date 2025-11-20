#!/bin/bash

# ============================================================================
# DEPLOY - DASHBOARD COM INVESTIMENTO DINÂMICO
# ============================================================================
# Este script atualiza o dashboard para usar investimento apenas em memória
# O valor será zerado automaticamente ao atualizar a página
# ============================================================================

set -e

echo "🚀 Iniciando deploy do Dashboard com Investimento Dinâmico..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/home/user/webapp/cashback-system"

echo -e "${BLUE}📁 Navegando para o diretório do projeto...${NC}"
cd "$PROJECT_DIR"

echo -e "${BLUE}🔄 Buscando atualizações do GitHub...${NC}"
git fetch origin genspark_ai_developer

echo -e "${BLUE}⬇️  Fazendo pull das mudanças...${NC}"
git pull origin genspark_ai_developer

echo -e "${BLUE}📦 Instalando dependências (se necessário)...${NC}"
npm install --silent

echo -e "${BLUE}🏗️  Fazendo build do projeto...${NC}"
npm run build

echo -e "${BLUE}📋 Verificando build gerado...${NC}"
ls -lh dist/assets/*.js | tail -3

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📊 O que mudou:${NC}"
echo "  ✓ Valor de investimento agora é dinâmico (apenas em memória)"
echo "  ✓ Zera automaticamente ao atualizar a página (F5)"
echo "  ✓ Zera automaticamente ao trocar o período de data"
echo "  ✓ Recalcula métricas automaticamente ao digitar"
echo "  ✓ Não salva mais no banco de dados"
echo ""
echo -e "${YELLOW}🧪 Para testar:${NC}"
echo "  1. Acesse o dashboard em: https://cashback.vipclubesystem.com.br/"
echo "  2. Digite um valor de investimento"
echo "  3. Veja as métricas sendo calculadas automaticamente"
echo "  4. Atualize a página (F5) - o valor voltará para zero"
echo "  5. Troque o período de data - o valor voltará para zero"
echo ""
echo -e "${RED}⚠️  IMPORTANTE:${NC}"
echo "  • Limpe o cache do navegador (Ctrl+Shift+Delete)"
echo "  • Ou use aba anônima (Ctrl+Shift+N)"
echo "  • Para forçar atualização: Ctrl+F5"
echo ""
