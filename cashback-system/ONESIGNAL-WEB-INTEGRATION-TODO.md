# OneSignal Web Integration - Próximos Passos

## 📋 O que foi feito até agora:

✅ Backend de sincronização (clientes vão para o OneSignal)
✅ Interface de configuração (merchants configuram App ID e REST API Key)
✅ Sincronização automática em signup, purchase, redemption
✅ Tags automáticas (lifecycle tracking)

## ⚠️ O que falta para push real funcionar:

### 1. Adicionar OneSignal Web SDK

No `index.html`, adicionar:
```html
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
```

### 2. Inicializar OneSignal no App

Criar `src/lib/integrations/onesignalWeb.js`:
```javascript
export async function initOneSignal(merchantAppId) {
  if (!window.OneSignalDeferred) return;
  
  window.OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: merchantAppId,
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: true
    });
  });
}

export async function subscribeUser(customerPhone) {
  if (!window.OneSignalDeferred) return;
  
  window.OneSignalDeferred.push(async function(OneSignal) {
    // Set external user ID
    await OneSignal.login(customerPhone);
    
    // Subscribe to push
    await OneSignal.Notifications.requestPermission();
    
    return {
      success: true,
      playerId: await OneSignal.User.PushSubscription.id
    };
  });
}
```

### 3. Integrar no CustomerDashboard

No `CustomerDashboard.jsx`:
```javascript
import { initOneSignal, subscribeUser } from '../lib/integrations/onesignalWeb';

useEffect(() => {
  if (merchant?.onesignal_app_id) {
    initOneSignal(merchant.onesignal_app_id);
  }
}, [merchant]);

// Quando cliente clicar em "Ativar Notificações"
const handleEnableNotifications = async () => {
  const result = await subscribeUser(customer.phone);
  if (result.success) {
    toast.success('Notificações ativadas!');
  }
};
```

### 4. Configuração OneSignal Web (Dashboard)

No OneSignal dashboard:
1. Settings → Platforms → Web → Add
2. Configure:
   - Site URL: https://cashback.churrascariaboidourado.com.br
   - Default Notification Icon
   - Permission Prompt
3. Download OneSignalSDKWorker.js → colocar em /public/

### 5. Service Worker

Adicionar ao `public/OneSignalSDKWorker.js`:
```javascript
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
```

## 🎯 Resultado Esperado:

Após implementação completa:
- ✅ Cliente acessa dashboard
- ✅ OneSignal SDK inicializa automaticamente
- ✅ Cliente clica "Ativar Notificações"
- ✅ Browser pede permissão de push
- ✅ Cliente é registrado no OneSignal com Player ID
- ✅ Merchant pode enviar push pelo dashboard OneSignal
- ✅ Cliente recebe notificação mesmo com browser fechado

## 📊 Comparação:

| Feature | Notificações Locais (Atual) | OneSignal (Completo) |
|---------|------------------------------|----------------------|
| Funciona sem servidor | ✅ Sim | ❌ Não |
| Push com app fechado | ❌ Não | ✅ Sim |
| Segmentação | ❌ Limitado | ✅ Avançada |
| Estatísticas | ❌ Não | ✅ Sim |
| Campanhas programadas | ❌ Não | ✅ Sim |
| Multi-plataforma | ❌ Web only | ✅ Web + Mobile |

## 💡 Recomendação:

**Para testes rápidos**: Use Notificações Locais (já funciona)
**Para produção**: Implemente OneSignal completo (melhor experiência)
