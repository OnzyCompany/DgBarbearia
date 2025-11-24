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

    console.log("Solicitando permissão...");
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Permissão concedida. Registrando SW...');
      
      try {
        // Registrar o Service Worker explicitamente para garantir escopo
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('SW registrado:', registration.scope);
        
        await navigator.serviceWorker.ready;

        // Obter o Token FCM usando o SW correto
        console.log('Obtendo token...');
        const token = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (token) {
          console.log('FCM Token obtido:', token);
          await salvarTokenNoFirestore(token, userId);
          return token;
        } else {
          console.error('Token veio vazio.');
        }
      } catch (swError) {
        console.error('Erro no processo de SW/Token:', swError);
      }
    } else {
      console.warn('Permissão de notificação negada pelo usuário.');
    }
  } catch (error) {
    console.error('Erro geral ao solicitar permissão:', error);
  }
  return null;
};

const salvarTokenNoFirestore = async (token: string, userId?: string) => {
  try {
    const tokenRef = doc(db, 'users_notifications', token);
    await setDoc(tokenRef, {
      token: token,
      userId: userId || 'anonymous',
      userAgent: navigator.userAgent,
      updatedAt: serverTimestamp(),
      platform: 'web'
    }, { merge: true });
    console.log('Token salvo no Firestore.');
  } catch (e) {
    console.error("Erro ao salvar token no Firestore:", e);
  }
};

export const ouvirMensagensEmPrimeiroPlano = (callback: (payload: any) => void) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    console.log('Mensagem recebida em primeiro plano:', payload);
    callback(payload);
  });
};