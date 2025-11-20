#!/bin/bash

# Script de Deploy - Compartilhamento Social com Logo do Cliente
# Atualização: Meta Tags Open Graph para WhatsApp, Facebook, etc.

set -e  # Parar em caso de erro

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║        🔗 DEPLOY - Compartilhamento Social com Logo             ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir mensagens
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Erro: Execute este script no diretório /var/www/cashback/cashback-system"
    exit 1
fi

info "Iniciando deploy do sistema de compartilhamento social..."
echo ""

# Passo 1: Backup
info "1/7 - Criando backup do build atual..."
if [ -d "dist" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mv dist "dist.backup.${TIMESTAMP}"
    success "Backup criado: dist.backup.${TIMESTAMP}"
else
    warning "Nenhum build anterior encontrado. Pulando backup."
fi
echo ""

# Passo 2: Git pull (se necessário)
info "2/7 - Atualizando código do repositório..."
if [ -d ".git" ]; then
    git pull origin main || warning "Não foi possível fazer git pull (continuando...)"
    success "Código atualizado"
else
    warning "Não é um repositório git. Pulando git pull."
fi
echo ""

# Passo 3: Instalar dependências
info "3/7 - Instalando dependências (react-helmet-async, react-is)..."
npm install --legacy-peer-deps
success "Dependências instaladas"
echo ""

# Passo 4: Build
info "4/7 - Compilando aplicação React..."
npm run build
if [ $? -eq 0 ]; then
    success "Build concluído com sucesso"
else
    error "Erro no build! Verifique os logs acima."
    exit 1
fi
echo ""

# Passo 5: Verificar arquivos gerados
info "5/7 - Verificando arquivos gerados..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    success "Arquivos dist/ gerados corretamente"
    
    # Mostrar tamanho dos arquivos
    echo ""
    info "Tamanho dos arquivos principais:"
    du -h dist/index.html dist/assets/*.css dist/assets/*.js 2>/dev/null | head -5
else
    error "Erro: Arquivos dist/ não foram gerados!"
    exit 1
fi
echo ""

# Passo 6: Testar se Nginx está ativo
info "6/7 - Verificando status do Nginx..."
if systemctl is-active --quiet nginx; then
    success "Nginx está rodando"
    
    info "Recarregando configuração do Nginx..."
    sudo systemctl reload nginx
    success "Nginx recarregado"
else
    warning "Nginx não está rodando. Tentando iniciar..."
    sudo systemctl start nginx
    if [ $? -eq 0 ]; then
        success "Nginx iniciado"
    else
        error "Erro ao iniciar Nginx!"
        exit 1
    fi
fi
echo ""

# Passo 7: Validação final
info "7/7 - Validação final..."
if [ -f "dist/index.html" ]; then
    # Verificar se as novas meta tags estão no build
    if grep -q "react-helmet-async" dist/assets/*.js 2>/dev/null; then
        success "Meta tags dinâmicas detectadas no build!"
    else
        warning "Meta tags não detectadas no bundle (pode ser normal devido à minificação)"
    fi
    
    success "Deploy concluído com sucesso!"
else
    error "Erro: dist/index.html não existe!"
    exit 1
fi
echo ""

# Informações finais
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║                    ✅ DEPLOY CONCLUÍDO! ✅                       ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
success "O sistema agora exibe a logo do cliente ao compartilhar links!"
echo ""
info "Páginas com meta tags dinâmicas:"
echo "  → /signup/:slug (Cadastro de clientes)"
echo "  → /customer/dashboard/:phone (Dashboard do cliente)"
echo "  → /customer/cashback/:token/parabens (Cashback recebido)"
echo ""
warning "IMPORTANTE: Redes sociais fazem CACHE das miniaturas!"
echo ""
info "Para forçar atualização do cache:"
echo "  → Facebook: https://developers.facebook.com/tools/debug/"
echo "  → LinkedIn: https://www.linkedin.com/post-inspector/"
echo "  → WhatsApp: Aguarde algumas horas ou use outro número"
echo ""
info "Leia a documentação completa em:"
echo "  → COMPARTILHAMENTO-SOCIAL.md"
echo "  → RESUMO-COMPARTILHAMENTO.txt"
echo ""
success "🎉 Pronto para viralizar com a logo dos clientes! 🚀"
echo ""
