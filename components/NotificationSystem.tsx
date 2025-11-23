
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
    // Som de sino mais audível e curto
    audioRef.current = new Audio('https://cdn.freesound.org/previews/536/536108_11537492-lq.mp3');
  }, []);

  useEffect(() => {
     // @ts-ignore
     window.enableAppAudio = () => {
         if (audioRef.current) {
             audioRef.current.volume = 1.0;
             audioRef.current.play().then(() => {
                 audioRef.current?.pause();
                 audioRef.current!.currentTime = 0;
                 setAudioEnabled(true);
                 toast.success("Áudio Ativado!");
             }).catch(e => console.log("Erro ao ativar áudio:", e));
         }
     };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser. User needs to interact first.", e));
    }
  };

  useEffect(() => {
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
                        'Novo Agendamento! 🔔',
                        `${data.clienteNome} marcou ${data.servicoNome} às ${data.horario}.`,
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
    // Toast Visual
    toast(corpo, {
      icon: '🔔',
      duration: 6000,
      style: { borderRadius: '10px', background: '#333', color: '#fff', border: '1px solid #D4A853' },
    });

    // Notificação Nativa do SO
    if ('Notification' in window && Notification.permission === 'granted') {
       try {
        const notif = new Notification(titulo || 'NextBarber', {
            body: corpo,
            icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
            tag: 'nextbarber-alert'
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
