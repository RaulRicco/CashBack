#!/bin/bash

# Ler variáveis do .env
source .env

EMAIL="raul.vendasbsb@gmail.com"
PASSWORD="Cashback2025!"

echo ""
echo "🔧 Criando usuário no Supabase Auth..."
echo "📧 Email: $EMAIL"
echo "🔑 Senha temporária: $PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Tentar criar usuário via API do Supabase
RESPONSE=$(curl -s -X POST \
  "${VITE_SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\"
  }")

echo "📨 Resposta do servidor:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Verificar se contém erro "already registered"
if echo "$RESPONSE" | grep -q "already registered"; then
  echo ""
  echo "✅ Usuário já existe no Supabase Auth!"
  echo "📝 Você pode usar a senha temporária para login: $PASSWORD"
  echo ""
  echo "🔄 Tentando enviar email de recuperação de senha..."
  
  RESET_RESPONSE=$(curl -s -X POST \
    "${VITE_SUPABASE_URL}/auth/v1/recover" \
    -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${EMAIL}\"
    }")
  
  echo "📨 Resposta do reset:"
  echo "$RESET_RESPONSE" | jq '.' 2>/dev/null || echo "$RESET_RESPONSE"
  
  if echo "$RESET_RESPONSE" | grep -q "error"; then
    echo ""
    echo "⚠️  PROBLEMA: O Supabase não consegue enviar emails!"
    echo "💡 SOLUÇÃO TEMPORÁRIA: Use a senha acima para fazer login"
    echo "   Email: $EMAIL"
    echo "   Senha: $PASSWORD"
  fi
elif echo "$RESPONSE" | grep -q "id"; then
  echo ""
  echo "✅ Usuário criado com sucesso!"
  echo "📧 Email: $EMAIL"
  echo "🔑 Senha: $PASSWORD"
  echo ""
  echo "⚠️  IMPORTANTE: Use essas credenciais para fazer login!"
else
  echo ""
  echo "❌ Erro ao criar usuário"
fi
