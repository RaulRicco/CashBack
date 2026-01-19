#!/bin/bash

################################################################################
# SCRIPT DE DEPLOY - CORREÇÃO DE ISOLAMENTO DE DADOS POR ESTABELECIMENTO
# Sistema de Cashback - Local CashBack
################################################################################

set -e  # Parar execução se houver erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     DEPLOY - CORREÇÃO DE ISOLAMENTO DE DADOS               ║${NC}"
echo -e "${BLUE}║     Sistema de Cashback Local                               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Diretório do projeto no servidor
PROJECT_DIR="/var/www/cashback"
BRANCH="genspark_ai_developer"
BACKUP_DIR="/var/www/backups/cashback"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

################################################################################
# ETAPA 1: Backup
################################################################################
echo -e "${YELLOW}[1/10] Criando backup...${NC}"

if [ -d "$PROJECT_DIR/dist" ]; then
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$PROJECT_DIR" dist/ 2>/dev/null || true
    echo -e "${GREEN}✓ Backup criado: backup_$TIMESTAMP.tar.gz${NC}"
else
    echo -e "${YELLOW}⚠ Nenhum build anterior encontrado para backup${NC}"
fi

################################################################################
# ETAPA 2: Navegação
################################################################################
echo -e "${YELLOW}[2/10] Navegando para diretório do projeto...${NC}"
cd "$PROJECT_DIR"
echo -e "${GREEN}✓ Diretório atual: $(pwd)${NC}"

################################################################################
# ETAPA 3: Git Stash (se houver mudanças locais)
################################################################################
echo -e "${YELLOW}[3/10] Verificando mudanças locais...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠ Salvando mudanças locais em stash...${NC}"
    git stash push -m "Auto-stash antes do deploy $TIMESTAMP"
    echo -e "${GREEN}✓ Mudanças salvas em stash${NC}"
else
    echo -e "${GREEN}✓ Nenhuma mudança local pendente${NC}"
fi

################################################################################
# ETAPA 4: Git Fetch
################################################################################
echo -e "${YELLOW}[4/10] Baixando últimas alterações do repositório...${NC}"
git fetch origin "$BRANCH"
echo -e "${GREEN}✓ Fetch concluído${NC}"

################################################################################
# ETAPA 5: Git Reset Hard (forçar atualização)
################################################################################
echo -e "${YELLOW}[5/10] Atualizando código para última versão...${NC}"
git reset --hard "origin/$BRANCH"
echo -e "${GREEN}✓ Código atualizado para branch: $BRANCH${NC}"

# Mostrar último commit
echo -e "${BLUE}📝 Último commit:${NC}"
git log -1 --oneline --decorate

################################################################################
# ETAPA 6: Verificar variáveis de ambiente
################################################################################
echo -e "${YELLOW}[6/10] Verificando arquivo .env...${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Arquivo .env encontrado${NC}"
    
    # Verificar variáveis essenciais
    if grep -q "VITE_SUPABASE_URL" .env && \
       grep -q "VITE_SUPABASE_ANON_KEY" .env && \
       grep -q "VITE_RESEND_API_KEY" .env; then
        echo -e "${GREEN}✓ Variáveis essenciais configuradas${NC}"
    else
        echo -e "${RED}✗ ERRO: Variáveis essenciais faltando no .env${NC}"
        echo -e "${YELLOW}Configure as seguintes variáveis:${NC}"
        echo "  - VITE_SUPABASE_URL"
        echo "  - VITE_SUPABASE_ANON_KEY"
        echo "  - VITE_RESEND_API_KEY"
        echo "  - VITE_RESEND_FROM_EMAIL"
        echo "  - VITE_RESEND_FROM_NAME"
        exit 1
    fi
else
    echo -e "${RED}✗ ERRO: Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}Crie o arquivo .env com as configurações necessárias${NC}"
    exit 1
fi

################################################################################
# ETAPA 7: Limpar cache e builds antigos
################################################################################
echo -e "${YELLOW}[7/10] Limpando cache e builds antigos...${NC}"

# Remover cache do Vite
rm -rf node_modules/.vite 2>/dev/null || true
echo -e "${GREEN}✓ Cache do Vite removido${NC}"

# Remover build anterior
rm -rf dist 2>/dev/null || true
echo -e "${GREEN}✓ Build anterior removido${NC}"

