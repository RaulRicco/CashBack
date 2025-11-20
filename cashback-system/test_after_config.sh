#!/bin/bash

echo ""
echo "⏳ Aguardando 10 segundos para configuração propagar..."
sleep 10

source .env

EMAIL="raul.vendasbsb@gmail.com"

echo ""
echo "🔄 Testando recuperação de senha novamente..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE=$(curl -s -X POST \
  "${VITE_SUPABASE_URL}/auth/v1/recover" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"options\": {
      \"redirectTo\": \"http://31.97.167.88:8080/reset-password\"
    }
  }")

echo "📨 Resposta:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ Ainda com erro. Possíveis causas:"
  echo "   1. Aguardar mais 1-2 minutos"
  echo "   2. Verificar se salvou as configurações"
  echo "   3. Verificar logs do Supabase Dashboard"
else
  echo "✅ SUCESSO! Email de recuperação enviado!"
  echo ""
  echo "📬 Próximos passos:"
  echo "   1. Verifique o email: $EMAIL"
  echo "   2. Clique no link de recuperação"
  echo "   3. Defina uma nova senha"
fi
