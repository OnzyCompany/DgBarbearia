importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Configuração do Firebase no Service Worker
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
  
  // Configurações para garantir que apareça no Android/Windows
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png', // Ícone pequeno na barra
    data: payload.data || { url: '/' },
    tag: 'nextbarber-notification',
    renotify: true, // Vibra novamente se chegar outra msg
    requireInteraction: true, // Exige que o usuário interaja
    actions: [
      { action: 'open_url', title: 'Abrir Barbearia' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Clique na notificação abre o site
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já tem uma aba aberta, foca nela e recarrega ou navega
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          if (client.url === urlToOpen) {
             return client.focus();
          }
          // Opcional: navegar a aba existente para a URL
          // return client.navigate(urlToOpen).then(c => c.focus());
        }
      }
      // Se não, abre nova janela
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});