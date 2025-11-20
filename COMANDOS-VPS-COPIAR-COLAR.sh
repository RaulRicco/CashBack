#!/bin/bash

# ========================================
# 🔧 COMANDOS PARA EXECUTAR NO VPS
# ========================================
# Use estes comandos SE precisar atualizar o código JavaScript
# SOMENTE se o SQL não resolver!
#
# COMO USAR:
# 1. Copie cada bloco
# 2. Cole no terminal do VPS
# 3. Pressione Enter
# 4. Aguarde completar
# ========================================


# ========================================
# 📥 BLOCO 1: CONECTAR AO VPS E NAVEGAR
# ========================================
# ATENÇÃO: Execute no seu computador local, não copie este primeiro bloco

# ssh root@31.97.167.88
# cd /var/www/cashback/cashback-system


# ========================================
# 💾 BLOCO 2: FAZER BACKUP DO ARQUIVO ATUAL
# ========================================
# Execute este comando primeiro (segurança!)

cp src/pages/WhiteLabelSettings.jsx src/pages/WhiteLabelSettings.jsx.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup criado com sucesso!"
ls -lh src/pages/WhiteLabelSettings.jsx*


# ========================================
# 🔍 BLOCO 3: VERIFICAR O PROBLEMA ATUAL
# ========================================
# Ver onde está a função handleLogoUpload

echo ""
echo "📍 Localizando função handleLogoUpload:"
grep -n "handleLogoUpload" src/pages/WhiteLabelSettings.jsx | head -5
echo ""
echo "📍 Localizando storage.from:"
grep -n "storage.from" src/pages/WhiteLabelSettings.jsx | head -5
echo ""
echo "📍 Verificando se tem getPublicUrl:"
grep -n "getPublicUrl" src/pages/WhiteLabelSettings.jsx | head -5


# ========================================
# 📋 BLOCO 4: VER O CÓDIGO ATUAL DO UPLOAD
# ========================================
# Extrair as linhas da função handleLogoUpload

echo ""
echo "📄 Código atual da função handleLogoUpload:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sed -n '/const handleLogoUpload/,/^  }/p' src/pages/WhiteLabelSettings.jsx | head -100
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


# ========================================
# 🔧 BLOCO 5: ADICIONAR LOGS DETALHADOS (OPÇÃO RÁPIDA)
# ========================================
# Se você só quer adicionar logs para debugar, use este comando:

# ATENÇÃO: Este comando adiciona console.log ANTES da função handleLogoUpload
# Para ver mais detalhes sobre o que está acontecendo

# Primeiro, encontre a linha onde está handleLogoUpload
LINHA=$(grep -n "const handleLogoUpload" src/pages/WhiteLabelSettings.jsx | head -1 | cut -d: -f1)

if [ ! -z "$LINHA" ]; then
  echo "✅ Função encontrada na linha: $LINHA"
  echo ""
  echo "Para adicionar logs detalhados, edite o arquivo manualmente:"
  echo "nano +$LINHA src/pages/WhiteLabelSettings.jsx"
  echo ""
  echo "Adicione console.log em pontos estratégicos:"
  echo "  - Antes do upload"
  echo "  - Depois do upload"
  echo "  - Na geração da URL"
  echo "  - No onError da <img>"
else
  echo "❌ Função handleLogoUpload não encontrada!"
fi


# ========================================
# 🏗️ BLOCO 6: REBUILDAR O PROJETO
# ========================================
# Execute após qualquer alteração no código

echo ""
echo "🏗️ Limpando build anterior..."
rm -rf dist/

echo "🏗️ Buildando projeto..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build concluído com sucesso!"
  echo ""
  echo "📊 Tamanho da build:"
  du -sh dist/
  echo ""
  echo "📅 Arquivos mais recentes:"
  ls -lht dist/ | head -5
else
  echo "❌ Erro no build! Verifique os logs acima."
  exit 1
fi


# ========================================
# 🔄 BLOCO 7: REINICIAR SERVIDOR (PM2)
# ========================================
# Se você usa PM2 para gerenciar o processo

if command -v pm2 &> /dev/null; then
  echo ""
  echo "🔄 Reiniciando com PM2..."
  pm2 restart cashback
  
  echo ""
  echo "📊 Status do PM2:"
  pm2 status
  
  echo ""
  echo "📝 Logs recentes:"
  pm2 logs cashback --nostream --lines 20
else
  echo "⚠️ PM2 não encontrado. Servidor não reiniciado automaticamente."
fi


# ========================================
# 🌐 BLOCO 8: REINICIAR NGINX (se necessário)
# ========================================
# Se você serve os arquivos estáticos via Nginx

