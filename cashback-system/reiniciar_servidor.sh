#!/bin/bash

echo "============================================"
echo "🔄 REINICIANDO SERVIDOR COM CÓDIGO ATUALIZADO"
echo "============================================"
echo ""

# Verificar se está no diretório correto
cd /home/user/webapp/cashback-system || exit 1

# Verificar se o código tem contentType
echo "📝 Verificando código..."
if grep -q "contentType: file.type" src/pages/WhiteLabelSettings.jsx; then
    echo "✅ Código atualizado encontrado!"
else
    echo "❌ Código ainda não tem contentType!"
    echo "Execute: git pull origin genspark_ai_developer"
    exit 1
fi

echo ""
echo "🛑 Parando processos antigos..."

# Parar todos os processos Node/Vite relacionados ao cashback
pkill -f "node.*vite.*cashback" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null

# Aguardar processos terminarem
sleep 2

# Verificar se ainda há processos
if pgrep -f "vite.*cashback" > /dev/null; then
    echo "⚠️  Processos ainda rodando, forçando kill..."
    pkill -9 -f "vite.*cashback" 2>/dev/null
    sleep 1
fi

echo "✅ Processos antigos parados"
echo ""

echo "🚀 Iniciando servidor com código atualizado..."
cd /home/user/webapp/cashback-system

# Iniciar como usuário correto
if [ "$EUID" -eq 0 ]; then
    # Se executando como root, usar su para mudar para user
    echo "   (iniciando como user)"
    su - user -c "cd /home/user/webapp/cashback-system && npm run dev > /tmp/vite-cashback.log 2>&1 &"
else
    # Se já é user, executar diretamente
    nohup npm run dev > /tmp/vite-cashback.log 2>&1 &
fi

# Aguardar servidor iniciar
echo "   Aguardando servidor iniciar..."
sleep 5

echo ""
echo "📊 Verificando status..."

# Verificar se o processo está rodando
if pgrep -f "vite" > /dev/null; then
    echo "✅ Servidor está rodando!"
    echo ""
    echo "🔍 Processos ativos:"
    ps aux | grep -E "(node|vite)" | grep -v grep | grep cashback
    echo ""
    echo "📝 Ver logs: tail -f /tmp/vite-cashback.log"
else
    echo "❌ Erro ao iniciar servidor!"
    echo ""
    echo "📝 Veja os logs:"
    tail -20 /tmp/vite-cashback.log
    exit 1
fi

echo ""
echo "============================================"
echo "✅ SERVIDOR REINICIADO COM SUCESSO!"
echo "============================================"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Execute o SQL de limpeza no Supabase (ver EXECUTAR_AGORA.sql)"
echo "2. Abra ABA ANÔNIMA no navegador (Ctrl+Shift+N)"
echo "3. Acesse seu dashboard e faça upload do logo"
echo "4. Verifique com a query SQL"
echo ""
echo "📝 Ver logs em tempo real:"
echo "   tail -f /tmp/vite-cashback.log"
echo ""
