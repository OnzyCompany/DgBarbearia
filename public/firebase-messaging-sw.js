importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Configuração do Firebase no Service Worker
// Essas chaves são seguras de expor no frontend/SW
firebase.initializeApp({
  apiKey: "AIzaSyCrY_mxYOtVTFtKRsBpBjRWz13DbF2xA5Q",
  authDomain: "dgbarbearia.firebaseapp.com",
  projectId: "dgbarbearia",
  storageBucket: "dgbarbearia.firebasestorage.app",
  messagingSenderId: "746464245192",
  appId: "1:746464245192:web:c1bf405cbe818850b93cfd"
});

const messaging = firebase.messaging();

// Handler para mensagens em background (quando o site está fechado/minimizado)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Recebeu mensagem em background ', payload);
  
  const notificationTitle = payload.notification?.title || 'Nova Notificação';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
    // Importante para manter a notificação clicável e com dados
    data: payload.data || {},
    tag: 'push-notification-tag', // Evita spam visual acumulando
    renotify: true,
    requireInteraction: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Clique na notificação abre o site
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Tenta pegar a URL dos dados ou vai para a raiz
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já tem uma aba aberta, foca nela
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});