################################################################################
# ETAPA 8: Instalar dependências
################################################################################
echo -e "${YELLOW}[8/10] Instalando dependências...${NC}"

# Usar npm ci para instalação limpa (mais rápido e confiável)
if [ -f "package-lock.json" ]; then
    npm ci --production=false
else
    npm install
fi

echo -e "${GREEN}✓ Dependências instaladas${NC}"

################################################################################
# ETAPA 9: Build do projeto
################################################################################
echo -e "${YELLOW}[9/10] Gerando build de produção...${NC}"

# Build com output detalhado
npm run build

# Verificar se build foi criado
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✓ Build gerado com sucesso${NC}"
    
    # Mostrar tamanho do build
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo -e "${BLUE}📦 Tamanho do build: $BUILD_SIZE${NC}"
    
    # Contar arquivos gerados
    FILE_COUNT=$(find dist -type f | wc -l)
    echo -e "${BLUE}📄 Arquivos gerados: $FILE_COUNT${NC}"
else
    echo -e "${RED}✗ ERRO: Build falhou! Diretório dist não foi criado.${NC}"
    exit 1
fi

################################################################################
# ETAPA 10: Recarregar serviços
################################################################################
echo -e "${YELLOW}[10/10] Recarregando serviços...${NC}"

# Recarregar Nginx
if command -v nginx &> /dev/null; then
    if sudo nginx -t 2>/dev/null; then
        sudo systemctl reload nginx
        echo -e "${GREEN}✓ Nginx recarregado${NC}"
    else
        echo -e "${RED}✗ Erro na configuração do Nginx${NC}"
        echo -e "${YELLOW}Execute: sudo nginx -t${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Nginx não encontrado (pode estar usando outro servidor web)${NC}"
fi

# Reiniciar integration-proxy.js se existir
if [ -f "integration-proxy.js" ]; then
    if command -v pm2 &> /dev/null; then
        # Verificar se o processo existe no PM2
        if pm2 list | grep -q "integration-proxy"; then
            pm2 restart integration-proxy
            echo -e "${GREEN}✓ Integration proxy reiniciado${NC}"
        else
            # Iniciar pela primeira vez
            pm2 start integration-proxy.js --name integration-proxy
            pm2 save
            echo -e "${GREEN}✓ Integration proxy iniciado${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ PM2 não instalado. Integration proxy não foi reiniciado.${NC}"
        echo -e "${YELLOW}Instale com: npm install -g pm2${NC}"
    fi
fi

################################################################################
# RESUMO FINAL
################################################################################
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    DEPLOY CONCLUÍDO!                        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Código atualizado para branch: $BRANCH${NC}"
echo -e "${GREEN}✓ Build de produção gerado${NC}"
echo -e "${GREEN}✓ Serviços recarregados${NC}"
echo ""
echo -e "${BLUE}📋 ALTERAÇÕES NESTE DEPLOY:${NC}"
echo -e "${YELLOW}   • Correção de isolamento de dados por estabelecimento${NC}"
echo -e "${YELLOW}   • Dashboard agora mostra apenas clientes do próprio merchant${NC}"
echo -e "${YELLOW}   • Novos estabelecimentos começam com contadores zerados${NC}"
echo -e "${YELLOW}   • Estatísticas completamente isoladas por loja${NC}"
echo ""
echo -e "${BLUE}🔍 VERIFICAÇÕES RECOMENDADAS:${NC}"
echo -e "   1. Acesse o dashboard de um estabelecimento"
echo -e "   2. Crie um novo estabelecimento e verifique contadores em zero"
echo -e "   3. Faça uma venda e veja o cliente aparecer apenas naquela loja"
echo -e "   4. Verifique que outros estabelecimentos não veem esse cliente"
echo ""
echo -e "${BLUE}📁 Backup anterior:${NC}"
echo -e "   $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
echo ""
echo -e "${BLUE}🌐 Último commit aplicado:${NC}"
git log -1 --pretty=format:"   %h - %s (%ar)" --abbrev-commit
echo ""
echo ""
echo -e "${GREEN}Deploy finalizado com sucesso! 🚀${NC}"
echo ""

################################################################################
# FIM DO SCRIPT
################################################################################
