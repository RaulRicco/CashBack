#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3001}"
BASE="http://localhost:${PORT}"

function json() { jq -r '.'; }

echo "[Diag] Verificando configuração OneSignal..."
curl -s "${BASE}/api/onesignal/config" | json

echo "[Diag] Validando credenciais com OneSignal (sem envio)..."
curl -s "${BASE}/api/onesignal/validate" | json

echo "[Diag] Dry-run: envio para todos (não dispara notificação)"
curl -s -X POST "${BASE}/api/onesignal/send-to-all" \
  -H 'Content-Type: application/json' \
  -d '{
    "dryRun": true,
    "notification": {
      "title": "Teste CashBack",
      "message": "Dry-run OneSignal",
      "url": "https://localcashback.com.br"
    }
  }' | json

echo "[Diag] Dry-run: envio para usuário (não dispara notificação)"
curl -s -X POST "${BASE}/api/onesignal/send-to-user" \
  -H 'Content-Type: application/json' \
  -d '{
    "dryRun": true,
    "userId": "USER_ID_EXEMPLO",
    "notification": {
      "title": "Teste CashBack",
      "message": "Dry-run para usuário",
      "url": "https://localcashback.com.br"
    }
  }' | json

cat <<EOF

Pronto. Se "configured:true" e "validated:true" aparecerem,
as credenciais estão corretas. Os payloads de dry-run mostram
como seriam enviados sem acionar a API.

Para executar:
  PORT=3001 bash cashback-system/scripts/onesignal_diagnostics.sh
(assumindo o proxy rodando com: node cashback-system/integration-proxy.js)
EOF
