#!/bin/bash

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🚀 DEPLOY DAS ALTERAÇÕES DA PÁGINA DO CLIENTE"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Passo 1: Atualizar código
echo "📥 PASSO 1: Atualizando código do repositório..."
cd /var/www/cashback/cashback-system
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Código atualizado com sucesso!"
else
    echo "❌ Erro ao atualizar código. Abortando..."
    exit 1
fi

echo ""

# Passo 2: Build
echo "🔨 PASSO 2: Compilando frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro ao fazer build. Abortando..."
    exit 1
fi

echo ""

# Passo 3: Recarregar nginx
echo "🔄 PASSO 3: Recarregando nginx..."
sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "✅ Nginx recarregado com sucesso!"
else
    echo "❌ Erro ao recarregar nginx."
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ DEPLOY CONCLUÍDO!"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANTE: Ainda falta atualizar o banco de dados!"
echo ""
echo "📋 Execute no Supabase SQL Editor:"
echo ""
echo "   1. Acesse https://app.supabase.com"
echo "   2. Vá em SQL Editor"
echo "   3. Cole e execute:"
echo ""
cat << 'EOF'
-- Adicionar campos na tabela customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS birthdate DATE;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_customers_password ON customers(password_hash);

-- Definir senha padrão "123456" para clientes antigos
UPDATE customers 
SET password_hash = 'MTIzNDU2'
WHERE password_hash IS NULL;
EOF
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "🎉 Pronto! As alterações foram aplicadas!"
echo ""
echo "🧪 TESTE AGORA:"
echo "   1. Acesse um link de cadastro"
echo "   2. Verifique se logo do estabelecimento está no topo"
echo "   3. Verifique se campos de nascimento e senha estão presentes"
echo "   4. Faça um cadastro de teste"
echo "   5. Tente acessar o perfil e veja a tela de login"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
