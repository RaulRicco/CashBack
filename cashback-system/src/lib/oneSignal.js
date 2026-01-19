// Integração com OneSignal
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

/**
 * Inicializar OneSignal
 */
export async function initOneSignal() {
  try {
    if (!window.OneSignalDeferred) {
      console.error('❌ OneSignal SDK não carregado');
      return { success: false, error: 'sdk_not_loaded' };
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    await new Promise((resolve) => {
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true, // Para desenvolvimento
        });
        
        console.log('✅ OneSignal inicializado');
        resolve();
      });
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao inicializar OneSignal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Solicitar permissão de notificações
 */
export async function requestPermission() {
  try {
    await initOneSignal();
    
    return new Promise((resolve) => {
      window.OneSignalDeferred.push(async function(OneSignal) {
        const isPushSupported = await OneSignal.Notifications.isPushSupported();
        
        if (!isPushSupported) {
          console.error('❌ Push notifications não suportadas');
          resolve({ success: false, error: 'not_supported' });
          return;
        }

        const permission = await OneSignal.Notifications.requestPermission();
        
        if (permission) {
          console.log('✅ Permissão concedida');
          resolve({ success: true });
        } else {
          console.log('❌ Permissão negada');
          resolve({ success: false, error: 'permission_denied' });
        }
      });
    });
  } catch (error) {
    console.error('❌ Erro ao solicitar permissão:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar se está inscrito
 */
export async function isSubscribed() {
  try {
    return new Promise((resolve) => {
      window.OneSignalDeferred.push(async function(OneSignal) {
        const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
        resolve(isOptedIn);
      });
    });
  } catch (error) {
    console.error('❌ Erro ao verificar inscrição:', error);
    return false;
  }
}

/**
 * Enviar notificação para todos (via proxy)
 */
export async function sendNotificationToAll(notification) {
  try {
    console.log('📤 Enviando notificação para todos via proxy:', notification);

    // Usar o proxy local para evitar CORS (mesma origem em produção)
    const proxyUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001'
      : '';

    const response = await fetch(`${proxyUrl}/api/onesignal/send-to-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification: {
          title: notification.title,
          message: notification.message,
          url: notification.url || 'https://localcashback.com.br',
          image: notification.image,
          icon: notification.icon || '/icon-192.png',
        }
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Notificação enviada com sucesso!', data);
      return {
        success: true,
        recipients: data.recipients,
        id: data.id
      };
    } else {
      console.error('❌ Erro ao enviar:', data);
      return {
        success: false,
        error: data.error || 'Erro desconhecido'
      };
    }
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Enviar notificação para usuário específico (via proxy)
 */
export async function sendNotificationToUser(userId, notification) {
  try {
    console.log(`📤 Enviando notificação para usuário ${userId} via proxy:`, notification);

    // Usar o proxy local para evitar CORS (mesma origem em produção)
    const proxyUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001'
      : '';

    const response = await fetch(`${proxyUrl}/api/onesignal/send-to-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        notification: {
          title: notification.title,
          message: notification.message,
          url: notification.url || 'https://localcashback.com.br',
          image: notification.image,
          icon: notification.icon || '/icon-192.png',
        }
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Notificação enviada!', data);
      return { success: true, data };
    } else {
      console.error('❌ Erro:', data);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Registrar cliente no OneSignal
 */
export async function registerCustomer(customerId, customerData) {
  try {
    return new Promise((resolve) => {
      window.OneSignalDeferred.push(async function(OneSignal) {
        // Definir external user ID
        await OneSignal.login(customerId);
        
        // Adicionar tags (dados do cliente)
        await OneSignal.User.addTags({
          customer_phone: customerData.phone,
          customer_name: customerData.name,
          available_cashback: customerData.available_cashback || 0,
        });

        console.log('✅ Cliente registrado no OneSignal:', customerId);
        resolve({ success: true });
      });
    });
  } catch (error) {
    console.error('❌ Erro ao registrar cliente:', error);
    return { success: false, error: error.message };
  }
}
