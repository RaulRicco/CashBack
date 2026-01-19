#!/bin/bash

echo "🧪 TESTE COMPLETO MAILCHIMP - TODOS OS DOMÍNIOS"
echo "================================================"
echo ""

# Teste 1: localcashback.com.br
echo "1️⃣ Testando localcashback.com.br..."
curl -X POST https://localcashback.com.br/api/mailchimp/sync \
  -H "Content-Type: application/json" \
  -d '{"customer":{"email":"teste1@localcashback.com.br","name":"Teste 1","phone":"11111111111"}}' \
  -w "\nStatus: %{http_code} | Tempo: %{time_total}s\n" \
  -s | head -1
echo ""

# Teste 2: cashback.raulricco.com.br
echo "2️⃣ Testando cashback.raulricco.com.br..."
curl -X POST https://cashback.raulricco.com.br/api/mailchimp/sync \
  -H "Content-Type: application/json" \
  -d '{"customer":{"email":"teste2@localcashback.com.br","name":"Teste 2","phone":"22222222222"}}' \
  -w "\nStatus: %{http_code} | Tempo: %{time_total}s\n" \
  -s | head -1
echo ""

# Teste 3: API Health
echo "3️⃣ Testando API Health..."
curl -s https://localcashback.com.br/api/health | head -1
echo ""

echo "✅ TESTE COMPLETO FINALIZADO!"
