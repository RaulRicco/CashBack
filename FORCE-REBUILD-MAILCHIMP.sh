#!/bin/bash
set -e

echo "🔥 FORCE REBUILD MAILCHIMP - SEM CACHE"
echo "======================================"

cd /var/www/cashback/cashback-system

echo ""
echo "1️⃣ RESETANDO código para versão mais recente..."
git fetch origin genspark_ai_developer
git reset --hard origin/genspark_ai_developer

echo ""
echo "2️⃣ Verificando código fonte..."
echo "---"
grep -A 3 "const proxyUrl" src/lib/integrations/mailchimp.js | head -6
echo "---"

if grep -q ": '';" src/lib/integrations/mailchimp.js; then
    echo "✅ Código fonte tem proxyUrl vazio (correto para nginx)"
else
    echo "❌ Código fonte AINDA tem :3001 ou outra URL!"
    echo "Mostrando o que tem:"
    grep "proxyUrl" src/lib/integrations/mailchimp.js
    exit 1
fi

echo ""
echo "3️⃣ LIMPANDO TODO cache e dist..."
rm -rf dist/
rm -rf node_modules/.vite
rm -rf node_modules/.cache
npm cache clean --force

echo ""
echo "4️⃣ Adicionando timestamp para forçar novo hash..."
TIMESTAMP=$(date +%s)
echo "// Build timestamp: $TIMESTAMP" >> src/main.jsx

echo ""
echo "5️⃣ BUILD COMPLETO..."
npm run build

echo ""
echo "6️⃣ Verificando bundle gerado..."
BUNDLE=$(ls -t dist/assets/index-*.js | head -1)
echo "Bundle: $BUNDLE"
echo "Data: $(stat -c %y "$BUNDLE")"

echo ""
echo "Verificando se tem :3001 no bundle (NÃO DEVE TER!):"
if grep -q ":3001" "$BUNDLE"; then
    echo "❌❌❌ AINDA TEM :3001 NO BUNDLE!"
    grep -o '.*:3001.*' "$BUNDLE" | head -3
    exit 1
else
    echo "✅✅✅ NÃO TEM :3001! Bundle correto!"
fi

echo ""
echo "Verificando se tem proxyUrl vazio:"
if grep -q 'proxyUrl=""' "$BUNDLE" || grep -q "proxyUrl=''" "$BUNDLE" || grep -q 'n=""' "$BUNDLE"; then
    echo "✅✅✅ TEM proxyUrl vazio! Correto!"
else
    echo "⚠️  Procurando padrão de proxyUrl no bundle:"
    grep -o 'localhost.*mailchimp' "$BUNDLE" | head -3
fi

echo ""
echo "7️⃣ Removendo timestamp adicionado..."
sed -i '/Build timestamp:/d' src/main.jsx

echo ""
echo "8️⃣ Restart de serviços..."
pm2 restart integration-proxy
systemctl reload nginx
sleep 3

echo ""
echo "9️⃣ TESTE FINAL..."
echo "URL: https://localcashback.com.br/api/mailchimp/test"

RESPONSE=$(curl -s -X POST https://localcashback.com.br/api/mailchimp/test \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"teste","audienceId":"teste","serverPrefix":"us1"}' \
    -w "\nHTTP: %{http_code}\n" \
    --max-time 20)

echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "HTTP: 200"; then
    echo ""
    echo "✅✅✅ SERVIDOR OK!"
else
    echo ""
    echo "❌ Servidor não respondeu HTTP 200"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ REBUILD COMPLETO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔴🔴🔴 ATENÇÃO CRÍTICA! 🔴🔴🔴"
echo ""
echo "O bundle foi recriado, mas o navegador AINDA pode ter"
echo "o arquivo antigo em cache!"
echo ""
echo "VOCÊ PRECISA:"
echo ""
echo "1️⃣ FECHAR o navegador COMPLETAMENTE"
echo "2️⃣ LIMPAR cache: Ctrl+Shift+Delete → Todo período"
echo "3️⃣ REABRIR navegador"
echo "4️⃣ OU usar aba anônima: Ctrl+Shift+N"
echo ""
echo "Se não fizer isso, o JavaScript antigo (com :3001)"
echo "ainda vai estar ativo no navegador!"
echo ""
echo "Bundle novo: $BUNDLE"
echo ""
