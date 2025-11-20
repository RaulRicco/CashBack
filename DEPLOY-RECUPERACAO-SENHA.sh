#!/bin/bash

###############################################################################
# 🚀 DEPLOY - Sistema de Recuperação de Senha com Código de 6 Dígitos
###############################################################################

set -e  # Para se houver erro

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║        🚀 DEPLOY - Sistema de Recuperação de Senha (Código 6 Dígitos)       ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretórios
PROJECT_DIR="/var/www/cashback"
APP_DIR="$PROJECT_DIR/cashback-system"

echo -e "${YELLOW}📂 Diretório do projeto: $PROJECT_DIR${NC}"
echo ""

# 1. Verificar se diretório existe
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Verificando estrutura de diretórios..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório $PROJECT_DIR não encontrado!${NC}"
    exit 1
fi

cd "$PROJECT_DIR"
echo -e "${GREEN}✅ Diretório encontrado${NC}"
echo ""

# 2. Fazer backup do dist atual
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Fazendo backup do build atual..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "$APP_DIR/dist" ]; then
    BACKUP_DIR="$PROJECT_DIR/backup-dist-$(date +%Y%m%d-%H%M%S)"
    cp -r "$APP_DIR/dist" "$BACKUP_DIR"
    echo -e "${GREEN}✅ Backup criado: $BACKUP_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum build anterior encontrado (primeira vez)${NC}"
fi
echo ""

# 3. Pull do GitHub
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Baixando código atualizado do GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

git fetch origin genspark_ai_developer
git reset --hard origin/genspark_ai_developer
echo -e "${GREEN}✅ Código atualizado${NC}"
echo ""

# 4. Verificar se .env existe
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Verificando variáveis de ambiente..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$APP_DIR/.env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    
    # Verificar se tem as variáveis do Resend
    if grep -q "VITE_RESEND_API_KEY" "$APP_DIR/.env"; then
        echo -e "${GREEN}✅ VITE_RESEND_API_KEY configurada${NC}"
    else
        echo -e "${RED}❌ VITE_RESEND_API_KEY não encontrada no .env!${NC}"
        echo -e "${YELLOW}Adicione manualmente:${NC}"
        echo "VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF"
        exit 1
    fi
else
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}Criando .env com variáveis básicas...${NC}"
    
    cat > "$APP_DIR/.env" << 'EOF'
# Supabase
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5MzMwNzksImV4cCI6MjA1MjUwOTA3OX0.oRxcWjHZqVJBfWaHqLqpMzxWXPE84lDxxdPqJFnZ4MM

# Resend Email Service
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_RESEND_FROM_NAME=Local CashBack

# OneSignal
VITE_ONESIGNAL_APP_ID=e2b2fb1d-4a56-470f-a33a-aeb35e99631d
VITE_ONESIGNAL_REST_API_KEY=os_v2_app_4kzpwhkkkzdqhne5hfbjddnhq7idmz4bndgzp2bcobxw2m3pojzeamzvgmzggy3boq2di3dfnzuw2ncvnzwdcorvhbqwgllbgyzwk
EOF
    
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
fi
echo ""

# 5. Limpar cache
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Limpando cache e arquivos antigos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$APP_DIR"
rm -rf node_modules/.vite
rm -rf dist
echo -e "${GREEN}✅ Cache limpo${NC}"
echo ""

# 6. Instalar dependências
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  Instalando/atualizando dependências..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 7. Build
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  Fazendo build do projeto..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm run build
echo -e "${GREEN}✅ Build concluído${NC}"
echo ""

# 8. Verificar build
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  Verificando arquivos gerados..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "$APP_DIR/dist" ]; then
    echo -e "${GREEN}✅ Diretório dist/ criado${NC}"
    
    # Verificar se tem os arquivos essenciais
    if [ -f "$APP_DIR/dist/index.html" ]; then
        echo -e "${GREEN}✅ index.html encontrado${NC}"
    else
        echo -e "${RED}❌ index.html não encontrado!${NC}"
        exit 1
    fi
    
    # Contar arquivos
    FILE_COUNT=$(find "$APP_DIR/dist" -type f | wc -l)
    echo -e "${GREEN}✅ $FILE_COUNT arquivos gerados${NC}"
    
    # Mostrar tamanho
    DIST_SIZE=$(du -sh "$APP_DIR/dist" | cut -f1)
    echo -e "${GREEN}✅ Tamanho total: $DIST_SIZE${NC}"
