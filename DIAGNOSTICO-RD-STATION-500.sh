#!/bin/bash

echo "═══════════════════════════════════════════════════"
echo "  DIAGNÓSTICO COMPLETO - ERRO 500 RD STATION"
echo "═══════════════════════════════════════════════════"
echo ""

# 1. Verificar se proxy está rodando
echo "1️⃣  VERIFICANDO PROXY (PM2)"
echo "---------------------------------------------------"
pm2 list | grep integration-proxy
echo ""

# 2. Verificar porta 3001
echo "2️⃣  VERIFICANDO PORTA 3001"
echo "---------------------------------------------------"
sudo netstat -tlnp | grep 3001
echo ""

# 3. Verificar logs recentes do proxy
echo "3️⃣  LOGS DO PROXY (últimas 20 linhas)"
echo "---------------------------------------------------"
pm2 logs integration-proxy --lines 20 --nostream
echo ""

# 4. Verificar nginx access log para /api/rdstation
echo "4️⃣  NGINX ACCESS LOG - REQUISIÇÕES /api/rdstation"
echo "---------------------------------------------------"
sudo tail -100 /var/log/nginx/access.log | grep -i "rdstation" | tail -10
if [ $? -ne 0 ]; then
    echo "❌ Nenhuma requisição /api/rdstation encontrada nos logs do nginx!"
fi
echo ""

# 5. Verificar nginx error log
echo "5️⃣  NGINX ERROR LOG (últimas 10 linhas)"
echo "---------------------------------------------------"
sudo tail -10 /var/log/nginx/error.log
echo ""

# 6. Testar proxy diretamente (localhost)
echo "6️⃣  TESTE DIRETO NO PROXY (curl localhost:3001)"
echo "---------------------------------------------------"
curl -s http://localhost:3001/api/rdstation/test \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"924c4bde788c0710b77bb3a10127c850"}' | jq '.'
echo ""

# 7. Testar através do nginx (127.0.0.1:443)
echo "7️⃣  TESTE ATRAVÉS DO NGINX (curl https://localcashback.com.br/api/...)"
echo "---------------------------------------------------"
curl -k -s https://localcashback.com.br/api/rdstation/test \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"924c4bde788c0710b77bb3a10127c850"}' | jq '.'
echo ""

# 8. Verificar configuração nginx
echo "8️⃣  CONFIGURAÇÃO NGINX - BLOCO /api/"
echo "---------------------------------------------------"
sudo grep -A 10 "location /api/" /etc/nginx/sites-available/localcashback
echo ""

# 9. Verificar se há outro serviço na porta 3001
echo "9️⃣  PROCESSOS NA PORTA 3001"
echo "---------------------------------------------------"
sudo lsof -i :3001
echo ""

# 10. Verificar última modificação do dist
echo "🔟 ÚLTIMA BUILD DO FRONTEND"
echo "---------------------------------------------------"
ls -lh /var/www/cashback/cashback-system/dist/assets/*.js | head -3
echo ""
stat /var/www/cashback/cashback-system/dist/index.html | grep Modify
echo ""

echo "═══════════════════════════════════════════════════"
echo "  FIM DO DIAGNÓSTICO"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📋 INSTRUÇÕES:"
echo "   1. Copie TODA a saída acima"
echo "   2. Envie para o assistente"
echo "   3. Aguarde análise detalhada"
echo ""
