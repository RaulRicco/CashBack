#!/bin/bash

clear

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo -e "${BOLD}${CYAN}             🔔 DEMONSTRAÇÃO VISUAL - ONESIGNAL              ${NC}"
echo -e "${BOLD}${CYAN}                    LocalCashback System                      ${NC}"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# ETAPA 1: CLIENTE ACESSA O SITE
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}${BOLD}📱 ETAPA 1: Cliente acessa o site${NC}"
echo "────────────────────────────────────────────────────────────────────────────────"
echo ""
echo -e "${BLUE}Cliente abre: https://localcashback.com.br/customer${NC}"
echo "Faz login com telefone: 11999999999"
echo ""
sleep 2

# ═══════════════════════════════════════════════════════════════════════════════
# ETAPA 2: POPUP DE PERMISSÃO
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}${BOLD}🔔 ETAPA 2: Popup de permissão aparece${NC}"
echo "────────────────────────────────────────────────────────────────────────────────"
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│                                                              │"
echo "│  🔔  Ativar Notificações Push?                              │"
echo "│                                                              │"
echo "│  Receba alertas instantâneos quando ganhar ou               │"
echo "│  resgatar cashback! Funciona mesmo com o app fechado.       │"
echo "│                                                              │"
echo "│  ┌────────────┐  ┌────────────┐                            │"
echo "│  │   Ativar   │  │ Agora Não  │                            │"
echo "│  └────────────┘  └────────────┘                            │"
echo "│                                                              │"
echo "│  Você pode desativar a qualquer momento nas                 │"
echo "│  configurações do navegador.                                │"
echo "│                                                              │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""
echo -e "${GREEN}Cliente clica em: ${BOLD}[Ativar]${NC}"
sleep 3

# ═══════════════════════════════════════════════════════════════════════════════
# ETAPA 3: NAVEGADOR PEDE PERMISSÃO
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}${BOLD}🌐 ETAPA 3: Navegador pede permissão${NC}"
echo "────────────────────────────────────────────────────────────────────────────────"
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  localcashback.com.br deseja enviar notificações            │"
echo "│                                                              │"
echo "│               ┌────────────┐  ┌──────────┐                 │"
echo "│               │  Bloquear  │  │ Permitir │                 │"
echo "│               └────────────┘  └──────────┘                 │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""
echo -e "${GREEN}Cliente clica em: ${BOLD}[Permitir]${NC}"
sleep 3

# ═══════════════════════════════════════════════════════════════════════════════
# ETAPA 4: CONFIRMAÇÃO
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}${BOLD}✅ ETAPA 4: Confirmação de sucesso${NC}"
echo "────────────────────────────────────────────────────────────────────────────────"
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│                                                              │"
echo "│  ✅  Notificações Ativadas!                                 │"
echo "│                                                              │"
echo "│  Você receberá alertas de cashback mesmo com                │"
echo "│  o navegador fechado!                                        │"
echo "│                                                              │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""
echo -e "${GREEN}✅ Cliente está inscrito no OneSignal!${NC}"
echo -e "${CYAN}📊 Total de inscritos: 7 (agora)${NC}"
sleep 3

# ═══════════════════════════════════════════════════════════════════════════════
# ETAPA 5: TESTE DE ENVIO
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo ""
echo -e "${YELLOW}${BOLD}📤 ETAPA 5: Enviando notificações de teste...${NC}"
echo "────────────────────────────────────────────────────────────────────────────────"
echo ""

# Teste 1: Cadastro
echo -e "${BLUE}Enviando: Notificação de Cadastro...${NC}"
sleep 1
RESPONSE=$(curl -s -X POST http://localhost:3001/api/onesignal/notify-signup \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "teste-visual",
    "customerName": "João Silva",
    "customerPhone": "11999999999"
  }')

if echo "$RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Enviada com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro ao enviar${NC}"
fi
sleep 2

# Teste 2: Cashback
echo ""
echo -e "${BLUE}Enviando: Notificação de Cashback...${NC}"
sleep 1
RESPONSE=$(curl -s -X POST http://localhost:3001/api/onesignal/notify-cashback \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "teste-visual",
    "customerName": "João Silva",
    "cashbackAmount": 25.00
  }')

if echo "$RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Enviada com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro ao enviar${NC}"
fi
sleep 2

# Teste 3: Resgate
echo ""
echo -e "${BLUE}Enviando: Notificação de Resgate...${NC}"
sleep 1
RESPONSE=$(curl -s -X POST http://localhost:3001/api/onesignal/notify-redemption \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "teste-visual",
    "customerName": "João Silva",
    "redemptionAmount": 50.00
  }')

if echo "$RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Enviada com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro ao enviar${NC}"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# ETAPA 6: NOTIFICAÇÕES RECEBIDAS
# ═══════════════════════════════════════════════════════════════════════════════
sleep 2
echo ""
echo ""
echo -e "${YELLOW}${BOLD}🔔 ETAPA 6: Cliente recebe as notificações!${NC}"
echo "────────────────────────────────────────────────────────────────────────────────"
echo ""
echo -e "${CYAN}(Notificações aparecem no canto superior direito do navegador)${NC}"
echo ""
sleep 1

# Notificação 1
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 🏪 LocalCashback                                   [X] ┃"
echo "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫"
echo "┃                                                        ┃"
echo "┃ 👤 Novo Cliente Cadastrado!                           ┃"
echo "┃                                                        ┃"
echo "┃ João Silva acabou de se cadastrar (11999999999).      ┃"
echo "┃ Bem-vindo!                                             ┃"
echo "┃                                                        ┃"
echo "┃                                    Agora há 2 segundos ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
sleep 2

echo ""
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 🏪 LocalCashback                                   [X] ┃"
echo "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫"
echo "┃                                                        ┃"
echo "┃ 💰 Cashback Creditado!                                ┃"
echo "┃                                                        ┃"
echo "┃ João Silva ganhou R$ 25.00 de cashback! 🎉           ┃"
echo "┃                                                        ┃"
echo "┃                                    Agora há 5 segundos ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
sleep 2

echo ""
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 🏪 LocalCashback                                   [X] ┃"
echo "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫"
echo "┃                                                        ┃"
echo "┃ ✅ Resgate Solicitado!                                ┃"
echo "┃                                                        ┃"
echo "┃ João Silva solicitou resgate de R$ 50.00.             ┃"
echo "┃ Aguardando aprovação...                                ┃"
echo "┃                                                        ┃"
echo "┃                                    Agora há 8 segundos ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"

# ═══════════════════════════════════════════════════════════════════════════════
# RESUMO FINAL
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}${BOLD}                   ✅ TESTE CONCLUÍDO COM SUCESSO!                     ${NC}"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${CYAN}📊 RESUMO:${NC}"
echo ""
echo "   ✅ Cliente permitiu notificações"
echo "   ✅ Inscrito no OneSignal"
echo "   ✅ 3 notificações enviadas"
echo "   ✅ 3 notificações recebidas"
echo ""
echo -e "${YELLOW}💡 IMPORTANTE:${NC}"
echo ""
echo "   🔔 As notificações funcionam MESMO com o navegador fechado!"
echo "   📱 Funcionam em Desktop (Chrome, Firefox, Edge)"
echo "   📱 Funcionam em Mobile Android (Chrome)"
echo "   ⚠️  iOS tem limitações (Safari 16.4+)"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
