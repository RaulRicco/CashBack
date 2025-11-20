#!/bin/bash

# =====================================================
# COMANDOS PARA FIX DO LOGO UPLOAD - COPIAR E COLAR
# =====================================================

echo "=============================================="
echo "🔧 FIX LOGO UPLOAD - COMANDOS PRONTOS"
echo "=============================================="
echo ""

# ---------------------------------------------
# PARTE 1: PUSH DO CÓDIGO (Execute no local)
# ---------------------------------------------
echo "📦 PARTE 1: PUSH DO CÓDIGO"
echo "----------------------------"
echo ""
echo "cd /home/root/webapp/cashback-system"
echo "git status"
echo "git push origin main"
echo ""
echo "⚠️ Se der erro de autenticação, use o GitHub Desktop ou configure token"
echo ""

# ---------------------------------------------
# PARTE 2: SQL NO SUPABASE (Copiar e colar)
# ---------------------------------------------
echo "=============================================="
echo "📊 PARTE 2: EXECUTAR SQL NO SUPABASE"
echo "=============================================="
echo ""
echo "1. Acesse: https://supabase.com/dashboard"
echo "2. Selecione seu projeto"
echo "3. Vá em: SQL Editor"
echo "4. Clique em: New Query"
echo "5. Cole o script: FIX-LOGO-UPLOAD-DEFINITIVO.sql"
echo "6. Clique em: Run (ou Ctrl+Enter)"
echo ""

# ---------------------------------------------
# PARTE 3: DEPLOY NO SERVIDOR
# ---------------------------------------------
echo "=============================================="
echo "🚀 PARTE 3: DEPLOY NO SERVIDOR"
echo "=============================================="
echo ""
echo "# Conectar no servidor"
echo "ssh root@31.97.167.88"
echo ""
echo "# Atualizar código"
echo "cd /var/www/cashback/cashback-system"
echo "git pull origin main"
echo ""
echo "# Rebuild"
echo "npm run build"
echo ""
echo "# Recarregar Nginx"
echo "systemctl reload nginx"
echo ""
echo "# Sair"
echo "exit"
echo ""

# ---------------------------------------------
# PARTE 4: TESTE
# ---------------------------------------------
echo "=============================================="
echo "✅ PARTE 4: TESTAR"
echo "=============================================="
echo ""
echo "1. Abra o sistema no navegador"
echo "2. Faça login como merchant"
echo "3. Vá em: Meu CashBack (menu lateral)"
echo "4. Faça upload de uma logo (PNG ou JPG, máx 2MB)"
echo "5. Clique em: Salvar Configurações"
echo "6. A logo deve aparecer! ✅"
echo ""

# ---------------------------------------------
# TROUBLESHOOTING
# ---------------------------------------------
echo "=============================================="
echo "🐛 SE DER ERRO"
echo "=============================================="
echo ""
echo "1. Abra Console do Navegador (F12)"
echo "2. Veja mensagens de erro"
echo "3. Execute verify_storage_fix.sql no Supabase"
echo "4. Verifique se bucket está público"
echo ""
echo "Guia completo: SOLUCAO-LOGO-UPLOAD.md"
echo ""

# ---------------------------------------------
# RESUMO
# ---------------------------------------------
echo "=============================================="
echo "📋 RESUMO"
echo "=============================================="
echo ""
echo "✅ Commit realizado: fix: add error handling and SQL solution for logo upload issue"
echo "✅ Arquivos modificados:"
echo "   - src/pages/WhiteLabelSettings.jsx (tratamento de erro)"
echo "   - FIX-LOGO-UPLOAD-DEFINITIVO.sql (correção Supabase)"
echo "   - SOLUCAO-LOGO-UPLOAD.md (guia completo)"
echo ""
echo "⏭️ Próximo passo: Execute git push origin main"
echo ""
echo "=============================================="
