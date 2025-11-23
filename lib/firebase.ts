import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Função auxiliar para tentar pegar variável de ambiente de todas as formas possíveis
// Se não encontrar, usa o valor HARDCODED (Fixo) que você forneceu para garantir que funcione.
const getEnv = (key: string, fallback: string) => {
  // 1. Tenta Vite (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  
  // 2. Tenta Node/Next.js/Shim (process.env)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // 3. Retorna o valor fixo (Sua chave real)
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY', "AIzaSyCrY_mxYOtVTFtKRsBpBjRWz13DbF2xA5Q"),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', "dgbarbearia.firebaseapp.com"),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', "dgbarbearia"),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', "dgbarbearia.firebasestorage.app"),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', "746464245192"),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID', "1:746464245192:web:c1bf405cbe818850b93cfd")
};

// Inicialização segura para evitar tela preta
let app;
let auth;
let db;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase conectado com sucesso!");
} catch (error) {
  console.error("Erro crítico ao iniciar Firebase:", error);
  // Mock objects to prevent app crash if config fails completely
  // @ts-ignore
  auth = { currentUser: null };
  // @ts-ignore
  db = {}; 
}

export { app, auth, db };