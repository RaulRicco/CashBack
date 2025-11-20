#!/bin/bash

echo "=========================================="
echo "🔧 CORRIGINDO PROBLEMA DO ONESIGNAL"
echo "=========================================="
echo ""

cd /var/www/cashback/cashback-system

# Passo 1: Garantir que o .env tem a chave correta
echo "1️⃣ Verificando e corrigindo arquivo .env..."
echo ""

# Fazer backup do .env atual
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup do .env criado"

# Verificar se a chave NOVA já está no .env
if grep -q "nuici" .env 2>/dev/null; then
    echo "✅ Chave NOVA já está no .env (ok!)"
else
    echo "⚠️  Chave NOVA não encontrada. Atualizando .env..."
    
    # Atualizar ou adicionar a linha com a chave NOVA
    if grep -q "VITE_ONESIGNAL_REST_API_KEY=" .env; then
        # Substituir linha existente
        sed -i 's/VITE_ONESIGNAL_REST_API_KEY=.*/VITE_ONESIGNAL_REST_API_KEY=os_v2_app_4kzpwhkkkzdq7iz2v2zv5glddvok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici/' .env
        echo "✅ Linha VITE_ONESIGNAL_REST_API_KEY atualizada no .env"
    else
        # Adicionar linha nova
        echo "" >> .env
        echo "VITE_ONESIGNAL_REST_API_KEY=os_v2_app_4kzpwhkkkzdq7iz2v2zv5glddvok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici" >> .env
        echo "✅ Linha VITE_ONESIGNAL_REST_API_KEY adicionada ao .env"
    fi
fi

echo ""
echo "📄 Conteúdo atual das variáveis OneSignal no .env:"
grep ONESIGNAL .env
echo ""

# Passo 2: Limpar TODOS os caches
echo "2️⃣ Limpando todos os caches..."
echo ""

rm -rf dist
echo "✅ Diretório dist removido"

rm -rf node_modules/.vite
echo "✅ Cache do Vite removido"

rm -rf .cache
echo "✅ Cache geral removido"

rm -rf node_modules/.cache
echo "✅ Cache do node_modules removido"

echo ""

# Passo 3: Rebuild completo
echo "3️⃣ Executando build completo (pode demorar 1-2 minutos)..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build executado com SUCESSO!"
    echo ""
else
    echo ""
    echo "❌ ERRO no build! Verifique as mensagens acima."
    exit 1
fi

# Passo 4: Verificar se a chave NOVA está no JavaScript compilado
echo "4️⃣ Verificando se a chave NOVA está no JavaScript compilado..."
echo ""

if grep -q "nuici" dist/assets/index-*.js 2>/dev/null; then
    echo "✅ PERFEITO! Chave NOVA encontrada no JavaScript compilado!"
    echo ""
    echo "🔍 Arquivo JavaScript gerado:"
    ls -lh dist/assets/index-*.js
    echo ""
    echo "🔍 Confirmação - últimos 50 caracteres da chave no JS:"
    grep -o ".{50}nuici" dist/assets/index-*.js | head -1
    echo ""
else
    echo "❌ ERRO: Chave NOVA ainda NÃO está no JavaScript!"
    echo "   Isso não deveria acontecer. Verifique o arquivo .env manualmente."
    exit 1
fi

# Passo 5: Recarregar Nginx e PM2
echo "5️⃣ Recarregando serviços..."
echo ""

systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "✅ Nginx recarregado"
else
    echo "⚠️  Aviso: Erro ao recarregar Nginx (pode precisar de sudo)"
fi

pm2 restart integration-proxy
if [ $? -eq 0 ]; then
    echo "✅ integration-proxy reiniciado"
else
    echo "⚠️  Aviso: Erro ao reiniciar PM2"
fi

echo ""

# Passo 6: Instruções finais
echo "=========================================="
echo "✅ CORREÇÃO CONCLUÍDA COM SUCESSO!"
echo "=========================================="
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣ Limpar cache do navegador:"
echo "   - Chrome/Edge: Ctrl + Shift + Delete"
echo "   - Selecione 'Imagens e arquivos em cache'"
echo "   - Clique em 'Limpar dados'"
echo ""
echo "2️⃣ Recarregar a página do painel admin:"
echo "   - Pressione Ctrl + F5 (força recarregamento)"
echo "   - Ou feche e abra o navegador novamente"
echo ""
echo "3️⃣ Testar envio de notificação:"
echo "   - Vá para o painel de notificações"
echo "   - Tente enviar uma notificação"
echo "   - Verifique o console do navegador (F12)"
echo ""
echo "4️⃣ Se ainda aparecer erro:"
echo "   - Copie e envie a mensagem de erro completa"
echo "   - Verifique se o erro mudou da mensagem anterior"
echo ""
echo "⚠️  IMPORTANTE: Se ainda mostrar 'Access denied',"
echo "   o problema é CACHE DO NAVEGADOR, não do servidor!"
echo ""
echo "=========================================="
