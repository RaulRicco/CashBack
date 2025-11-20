#!/bin/bash

##############################################################################
# 🚀 DEPLOY CASHBACK SYSTEM - RECUPERAÇÃO DE SENHA POR EMAIL
# 
# Script automatizado de deploy para produção
# Branch: genspark_ai_developer
# Features: Forgot Password com Resend Email
##############################################################################

set -e  # Parar em qualquer erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✅ ${NC}$1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  ${NC}$1"
}

log_error() {
    echo -e "${RED}❌ ${NC}$1"
}

log_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

##############################################################################
# CONFIGURAÇÕES
##############################################################################

# AJUSTE ESTAS VARIÁVEIS CONFORME SEU AMBIENTE
PROJECT_DIR="/var/www/cashback-system"
BACKUP_DIR="/var/www/backups"
BRANCH="genspark_ai_developer"
PM2_APP_NAME="cashback-system"

# Detectar tipo de servidor
USE_PM2=false
USE_SYSTEMD=false
USE_NGINX_STATIC=false

##############################################################################
# BANNER
##############################################################################

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🚀 DEPLOY CASHBACK SYSTEM                          ║"
echo "║        📧 Recuperação de Senha por Email                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

##############################################################################
# VERIFICAÇÕES PRÉ-DEPLOY
##############################################################################

log_step "1️⃣  VERIFICAÇÕES PRÉ-DEPLOY"

# Verificar se diretório existe
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Diretório do projeto não encontrado: $PROJECT_DIR"
    log_warning "Ajuste a variável PROJECT_DIR no script"
    exit 1
fi
log_success "Diretório do projeto encontrado"

# Verificar se é repositório git
cd "$PROJECT_DIR"
if [ ! -d ".git" ]; then
    log_error "Não é um repositório Git"
    exit 1
fi
log_success "Repositório Git válido"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js não instalado"
    exit 1
fi
NODE_VERSION=$(node -v)
log_success "Node.js instalado: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    log_error "npm não instalado"
    exit 1
fi
NPM_VERSION=$(npm -v)
log_success "npm instalado: $NPM_VERSION"

# Detectar tipo de servidor
if command -v pm2 &> /dev/null; then
    USE_PM2=true
    log_success "PM2 detectado"
elif systemctl list-unit-files | grep -q "$PM2_APP_NAME"; then
    USE_SYSTEMD=true
    log_success "systemd detectado"
else
    USE_NGINX_STATIC=true
    log_success "Deploy estático (nginx) será usado"
fi

##############################################################################
# CONFIRMAÇÃO
##############################################################################

echo ""
log_warning "CONFIGURAÇÃO DO DEPLOY:"
echo "  📁 Diretório: $PROJECT_DIR"
echo "  🌿 Branch: $BRANCH"
echo "  💾 Backup: $BACKUP_DIR"
if [ "$USE_PM2" = true ]; then
    echo "  🔧 Servidor: PM2 ($PM2_APP_NAME)"
elif [ "$USE_SYSTEMD" = true ]; then
    echo "  🔧 Servidor: systemd ($PM2_APP_NAME)"
else
    echo "  🔧 Servidor: Nginx (static files)"
fi
echo ""

read -p "Continuar com o deploy? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    log_warning "Deploy cancelado pelo usuário"
    exit 0
fi

##############################################################################
# BACKUP
##############################################################################

log_step "2️⃣  CRIANDO BACKUP"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="cashback-backup-$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

log_info "Criando backup em: $BACKUP_PATH"
cp -r "$PROJECT_DIR" "$BACKUP_PATH"

if [ -d "$BACKUP_PATH" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
    log_success "Backup criado com sucesso ($BACKUP_SIZE)"
else
    log_error "Falha ao criar backup"
    exit 1
fi

##############################################################################
# GIT PULL
##############################################################################

log_step "3️⃣  ATUALIZANDO CÓDIGO"

cd "$PROJECT_DIR"

# Stash de mudanças locais (se houver)
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Mudanças locais detectadas, salvando..."
    git stash
fi

# Fetch e checkout
log_info "Buscando atualizações do GitHub..."
git fetch origin

log_info "Mudando para branch: $BRANCH"
git checkout "$BRANCH"

log_info "Puxando últimas mudanças..."
BEFORE_COMMIT=$(git rev-parse HEAD)
git pull origin "$BRANCH"
AFTER_COMMIT=$(git rev-parse HEAD)

if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ]; then
    log_warning "Nenhuma atualização disponível"
else
    log_success "Código atualizado"
    log_info "Commits novos:"
    git log --oneline "$BEFORE_COMMIT..$AFTER_COMMIT" | head -5
fi

##############################################################################
# INSTALAR DEPENDÊNCIAS
##############################################################################

log_step "4️⃣  INSTALANDO DEPENDÊNCIAS"

log_info "Verificando package.json..."
if [ -f "package-lock.json" ]; then
    log_info "Rodando: npm ci (instalação limpa)"
    npm ci
else
    log_info "Rodando: npm install"
    npm install
fi

log_success "Dependências instaladas"

##############################################################################
# BUILD
##############################################################################

log_step "5️⃣  BUILDING PROJETO"

log_info "Rodando: npm run build"

if npm run build; then
    log_success "Build concluído com sucesso"
    
    # Verificar se dist/ foi criado
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        log_success "Diretório dist/ criado ($DIST_SIZE)"
    else
        log_error "Diretório dist/ não foi criado"
        exit 1
    fi
else
    log_error "Falha no build!"
    log_warning "Restaurando backup..."
    
    # Restaurar backup
    rm -rf "$PROJECT_DIR"
    cp -r "$BACKUP_PATH" "$PROJECT_DIR"
    
    log_error "Deploy falhou. Backup restaurado."
    exit 1
