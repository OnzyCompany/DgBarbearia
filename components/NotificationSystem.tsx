
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

  useEffect(() => {
    // Som de notificação curto e agradável
    audioRef.current = new Audio('https://cdn.freesound.org/previews/536/536108_11537492-lq.mp3');
  }, []);

  useEffect(() => {
     // Função global para ser chamada pelo botão na página de configurações
     // @ts-ignore
     window.enableAppAudio = async (callback: (enabled: boolean) => void) => {
         if (audioRef.current) {
             try {
                 // 1. Tentar tocar o som
                 audioRef.current.volume = 1.0;
                 await audioRef.current.play();
                 audioRef.current.pause();
                 audioRef.current.currentTime = 0;
                 
                 // 2. Pedir permissão de Notificação Nativa (Sistema Operacional)
                 if ('Notification' in window) {
                     const permission = await Notification.requestPermission();
                     if (permission === 'granted') {
                         new Notification('NextBarber Pro', {
                             body: 'Notificações e Sons Ativados com Sucesso! 🔊',
                             icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png'
                         });
                     }
                 }

                 toast.success("Sistema de Alerta Ativado!");
                 if(callback) callback(true);
             } catch(e) { 
                 console.log("Erro ao ativar áudio:", e);
                 toast.error("Não foi possível ativar o som. Interaja com a página primeiro.");
                 if(callback) callback(false);
             }
         }
     };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Som bloqueado pelo navegador", e));
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
          // Toca som se for usuário comum ou admin
          playSound();
          dispararNotificacao(data.titulo, data.mensagem, data.url);
        }
      });
    });

    // LISTENER: Novos Agendamentos (Apenas para Admin)
    let unsubscribeAgendamentos = () => {};
    
    if (isAdmin) {
        const qAgendamentos = query(
            collection(db, 'agendamentos'),
            where('status', '==', 'pendente'),
            // Filtrar apenas criados recentemente para evitar spam ao carregar a página
            where('criadoEm', '>', agora),
            limit(1)
        );

        unsubscribeAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    playSound();
                    dispararNotificacao(
                        'Novo Agendamento! ✂️',
                        `${data.clienteNome} marcou ${data.servicoNome} às ${data.horario}.`,
                        '/admin/agendamentos'
                    );
                }
            });
        });
    }

    return () => {
        unsubscribePush();
        unsubscribeAgendamentos();
    };
  }, [isAdmin]);

  const dispararNotificacao = (titulo: string, corpo: string, url?: string) => {
    // 1. Toast Visual (Dentro do App)
    toast(corpo, {
      icon: '🔔',
      duration: 6000,
      style: { borderRadius: '10px', background: '#333', color: '#fff', border: '1px solid #D4A853' },
    });

    // 2. Notificação Nativa (Fora do App - Windows/Android)
    if ('Notification' in window && Notification.permission === 'granted') {
       try {
        const notif = new Notification(titulo || 'NextBarber', {
            body: corpo,
            icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
            tag: 'nextbarber-alert',
            silent: false // Tenta forçar som nativo também
        });
        
        if (url) {
            notif.onclick = (e) => {
                e.preventDefault();
                window.location.hash = url; // Redireciona usando HashRouter
                window.focus();
                notif.close();
            };
        }
       } catch(e) { console.error("Erro notificação nativa", e); }
    }
  };

  return null;
}
