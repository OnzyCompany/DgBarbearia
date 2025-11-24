import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, messaging } from './firebase';

// ⚠️ CHAVE VAPID
const VAPID_KEY = 'BAuLOh43fr68Lhdh5_BOlCQHw2MulSD2DPlaVdJNUcC9QJrULnsAo1xWQmT7iwAq5fmoPa4AByC8KrQVULrjFEQ'; 

export const solicitarPermissaoNotificacao = async (userId?: string) => {
  try {
    if (!messaging) {
      console.warn("Messaging não suportado neste navegador.");
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Permissão de notificação concedida.');
      
      // Registrar o Service Worker explicitamente para garantir escopo
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      // Obter o Token FCM usando o SW correto
      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('FCM Token obtido:', token);
        await salvarTokenNoFirestore(token, userId);
        return token;
      } else {
        console.error('Não foi possível obter o token.');
      }
    } else {
      console.warn('Permissão de notificação negada.');
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
  }
  return null;
};

const salvarTokenNoFirestore = async (token: string, userId?: string) => {
  // Salva na coleção 'users_notifications'
  // Usamos o próprio token como ID do documento para evitar duplicatas
  const tokenRef = doc(db, 'users_notifications', token);
  
  await setDoc(tokenRef, {
    token: token,
    userId: userId || 'anonymous',
    userAgent: navigator.userAgent,
    updatedAt: serverTimestamp(),
    platform: 'web'
  }, { merge: true });
  
  console.log('Token salvo no Firestore com sucesso.');
};

export const ouvirMensagensEmPrimeiroPlano = (callback: (payload: any) => void) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    console.log('Mensagem recebida em primeiro plano:', payload);
    callback(payload);
  });
};