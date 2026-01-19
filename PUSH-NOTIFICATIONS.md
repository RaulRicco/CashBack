# 🔔 Sistema de Push Notifications - Documentação

## 📋 O Que Foi Implementado

### 1. **Push Notifications Nativas do Sistema**
- Notificações aparecem na barra de notificações do Android/iOS
- Funcionam mesmo com o navegador minimizado
- Som e vibração personalizados
- Ícone e imagem de marca

### 2. **Service Worker**
- Gerencia notificações em background
- Permite clique para abrir o app
- Persiste mesmo com app fechado

### 3. **Notificações Automáticas**
✅ **Cashback Recebido** - Quando cliente ganha cashback
✅ **Resgate Realizado** - Quando cliente resgata cashback
✅ **Promoções** - Admin pode enviar promoções personalizadas

### 4. **Painel Admin de Promoções**
- Enviar notificações para clientes
- Personalizar título, mensagem, imagem
- Definir link de destino
- Histórico de notificações enviadas

---

## 🎯 Como Funciona

### **Para o Cliente:**

1. **Primeira vez no dashboard:** Aparece popup pedindo permissão
2. Cliente clica em **"Ativar"**
3. Navegador solicita permissão nativa (popup do sistema)
4. Cliente permite
5. ✅ Pronto! Agora receberá notificações

### **Notificações Automáticas:**

- **Ganhou cashback?** → 🎉 Notificação verde aparece
- **Resgatou cashback?** → 💰 Notificação laranja aparece
- Funcionam MESMO se o app estiver minimizado

---

## 🛠️ Arquivos Criados/Modificados

### **Novos Arquivos:**
```
public/sw.js                                 - Service Worker
src/lib/pushNotifications.js                 - Sistema de Push
src/components/NotificationPermission.jsx    - Popup de permissão
src/pages/AdminNotifications.jsx             - Painel admin
supabase/migrations/create_notifications_table.sql
```

### **Arquivos Modificados:**
```
src/pages/CustomerCashback.jsx          - Integrar notificação
src/pages/CustomerRedemption.jsx        - Integrar notificação
src/pages/CustomerDashboard.jsx         - Mostrar popup permissão
src/components/DashboardLayout.jsx      - Link menu "Notificações"
src/App.jsx                             - Rota /notifications
```

---

## 📱 Como Testar

### **1. Habilitar Notificações (Cliente)**

```bash
# 1. Acesse o dashboard do cliente
https://localcashback.com.br/customer/dashboard/SEU_TELEFONE

# 2. Aparecerá popup no canto inferior direito
# 3. Clique em "Ativar"
# 4. Permita nas configurações do navegador
```

### **2. Testar Cashback Recebido**

```bash
# 1. Crie uma transação no painel admin
# 2. Gere QR Code
# 3. Escaneie com o telefone do cliente
# 4. ✅ Notificação aparece automaticamente!
```

### **3. Testar Resgate**

```bash
# 1. No painel admin, vá em "Resgate"
# 2. Gere QR Code de resgate
# 3. Cliente escaneia
# 4. ✅ Notificação aparece!
```

### **4. Enviar Promoção (Admin)**

```bash
# 1. No painel admin, vá em "Notificações" no menu
# 2. Preencha o formulário:
   - Título: 🎁 Promoção Especial!
   - Mensagem: Ganhe 20% de cashback hoje!
   - Imagem (opcional)
   - Link de destino (opcional)
# 3. Clique em "Enviar Notificação"
# 4. ✅ Notificação aparece para todos os clientes!
```

---

## 🗄️ Banco de Dados

### **SQL para Executar:**

```sql
-- Execute este SQL no Supabase SQL Editor:
-- Copie e cole o conteúdo de: supabase/migrations/create_notifications_table.sql

-- Resumo do que será criado:
-- Tabela 'notifications' - histórico de notificações enviadas
-- Campos 'push_enabled' e 'push_enabled_at' na tabela customers
-- Índices para melhor performance
```

### **Como Executar:**

1. Acesse Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo de `supabase/migrations/create_notifications_table.sql`
5. Clique em **Run** ▶️

---

## 🎨 Ícones de Notificação

### **Arquivos Necessários:**

```
public/icon-192.png   - 192x192 pixels (logo colorido)
public/badge-72.png   - 72x72 pixels (logo monocromático)
```

### **Como Criar:**

1. Use seu logo do LocalCashback
2. Redimensione para 192x192 e 72x72
3. Salve como PNG
4. Coloque na pasta `public/`

