// Service Worker para Push Notifications
console.log('🔔 Service Worker carregado');

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker instalado');
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Receber Push Notifications
self.addEventListener('push', (event) => {
  console.log('📬 Push recebido:', event.data?.text());

  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'Localcashback';
  const options = {
    body: data.body || data.message || 'Nova notificação',
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    image: data.image,
    data: data.data || {},
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificação clicada:', event.notification.tag);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Tentar focar em janela existente
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificação fechada:', event.notification.tag);
});
