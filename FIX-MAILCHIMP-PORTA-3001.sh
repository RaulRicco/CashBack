#!/bin/bash
set -e

echo "🔥 FIX MAILCHIMP - REVERTER PARA CONFIGURAÇÃO QUE FUNCIONAVA"
echo "============================================================="

PROJECT_DIR="/var/www/cashback/cashback-system"
cd $PROJECT_DIR

echo ""
echo "📋 DIAGNÓSTICO DO PROBLEMA:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ Mudamos a URL de: https://localcashback.com.br:3001"
echo "❌ Para: https://localcashback.com.br/api/"
echo "❌ MAS isso QUEBROU porque a porta 3001 precisa estar acessível!"
echo ""
echo "✅ SOLUÇÃO: Reverter para configuração ORIGINAL que funcionava"
echo ""

echo "1️⃣ Atualizando código para versão que FUNCIONAVA..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

git fetch origin genspark_ai_developer
git pull origin genspark_ai_developer

# Verificar se código foi revertido
if grep -q "':3001'" src/lib/integrations/mailchimp.js; then
    echo "✅ Código REVERTIDO para porta :3001"
else
    echo "❌ Código NÃO foi revertido!"
    exit 1
fi

if grep -q "timeout: 15000" src/lib/integrations/mailchimp.js; then
    echo "✅ Timeout REVERTIDO para 15000ms"
else
    echo "❌ Timeout NÃO foi revertido!"
    exit 1
fi

echo ""
echo "2️⃣ Verificando se porta 3001 está aberta no firewall..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se ufw está ativo
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "3001"; then
        echo "✅ Porta 3001 já está aberta no firewall"
    else
        echo "⚠️  Abrindo porta 3001 no firewall..."
        ufw allow 3001/tcp comment "Integration Proxy (Mailchimp/RD Station)"
        echo "✅ Porta 3001 aberta!"
    fi
else
    echo "ℹ️  UFW não encontrado (firewall pode não estar ativo)"
fi

echo ""
echo "3️⃣ Verificando se integration-proxy aceita conexões externas..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se o proxy está escutando em 0.0.0.0 ou só localhost
if netstat -tlnp 2>/dev/null | grep ":3001" | grep -q "0.0.0.0"; then
    echo "✅ Proxy escutando em 0.0.0.0 (aceita conexões externas)"
elif netstat -tlnp 2>/dev/null | grep ":3001" | grep -q "127.0.0.1"; then
    echo "❌ Proxy escutando APENAS em 127.0.0.1 (localhost)"
    echo "⚠️  Precisa modificar integration-proxy.js para escutar em 0.0.0.0"
    echo ""
    echo "📝 Modificando integration-proxy.js..."
    
    # Adicionar host: '0.0.0.0' no app.listen
    if grep -q "app.listen(PORT" integration-proxy.js; then
        sed -i "s/app.listen(PORT,/app.listen(PORT, '0.0.0.0',/" integration-proxy.js
        echo "✅ Modificado para escutar em 0.0.0.0"
    fi
else
    echo "⚠️  Não foi possível verificar (proxy pode não estar rodando)"
fi

echo ""
echo "4️⃣ Build do frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf dist/
rm -rf node_modules/.vite
npm run build

echo "✅ Build concluído!"

echo ""
echo "5️⃣ Verificando bundle..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q ":3001" dist/assets/index-*.js; then
    echo "✅✅✅ Bundle TEM :3001 (configuração correta!)"
else
    echo "❌ Bundle NÃO tem :3001!"
    exit 1
fi

if grep -q "timeout:15" dist/assets/index-*.js; then
    echo "✅✅✅ Bundle TEM timeout:15 (15000ms - correto!)"
else
    echo "❌ Bundle NÃO tem timeout:15!"
    exit 1
fi

echo ""
echo "6️⃣ Reiniciando serviços..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 restart integration-proxy
systemctl reload nginx
sleep 2

echo "✅ Serviços reiniciados!"

echo ""
echo "7️⃣ Testando conexão na porta 3001..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Teste local
echo "🧪 Teste LOCAL (http://localhost:3001/health):"
curl -s http://localhost:3001/health || echo "❌ Falhou"

echo ""
echo "🧪 Teste EXTERNO (https://localcashback.com.br:3001/health):"
EXTERNAL_TEST=$(curl -s -k https://localcashback.com.br:3001/health --max-time 5 || echo "FALHOU")

if [ "$EXTERNAL_TEST" != "FALHOU" ]; then
    echo "✅✅✅ PORTA 3001 ACESSÍVEL EXTERNAMENTE!"
    echo "Resposta: $EXTERNAL_TEST"
else
    echo "❌ Porta 3001 NÃO acessível externamente"
    echo ""
    echo "🔧 AÇÕES NECESSÁRIAS:"
    echo "1. Verificar firewall do servidor: ufw status"
    echo "2. Verificar firewall do provedor (VPS panel)"
    echo "3. Verificar se proxy escuta em 0.0.0.0"
fi

echo ""
echo "8️⃣ Testando endpoint Mailchimp..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -k -X POST https://localcashback.com.br:3001/api/mailchimp/test \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"teste","audienceId":"teste","serverPrefix":"us1"}' \
    -w "\nHTTP: %{http_code}\n" \
    --max-time 10)

echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "HTTP: 200"; then
    echo ""
    echo "✅✅✅ ENDPOINT FUNCIONANDO NA PORTA 3001!"
else
    echo ""
    echo "❌ Endpoint não funcionando"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SCRIPT CONCLUÍDO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣ LIMPAR cache do navegador (Ctrl+Shift+Delete)"
echo "2️⃣ FECHAR e reabrir o navegador"
echo "3️⃣ Testar em: Admin > Integrações > Mailchimp"
echo ""
echo "⚠️  Se ainda não funcionar, verifique:"
echo "   - Firewall do servidor está permitindo porta 3001?"
echo "   - Firewall do provedor está permitindo porta 3001?"
echo "   - SSL está válido para a porta 3001?"
echo ""
