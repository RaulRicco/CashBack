#!/bin/bash

echo "=========================================="
echo "🔍 DIAGNÓSTICO ONESIGNAL - CHAVE REST API"
echo "=========================================="
echo ""

cd /var/www/cashback/cashback-system

# 1. Verificar se o arquivo .env existe e tem a chave correta
echo "1️⃣ Verificando arquivo .env..."
if [ -f .env ]; then
    echo "✅ Arquivo .env existe"
    echo ""
    echo "📄 Conteúdo das variáveis OneSignal no .env:"
    grep ONESIGNAL .env
    echo ""
else
    echo "❌ ERRO: Arquivo .env NÃO EXISTE!"
    echo ""
fi

# 2. Verificar a chave NOVA (últimos caracteres: ...nuici)
echo "2️⃣ Verificando se .env contém a chave NOVA (termina em 'nuici')..."
if grep -q "nuici" .env 2>/dev/null; then
    echo "✅ Chave NOVA encontrada no .env!"
else
    echo "❌ PROBLEMA: Chave NOVA NÃO está no .env!"
    echo "   A chave deve terminar em: ...nuici"
fi
echo ""

# 3. Verificar se o diretório dist existe
echo "3️⃣ Verificando diretório dist (build)..."
if [ -d dist ]; then
    echo "✅ Diretório dist existe"
    echo ""
    echo "📁 Data da última modificação do dist:"
    ls -ld dist
    echo ""
    echo "📄 Arquivos JavaScript compilados:"
    ls -lh dist/assets/index-*.js 2>/dev/null || echo "❌ Nenhum arquivo index-*.js encontrado!"
    echo ""
else
    echo "❌ ERRO: Diretório dist NÃO EXISTE! Build nunca foi executado."
    echo ""
fi

# 4. Verificar se a chave NOVA está no JavaScript compilado
echo "4️⃣ Verificando se a chave NOVA está no JavaScript compilado..."
if [ -d dist ]; then
    if grep -q "nuici" dist/assets/index-*.js 2>/dev/null; then
        echo "✅ SUCESSO! Chave NOVA encontrada no JavaScript compilado!"
        echo ""
        echo "🔍 Contexto onde aparece (primeiros 200 caracteres):"
        grep -o ".{0,100}nuici.{0,100}" dist/assets/index-*.js | head -1
        echo ""
    else
        echo "❌ PROBLEMA ENCONTRADO: Chave NOVA NÃO está no JavaScript!"
        echo ""
        echo "🔍 Verificando se tem alguma chave antiga (procurando padrão 'os_v2_app')..."
        if grep -o "os_v2_app_[a-z0-9]\{100,200\}" dist/assets/index-*.js 2>/dev/null | head -1; then
            echo "⚠️  Chave ANTIGA encontrada acima! O build está desatualizado."
        else
            echo "⚠️  Nenhuma chave OneSignal encontrada no JavaScript."
        fi
        echo ""
    fi
else
    echo "⏭️  Pulando (dist não existe)"
    echo ""
fi

# 5. Verificar cache do Vite
echo "5️⃣ Verificando cache do Vite..."
if [ -d node_modules/.vite ]; then
    echo "⚠️  Cache do Vite existe (pode estar causando problema)"
    ls -ld node_modules/.vite
else
    echo "✅ Cache do Vite não existe (ok)"
fi
echo ""

# 6. Verificar status do git
echo "6️⃣ Verificando status do Git..."
echo "📌 Branch atual:"
git branch --show-current
echo ""
echo "📌 Último commit:"
git log -1 --oneline
echo ""
echo "📌 Status do repositório:"
git status --short
echo ""

# 7. Verificar serviços rodando
echo "7️⃣ Verificando serviços..."
echo "🔄 PM2 status:"
pm2 list | grep integration-proxy
echo ""
echo "🌐 Nginx status:"
systemctl is-active nginx
echo ""

echo "=========================================="
echo "📋 RESUMO DO DIAGNÓSTICO"
echo "=========================================="
echo ""

# Análise automática
PROBLEMA_ENCONTRADO=0

if ! grep -q "nuici" .env 2>/dev/null; then
    echo "❌ PROBLEMA 1: .env não tem a chave NOVA"
    PROBLEMA_ENCONTRADO=1
fi

if ! grep -q "nuici" dist/assets/index-*.js 2>/dev/null; then
    echo "❌ PROBLEMA 2: JavaScript compilado não tem a chave NOVA"
    PROBLEMA_ENCONTRADO=1
fi

if [ -d node_modules/.vite ]; then
    echo "⚠️  ATENÇÃO: Cache do Vite pode estar interferindo"
fi

echo ""

if [ $PROBLEMA_ENCONTRADO -eq 0 ]; then
    echo "✅ Tudo parece correto! A chave NOVA está no .env e no JavaScript."
    echo "   Se ainda está com erro, pode ser cache do navegador."
    echo ""
    echo "💡 SOLUÇÃO: Limpar cache do navegador (Ctrl+Shift+Delete)"
else
    echo "🔧 AÇÃO NECESSÁRIA: Executar rebuild completo (próximo passo)"
fi

echo ""
echo "=========================================="
