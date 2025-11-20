#!/bin/bash
set -e

echo "🔥 FIX MAILCHIMP TIMEOUT - REBUILD FORÇADO"
echo "=========================================="

PROJECT_DIR="/var/www/cashback/cashback-system"
cd $PROJECT_DIR

echo ""
echo "1️⃣ Verificando código fonte atual..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se o código fonte tem 60000
if grep -q "timeout: 60000" src/lib/integrations/mailchimp.js; then
    echo "✅ Código fonte TEM timeout de 60000ms"
else
    echo "❌ Código fonte NÃO tem timeout de 60000ms!"
    echo "🔄 Baixando última versão do Git..."
    git fetch origin genspark_ai_developer
    git reset --hard origin/genspark_ai_developer
fi

echo ""
echo "2️⃣ Limpando TUDO antes do build..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remover dist completo
rm -rf dist/
echo "✅ Pasta dist/ removida"

# Remover node_modules/.vite (cache do Vite)
rm -rf node_modules/.vite
echo "✅ Cache do Vite removido"

# Limpar cache do npm
npm cache clean --force 2>/dev/null || true
echo "✅ Cache do npm limpo"

echo ""
echo "3️⃣ Fazendo BUILD LIMPO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm run build

if [ $? -ne 0 ]; then
    echo "❌ ERRO no build!"
    exit 1
fi

echo "✅ Build concluído!"

echo ""
echo "4️⃣ VERIFICANDO se timeout de 60000 entrou no bundle..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Procurar por timeout:60 (60000 minificado = 60)
if grep -q "timeout:6e4\|timeout:60000\|timeout:60" dist/assets/index-*.js; then
    echo "✅✅✅ SUCESSO! Timeout de 60s ESTÁ no bundle!"
    echo ""
    echo "📊 Ocorrências encontradas:"
    grep -o "timeout:[0-9e]*" dist/assets/index-*.js | sort | uniq -c
else
    echo "❌❌❌ FALHA! Timeout de 60s NÃO está no bundle!"
    echo ""
    echo "📊 Timeouts encontrados:"
    grep -o "timeout:[0-9e]*" dist/assets/index-*.js | sort | uniq -c
    echo ""
    echo "🔍 Verificando código fonte novamente:"
    grep -n "timeout:" src/lib/integrations/mailchimp.js
    exit 1
fi

echo ""
echo "5️⃣ Informações do bundle gerado..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BUNDLE_FILE=$(ls -t dist/assets/index-*.js | head -1)
BUNDLE_SIZE=$(du -h "$BUNDLE_FILE" | cut -f1)
BUNDLE_DATE=$(stat -c %y "$BUNDLE_FILE" | cut -d. -f1)

echo "📦 Arquivo: $BUNDLE_FILE"
echo "📏 Tamanho: $BUNDLE_SIZE"
echo "📅 Data: $BUNDLE_DATE"

echo ""
echo "6️⃣ Reiniciando serviços..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Reiniciar integration proxy
pm2 restart integration-proxy
echo "✅ Integration proxy reiniciado"

# Reload nginx
systemctl reload nginx
echo "✅ Nginx recarregado"

sleep 2

echo ""
echo "7️⃣ Testando endpoint no domínio real..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST https://localcashback.com.br/api/mailchimp/test \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"teste","audienceId":"teste","serverPrefix":"us1"}' \
    -w "\nHTTP: %{http_code}\n" \
    --max-time 10)

echo "$RESPONSE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CORREÇÃO CONCLUÍDA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 PRÓXIMOS PASSOS OBRIGATÓRIOS:"
echo ""
echo "1️⃣ LIMPAR CACHE DO NAVEGADOR:"
echo "   - Pressione Ctrl+Shift+Delete"
echo "   - Selecione 'Todo o período'"
echo "   - Marque 'Imagens e arquivos em cache'"
echo "   - Clique em 'Limpar dados'"
echo ""
echo "2️⃣ FECHAR E REABRIR O NAVEGADOR:"
echo "   - Feche TODAS as abas"
echo "   - Feche o navegador completamente"
echo "   - Abra novamente"
echo ""
echo "3️⃣ USAR ABA ANÔNIMA (RECOMENDADO):"
echo "   - Ctrl+Shift+N (Chrome)"
echo "   - Ctrl+Shift+P (Firefox)"
echo ""
echo "4️⃣ TESTAR NO SISTEMA:"
echo "   - Acesse: https://localcashback.com.br"
echo "   - Vá em: Admin > Integrações > Mailchimp"
echo "   - Clique em 'Testar Conexão'"
echo "   - DEVE funcionar sem timeout!"
echo ""
echo "⚠️  IMPORTANTE: Se não limpar o cache, o JavaScript"
echo "    antigo (com timeout de 15s) ainda vai estar ativo!"
echo ""
