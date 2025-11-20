#!/bin/bash

echo "=========================================="
echo "🔍 DIAGNÓSTICO COMPLETO - LOGO UPLOAD"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /var/www/cashback/cashback-system

echo "1️⃣ VERIFICANDO ARQUIVO WhiteLabelSettings.jsx"
echo "=========================================="
if [ -f "src/pages/WhiteLabelSettings.jsx" ]; then
    echo -e "${GREEN}✅ Arquivo encontrado${NC}"
    echo ""
    echo "📄 Código do upload (linhas 180-280):"
    sed -n '180,280p' src/pages/WhiteLabelSettings.jsx | grep -A 50 "handleLogoUpload"
    echo ""
    echo "📄 Código do display (linhas 320-360):"
    sed -n '320,360p' src/pages/WhiteLabelSettings.jsx
else
    echo -e "${RED}❌ Arquivo NÃO encontrado!${NC}"
fi

echo ""
echo "2️⃣ VERIFICANDO CONFIGURAÇÃO SUPABASE"
echo "=========================================="
if [ -f "src/config/supabase.js" ]; then
    echo -e "${GREEN}✅ Config Supabase encontrado${NC}"
    grep -E "(VITE_SUPABASE_URL|supabaseUrl)" src/config/supabase.js | head -5
elif [ -f "src/lib/supabase.js" ]; then
    echo -e "${GREEN}✅ Config Supabase encontrado (lib)${NC}"
    grep -E "(VITE_SUPABASE_URL|supabaseUrl)" src/lib/supabase.js | head -5
else
    echo -e "${YELLOW}⚠️ Procurando em todos os arquivos...${NC}"
    find src -name "*.js" -o -name "*.jsx" | xargs grep -l "createClient" | head -3
fi

echo ""
echo "3️⃣ VERIFICANDO VARIÁVEIS DE AMBIENTE"
echo "=========================================="
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env encontrado${NC}"
    echo "VITE_SUPABASE_URL:"
    grep "VITE_SUPABASE_URL" .env
    echo "VITE_SUPABASE_ANON_KEY (primeiros 50 chars):"
    grep "VITE_SUPABASE_ANON_KEY" .env | cut -c1-80
else
    echo -e "${RED}❌ .env NÃO encontrado!${NC}"
fi

echo ""
echo "4️⃣ TESTANDO URL DA LOGO DIRETAMENTE"
echo "=========================================="
LOGO_URL="https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png"
echo "Testando: $LOGO_URL"
echo ""
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$LOGO_URL")
echo "HTTP Status Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Imagem acessível! Status 200 OK${NC}"
    curl -sI "$LOGO_URL" | head -10
elif [ "$HTTP_CODE" == "404" ]; then
    echo -e "${RED}❌ ERRO 404 - Imagem não encontrada no storage!${NC}"
    echo "Isso significa que o upload FALHOU ou o arquivo foi deletado."
elif [ "$HTTP_CODE" == "403" ]; then
    echo -e "${RED}❌ ERRO 403 - SEM PERMISSÃO!${NC}"
    echo "Isso significa que as políticas de Storage NÃO estão configuradas."
else
    echo -e "${YELLOW}⚠️ Status: $HTTP_CODE${NC}"
    curl -sI "$LOGO_URL"
fi

echo ""
echo "5️⃣ VERIFICANDO CÓDIGO DE UPLOAD"
echo "=========================================="
echo "Procurando função handleLogoUpload..."
grep -n "handleLogoUpload" src/pages/WhiteLabelSettings.jsx | head -3
echo ""
echo "Procurando storage.from('merchant-assets')..."
grep -n "storage.from" src/pages/WhiteLabelSettings.jsx | head -5

echo ""
echo "6️⃣ VERIFICANDO BUILD"
echo "=========================================="
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Pasta dist/ existe${NC}"
    echo "Última modificação:"
    ls -lht dist/ | head -5
else
    echo -e "${RED}❌ Pasta dist/ NÃO existe! Precisa buildar!${NC}"
fi

echo ""
echo "7️⃣ VERIFICANDO LOGS DO NAVEGADOR"
echo "=========================================="
echo "Para capturar os detalhes do erro, adicione isto no código:"
echo ""
cat << 'EOF'
// NO ARQUIVO WhiteLabelSettings.jsx, na função handleLogoUpload:

console.log('🔍 DIAGNÓSTICO DETALHADO:');
console.log('1. Arquivo selecionado:', file);
console.log('2. Nome:', file.name);
console.log('3. Tipo:', file.type);
console.log('4. Tamanho:', file.size);
console.log('5. Merchant ID:', merchant.id);
console.log('6. FilePath que será usado:', filePath);

// APÓS O UPLOAD:
console.log('7. Upload Result:', uploadData);
console.log('8. Upload Error:', uploadError);
console.log('9. Public URL gerada:', publicUrl);

// NO onError da tag <img>:
onError={(e) => {
  console.error('❌ ERRO DETALHADO AO CARREGAR IMAGEM:');
  console.error('URL:', e.target.src);
  console.error('Erro completo:', e);
  console.error('naturalWidth:', e.target.naturalWidth);
  console.error('naturalHeight:', e.target.naturalHeight);
  
  // TESTAR SE É CORS
  fetch(e.target.src, { method: 'HEAD' })
    .then(res => {
      console.log('✅ Fetch funcionou! Status:', res.status);
      console.log('Headers:', [...res.headers.entries()]);
    })
    .catch(err => console.error('❌ Fetch falhou:', err));
}}
EOF

echo ""
echo "=========================================="
echo "🎯 PRÓXIMOS PASSOS:"
echo "=========================================="
echo ""
echo "1. Copie TODA esta saída e me envie"
echo "2. Vá no navegador, abra DevTools (F12)"
echo "3. Vá na aba Network"
echo "4. Tente fazer upload da logo novamente"
echo "5. Procure a requisição para 'merchant-assets'"
echo "6. Clique nela e me envie:"
echo "   - Status Code"
echo "   - Response Headers"
echo "   - Response Body"
echo "7. Abra esta URL no navegador e me diga o que aparece:"
echo "   $LOGO_URL"
echo ""
echo "=========================================="
