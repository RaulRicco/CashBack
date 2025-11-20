#!/bin/bash

echo "============================================"
echo "🚀 DEPLOY DE PRODUÇÃO COM FIX DO LOGO"
echo "============================================"
echo ""

cd /home/user/webapp/cashback-system || exit 1

echo "1️⃣ Verificando código atualizado..."
if ! grep -q "contentType: file.type" src/pages/WhiteLabelSettings.jsx; then
    echo "❌ Código não tem contentType!"
    echo "Execute: git pull origin genspark_ai_developer"
    exit 1
fi
echo "✅ Código atualizado encontrado!"
echo ""

echo "2️⃣ Parando servidores antigos..."
pkill -9 -f "vite preview.*3000" 2>/dev/null
pkill -9 -f "vite.*5173" 2>/dev/null
sleep 2
echo "✅ Servidores antigos parados"
echo ""

echo "3️⃣ Limpando cache do Vite..."
rm -rf node_modules/.vite
rm -rf dist
echo "✅ Cache limpo"
echo ""

echo "4️⃣ Fazendo build de produção..."
su - user -c "cd /home/user/webapp/cashback-system && npm run build" 2>&1 | tail -5
if [ ! -d "dist" ]; then
    echo "❌ Build falhou!"
    exit 1
fi
echo "✅ Build concluído"
echo ""

echo "5️⃣ Verificando se contentType está no build..."
if grep -q "contentType" dist/assets/*.js 2>/dev/null; then
    echo "✅ contentType encontrado no build!"
else
    echo "⚠️  Aviso: contentType pode estar minificado"
fi
echo ""

echo "6️⃣ Iniciando servidor de produção (porta 3000)..."
su - user -c "cd /home/user/webapp/cashback-system && nohup npx vite preview --host 0.0.0.0 --port 3000 > /tmp/vite-prod.log 2>&1 &"
sleep 4

if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Servidor rodando na porta 3000!"
else
    echo "❌ Erro ao iniciar servidor!"
    tail -20 /tmp/vite-prod.log
    exit 1
fi
echo ""

echo "============================================"
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "============================================"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣ LIMPAR STORAGE (Execute no Supabase SQL Editor):"
echo "   DELETE FROM storage.objects WHERE bucket_id = 'merchant-assets';"
echo "   UPDATE merchants SET logo_url = NULL WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';"
echo ""
echo "2️⃣ LIMPAR CACHE DO NAVEGADOR:"
echo "   - Abra ABA ANÔNIMA: Ctrl+Shift+N (Chrome) ou Ctrl+Shift+P (Firefox)"
echo "   - OU faça Hard Reload: Ctrl+Shift+R"
echo "   - OU limpe todo cache: Ctrl+Shift+Delete"
echo ""
echo "3️⃣ ACESSAR E FAZER UPLOAD:"
echo "   - Acesse: https://localcashback.com.br/dashboard/white-label"
echo "   - Na ABA ANÔNIMA"
echo "   - Faça upload do logo"
echo "   - Salve as configurações"
echo ""
echo "4️⃣ VERIFICAR NO SUPABASE:"
echo "   SELECT metadata->>'mimetype' as mime_type,"
echo "          metadata->>'cacheControl' as cache_control"
echo "   FROM storage.objects"
echo "   WHERE bucket_id = 'merchant-assets'"
echo "   ORDER BY created_at DESC LIMIT 1;"
echo ""
echo "   ✅ ESPERADO: mime_type = 'image/jpeg' e cache_control = '3600'"
echo ""
echo "📝 Ver logs: tail -f /tmp/vite-prod.log"
echo ""
