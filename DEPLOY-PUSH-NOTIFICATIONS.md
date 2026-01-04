# 🚀 DEPLOY - Push Notifications

## ✅ PASSOS OBRIGATÓRIOS

### **1. Executar SQL no Supabase**

```sql
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Selecione seu projeto LocalCashback
-- 3. Vá em: SQL Editor > New Query
-- 4. Cole o SQL abaixo e clique em RUN ▶️

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  image TEXT,
  url TEXT,
  target VARCHAR(50) DEFAULT 'all',
  target_id UUID,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar campos de push na tabela customers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'push_enabled'
  ) THEN
    ALTER TABLE customers 
    ADD COLUMN push_enabled BOOLEAN DEFAULT false,
    ADD COLUMN push_enabled_at TIMESTAMPTZ;
  END IF;
END $$;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_push_enabled ON customers(push_enabled);
```

✅ **Resultado esperado:** "Success. No rows returned"

---

### **2. Deploy para Servidor**

```bash
ssh root@31.97.167.88 "cd /var/www/cashback/cashback-system && git pull origin main && npm install && npm run build && systemctl reload nginx && echo '✅ Deploy completo!'"
```

⏱️ **Aguarde 1-2 minutos** para o deploy completar.

---

### **3. Criar Ícones de Notificação (OPCIONAL)**

Os ícones melhoram a aparência, mas o sistema funciona sem eles.

**Método 1: Usar Canva (Fácil)**
1. Acesse: https://canva.com
2. Crie design 192x192 pixels com seu logo
3. Baixe como PNG → salve como `icon-192.png`
4. Crie design 72x72 pixels (logo simples)
5. Baixe como PNG → salve como `badge-72.png`
6. Envie via SCP:
```bash
scp icon-192.png root@31.97.167.88:/var/www/cashback/cashback-system/dist/
scp badge-72.png root@31.97.167.88:/var/www/cashback/cashback-system/dist/
```

**Método 2: Usar Logo Existente**
```bash
# SSH no servidor
ssh root@31.97.167.88

# Ir para pasta do site
cd /var/www/cashback/cashback-system/dist

# Copiar favicon como ícone (temporário)
cp favicon.ico icon-192.png
cp favicon.ico badge-72.png
```

---

## 🧪 TESTAR O SISTEMA

### **Teste 1: Verificar Deploy**

```bash
# Acesse o site
https://localcashback.com.br

# Abra DevTools (F12)
# Vá em: Application > Service Workers
# Deve aparecer: /sw.js - activated and running ✅
```

### **Teste 2: Habilitar Notificações (Como Cliente)**

```bash
# 1. Acesse o dashboard do cliente
https://localcashback.com.br/customer/dashboard/11999887766

# 2. Aparecerá popup no canto inferior direito:
#    "Ativar Notificações?"
#    
# 3. Clique em "Ativar"
#    
# 4. Navegador pedirá permissão:
#    "localcashback.com.br deseja enviar notificações"
#    
# 5. Clique em "Permitir" ✅
```

### **Teste 3: Receber Cashback com Notificação**

```bash
# 1. Faça login como comerciante
https://localcashback.com.br/login

# 2. Vá em "Cashback" no menu

# 3. Crie nova transação:
   - Telefone: 11999887766
   - Valor: R$ 100,00
   
# 4. Clique em "Gerar QR Code"

# 5. No celular, escaneie o QR Code

# 6. ✅ NOTIFICAÇÃO APARECE!
#    "🎉 Cashback Recebido!"
#    "Você ganhou R$ 10,00 em Nome do Comerciante"
```

### **Teste 4: Enviar Promoção (Como Admin)**

```bash
# 1. Faça login como comerciante
https://localcashback.com.br/login

# 2. No menu lateral, clique em "Notificações" 🔔

# 3. Preencha o formulário:
   Título: 🎁 Promoção Especial!
   Mensagem: Ganhe 20% de cashback em todas as compras hoje!
   
# 4. Clique em "Enviar Notificação"

# 5. ✅ NOTIFICAÇÃO APARECE!
#    (Aparecerá para você como teste)
```

---

## 🎯 COMO OS CLIENTES USAM

### **Fluxo Completo:**

