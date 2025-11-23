
'use client';

import { useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

export function NotificationSystem() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Inicializa o som de notificação (apenas um bip simples)
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  useEffect(() => {
    // 1. Solicitar permissão ao carregar
    const requestPermission = async () => {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    requestPermission();

    if (!db) return;

    // ==========================================
    // LISTENER 1: Notificações Push (Geral)
    // ==========================================
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

    // ==========================================
    // LISTENER 2: Novos Agendamentos (Para o Barbeiro/Admin)
    // ==========================================
    // Só escuta se estiver na área administrativa para não incomodar clientes
    if (isAdmin) {
        const qAgendamentos = query(
            collection(db, 'agendamentos'),
            where('status', '==', 'pendente'),
            where('criadoEm', '>', agora), // Apenas novos criados após abrir o app
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
    // Toast no App (sempre visível)
    toast(corpo, {
      icon: '🔔',
      duration: 6000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
        border: '1px solid #D4A853'
      },
    });

    // Notificação do Navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(titulo || 'NextBarber', {
            body: corpo,
            icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png', // Icone genérico de barbearia
            tag: 'nextbarber-alert'
        });

        if (url) {
            notif.onclick = (e) => {
            e.preventDefault();
            window.location.hash = url; // HashRouter
            window.focus();
            notif.close();
            };
        }
      } catch (e) {
        console.error("Erro notificação nativa", e);
      }
    }
  };

  return null;
}
