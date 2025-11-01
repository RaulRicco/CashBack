#!/bin/bash

echo "🔍 TESTE RÁPIDO - Por que não funciona?"
echo ""

# Teste 1: Proxy direto
echo "✅ Teste 1: Proxy direto (localhost:3001)"
curl -s http://localhost:3001/api/rdstation/test \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"924c4bde788c0710b77bb3a10127c850"}' \
  | grep -o '"success":[^,]*' | head -1
echo ""

# Teste 2: Através do nginx (domínio)
echo "🌐 Teste 2: Através do nginx (https://localcashback.com.br/api/...)"
curl -k -s https://localcashback.com.br/api/rdstation/test \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"924c4bde788c0710b77bb3a10127c850"}' \
  | grep -o '"success":[^,]*' | head -1
echo ""

# Aguardar 2 segundos
sleep 2

# Ver se algo chegou no proxy
echo "📋 Últimas 5 linhas do log do proxy:"
pm2 logs integration-proxy --lines 5 --nostream 2>/dev/null | tail -5
echo ""

echo "═══════════════════════════════════════════════════"
echo "🔍 RESULTADO:"
echo "   - Se Teste 1 deu success:true → Proxy funciona ✅"
echo "   - Se Teste 2 deu success:false ou erro → Nginx não está roteando ❌"
echo "   - Se logs estão vazios → Requisições não chegam ao proxy ❌"
echo "═══════════════════════════════════════════════════"
