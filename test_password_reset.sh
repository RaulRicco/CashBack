#!/bin/bash

source .env

EMAIL="raul.vendasbsb@gmail.com"

echo ""
echo "🔍 Testando fluxo de recuperação de senha..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Testar com redirect_to do DEV
echo "📧 Enviando email de recuperação (DEV)..."
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

echo "📨 Resposta do servidor:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar se tem erro específico
if echo "$RESPONSE" | grep -q "error"; then
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.msg // .message // .error_description' 2>/dev/null)
  ERROR_CODE=$(echo "$RESPONSE" | jq -r '.error_code // .error' 2>/dev/null)
  
  echo "❌ ERRO DETECTADO:"
  echo "   Código: $ERROR_CODE"
  echo "   Mensagem: $ERROR_MSG"
  echo ""
  
  # Diagnóstico baseado no erro
  case "$ERROR_CODE" in
    "unexpected_failure")
      echo "💡 Possíveis causas:"
      echo "   1. Email não confirmado no Supabase Auth"
      echo "   2. Redirect URL não autorizada no Supabase"
      echo "   3. Problema com SMTP Resend (API key inválida)"
      echo "   4. Rate limit atingido"
      ;;
    "email_not_confirmed")
      echo "💡 Solução: Confirmar email do usuário no Supabase Dashboard"
      ;;
    *)
      echo "💡 Erro desconhecido. Verificar logs do Supabase."
      ;;
  esac
  echo ""
  
  # Verificar configuração de redirect URLs
  echo "🔧 Verificando configuração de Redirect URLs..."
  echo "   URL atual do DEV: http://31.97.167.88:8080/reset-password"
  echo ""
  echo "⚠️  AÇÃO NECESSÁRIA:"
  echo "   1. Ir em Supabase Dashboard > Authentication > URL Configuration"
  echo "   2. Adicionar em 'Redirect URLs':"
  echo "      - http://31.97.167.88:8080/**"
  echo "      - http://localhost:8080/**"
  echo "      - https://seu-dominio.com/**"
else
  echo "✅ Email de recuperação enviado com sucesso!"
  echo "📬 Verifique a caixa de entrada de: $EMAIL"
fi
