#!/bin/bash

# Script de Verificação - Compartilhamento Social
# Verifica se a implementação está funcionando corretamente

set -e

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║     🔍 VERIFICAÇÃO - Compartilhamento Social com Logo            ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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
    error "Execute este script no diretório do projeto cashback-system"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "1. Verificando Dependências"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar react-helmet-async
if grep -q "react-helmet-async" package.json; then
    success "react-helmet-async instalado"
else
    error "react-helmet-async NÃO instalado"
    echo "  Execute: npm install react-helmet-async --legacy-peer-deps"
fi

# Verificar react-is
if grep -q "react-is" package.json; then
    success "react-is instalado"
else
    error "react-is NÃO instalado"
    echo "  Execute: npm install react-is --legacy-peer-deps"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "2. Verificando Arquivos Criados"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FILES=(
    "src/components/MerchantSEO.jsx"
    "COMPARTILHAMENTO-SOCIAL.md"
    "RESUMO-COMPARTILHAMENTO.txt"
    "EXEMPLO-VISUAL-COMPARTILHAMENTO.txt"
    "TESTE-COMPARTILHAMENTO-RAPIDO.md"
    "DEPLOY-COMPARTILHAMENTO.sh"
    "SUMARIO-IMPLEMENTACAO.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        success "$file existe"
    else
        error "$file NÃO EXISTE"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "3. Verificando Modificações em Arquivos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar main.jsx
if grep -q "HelmetProvider" src/main.jsx; then
    success "HelmetProvider adicionado em main.jsx"
else
    error "HelmetProvider NÃO encontrado em main.jsx"
fi

# Verificar CustomerSignup.jsx
if grep -q "MerchantSEO" src/pages/CustomerSignup.jsx; then
    success "MerchantSEO adicionado em CustomerSignup.jsx"
else
    error "MerchantSEO NÃO encontrado em CustomerSignup.jsx"
fi

# Verificar CustomerDashboard.jsx
if grep -q "MerchantSEO" src/pages/CustomerDashboard.jsx; then
    success "MerchantSEO adicionado em CustomerDashboard.jsx"
else
    error "MerchantSEO NÃO encontrado em CustomerDashboard.jsx"
fi

# Verificar CustomerCashback.jsx
if grep -q "MerchantSEO" src/pages/CustomerCashback.jsx; then
    success "MerchantSEO adicionado em CustomerCashback.jsx"
else
    error "MerchantSEO NÃO encontrado em CustomerCashback.jsx"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "4. Verificando Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "dist" ]; then
    success "Diretório dist/ existe"
    
    if [ -f "dist/index.html" ]; then
        success "dist/index.html existe"
        
        # Mostrar tamanho
        SIZE=$(du -h dist/index.html | cut -f1)
        info "Tamanho: $SIZE"
    else
        warning "dist/index.html NÃO existe"
        echo "  Execute: npm run build"
    fi
    
    # Verificar arquivos JS
    JS_COUNT=$(find dist/assets -name "*.js" 2>/dev/null | wc -l)
    if [ "$JS_COUNT" -gt 0 ]; then
        success "Arquivos JavaScript gerados: $JS_COUNT"
    else
        warning "Nenhum arquivo JavaScript encontrado"
    fi
    
    # Verificar arquivos CSS
    CSS_COUNT=$(find dist/assets -name "*.css" 2>/dev/null | wc -l)
    if [ "$CSS_COUNT" -gt 0 ]; then
        success "Arquivos CSS gerados: $CSS_COUNT"
    else
        warning "Nenhum arquivo CSS encontrado"
    fi
else
    error "Diretório dist/ NÃO EXISTE"
    echo "  Execute: npm run build"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "5. Teste de Conectividade (se em produção)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se está em produção (VPS)
if [ -d "/var/www/cashback" ]; then
    info "Ambiente de produção detectado"
    
    # Testar URL principal
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://localcashback.com.br 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            success "Site responde: HTTP $HTTP_CODE"
        else
            warning "Site retornou: HTTP $HTTP_CODE"
        fi
    else
        warning "curl não instalado. Pulando teste de conectividade."
    fi
    
    # Verificar Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        success "Nginx está rodando"
    else
        warning "Nginx não está rodando"
    fi
else
    info "Ambiente de desenvolvimento (local)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "6. Instruções de Teste"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Para testar se as meta tags estão funcionando:"
echo ""
echo "1️⃣  Facebook Debug Tool:"
echo "   https://developers.facebook.com/tools/debug/"
echo ""
echo "2️⃣  LinkedIn Post Inspector:"
echo "   https://www.linkedin.com/post-inspector/"
echo ""
echo "3️⃣  Verificar no navegador (DevTools):"
echo "   F12 → Elements → <head> → Procure por 'og:title'"
echo ""
echo "4️⃣  Teste com curl (se em produção):"
echo '   curl -s https://localcashback.com.br/signup/[slug] | grep "og:title"'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "7. Próximos Passos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Se todas as verificações passaram:"
echo ""
echo "✅ Fazer commit das alterações:"
echo "   git add ."
echo '   git commit -m "Adicionar compartilhamento social com logo do cliente"'
echo "   git push origin main"
echo ""
echo "✅ Deploy em produção:"
echo "   ./DEPLOY-COMPARTILHAMENTO.sh"
echo ""
echo "✅ Testar com estabelecimentos reais:"
echo "   Leia: TESTE-COMPARTILHAMENTO-RAPIDO.md"
echo ""

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║                 ✅ VERIFICAÇÃO CONCLUÍDA ✅                       ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
