#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 FIX MAILCHIMP - SOLUÇÃO DEFINITIVA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /var/www/cashback/cashback-system

echo ""
echo "1️⃣ ATUALIZANDO código (com vite.config que força novo nome)..."
git fetch origin genspark_ai_developer
git reset --hard origin/genspark_ai_developer
echo "✅ Código atualizado"

echo ""
echo "2️⃣ VERIFICANDO código fonte..."
echo "════════════════════════════════════════════════════════"
grep -A 4 "const proxyUrl" src/lib/integrations/mailchimp.js | head -6
echo "════════════════════════════════════════════════════════"

if grep -q ": '';" src/lib/integrations/mailchimp.js; then
    echo "✅ Código TEM proxyUrl vazio (vai usar nginx)"
else
    echo "❌ ERRO: Código NÃO tem proxyUrl vazio!"
    echo "Tem isso:"
    grep "const proxyUrl" src/lib/integrations/mailchimp.js
    exit 1
fi

echo ""
echo "3️⃣ REMOVENDO bundles antigos..."
rm -rf dist/
echo "✅ dist/ removido"

echo ""
echo "4️⃣ LIMPANDO cache do Vite e npm..."
rm -rf node_modules/.vite node_modules/.cache
npm cache clean --force 2>/dev/null || true
echo "✅ Cache limpo"

echo ""
echo "5️⃣ BUILD (vai gerar nome único com timestamp)..."
npm run build 2>&1 | tail -10

echo ""
echo "6️⃣ VERIFICANDO bundle gerado..."
echo "════════════════════════════════════════════════════════"
BUNDLE=$(ls -t dist/assets/index-*.js | head -1)
BUNDLE_NAME=$(basename "$BUNDLE")
BUNDLE_SIZE=$(du -h "$BUNDLE" | cut -f1)
BUNDLE_DATE=$(date -r "$BUNDLE" "+%Y-%m-%d %H:%M:%S")

echo "📦 Bundle: $BUNDLE_NAME"
echo "📏 Tamanho: $BUNDLE_SIZE"
echo "📅 Criado: $BUNDLE_DATE"
echo "════════════════════════════════════════════════════════"

echo ""
echo "7️⃣ TESTANDO se bundle tem :3001 (NÃO DEVE TER!)..."
if grep -q ":3001" "$BUNDLE"; then
    echo "❌❌❌ ERRO! Bundle AINDA tem :3001!"
    echo "Mostrando onde está:"
    grep -o '.*:3001.*' "$BUNDLE" | head -3
    exit 1
else
    echo "✅✅✅ Bundle NÃO tem :3001! Perfeito!"
fi

echo ""
echo "8️⃣ VERIFICANDO configuração do nginx..."
if grep -q "location /api/" /etc/nginx/sites-enabled/*; then
    echo "✅ Nginx tem location /api/"
    grep -A 3 "location /api/" /etc/nginx/sites-enabled/* | head -7
else
    echo "❌ Nginx NÃO tem location /api/!"
    exit 1
fi

echo ""
echo "9️⃣ VERIFICANDO integration-proxy..."
if pm2 list | grep -q "integration-proxy.*online"; then
    echo "✅ Proxy está online"
else
    echo "⚠️  Proxy offline, iniciando..."
    pm2 restart integration-proxy || pm2 start integration-proxy.js --name integration-proxy
    sleep 2
fi

# Testar proxy local
HEALTH=$(curl -s http://localhost:3001/health 2>&1)
if echo "$HEALTH" | grep -q "status"; then
    echo "✅ Proxy local OK: $HEALTH"
else
    echo "❌ Proxy local não responde!"
    echo "Resposta: $HEALTH"
    exit 1
fi

echo ""
echo "🔟 REINICIANDO tudo..."
pm2 restart integration-proxy
systemctl reload nginx
sleep 3
echo "✅ Serviços reiniciados"

echo ""
echo "1️⃣1️⃣ TESTE FINAL - Endpoint via nginx..."
echo "════════════════════════════════════════════════════════"
echo "URL: https://localcashback.com.br/api/mailchimp/test"
echo ""

RESPONSE=$(curl -s -X POST https://localcashback.com.br/api/mailchimp/test \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"teste123","audienceId":"teste123","serverPrefix":"us1"}' \
    -w "\nHTTP_CODE: %{http_code}\nTIME_TOTAL: %{time_total}s\n" \
    --max-time 20 2>&1)

echo "$RESPONSE"
echo "════════════════════════════════════════════════════════"

if echo "$RESPONSE" | grep -q "HTTP_CODE: 200"; then
    echo ""
    echo "✅✅✅ SERVIDOR FUNCIONANDO PERFEITAMENTE!"
elif echo "$RESPONSE" | grep -q "HTTP_CODE: 404"; then
    echo ""
    echo "❌ ERRO 404 - Nginx não redirecionou"
    exit 1
elif echo "$RESPONSE" | grep -q "HTTP_CODE: 502"; then
    echo ""
    echo "❌ ERRO 502 - Proxy não conectou"
    exit 1
else
    echo ""
    echo "❌ Resposta inesperada"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SERVIDOR 100% CONFIGURADO E FUNCIONANDO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 NOVO BUNDLE: $BUNDLE_NAME"
echo "📅 Criado em: $BUNDLE_DATE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔴🔴🔴 ATENÇÃO CRÍTICA - LEIA ISTO! 🔴🔴🔴"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "O servidor está funcionando, MAS o seu navegador ainda"
echo "pode estar usando o JavaScript ANTIGO em cache!"
echo ""
echo "SE CONTINUAR DANDO 'Network Error', é porque o navegador"
echo "está carregando o arquivo antigo (index-B-rBUzUo.js)"
echo "ao invés do novo (index-...-$(date +%s).js)"
echo ""
echo "SOLUÇÃO:"
echo ""
echo "════════════════════════════════════════════════════════"
echo "OPÇÃO 1 - ABA ANÔNIMA (MAIS FÁCIL):"
echo "════════════════════════════════════════════════════════"
echo ""
echo "1. Pressione: Ctrl+Shift+N (Chrome) ou Ctrl+Shift+P (Firefox)"
echo "2. Acesse: https://localcashback.com.br"
echo "3. Faça login e teste"
echo ""
echo "════════════════════════════════════════════════════════"
echo "OPÇÃO 2 - LIMPAR CACHE:"
echo "════════════════════════════════════════════════════════"
echo ""
echo "1. Pressione: Ctrl+Shift+Delete"
echo "2. Selecione: 'Todo o período' ou 'Desde sempre'"
echo "3. Marque: 'Imagens e arquivos em cache'"
echo "4. Clique: 'Limpar dados'"
echo "5. FECHE o navegador completamente"
echo "6. Reabra e teste"
echo ""
echo "════════════════════════════════════════════════════════"
echo "COMO VERIFICAR SE ESTÁ USANDO O BUNDLE NOVO:"
echo "════════════════════════════════════════════════════════"
echo ""
echo "1. Abra o site: https://localcashback.com.br"
echo "2. Pressione F12 (DevTools)"
echo "3. Vá na aba 'Network' ou 'Rede'"
echo "4. Recarregue a página (F5)"
echo "5. Procure por arquivos 'index-*.js'"
echo "6. DEVE aparecer: $BUNDLE_NAME"
echo "7. Se aparecer: index-B-rBUzUo.js = CACHE ANTIGO!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