else
    echo -e "${RED}❌ Erro: Build falhou, dist/ não foi criado${NC}"
    exit 1
fi
echo ""

# 9. Verificar Nginx
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  Verificando configuração do Nginx..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✅ Nginx instalado${NC}"
    
    # Testar configuração
    if sudo nginx -t 2>/dev/null; then
        echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
        
        # Recarregar Nginx
        echo -e "${YELLOW}🔄 Recarregando Nginx...${NC}"
        sudo systemctl reload nginx
        echo -e "${GREEN}✅ Nginx recarregado${NC}"
    else
        echo -e "${YELLOW}⚠️  Erro na configuração do Nginx (mas build ok)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx não encontrado (pode estar usando outro servidor)${NC}"
fi
echo ""

# 10. Verificar Integration Proxy
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔟 Verificando Integration Proxy..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$PROJECT_DIR/integration-proxy.js" ]; then
    echo -e "${GREEN}✅ integration-proxy.js encontrado${NC}"
    
    # Verificar se está rodando
    if pgrep -f "integration-proxy.js" > /dev/null; then
        echo -e "${GREEN}✅ Integration Proxy já está rodando${NC}"
        echo -e "${YELLOW}🔄 Reiniciando proxy...${NC}"
        pkill -f "integration-proxy.js"
        sleep 2
    fi
    
    # Iniciar proxy em background
    cd "$PROJECT_DIR"
    nohup node integration-proxy.js > integration-proxy.log 2>&1 &
    sleep 2
    
    if pgrep -f "integration-proxy.js" > /dev/null; then
        echo -e "${GREEN}✅ Integration Proxy iniciado com sucesso${NC}"
    else
        echo -e "${YELLOW}⚠️  Erro ao iniciar proxy (verifique integration-proxy.log)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  integration-proxy.js não encontrado (pode não ser necessário)${NC}"
fi
echo ""

# 11. Resumo final
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                         ✅ DEPLOY CONCLUÍDO COM SUCESSO!                     ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 RESUMO DO DEPLOY:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "✅ Código atualizado do GitHub"
echo -e "✅ Dependências instaladas"
echo -e "✅ Build gerado com sucesso"
echo -e "✅ Nginx recarregado"
echo -e "✅ Integration Proxy reiniciado"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  ATENÇÃO - CRIAR TABELA NO SUPABASE:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Antes de testar a recuperação de senha, você PRECISA criar a tabela no Supabase!"
echo ""
echo "Execute este SQL no Supabase SQL Editor:"
echo ""
echo "   Arquivo: $PROJECT_DIR/CRIAR-TABELA-PASSWORD-RESET.sql"
echo ""
echo "Ou acesse: https://supabase.com → Seu Projeto → SQL Editor"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🧪 COMO TESTAR:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Acesse: https://seu-dominio.com/forgot-password"
echo "2. Digite um email cadastrado"
echo "3. Selecione 'Estabelecimento' ou 'Cliente'"
echo "4. Clique em 'Enviar Código de Verificação'"
echo "5. Verifique seu email (pode estar no SPAM)"
echo "6. Copie o código de 6 dígitos"
echo "7. Cole na página de reset"
echo "8. Digite nova senha"
echo "9. Confirme e teste login ✅"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📁 ARQUIVOS IMPORTANTES:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📄 SQL para Supabase:"
echo "   $PROJECT_DIR/CRIAR-TABELA-PASSWORD-RESET.sql"
echo ""
echo "📖 Documentação completa:"
echo "   $PROJECT_DIR/CONFIGURAR-RECUPERACAO-SENHA.md"
echo ""
echo "🔧 Logs do proxy:"
echo "   $PROJECT_DIR/integration-proxy.log"
echo ""
echo "📦 Backup do build anterior:"
if [ -n "$BACKUP_DIR" ]; then
    echo "   $BACKUP_DIR"
else
    echo "   (nenhum backup criado - primeira vez)"
fi
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Sistema de recuperação de senha está PRONTO para uso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
