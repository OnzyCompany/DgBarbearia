
'use client';

import { useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export function NotificationSystem() {
  useEffect(() => {
    // 1. Solicitar permissão ao carregar
    const requestPermission = async () => {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    requestPermission();

    // 2. Escutar novas notificações no Firebase (últimos 5 minutos para evitar spam de antigas)
    if (!db) return;

    // Timestamp de "agora" menos 1 minuto para pegar apenas as novas disparadas agora
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - 1); 

    const q = query(
      collection(db, 'notificacoes_push'),
      where('criadoEm', '>', agora),
      orderBy('criadoEm', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          dispararNotificacao(data.titulo, data.mensagem, data.url);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const dispararNotificacao = (titulo: string, corpo: string, url?: string) => {
    // Toast no App (sempre visível)
    toast(corpo, {
      icon: '🔔',
      duration: 5000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });

    // Notificação do Navegador (funciona em outra aba/minimizado)
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(titulo || 'NextBarber', {
        body: corpo,
        icon: '/favicon.ico', // idealmente um link para logo
        tag: 'nextbarber-push'
      });

      if (url) {
        notif.onclick = () => {
          window.open(url, '_blank');
          notif.close();
        };
      }
    }
  };

  return null; // Componente invisível
}
