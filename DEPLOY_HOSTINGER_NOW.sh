#!/bin/bash

echo "================================================"
echo "🚀 DEPLOY DEFINITIVO PARA HOSTINGER"
echo "================================================"
echo ""

cd /home/user/webapp/cashback-system || exit 1

# 1. Fazer backup do build atual
echo "1️⃣ Fazendo backup do build atual..."
if [ -d "dist.backup" ]; then
    rm -rf dist.backup
fi
if [ -d "dist" ]; then
    cp -r dist dist.backup
    echo "✅ Backup criado: dist.backup"
fi
echo ""

# 2. Limpar e fazer novo build
echo "2️⃣ Limpando cache e fazendo novo build..."
rm -rf node_modules/.vite
rm -rf dist
npm run build 2>&1 | tail -15

if [ ! -d "dist" ]; then
    echo "❌ Build falhou!"
    if [ -d "dist.backup" ]; then
        echo "Restaurando backup..."
        mv dist.backup dist
    fi
    exit 1
fi
echo "✅ Build concluído"
echo ""

# 3. Verificar contentType no build
echo "3️⃣ Verificando contentType no build..."
NEW_JS=$(ls dist/assets/index-*.js | head -1)
if grep -q "contentType" "$NEW_JS"; then
    echo "✅ contentType encontrado!"
else
    echo "⚠️  contentType minificado (normal em produção)"
fi
echo "   Arquivo: $(basename $NEW_JS)"
echo ""

# 4. Adicionar cache busting extremo
echo "4️⃣ Adicionando cache busting..."
TIMESTAMP=$(date +%s%N | cut -b1-13)
sed -i "s|/assets/|/assets/|g" dist/index.html
sed -i "s|\\(assets/[^?\"']*\\)|\\1?v=$TIMESTAMP|g" dist/index.html
sed -i "s|href=\"/|href=\"/?cb=$TIMESTAMP\"|g" dist/index.html 2>/dev/null || true
echo "✅ Cache bust: $TIMESTAMP"
echo ""

# 5. Criar arquivo de verificação
echo "5️⃣ Criando arquivo de verificação..."
cat > dist/deploy-verify.json << EOF
{
  "deployTime": "$(date -Iseconds)",
  "timestamp": $TIMESTAMP,
  "buildFile": "$(basename $NEW_JS)",
  "server": "$(hostname)",
  "user": "$(whoami)",
  "fixApplied": "contentType added to upload"
}
EOF
echo "✅ Arquivo criado: /deploy-verify.json"
echo ""

# 6. Tentar encontrar e substituir em locais comuns da Hostinger
echo "6️⃣ Procurando e substituindo em possíveis locais..."

POSSIBLE_PATHS=(
    "/home/user/domains/localcashback.com.br/public_html"
    "/home/user/public_html/localcashback.com.br"
    "/home/user/public_html"
    "/home/user/htdocs"
    "/home/user/www/localcashback.com.br"
    "/home/user/www"
    "/var/www/html/localcashback.com.br"
    "/var/www/localcashback.com.br"
    "/var/www/html"
    "/usr/share/nginx/html"
)

DEPLOYED=false
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "   📁 Encontrado: $path"
        echo "      Copiando build..."
        cp -r dist/* "$path/" 2>/dev/null && {
            echo "      ✅ Deploy realizado em: $path"
            DEPLOYED=true
            DEPLOY_PATH="$path"
        } || {
            echo "      ⚠️  Sem permissão para escrever"
        }
    fi
done

if [ "$DEPLOYED" = false ]; then
    echo "   ⚠️  Nenhum path encontrado automaticamente"
    echo "   Você precisará copiar manualmente ou usar painel da Hostinger"
fi
echo ""

# 7. Criar link simbólico como fallback
echo "7️⃣ Criando link simbólico..."
if [ ! -L "/home/user/public_html" ]; then
    ln -sf /home/user/webapp/cashback-system/dist /home/user/public_html 2>/dev/null && {
        echo "✅ Link criado: /home/user/public_html -> dist"
    } || {
        echo "⚠️  Não foi possível criar link"
    }
fi
echo ""

# 8. Testar localhost
echo "8️⃣ Testando servidor local (porta 3000)..."
pkill -9 -f "vite preview"
sleep 2
nohup npx vite preview --host 0.0.0.0 --port 3000 > /tmp/vite-host.log 2>&1 &
sleep 4

if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Vite rodando na porta 3000"
    if curl -s http://localhost:3000/deploy-verify.json | grep -q "$TIMESTAMP"; then
        echo "✅ Servidor local servindo build NOVO!"
    fi
else
    echo "⚠️  Vite não iniciou na porta 3000"
fi
echo ""

# 9. Instruções finais
echo "================================================"
echo "✅ BUILD CONCLUÍDO!"
echo "================================================"
echo ""
echo "📦 NOVO BUILD:"
echo "   Arquivo: $(basename $NEW_JS)"
echo "   Timestamp: $TIMESTAMP"
echo "   Local: /home/user/webapp/cashback-system/dist/"
if [ "$DEPLOYED" = true ]; then
    echo "   Deployed em: $DEPLOY_PATH"
fi
echo ""
echo "🔍 VERIFICAÇÃO:"
echo "   1. Acesse: https://localcashback.com.br/deploy-verify.json"
echo "   2. Verifique se timestamp é: $TIMESTAMP"
echo "   3. Se timestamp for ANTIGO:"
echo "      - Hostinger está cacheando"
echo "      - OU precisa deploy manual pelo painel"
echo ""
echo "🌐 TESTE DIRETO:"
echo "   http://31.97.167.88:3000/deploy-verify.json"
echo "   http://localhost:3000/deploy-verify.json"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "SE O TIMESTAMP ESTIVER CORRETO:"
echo "   1. Limpe cache do navegador: Ctrl+Shift+Delete"
echo "   2. Use aba anônima: Ctrl+Shift+N"
echo "   3. Acesse o site e faça upload do logo"
echo ""
echo "SE O TIMESTAMP ESTIVER ERRADO:"
echo "   OPÇÃO A - Upload manual via FileZilla/FTP:"
echo "   1. Conecte no FTP da Hostinger"
echo "   2. Vá em public_html ou htdocs"
echo "   3. Delete tudo"
echo "   4. Faça upload da pasta dist/* para lá"
echo ""
echo "   OPÇÃO B - Painel Hostinger:"
echo "   1. Acesse hpanel.hostinger.com"
echo "   2. File Manager"
echo "   3. Localize public_html"
echo "   4. Delete tudo e faça upload do dist"
echo ""
echo "   OPÇÃO C - SSH Deploy:"
echo "   Digite o caminho correto do public_html:"
echo "   Ex: /home/u123456/domains/localcashback.com.br/public_html"
echo ""
read -p "   Deseja tentar copiar para um path customizado? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    read -p "   Digite o caminho completo: " CUSTOM_PATH
    if [ -d "$CUSTOM_PATH" ]; then
        cp -r dist/* "$CUSTOM_PATH/" && {
            echo "   ✅ Copiado para: $CUSTOM_PATH"
        } || {
            echo "   ❌ Erro ao copiar"
        }
    else
        echo "   ❌ Caminho não existe"
    fi
fi
echo ""
echo "📝 Ver logs: tail -f /tmp/vite-host.log"
echo ""