```
1. Cliente escaneia QR Code pela primeira vez
   ↓
2. É redirecionado para dashboard
   ↓
3. Vê popup: "Ativar Notificações?"
   ↓
4. Clica em "Ativar"
   ↓
5. Navegador pede permissão
   ↓
6. Cliente permite
   ↓
7. ✅ PRONTO! Receberá notificações automáticas

Daqui em diante:
- Ganhou cashback? → NOTIFICAÇÃO INSTANTÂNEA 🎉
- Resgatou cashback? → NOTIFICAÇÃO INSTANTÂNEA 💰
- Admin enviou promoção? → NOTIFICAÇÃO 🎁
```

---

## 📊 MONITORAMENTO

### **Ver Clientes com Notificações Ativas**

```sql
-- Execute no Supabase SQL Editor
SELECT 
  name,
  phone,
  push_enabled,
  push_enabled_at
FROM customers
WHERE push_enabled = true
ORDER BY push_enabled_at DESC;
```

### **Ver Histórico de Notificações Enviadas**

```sql
SELECT 
  type,
  title,
  message,
  sent_at
FROM notifications
ORDER BY sent_at DESC
LIMIT 20;
```

---

## ⚠️ IMPORTANTE

### **Modo Atual: Notificações Locais**

O sistema atual envia notificações **quando o cliente está com o navegador aberto** (mesmo minimizado).

**Funciona perfeitamente para:**
✅ Cliente escaneia QR Code → recebe notificação
✅ Cliente está no app → recebe promoções
✅ Navegador minimizado → notificações aparecem

**Limitação:**
❌ Cliente fechou completamente o navegador → não recebe

### **Upgrade Futuro: Notificações Globais**

Para enviar notificações mesmo com navegador fechado:

**Opção 1: Firebase Cloud Messaging (Gratuito)**
- Cadastre em: https://console.firebase.google.com
- Integre o SDK
- Notificações ilimitadas grátis

**Opção 2: OneSignal (Plano Gratuito)**
- Cadastre em: https://onesignal.com
- 10.000 usuários grátis
- Interface visual fácil

**Opção 3: Pusher Beams**
- Cadastre em: https://pusher.com/beams
- 1.000 usuários grátis

---

## 🐛 PROBLEMAS COMUNS

### **"Service Worker não aparece"**

```bash
# Limpe cache do navegador
# Chrome: Ctrl + Shift + Delete
# Ou: F12 > Application > Clear Storage > Clear site data
```

### **"Notificação não aparece"**

```bash
# Verifique permissões
# Chrome: Configurações > Privacidade > Configurações de site > Notificações
# Procure localcashback.com.br
# Deve estar: Permitido ✅
```

### **"Popup não aparece no dashboard"**

```bash
# Limpe localStorage
# F12 > Console > Digite:
localStorage.removeItem('notification-permission-dismissed');
# Recarregue a página
```

### **Teste Manual (Console)**

```javascript
// Cole no Console (F12):
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('🧪 Teste', {
    body: 'Se você vê isso, está funcionando!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200]
  });
});
```

---

## 📱 COMPATIBILIDADE

### **Funciona em:**
✅ Chrome (Android e Desktop)
✅ Firefox (Android e Desktop)
✅ Edge (Desktop)
✅ Safari (iOS 16.4+, macOS 13+)
✅ Opera (Android e Desktop)
✅ Samsung Internet

### **Não funciona em:**
❌ Safari iOS < 16.4
❌ Navegadores muito antigos
❌ Modo de navegação anônima (algumas versões)

---

## ✅ CHECKLIST FINAL

Antes de considerar concluído, verifique:

- [ ] SQL executado no Supabase (sem erros)
- [ ] Deploy realizado com sucesso
- [ ] Service Worker aparece em Application (F12)
- [ ] Popup de permissão aparece no dashboard do cliente
- [ ] Notificação de cashback funciona
- [ ] Notificação de resgate funciona
- [ ] Painel admin acessível em /notifications
- [ ] Consegue enviar promoção de teste
- [ ] Ícones criados (opcional)

---

## 🎓 RECURSOS

**Documentação completa:** `PUSH-NOTIFICATIONS.md`

**Arquivos importantes:**
- `public/sw.js` - Service Worker
- `src/lib/pushNotifications.js` - Funções principais
- `src/pages/AdminNotifications.jsx` - Painel admin
- `src/components/NotificationPermission.jsx` - Popup

**Dúvidas?** Verifique o console do navegador (F12 > Console)

---

**LocalCashback - Sistema de Push Notifications** 🚀
**Versão:** 1.0.0
**Data:** 2024
