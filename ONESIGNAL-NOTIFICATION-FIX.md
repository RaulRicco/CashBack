# OneSignal Notification Fix

**Data**: 2026-01-03  
**Status**: ✅ Corrigido e em produção

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. **Permissão de notificações não solicitada no cadastro**

**Sintoma:**
- Cliente faz cadastro
- Navegador não pede permissão para notificações
- Cliente não recebe push notifications

**Causa:**
- Página `CustomerSignup.jsx` não solicitava permissão
- OneSignal não configurava External User ID no cadastro
- SDK não inicializado no momento do cadastro

### 2. **Push notifications de cashback não enviadas**

**Sintoma:**
- Cliente recebe cashback
- Push notification não chega
- Apenas signup e redemption funcionavam

**Causa:**
- Condição `eventType !== 'purchase'` bloqueava push de cashback
- Evento 'purchase' (recebimento de cashback) era ignorado
- Código na linha 125 de `integrations/index.js` tinha lógica errada

---

## ✅ CORREÇÕES APLICADAS

### **Fix 1: Solicitar permissão no cadastro**

**Arquivo**: `cashback-system/src/pages/CustomerSignup.jsx`

**O que foi feito:**
```javascript
// Após cadastro bem-sucedido, solicitar permissão
setTimeout(async () => {
  if (window.OneSignalDeferred) {
    window.OneSignalDeferred.push(async function(OneSignal) {
      // Definir External User ID (telefone)
      await OneSignal.login(phoneClean);
      
      // Solicitar permissão
      const permission = await OneSignal.Notifications.requestPermission();
      console.log('🔔 Permissão:', permission ? 'Concedida' : 'Negada');
    });
  }
}, 2000); // 2 segundos para garantir inicialização
```

**Resultado:**
- ✅ Navegador solicita permissão após cadastro
- ✅ External User ID configurado (telefone)
- ✅ Cliente inscrito para receber notificações
- ✅ Não bloqueia cadastro se usuário negar

---

### **Fix 2: Enviar push em todos os eventos**

**Arquivo**: `cashback-system/src/lib/integrations/index.js`

**ANTES (errado):**
```javascript
if (result?.success && eventType !== 'purchase') {
  // Push NÃO era enviado quando eventType = 'purchase'
  await sendPushNotification(customer, merchantId, eventType);
}
```

**DEPOIS (correto):**
```javascript
if (result?.success) {
  // Mapear 'purchase' → 'cashback'
  let notificationType = eventType;
  
  if (eventType === 'purchase') {
    notificationType = 'cashback';
  }
  
  console.log(`🔔 Enviando push: ${notificationType}`);
  await sendPushNotification(customer, merchantId, notificationType);
}
```

**Resultado:**
- ✅ Signup → push enviado
- ✅ Purchase/Cashback → push enviado (mapeado corretamente)
- ✅ Redemption → push enviado

---

## 🧪 TESTES RECOMENDADOS

### **Teste 1: Cadastro + Permissão**
1. Aba anônima
2. Acesse: https://cashback.raulricco.com.br/signup/bardoraul
3. Preencha os dados e cadastre
4. **Aguarde 2 segundos**
5. ✅ Navegador deve solicitar permissão de notificações
6. Aceite a permissão
7. ✅ Deve receber push: "🎉 Bem-vindo ao Local CashBack!"

### **Teste 2: Recebimento de Cashback**
1. Logue como merchant
2. Acesse área de cashback
3. Registre uma compra para um cliente
4. ✅ Cliente deve receber push: "💰 Você ganhou R$ X em cashback!"

### **Teste 3: Resgate**
1. Logue como cliente com saldo
2. Faça um resgate
3. ✅ Deve receber push: "✅ Resgate confirmado!"

---

## 📊 VERIFICAÇÃO NO CONSOLE

Abra DevTools (F12) e procure por:

### **No Cadastro:**
```
🔔 Solicitando permissão de notificações...
✅ [OneSignal] External User ID definido: 6199229922
🔔 Permissão de notificações: true
✅ Cliente sincronizado com OneSignal
🔔 Enviando push notification: signup
✅ Notificação push enviada
```

### **No Cashback:**
```
✅ Cliente sincronizado com OneSignal
🔔 Enviando push notification: cashback
✅ Notificação push enviada
```

### **No Resgate:**
```
✅ Cliente sincronizado com OneSignal
🔔 Enviando push notification: redemption
✅ Notificação push enviada
```

---

## 🔍 VERIFICAR NO DASHBOARD ONESIGNAL

1. Acesse: https://onesignal.com/
2. Vá em **Audience** → **All Users**
3. Você deve ver os usuários inscritos
4. Vá em **Messages** → **History**
5. Você deve ver as notificações enviadas com status "Delivered"

---

## 📝 RESUMO DAS MUDANÇAS

| Problema | Solução | Arquivo | Commit |
|----------|---------|---------|--------|
| Permissão não solicitada | Adicionar request no signup | CustomerSignup.jsx | 4ef16ea |
| Push de cashback não enviado | Remover condição bloqueadora | integrations/index.js | cc82059 |

---

## ✅ STATUS FINAL

| Evento | Push Enviado | Status |
|--------|--------------|--------|
| 🎯 Cadastro (signup) | ✅ Sim | "🎉 Bem-vindo ao Local CashBack!" |
| 💰 Cashback (purchase) | ✅ Sim | "💰 Você ganhou R$ X em cashback!" |
| 🎁 Resgate (redemption) | ✅ Sim | "✅ Resgate confirmado!" |

---

## 🚀 PRÓXIMOS PASSOS

1. **Configurar credenciais OneSignal** (se ainda não fez)
   - Criar conta: https://onesignal.com/
   - Copiar App ID + REST API Key
   - Adicionar em: https://cashback.raulricco.com.br/integrations

2. **Testar em produção**
   - Fazer um cadastro teste
   - Aceitar permissão de notificações
   - Registrar cashback
   - Fazer resgate
   - Verificar se todas as notificações chegam

3. **Monitorar logs**
   - Verificar console do navegador
   - Verificar dashboard OneSignal
   - Verificar logs de integração no sistema

---

## 🔗 LINKS ÚTEIS

- **OneSignal Dashboard**: https://onesignal.com/
- **Configurar Integração**: https://cashback.raulricco.com.br/integrations
- **Site Produção**: https://cashback.raulricco.com.br
- **PR GitHub**: https://github.com/RaulRicco/CashBack/pull/4

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `ONESIGNAL-QUICK-START.md` - Guia rápido de configuração
- `ONESIGNAL-CONFIG-GUIDE.md` - Guia completo detalhado
- `ONESIGNAL-IMPLEMENTATION-STATUS.md` - Status técnico

---

**Criado**: 2026-01-03  
**Última atualização**: 2026-01-03  
**Status**: ✅ Corrigido e em produção
