#!/bin/bash

# ==========================================
# SCRIPT DE DIAGNÓSTICO - LocalCashback
# ==========================================
# Execute no servidor: bash DIAGNOSTICO-DEPLOY.sh
# ==========================================

echo "🔍 DIAGNÓSTICO DO DEPLOY"
echo "================================"
echo ""

# 1. Verificar pasta do projeto
echo "📁 1. VERIFICANDO PASTA DO PROJETO"
echo "-----------------------------------"
if [ -d "/var/www/cashback/cashback-system" ]; then
    echo "✅ Pasta existe: /var/www/cashback/cashback-system"
    cd /var/www/cashback/cashback-system
else
    echo "❌ ERRO: Pasta não encontrada!"
    exit 1
fi
echo ""

# 2. Verificar branch e último commit
echo "🔀 2. VERIFICANDO BRANCH E COMMIT"
echo "-----------------------------------"
BRANCH=$(git branch --show-current 2>/dev/null)
COMMIT=$(git rev-parse --short HEAD 2>/dev/null)
echo "Branch atual: $BRANCH"
echo "Último commit local: $COMMIT"
echo ""

# 3. Verificar commits remotos
echo "🌐 3. VERIFICANDO GITHUB (REMOTO)"
echo "-----------------------------------"
git fetch origin main 2>/dev/null
REMOTE_COMMIT=$(git rev-parse --short origin/main 2>/dev/null)
echo "Último commit no GitHub: $REMOTE_COMMIT"
echo ""

# 4. Comparar commits
echo "⚖️  4. COMPARAÇÃO"
echo "-----------------------------------"
if [ "$COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "✅ Servidor está ATUALIZADO com GitHub"
else
    echo "❌ Servidor está DESATUALIZADO!"
    echo "   Commits atrás: $(git rev-list --count HEAD..origin/main 2>/dev/null || echo 'N/A')"
    echo ""
    echo "🔧 SOLUÇÃO: Execute 'git pull origin main'"
fi
echo ""

# 5. Verificar arquivos de recuperação de senha
echo "🔐 5. VERIFICANDO ARQUIVOS DE RECUPERAÇÃO"
echo "-----------------------------------"
FILES_NEEDED=(
    "src/pages/ForgotPassword.jsx"
    "src/pages/ResetPassword.jsx"
    "src/App.jsx"
)

for file in "${FILES_NEEDED[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
        
        # Verificar se ForgotPassword tem conteúdo
        if [ "$file" = "src/pages/ForgotPassword.jsx" ]; then
            LINES=$(wc -l < "$file")
            if [ "$LINES" -gt 100 ]; then
                echo "   ✅ Arquivo tem conteúdo ($LINES linhas)"
            else
                echo "   ⚠️  Arquivo parece incompleto ($LINES linhas)"
            fi
        fi
    else
        echo "❌ $file NÃO EXISTE"
    fi
done
echo ""

# 6. Verificar se Login.jsx tem o link "Esqueceu a senha?"
echo "🔗 6. VERIFICANDO LINK NO LOGIN"
echo "-----------------------------------"
if [ -f "src/pages/Login.jsx" ]; then
    if grep -q "forgot-password" src/pages/Login.jsx; then
        echo "✅ Login.jsx TEM o link 'Esqueceu a senha?'"
    else
        echo "❌ Login.jsx NÃO TEM o link 'Esqueceu a senha?'"
    fi
    
    if grep -q "Esqueceu a senha" src/pages/Login.jsx; then
        echo "✅ Texto 'Esqueceu a senha' encontrado"
    else
        echo "❌ Texto 'Esqueceu a senha' NÃO encontrado"
    fi
else
    echo "❌ Login.jsx não encontrado"
fi
echo ""

# 7. Verificar rotas no App.jsx
echo "🛣️  7. VERIFICANDO ROTAS NO APP.JSX"
echo "-----------------------------------"
if [ -f "src/App.jsx" ]; then
    if grep -q "forgot-password" src/App.jsx; then
        echo "✅ Rota /forgot-password encontrada"
    else
        echo "❌ Rota /forgot-password NÃO encontrada"
    fi
    
    if grep -q "reset-password" src/App.jsx; then
        echo "✅ Rota /reset-password encontrada"
    else
        echo "❌ Rota /reset-password NÃO encontrada"
    fi
else
    echo "❌ App.jsx não encontrado"
fi
echo ""

# 8. Verificar pasta dist (build)
echo "📦 8. VERIFICANDO BUILD (DIST)"
echo "-----------------------------------"
if [ -d "dist" ]; then
    echo "✅ Pasta dist existe"
    
    # Verificar data do último build
    DIST_DATE=$(stat -c %y dist/index.html 2>/dev/null | cut -d' ' -f1,2)
    echo "   Último build: $DIST_DATE"
    
    # Verificar tamanho
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo "   Tamanho: $DIST_SIZE"
    
    # Verificar se tem arquivos JS
    JS_COUNT=$(find dist -name "*.js" 2>/dev/null | wc -l)
    echo "   Arquivos JS: $JS_COUNT"
else
    echo "❌ Pasta dist NÃO EXISTE"
    echo "   🔧 SOLUÇÃO: Execute 'npm run build'"
fi
echo ""

# 9. Verificar Nginx
echo "🌐 9. VERIFICANDO NGINX"
echo "-----------------------------------"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx está rodando"
else
    echo "❌ Nginx NÃO está rodando"
    echo "   🔧 SOLUÇÃO: Execute 'systemctl start nginx'"
fi

# Verificar config do Nginx
if [ -f "/etc/nginx/sites-available/cashback" ]; then
    echo "✅ Arquivo de configuração existe"
else
    echo "⚠️  Arquivo de configuração não encontrado"
fi
echo ""

# 10. Verificar dependências
echo "📚 10. VERIFICANDO NODE_MODULES"
echo "-----------------------------------"
if [ -d "node_modules" ]; then
    echo "✅ node_modules existe"
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l)
    echo "   Pacotes instalados: $MODULE_COUNT"