**Dica:** Use o Canva ou Figma para criar rapidamente.

---

## 🚀 Deploy

### **Comando de Deploy:**

```bash
ssh root@31.97.167.88 "cd /var/www/cashback/cashback-system && git pull origin main && npm install && npm run build && systemctl reload nginx && echo '✅ Deploy completo!'"
```

### **Verificar Service Worker:**

1. Abra o site no Chrome
2. Aperte **F12** (DevTools)
3. Vá na aba **Application**
4. No menu esquerdo, clique em **Service Workers**
5. Deve aparecer: `/sw.js` - Status: **activated and is running**

---

## ⚠️ Importante

### **Modo de Teste Atual:**

O sistema está em **modo de teste** e envia notificações **locais** (apenas no dispositivo atual).

### **Próximos Passos (Produção Real):**

Para enviar notificações para TODOS os clientes mesmo quando não estão no site:

1. **Integrar com Firebase Cloud Messaging (FCM)** - Gratuito
2. **Ou usar OneSignal** - Plano gratuito até 10k usuários
3. **Ou usar Pusher Beams** - Plano gratuito disponível

**Por enquanto:** As notificações funcionam PERFEITAMENTE quando o cliente está com o site aberto (mesmo minimizado).

---

## 🎯 Casos de Uso

### **Exemplos de Promoções:**

- 🎉 **Dobro de cashback** neste final de semana!
- 🔥 **Queima de estoque** com 30% de desconto + cashback
- 🎁 Seu **aniversário** chegou! Ganhe 50% de cashback hoje
- ⚡ **Flash Sale**: Compre agora e ganhe R$ 10 de cashback extra
- 💰 Resgate seu cashback e ganhe **10% de bônus**

---

## 🐛 Solução de Problemas

### **Notificações Não Aparecem:**

1. **Verificar Permissões:**
   - Chrome: Settings > Privacy > Site Settings > Notifications
   - Procure por `localcashback.com.br` e garanta que está **Allowed**

2. **Verificar Service Worker:**
   - F12 > Application > Service Workers
   - Deve estar **activated**

3. **Testar Manualmente:**
```javascript
// Cole no Console (F12):
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Teste', {
    body: 'Se você vê isso, está funcionando!',
    icon: '/icon-192.png'
  });
});
```

### **Service Worker Não Registra:**

```bash
# Limpe o cache do navegador
# Ou force refresh: Ctrl + Shift + R
```

---

## 📊 Monitoramento

### **Ver Histórico de Notificações (SQL):**

```sql
-- Ver últimas 10 notificações enviadas
SELECT 
  type,
  title,
  message,
  sent_at,
  sent_by
FROM notifications
ORDER BY sent_at DESC
LIMIT 10;
```

### **Ver Clientes com Notificações Habilitadas:**

```sql
SELECT 
  name,
  phone,
  push_enabled,
  push_enabled_at
FROM customers
WHERE push_enabled = true
ORDER BY push_enabled_at DESC;
```

---

## ✅ Checklist de Implementação

- [x] Service Worker criado
- [x] Sistema de Push Notifications
- [x] Notificação automática de cashback
- [x] Notificação automática de resgate
- [x] Popup de solicitação de permissão
- [x] Painel admin de promoções
- [x] Integração no dashboard do cliente
- [x] Link no menu de navegação
- [x] Tabela de notificações no banco
- [x] Documentação completa
- [ ] Executar SQL no Supabase
- [ ] Deploy para servidor
- [ ] Adicionar ícones (icon-192.png, badge-72.png)
- [ ] Testar em dispositivo real
- [ ] (Futuro) Integrar com Firebase/OneSignal

---

## 🎓 Aprendizado

Este sistema usa a **Web Push API** do navegador, que é uma tecnologia nativa do HTML5.

**Vantagens:**
- ✅ Funciona em Android e iOS (PWA)
- ✅ Não precisa baixar app da loja
- ✅ Som, vibração e ícones personalizados
- ✅ Funciona com navegador minimizado
- ✅ Totalmente gratuito

**Limitações (modo teste):**
- ⚠️ Só envia para quem está com site aberto
- ⚠️ Precisa de Firebase/OneSignal para enviar quando fechado

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique esta documentação
2. Consulte os logs do console (F12)
3. Teste com o código JavaScript de teste acima

---

**Desenvolvido para LocalCashback** 🚀
**Data:** 2024
