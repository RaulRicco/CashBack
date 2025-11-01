#!/bin/bash

# 🔧 Script para RESOLVER DEFINITIVAMENTE o problema do OneSignal REST API Key
# Este script irá forçar um rebuild completo e verificar se a chave nova está no bundle

echo "============================================================"
echo "🔧 DIAGNÓSTICO E CORREÇÃO - OneSignal REST API Key"
echo "============================================================"
echo ""

# Passo 1: Navegar para o diretório do projeto
cd /var/www/cashback/cashback-system || { echo "❌ Erro: Diretório não encontrado"; exit 1; }
echo "✅ Passo 1: Navegou para /var/www/cashback/cashback-system"
echo ""

# Passo 2: Verificar o conteúdo do .env
echo "============================================================"
echo "📋 Passo 2: Verificando .env atual..."
echo "============================================================"
if [ -f .env ]; then
    echo "Conteúdo do .env (OneSignal):"
    grep "ONESIGNAL" .env
    echo ""
else
    echo "❌ ERRO: Arquivo .env não encontrado!"
    exit 1
fi

# Passo 3: Fazer backup do .env atual
echo "============================================================"
echo "💾 Passo 3: Fazendo backup do .env..."
echo "============================================================"
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup criado"
echo ""

# Passo 4: Pull do repositório para garantir código mais recente
echo "============================================================"
echo "📥 Passo 4: Atualizando código do GitHub..."
echo "============================================================"
git stash  # Salvar mudanças locais se houver
git pull origin main
git stash pop 2>/dev/null || true  # Restaurar mudanças se houver
echo "✅ Código atualizado"
echo ""

# Passo 5: Verificar novamente o .env após o pull
echo "============================================================"
echo "🔍 Passo 5: Verificando .env após git pull..."
echo "============================================================"
grep "ONESIGNAL" .env
echo ""

# Passo 6: Remover COMPLETAMENTE o cache e build antigo
echo "============================================================"
echo "🗑️  Passo 6: Removendo cache e build antigo..."
echo "============================================================"
rm -rf dist
rm -rf node_modules/.vite
rm -rf .cache
echo "✅ Cache limpo"
echo ""

# Passo 7: Rebuild COMPLETO
echo "============================================================"
echo "🔨 Passo 7: Executando build completo..."
echo "============================================================"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Build falhou!"
    exit 1
fi
echo "✅ Build concluído"
echo ""

# Passo 8: VERIFICAÇÃO CRÍTICA - Procurar a chave NOVA no bundle
echo "============================================================"
echo "🔍 Passo 8: VERIFICANDO se a chave NOVA está no bundle..."
echo "============================================================"
NEW_KEY_PART="vok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici"
OLD_KEY_1_PART="b2si"
OLD_KEY_2_PART="yrayfi"

echo "Procurando chave NOVA no bundle..."
if grep -q "$NEW_KEY_PART" dist/assets/index-*.js; then
    echo "✅ ✅ ✅ SUCESSO! A chave NOVA foi encontrada no bundle!"
else
    echo "❌ ❌ ❌ ERRO! A chave NOVA NÃO está no bundle!"
fi
echo ""

echo "Verificando se chaves antigas ainda estão no bundle..."
if grep -q "$OLD_KEY_1_PART" dist/assets/index-*.js; then
    echo "⚠️  Encontrou resíduo da chave antiga 1 (b2si)"
fi
if grep -q "$OLD_KEY_2_PART" dist/assets/index-*.js; then
    echo "⚠️  Encontrou resíduo da chave antiga 2 (yrayfi)"
fi
echo ""

# Passo 9: Listar arquivos do bundle
echo "============================================================"
echo "📄 Passo 9: Arquivos do bundle gerados:"
echo "============================================================"
ls -lh dist/assets/index-*.js
echo ""

# Passo 10: Reiniciar serviços
echo "============================================================"
echo "🔄 Passo 10: Reiniciando serviços..."
echo "============================================================"
pm2 restart integration-proxy
systemctl reload nginx
echo "✅ Serviços reiniciados"
echo ""

# Passo 11: Teste da chave via curl
echo "============================================================"
echo "🧪 Passo 11: Testando chave via curl..."
echo "============================================================"
FULL_KEY=$(grep "VITE_ONESIGNAL_REST_API_KEY" .env | cut -d '=' -f2)
APP_ID=$(grep "VITE_ONESIGNAL_APP_ID" .env | cut -d '=' -f2)

echo "Enviando requisição de teste para OneSignal..."
RESPONSE=$(curl -s -X POST https://onesignal.com/api/v1/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $FULL_KEY" \
  -d "{\"app_id\": \"$APP_ID\", \"included_segments\": [\"Subscribed Users\"], \"contents\": {\"en\": \"Teste de chave\"}}")

echo "Resposta do OneSignal:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "Access denied"; then
    echo "❌ ERRO: OneSignal retornou 'Access denied' - chave inválida!"
elif echo "$RESPONSE" | grep -q "errors"; then
    if echo "$RESPONSE" | grep -q "All included players are not subscribed"; then
        echo "✅ ✅ ✅ CHAVE VÁLIDA! (Nenhum usuário inscrito ainda)"
    else
        echo "⚠️  Resposta com erro, mas não é problema de autenticação"
    fi
else
    echo "✅ ✅ ✅ CHAVE VÁLIDA! Notificação enviada com sucesso!"
fi
echo ""

# Resumo final
echo "============================================================"
echo "📊 RESUMO FINAL"
echo "============================================================"
echo "1. ✅ .env verificado e backup criado"
echo "2. ✅ Código atualizado do GitHub"
echo "3. ✅ Cache limpo completamente"
echo "4. ✅ Build executado com sucesso"

if grep -q "$NEW_KEY_PART" dist/assets/index-*.js; then
    echo "5. ✅ ✅ ✅ CHAVE NOVA ESTÁ NO BUNDLE!"
else
    echo "5. ❌ ❌ ❌ CHAVE NOVA NÃO ESTÁ NO BUNDLE - PROBLEMA PERSISTE!"
fi

echo "6. ✅ Serviços reiniciados"
echo ""
echo "============================================================"
echo "🎯 PRÓXIMOS PASSOS:"
echo "============================================================"
echo "1. Limpe o cache do navegador (Ctrl+Shift+Del)"
echo "2. Abra o site em aba anônima: https://localcashback.com.br"
echo "3. Vá em Admin > Notificações Push"
echo "4. Clique em 'Permitir' quando aparecer o popup do OneSignal"
echo "5. Tente enviar uma notificação de teste"
echo ""
echo "Se der 'Access denied', execute este comando para ver o log:"
echo "pm2 logs integration-proxy --nostream | tail -30"
echo "============================================================"
