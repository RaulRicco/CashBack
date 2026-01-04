#!/bin/bash

echo "============================================"
echo "🔥 DEPLOY FORÇADO - SUBSTITUINDO TUDO"
echo "============================================"
echo ""

cd /home/user/webapp/cashback-system || exit 1

echo "1️⃣ Matando TODOS os processos..."
pkill -9 node
pkill -9 vite
sleep 2
echo "✅ Processos mortos"
echo ""

echo "2️⃣ Limpando cache e build antigo..."
rm -rf node_modules/.vite
rm -rf dist
echo "✅ Cache limpo"
echo ""

echo "3️⃣ Fazendo build NOVO com timestamp único..."
export BUILD_TIME=$(date +%s)
npm run build 2>&1 | tail -10
if [ ! -d "dist" ]; then
    echo "❌ Build falhou!"
    exit 1
fi
echo "✅ Build concluído"
echo ""

echo "4️⃣ Verificando arquivo gerado..."
NEW_JS=$(ls dist/assets/index-*.js | head -1 | xargs basename)
echo "   Arquivo: $NEW_JS"

if grep -q "contentType" "dist/assets/$NEW_JS"; then
    echo "✅ contentType encontrado no build!"
else
    echo "⚠️  contentType pode estar minificado"
fi
echo ""

echo "5️⃣ Adicionando cache bust ao HTML..."
TIMESTAMP=$(date +%s)
sed -i "s/assets\\/index-/assets\\/index-/g" dist/index.html
sed -i "s/\\(assets\\/[^?\"]*\\)/\\1?v=$TIMESTAMP/g" dist/index.html
echo "✅ Cache bust adicionado: ?v=$TIMESTAMP"
echo ""

echo "6️⃣ Iniciando servidor na porta 3000..."
su - user -c "cd /home/user/webapp/cashback-system && nohup npx vite preview --host 0.0.0.0 --port 3000 > /tmp/vite-force.log 2>&1 &"
sleep 4

if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Servidor rodando na porta 3000"
else
    echo "❌ Servidor não iniciou!"
    tail -20 /tmp/vite-force.log
    exit 1
fi
echo ""

echo "7️⃣ Testando servidor..."
if curl -s http://localhost:3000/ | grep -q "$NEW_JS"; then
    echo "✅ Servidor servindo build novo: $NEW_JS"
else
    echo "❌ Servidor não está servindo o build correto!"
    exit 1
fi
echo ""

echo "8️⃣ Testando contentType no JavaScript servido..."
CONTENT_TYPE_COUNT=$(curl -s "http://localhost:3000/assets/$NEW_JS" | grep -o "contentType" | wc -l)
echo "   contentType encontrado: $CONTENT_TYPE_COUNT vezes"

if [ "$CONTENT_TYPE_COUNT" -gt 0 ]; then
    echo "✅ contentType CONFIRMADO no JavaScript!"
else
    echo "⚠️  contentType não encontrado - pode estar minificado"
fi
echo ""

echo "9️⃣ Criando arquivo de verificação..."
echo "Deploy timestamp: $TIMESTAMP" > dist/deploy-check.txt
echo "Build file: $NEW_JS" >> dist/deploy-check.txt  
echo "contentType count: $CONTENT_TYPE_COUNT" >> dist/deploy-check.txt
echo "✅ Arquivo criado: /deploy-check.txt"
echo ""

echo "🔟 Verificando se Nginx está rodando..."
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "⚠️  NGINX DETECTADO RODANDO!"
    echo "   Nginx pode estar cacheando ou servindo arquivos antigos"
    echo ""
    echo "   🔧 OPÇÕES:"
    echo "   A) Reconfigurar Nginx para proxy para :3000"
    echo "   B) Copiar dist/ para pasta do Nginx"
    echo "   C) Desabilitar Nginx e usar apenas Vite"
    echo ""
    read -p "   Deseja RECARREGAR Nginx? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo "   Recarregando Nginx..."
        nginx -s reload 2>&1
        echo "   ✅ Nginx recarregado"
    fi
else
    echo "✅ Nginx não detectado"
fi
echo ""

echo "============================================"
echo "✅ DEPLOY FORÇADO CONCLUÍDO!"
echo "============================================"
echo ""
echo "📋 INFORMAÇÕES DO DEPLOY:"
echo "   Timestamp: $TIMESTAMP"
echo "   Build: $NEW_JS"
echo "   contentType: $CONTENT_TYPE_COUNT ocorrências"
echo "   Porta: 3000"
echo ""
echo "🌐 URLs DE TESTE:"
echo "   http://localhost:3000/deploy-check.txt"
echo "   https://localcashback.com.br/deploy-check.txt"
echo ""
echo "⚠️  IMPORTANTE PARA O USUÁRIO:"
echo "1️⃣ Limpe o cache do navegador: Ctrl+Shift+Delete"
echo "2️⃣ OU use aba anônima: Ctrl+Shift+N"
echo "3️⃣ Acesse: https://localcashback.com.br/deploy-check.txt"
echo "4️⃣ Verifique se o timestamp é: $TIMESTAMP"
echo "5️⃣ Se o timestamp for ANTIGO, o Nginx está cacheando!"
echo ""
echo "📝 Ver logs: tail -f /tmp/vite-force.log"
echo ""