else
    echo "❌ node_modules NÃO EXISTE"
    echo "   🔧 SOLUÇÃO: Execute 'npm install'"
fi
echo ""

# RESUMO
echo "================================"
echo "📊 RESUMO DO DIAGNÓSTICO"
echo "================================"
echo ""

# Determinar status geral
ISSUES=0

if [ "$COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "❌ Código desatualizado (precisa git pull)"
    ISSUES=$((ISSUES+1))
fi

if ! [ -f "src/pages/ForgotPassword.jsx" ]; then
    echo "❌ Arquivo ForgotPassword.jsx ausente"
    ISSUES=$((ISSUES+1))
fi

if ! grep -q "forgot-password" src/pages/Login.jsx 2>/dev/null; then
    echo "❌ Link de recuperação ausente no Login"
    ISSUES=$((ISSUES+1))
fi

if ! [ -d "dist" ]; then
    echo "❌ Build não foi feito"
    ISSUES=$((ISSUES+1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ Tudo parece OK!"
    echo ""
    echo "🤔 Se o site ainda não mostra a recuperação:"
    echo "   1. Limpe o cache do navegador (Cmd+Shift+R)"
    echo "   2. Abra em aba anônima"
    echo "   3. Verifique a URL: https://localcashback.com.br/login"
else
    echo ""
    echo "🔧 CORREÇÕES NECESSÁRIAS:"
    echo ""
    echo "Execute os comandos abaixo:"
    echo ""
    echo "cd /var/www/cashback/cashback-system"
    if [ "$COMMIT" != "$REMOTE_COMMIT" ]; then
        echo "git pull origin main"
    fi
    if ! [ -d "node_modules" ]; then
        echo "npm install"
    fi
    echo "npm run build"
    echo "systemctl reload nginx"
fi

echo ""
echo "================================"
echo "✅ Diagnóstico concluído!"
echo "================================"
