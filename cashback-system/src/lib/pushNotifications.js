// Sistema de Push Notifications
import { supabase } from './supabase';

/**
 * Solicitar permissão de notificações
 */
export async function requestNotificationPermission() {
  try {
    // Verificar se navegador suporta notificações
    if (!('Notification' in window)) {
      console.warn('❌ Este navegador não suporta notificações');
      return { success: false, error: 'not_supported' };
    }

    // Verificar se Service Worker é suportado
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Worker não suportado');
      return { success: false, error: 'no_service_worker' };
    }

    // Solicitar permissão
    const permission = await Notification.requestPermission();
    console.log('🔔 Permissão de notificação:', permission);

    if (permission === 'granted') {
      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registrado:', registration);

      // Aguardar Service Worker estar pronto
      await navigator.serviceWorker.ready;

      return { 
        success: true, 
        permission, 
        registration 
      };
    }

    return { 
      success: false, 
      error: 'permission_denied',
      permission 
    };

  } catch (error) {
    console.error('❌ Erro ao solicitar permissão:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Verificar se notificações estão habilitadas
 */
export function areNotificationsEnabled() {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Enviar notificação local (sem push server)
 */
export async function sendLocalNotification(options) {
  try {
    console.log('🔔 [INÍCIO] Enviando notificação...', options);

    // Verificar permissão
    if (!areNotificationsEnabled()) {
      console.error('❌ [ERRO] Notificações não habilitadas. Permission:', Notification.permission);
      return { success: false, error: 'not_enabled' };
    }

    console.log('✅ [OK] Permissão concedida');

    // Configuração padrão
    const notification = {
      title: options.title || 'Localcashback',
      body: options.message || options.body || '',
      icon: options.icon || '/icon-192.png',
      badge: '/badge-72.png',
      image: options.image,
      data: {
        url: options.url || '/',
        ...options.data
      },
      tag: options.tag || `notification-${Date.now()}`,
      requireInteraction: options.requireInteraction || false,
      vibrate: options.vibrate || [200, 100, 200],
      silent: options.silent || false
    };

    console.log('📋 [CONFIG]', notification);

    // SEMPRE usar Notification API direta (mais confiável)
    console.log('🚀 [EXECUTANDO] new Notification()...');
    
    const notif = new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      image: notification.image,
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      vibrate: notification.vibrate,
      silent: notification.silent
    });

    console.log('✅ [SUCESSO] Notificação criada!', notif);

    // Adicionar evento de clique
    notif.onclick = function(event) {
      console.log('🖱️ [CLIQUE] Notificação clicada');
      event.preventDefault();
      const url = notification.data?.url || '/';
      window.focus();
      notif.close();
    };

    notif.onerror = function(error) {
      console.error('❌ [ERRO NA NOTIFICAÇÃO]', error);
    };

    notif.onclose = function() {
      console.log('❌ [FECHADA] Notificação fechada');
    };

    notif.onshow = function() {
      console.log('👀 [MOSTRADA] Notificação apareceu na tela');
    };

    return { success: true, notification };

  } catch (error) {
    console.error('❌ [EXCEÇÃO] Erro ao enviar notificação:', error);
    console.error('❌ [DETALHES]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      permission: Notification.permission
    });
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificação de cashback recebido
 */
export async function notifyCashbackReceived(data) {
  const { amount, merchantName, customerPhone, merchantId } = data;
  const dashboardUrl = merchantId
    ? `/customer/dashboard/${customerPhone}?merchant=${merchantId}`
    : `/customer/dashboard/${customerPhone}`;

  return await sendLocalNotification({
    title: '🎉 Cashback Recebido!',
    body: `Você ganhou R$ ${parseFloat(amount).toFixed(2)} em ${merchantName}`,
    icon: '/icon-192.png',
    tag: 'cashback-received',
    data: {
      type: 'cashback',
      amount,
      merchantName,
      url: dashboardUrl
    },
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: false
  });
}

/**
 * Enviar notificação de resgate realizado
 */
export async function notifyRedemptionCompleted(data) {
  const { amount, merchantName, customerPhone, merchantId } = data;
  const dashboardUrl = merchantId
    ? `/customer/dashboard/${customerPhone}?merchant=${merchantId}`
    : `/customer/dashboard/${customerPhone}`;

  return await sendLocalNotification({
    title: '💰 Resgate Confirmado!',
    body: `Você usou R$ ${parseFloat(amount).toFixed(2)} em ${merchantName}`,
    icon: '/icon-192.png',
    tag: 'redemption-completed',
    data: {
      type: 'redemption',
      amount,
      merchantName,
      url: dashboardUrl
    },
    vibrate: [200, 100, 200],
    requireInteraction: false
  });
}

/**
 * Enviar notificação de promoção (admin)
 */
export async function notifyPromotion(data) {
  const { title, message, merchantName, url, image } = data;

  return await sendLocalNotification({
    title: title || '🎁 Nova Promoção!',
    body: message || `Confira a promoção exclusiva em ${merchantName}`,
    icon: '/icon-192.png',
    image: image,
    tag: 'promotion',
    data: {
      type: 'promotion',
      merchantName,
      url: url || '/'
    },
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true
  });
}

/**
 * Salvar subscription no banco (para futuro push server)
 */
export async function saveSubscription(customerId, subscription) {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        customer_id: customerId,
        subscription: subscription,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    console.log('✅ Subscription salva no banco');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao salvar subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Registrar dispositivo para receber notificações
 */
export async function registerDevice(customerPhone) {
  try {
    // Solicitar permissão
    const result = await requestNotificationPermission();
    
    if (!result.success) {
      return result;
    }

    // Buscar customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customerPhone)
      .single();

    if (customer) {
      // Salvar que o cliente habilitou notificações
      await supabase
        .from('customers')
        .update({ 
          push_enabled: true,
          push_enabled_at: new Date().toISOString()
        })
        .eq('id', customer.id);
    }

    console.log('✅ Dispositivo registrado para notificações');

    return { 
      success: true,
      message: 'Notificações habilitadas com sucesso!'
    };

  } catch (error) {
    console.error('❌ Erro ao registrar dispositivo:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