if command -v nginx &> /dev/null; then
  echo ""
  echo "🌐 Recarregando Nginx..."
  sudo systemctl reload nginx
  
  echo ""
  echo "📊 Status do Nginx:"
  sudo systemctl status nginx | head -10
else
  echo "⚠️ Nginx não encontrado. Não é necessário reiniciar."
fi


# ========================================
# ✅ BLOCO 9: VERIFICAÇÃO FINAL
# ========================================
# Confirmar que tudo está funcionando

echo ""
echo "════════════════════════════════════════"
echo "✅ VERIFICAÇÃO FINAL"
echo "════════════════════════════════════════"
echo ""

echo "1. Projeto buildado: $([ -d "dist/" ] && echo "✅ SIM" || echo "❌ NÃO")"
echo "2. Arquivo WhiteLabelSettings.jsx: $([ -f "src/pages/WhiteLabelSettings.jsx" ] && echo "✅ OK" || echo "❌ AUSENTE")"
echo "3. Backup criado: $(ls src/pages/WhiteLabelSettings.jsx.backup-* 2>/dev/null | wc -l) arquivo(s)"

echo ""
echo "📋 Próximos passos:"
echo "  1. Abra o sistema no navegador"
echo "  2. Pressione Ctrl+Shift+R (limpar cache)"
echo "  3. Faça login"
echo "  4. Abra Console (F12)"
echo "  5. Vá em Configurações White Label"
echo "  6. Tente fazer upload de uma logo"
echo "  7. Observe os logs no console"
echo ""
echo "════════════════════════════════════════"


# ========================================
# 🆘 BLOCO 10: RESTAURAR BACKUP (SE ALGO DEU ERRADO)
# ========================================
# Use este comando para voltar ao estado anterior

# ATENÇÃO: SÓ USE SE PRECISAR DESFAZER MUDANÇAS!

# Listar backups disponíveis:
# ls -lh src/pages/WhiteLabelSettings.jsx.backup-*

# Restaurar o backup mais recente:
# BACKUP=$(ls -t src/pages/WhiteLabelSettings.jsx.backup-* | head -1)
# cp "$BACKUP" src/pages/WhiteLabelSettings.jsx
# echo "✅ Backup restaurado: $BACKUP"
# npm run build


# ========================================
# 📊 BLOCO 11: DIAGNÓSTICO COMPLETO
# ========================================
# Execute para gerar relatório detalhado

cat << 'EOF' > /tmp/diagnostico-logo.sh
#!/bin/bash
echo "╔════════════════════════════════════════╗"
echo "║  🔍 DIAGNÓSTICO COMPLETO - LOGO UPLOAD ║"
echo "╚════════════════════════════════════════╝"
echo ""

cd /var/www/cashback/cashback-system

echo "1️⃣ Verificando arquivos:"
echo "  WhiteLabelSettings.jsx: $([ -f "src/pages/WhiteLabelSettings.jsx" ] && echo "✅" || echo "❌")"
echo "  Build dist/: $([ -d "dist/" ] && echo "✅" || echo "❌")"
echo ""

echo "2️⃣ Função handleLogoUpload:"
grep -c "handleLogoUpload" src/pages/WhiteLabelSettings.jsx
echo ""

echo "3️⃣ Storage upload:"
grep -c "storage.from('merchant-assets')" src/pages/WhiteLabelSettings.jsx
echo ""

echo "4️⃣ getPublicUrl:"
grep -c "getPublicUrl" src/pages/WhiteLabelSettings.jsx
echo ""

echo "5️⃣ Última build:"
ls -lh dist/index*.js | tail -1
echo ""

echo "6️⃣ Testando URL da logo:"
curl -sI "https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png" | head -5
echo ""

echo "╚════════════════════════════════════════╝"
EOF

chmod +x /tmp/diagnostico-logo.sh
/tmp/diagnostico-logo.sh


# ========================================
# 📝 NOTAS IMPORTANTES:
# ========================================
#
# 1. SEMPRE faça backup antes de editar
# 2. SEMPRE rebuilde após editar código
# 3. SEMPRE limpe cache do navegador após rebuild
# 4. Se algo der errado, restaure o backup
# 5. Execute os blocos UM POR VEZ, não todos juntos
#
# ========================================
# 🎯 ORDEM DE EXECUÇÃO RECOMENDADA:
# ========================================
#
# 1. BLOCO 2: Fazer backup
# 2. BLOCO 3: Verificar problema
# 3. BLOCO 4: Ver código atual
# 4. [EDITAR ARQUIVO MANUALMENTE]
# 5. BLOCO 6: Rebuildar
# 6. BLOCO 7: Reiniciar PM2 (se usar)
# 7. BLOCO 8: Reiniciar Nginx (se usar)
# 8. BLOCO 9: Verificação final
#
# ========================================
