importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Clique na notificação abre o site
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});