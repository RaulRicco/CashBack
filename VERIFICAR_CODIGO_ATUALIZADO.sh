#!/bin/bash

echo "============================================"
echo "🔍 VERIFICANDO SE O CÓDIGO ESTÁ ATUALIZADO"
echo "============================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "src/pages/WhiteLabelSettings.jsx" ]; then
    echo "❌ ERRO: Execute este script da pasta cashback-system"
    exit 1
fi

# Verificar se o contentType está presente
if grep -q "contentType: file.type" src/pages/WhiteLabelSettings.jsx; then
    echo "✅ CÓDIGO ATUALIZADO: contentType encontrado!"
    echo ""
    echo "📝 Código atual:"
    grep -A 3 -B 3 "contentType: file.type" src/pages/WhiteLabelSettings.jsx
    echo ""
    echo "============================================"
    echo "✅ TUDO CERTO! Você pode fazer o upload agora"
    echo "============================================"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. Execute o SQL de limpeza no Supabase"
    echo "2. Inicie o servidor: npm run dev"
    echo "3. Abra em ABA ANÔNIMA: Ctrl+Shift+N"
    echo "4. Acesse: http://localhost:5173/dashboard/white-label"
    echo "5. Faça o upload do logo"
    echo ""
else
    echo "❌ CÓDIGO DESATUALIZADO: contentType NÃO encontrado!"
    echo ""
    echo "🔧 Execute estes comandos para atualizar:"
    echo "   git pull origin genspark_ai_developer"
    echo "   npm run dev"
    echo ""
    exit 1
fi