fi

##############################################################################
# DEPLOY CONFORME TIPO DE SERVIDOR
##############################################################################

log_step "6️⃣  REINICIANDO SERVIDOR"

if [ "$USE_PM2" = true ]; then
    # PM2
    log_info "Reiniciando com PM2..."
    
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        pm2 restart "$PM2_APP_NAME"
        log_success "PM2 reiniciado"
    else
        log_warning "App não encontrado no PM2"
        log_info "Iniciando novo processo..."
        pm2 start npm --name "$PM2_APP_NAME" -- run preview
        log_success "PM2 iniciado"
    fi
    
    # Salvar configuração PM2
    pm2 save
    
    # Mostrar status
    echo ""
    pm2 status "$PM2_APP_NAME"
    
elif [ "$USE_SYSTEMD" = true ]; then
    # systemd
    log_info "Reiniciando com systemd..."
    
    sudo systemctl restart "$PM2_APP_NAME"
    
    if systemctl is-active --quiet "$PM2_APP_NAME"; then
        log_success "Serviço systemd reiniciado"
    else
        log_error "Falha ao reiniciar serviço"
        sudo systemctl status "$PM2_APP_NAME"
        exit 1
    fi
    
else
    # Nginx static files
    log_info "Copiando arquivos estáticos..."
    
    # Verificar se nginx está rodando
    if ! systemctl is-active --quiet nginx; then
        log_warning "Nginx não está rodando"
    fi
    
    # Copiar arquivos (ajuste o caminho conforme necessário)
    WEB_ROOT="/var/www/html"
    if [ -d "$WEB_ROOT" ]; then
        sudo cp -r dist/* "$WEB_ROOT/"
        log_success "Arquivos copiados para $WEB_ROOT"
        
        # Recarregar nginx
        sudo nginx -t && sudo systemctl reload nginx
        log_success "Nginx recarregado"
    else
        log_error "Diretório web root não encontrado: $WEB_ROOT"
        log_warning "Ajuste WEB_ROOT no script ou copie manualmente:"
        log_warning "  sudo cp -r dist/* /seu/web/root/"
    fi
fi

##############################################################################
# LIMPEZA DE BACKUPS ANTIGOS
##############################################################################

log_step "7️⃣  LIMPEZA DE BACKUPS ANTIGOS"

# Manter apenas últimos 5 backups
log_info "Mantendo apenas últimos 5 backups..."
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs -r rm -rf
BACKUP_COUNT=$(ls -1 | wc -l)
log_success "Backups mantidos: $BACKUP_COUNT"

##############################################################################
# VERIFICAÇÕES PÓS-DEPLOY
##############################################################################

log_step "8️⃣  VERIFICAÇÕES PÓS-DEPLOY"

cd "$PROJECT_DIR"

# Verificar commit atual
CURRENT_COMMIT=$(git rev-parse --short HEAD)
CURRENT_BRANCH=$(git branch --show-current)
log_success "Commit atual: $CURRENT_COMMIT"
log_success "Branch atual: $CURRENT_BRANCH"

# Verificar arquivos .env
if [ -f ".env" ]; then
    log_success "Arquivo .env encontrado"
    
    # Verificar variáveis importantes
    if grep -q "VITE_RESEND_API_KEY" .env; then
        log_success "✓ VITE_RESEND_API_KEY configurada"
    else
        log_warning "✗ VITE_RESEND_API_KEY não encontrada"
    fi
    
    if grep -q "VITE_SUPABASE_URL" .env; then
        log_success "✓ VITE_SUPABASE_URL configurada"
    else
        log_warning "✗ VITE_SUPABASE_URL não encontrada"
    fi
else
    log_warning "Arquivo .env não encontrado"
fi

##############################################################################
# TESTES RÁPIDOS
##############################################################################

log_step "9️⃣  TESTES RÁPIDOS"

# Se PM2, verificar logs
if [ "$USE_PM2" = true ]; then
    log_info "Últimas 5 linhas de log:"
    pm2 logs "$PM2_APP_NAME" --lines 5 --nostream
fi

# Se systemd, verificar status
if [ "$USE_SYSTEMD" = true ]; then
    log_info "Status do serviço:"
    systemctl status "$PM2_APP_NAME" --no-pager -l
fi

##############################################################################
# SUCESSO
##############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🎉 DEPLOY CONCLUÍDO COM SUCESSO!                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log_success "Deploy finalizado em $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

log_info "PRÓXIMOS PASSOS:"
echo "  1. 🧪 Teste a funcionalidade:"
echo "     - Acesse: https://seudominio.com/customer/login/SLUG"
echo "     - Clique em 'Esqueci minha senha'"
echo "     - Teste o fluxo completo"
echo ""
echo "  2. 📊 Monitore os logs:"
if [ "$USE_PM2" = true ]; then
    echo "     pm2 logs $PM2_APP_NAME"
elif [ "$USE_SYSTEMD" = true ]; then
    echo "     sudo journalctl -u $PM2_APP_NAME -f"
else
    echo "     sudo tail -f /var/log/nginx/access.log"
fi
echo ""
echo "  3. 📧 Verifique emails no Resend:"
echo "     https://resend.com/emails"
echo ""
echo "  4. 📋 Checklist completo em:"
echo "     TESTE-RECUPERACAO-EMAIL.md"
echo ""

log_info "ℹ️  Backup salvo em: $BACKUP_PATH"
log_info "🔗 PR #2: https://github.com/RaulRicco/CashBack/pull/2"

echo ""
log_success "Tudo pronto! 🚀"
echo ""

exit 0
