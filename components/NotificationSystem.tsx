
'use client';

import { useEffect, useRef, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

export function NotificationSystem() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    // Inicializa o som de notificação
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Expose global function for the Admin Panel to enable audio
  useEffect(() => {
     // @ts-ignore
     window.enableAppAudio = () => {
         if (audioRef.current) {
             audioRef.current.play().then(() => {
                 audioRef.current?.pause();
                 audioRef.current!.currentTime = 0;
                 setAudioEnabled(true);
                 toast.success("Áudio Ativado!");
             }).catch(e => console.log(e));
         }
     };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play blocked (needs interaction)", e));
    }
  };

  useEffect(() => {
    const requestPermission = async () => {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    requestPermission();

    if (!db) return;

    // LISTENER: Notificações Push (Geral)
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - 1); 

    const qPush = query(
      collection(db, 'notificacoes_push'),
      where('criadoEm', '>', agora),
      orderBy('criadoEm', 'desc'),
      limit(1)
    );

    const unsubscribePush = onSnapshot(qPush, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          dispararNotificacao(data.titulo, data.mensagem, data.url);
        }
      });
    });

    // LISTENER: Novos Agendamentos (Admin)
    if (isAdmin) {
        const qAgendamentos = query(
            collection(db, 'agendamentos'),
            where('status', '==', 'pendente'),
            where('criadoEm', '>', agora),
            limit(1)
        );

        const unsubscribeAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    playSound();
                    dispararNotificacao(
                        'Novo Agendamento! 📅',
                        `${data.clienteNome} agendou ${data.servicoNome} às ${data.horario}.`,
                        '/admin/agendamentos'
                    );
                }
            });
        });

        return () => {
            unsubscribePush();
            unsubscribeAgendamentos();
        };
    }

    return () => unsubscribePush();
  }, [isAdmin]);

  const dispararNotificacao = (titulo: string, corpo: string, url?: string) => {
    // Toast
    toast(corpo, {
      icon: '🔔',
      duration: 6000,
      style: { borderRadius: '10px', background: '#333', color: '#fff', border: '1px solid #D4A853' },
    });

    // Native Notification
    if ('Notification' in window && Notification.permission === 'granted') {
       // Check if document is hidden to show notification primarily when tab is inactive
       // But we show it always as requested
       try {
        const notif = new Notification(titulo || 'NextBarber', {
            body: corpo,
            icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
            tag: 'nextbarber-alert' // Prevents stacking
        });
        if (url) {
            notif.onclick = (e) => {
                e.preventDefault();
                window.location.hash = url;
                window.focus();
                notif.close();
            };
        }
       } catch(e) { console.error(e); }
    }
  };

  return null;
}
