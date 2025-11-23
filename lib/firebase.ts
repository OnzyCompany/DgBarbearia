import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração FIXA e EXPLICITA para garantir conexão imediata
// Não depende mais de variáveis de ambiente instáveis
const firebaseConfig = {
  apiKey: "AIzaSyCrY_mxYOtVTFtKRsBpBjRWz13DbF2xA5Q",
  authDomain: "dgbarbearia.firebaseapp.com",
  projectId: "dgbarbearia",
  storageBucket: "dgbarbearia.firebasestorage.app",
  messagingSenderId: "746464245192",
  appId: "1:746464245192:web:c1bf405cbe818850b93cfd"
};

// Inicialização Simples e Direta
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase inicializado com config fixa");

export { app, auth, db };