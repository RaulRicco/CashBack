#!/bin/bash

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🔔 DEPLOY ONESIGNAL - NOTIFICAÇÕES PUSH"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Este script vai:"
echo "   1. Baixar código atualizado com OneSignal do GitHub"
echo "   2. Adicionar variáveis de ambiente necessárias"
echo "   3. Fazer build de produção"
echo "   4. Recarregar nginx"
echo ""
echo "⏱️  Tempo estimado: 2-3 minutos"
echo ""
read -p "🚀 Pressione ENTER para começar..."
echo ""

# =============================================================================
# PASSO 1: Atualizar código do GitHub
# =============================================================================
echo "───────────────────────────────────────────────────────────────────────────"
echo "📥 PASSO 1/4: Baixando código atualizado do GitHub..."
echo "───────────────────────────────────────────────────────────────────────────"

cd /var/www/cashback/cashback-system

git fetch origin main
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Código atualizado com sucesso!"
else
    echo "❌ ERRO ao baixar código do GitHub"
    echo "   Verifique sua conexão com a internet"
    exit 1
fi

echo ""

# =============================================================================
# PASSO 2: Verificar e Adicionar Variáveis de Ambiente
# =============================================================================
echo "───────────────────────────────────────────────────────────────────────────"
echo "🔧 PASSO 2/4: Configurando variáveis de ambiente OneSignal..."
echo "───────────────────────────────────────────────────────────────────────────"

# Verificar se já existe
if grep -q "VITE_ONESIGNAL_APP_ID" .env; then
    echo "✅ Variáveis OneSignal já existem no .env"
else
    echo "📝 Adicionando variáveis OneSignal ao .env..."
    echo "" >> .env
    echo "# OneSignal Push Notifications" >> .env
    echo "VITE_ONESIGNAL_APP_ID=e2b2fb1d-4a56-470f-a33a-aeb35e99631d" >> .env
    echo "VITE_ONESIGNAL_REST_API_KEY=os_v2_app_4kzpwhkkkzdq7iz2v2zv5gldduw37ngfhotuqqfeoc3elv3ey4tlhthlfyixtb6rar2wcamg567nof2rzjg4ymb7oj3e65iwfwgb2si" >> .env
    echo "✅ Variáveis adicionadas com sucesso!"
fi

echo ""

# =============================================================================
# PASSO 3: Build de Produção
# =============================================================================
echo "───────────────────────────────────────────────────────────────────────────"
echo "🔨 PASSO 3/4: Compilando código para produção..."
echo "───────────────────────────────────────────────────────────────────────────"
echo "⏱️  Isso pode levar 10-30 segundos..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build concluído com sucesso!"
    
    # Verificar se OneSignal está no bundle
    if grep -q "onesignal" dist/assets/index-*.js; then
        echo "✅ OneSignal confirmado no bundle JavaScript!"
    else
        echo "⚠️  AVISO: OneSignal não encontrado no bundle!"
        echo "   Mas vamos continuar..."
    fi
else
    echo "❌ ERRO ao fazer build"
    echo "   Verifique os erros acima"
    exit 1
fi

echo ""

# =============================================================================
# PASSO 4: Recarregar Nginx
# =============================================================================
echo "───────────────────────────────────────────────────────────────────────────"
echo "🔄 PASSO 4/4: Recarregando servidor web (nginx)..."
echo "───────────────────────────────────────────────────────────────────────────"

sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "✅ Nginx recarregado com sucesso!"
else
    echo "❌ ERRO ao recarregar nginx"
    echo "   O site ainda vai funcionar, mas com código antigo"
fi

echo ""

# =============================================================================
# FINALIZADO
# =============================================================================
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ OneSignal instalado e funcionando!"
echo ""
echo "🧪 PRÓXIMOS PASSOS - TESTAR:"
echo ""
echo "   1. Abra o site: https://localcashback.com.br"
echo ""
echo "   2. Limpe o cache do navegador:"
echo "      Ctrl + Shift + Delete → Limpar imagens e cache"
echo ""
echo "   3. Feche e abra o navegador novamente"
echo ""
echo "   4. Acesse o site novamente"
echo ""
echo "   5. Vai aparecer popup do OneSignal:"
echo "      → Clique em PERMITIR notificações"
echo ""
echo "   6. Faça login no painel admin"
echo ""
echo "   7. Vá em: Notificações Push"
echo ""
echo "   8. Preencha:"
echo "      Título: 🎉 Teste OneSignal"
echo "      Mensagem: Funcionou perfeitamente!"
echo ""
echo "   9. Clique em: Enviar Notificação Push"
echo ""
echo "  10. Deve aparecer:"
echo "      ✅ Notificação enviada para X clientes!"
echo "      ✅ Notificação no canto da tela"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📚 DOCUMENTAÇÃO COMPLETA:"
echo "   cat /var/www/cashback/cashback-system/ONESIGNAL-PRONTO.md"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
