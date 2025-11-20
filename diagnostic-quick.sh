#!/bin/bash

# 🔍 Diagnóstico rápido para verificar estado atual do OneSignal no servidor de produção

echo "============================================================"
echo "🔍 DIAGNÓSTICO RÁPIDO - OneSignal REST API Key"
echo "============================================================"
echo ""

cd /var/www/cashback/cashback-system || { echo "❌ Diretório não encontrado"; exit 1; }

echo "1️⃣  Verificando .env atual:"
echo "-----------------------------------------------------------"
grep "ONESIGNAL" .env 2>/dev/null || echo "❌ Arquivo .env não encontrado"
echo ""

echo "2️⃣  Verificando bundle atual:"
echo "-----------------------------------------------------------"
if [ -f dist/assets/index-*.js ]; then
    ls -lh dist/assets/index-*.js
    echo ""
    
    NEW_KEY="vok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici"
    if grep -q "$NEW_KEY" dist/assets/index-*.js; then
        echo "✅ CHAVE NOVA encontrada no bundle!"
    else
        echo "❌ CHAVE NOVA NÃO encontrada no bundle!"
        echo ""
        echo "Chave encontrada no bundle:"
        grep -o "os_v2_app_4kzpwhkkk[^\"']*" dist/assets/index-*.js | head -1
    fi
else
    echo "❌ Bundle não encontrado (dist/assets/index-*.js)"
fi
echo ""

echo "3️⃣  Testando chave do .env via curl:"
echo "-----------------------------------------------------------"
FULL_KEY=$(grep "VITE_ONESIGNAL_REST_API_KEY" .env | cut -d '=' -f2)
APP_ID=$(grep "VITE_ONESIGNAL_APP_ID" .env | cut -d '=' -f2)

if [ -n "$FULL_KEY" ] && [ -n "$APP_ID" ]; then
    RESPONSE=$(curl -s -X POST https://onesignal.com/api/v1/notifications \
      -H "Content-Type: application/json" \
      -H "Authorization: Basic $FULL_KEY" \
      -d "{\"app_id\": \"$APP_ID\", \"included_segments\": [\"Subscribed Users\"], \"contents\": {\"en\": \"Teste\"}}")
    
    if echo "$RESPONSE" | grep -q "Access denied"; then
        echo "❌ Chave do .env é INVÁLIDA (Access denied)"
    elif echo "$RESPONSE" | grep -q "All included players are not subscribed"; then
        echo "✅ Chave do .env é VÁLIDA (sem usuários inscritos ainda)"
    elif echo "$RESPONSE" | grep -q "id"; then
        echo "✅ Chave do .env é VÁLIDA (notificação enviada)"
    else
        echo "⚠️  Resposta inesperada: $RESPONSE"
    fi
else
    echo "❌ Não foi possível ler as variáveis do .env"
fi
echo ""

echo "============================================================"
echo "📊 RESUMO:"
echo "============================================================"
echo "Se o .env tem chave nova MAS o bundle tem chave antiga,"
echo "é necessário executar o script de rebuild:"
echo ""
echo "bash fix-onesignal-final.sh"
echo "============================================================"
