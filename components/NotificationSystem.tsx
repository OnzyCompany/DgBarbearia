
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

export function NotificationSystem() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  
  // Inicializa o áudio
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
    audioRef.current = new Audio('https://res.cloudinary.com/dxhlvrach/video/upload/v1763934033/notificacao_umami_buejiy.mp3');
    audioRef.current.volume = 1.0;
  }, []);

  const requestPermission = async () => {
    if (!audioRef.current) return;

    try {
      // Truque para desbloquear áudio em navegadores mobile/desktop
      await audioRef.current.play().catch(() => {});
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionState(permission);
        
        if (permission === 'granted') {
          // Registra o momento atual para não receber notificações velhas
          localStorage.setItem('lastNotificationTime', Date.now().toString());
          
          showNativeNotification('Notificações Ativadas', 'Agora você receberá alertas do sistema! 🔔');
          audioRef.current.play();
          toast.success("Notificações e Som Ativados!");
        }
      }
    } catch (e) {
      console.error("Erro permissão:", e);
    }
  };

  // Função Global para ativar via Admin Page
  useEffect(() => {
     // @ts-ignore
     window.enableAppAudio = async (callback: (enabled: boolean) => void) => {
         await requestPermission();
         // @ts-ignore
         if (callback) callback(Notification.permission === 'granted');
     };
  }, []);

  const playAlert = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log("Som bloqueado pelo navegador:", err));
    }
  };

  const showNativeNotification = async (titulo: string, corpo: string, urlDestino?: string) => {
      // 1. Toast (Visual no site)
      toast(corpo, {
        icon: '🔔',
        duration: 6000,
        style: { background: '#1A1A1A', color: '#fff', border: '1px solid #D4A853' },
      });

      // 2. Popup Nativo (Fora do site - Barra de Notificação)
      if ('Notification' in window && Notification.permission === 'granted') {
          try {
              const registration = await navigator.serviceWorker?.getRegistration();
              
              // Tenta via Service Worker (Melhor para Mobile/Android)
              if (registration && 'showNotification' in registration) {
                  await registration.showNotification(titulo, {
                      body: corpo,
                      icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
                      vibrate: [200, 100, 200],
                      tag: 'nextbarber-alert-' + Date.now(), // Tag única para não sobrepor
                      data: { url: urlDestino || '/' }
                  } as any);
              } else {
                  // Fallback Desktop
                  new Notification(titulo, {
                      body: corpo,
                      icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
                  });
              }
          } catch (e) {
              console.error("Erro notificação nativa:", e);
          }
      }
  };

  useEffect(() => {
    if (!db) return;

    // Recupera a última vez que notificou do LocalStorage ou usa AGORA
    let lastTime = parseInt(localStorage.getItem('lastNotificationTime') || Date.now().toString());

    // Função auxiliar para verificar se é novo e notificar
    const checkAndNotify = (docData: any, titulo: string, msg: string, url: string) => {
        // Converte timestamp do Firestore ou String ISO para milissegundos
        let docTime = 0;
        if (docData.criadoEm?.toMillis) {
            docTime = docData.criadoEm.toMillis();
        } else if (docData.criadoEm instanceof Date) {
            docTime = docData.criadoEm.getTime();
        } else if (docData.criadoEm?.seconds) {
            docTime = docData.criadoEm.seconds * 1000;
        } else {
            // Tenta converter string ISO
            docTime = new Date(docData.criadoEm).getTime();
        }

        // Só notifica se o evento aconteceu DEPOIS da última marcação
        if (docTime > lastTime) {
            playAlert();
            showNativeNotification(titulo, msg, url);
            
            // Atualiza o lastTime para não repetir esse evento
            lastTime = docTime;
            localStorage.setItem('lastNotificationTime', docTime.toString());
        }
    };

    // --- LISTENER 1: PUSH GLOBAL (Clientes) ---
    const qPush = query(collection(db, 'notificacoes_push'), orderBy('criadoEm', 'desc'), limit(1));
    const unsubscribePush = onSnapshot(qPush, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          checkAndNotify(data, data.titulo, data.mensagem, '/');
        }
      });
    });

    // --- LISTENER 2: NOVOS AGENDAMENTOS (Admin) ---
    let unsubscribeAgendamentos = () => {};
    if (isAdmin) {
        const qAgendamentos = query(collection(db, 'agendamentos'), orderBy('criadoEm', 'desc'), limit(1));
        unsubscribeAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    checkAndNotify(
                        data, 
                        'Novo Agendamento! ✂️', 
                        `${data.clienteNome} - ${data.horario}`, 
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

  if (permissionState === 'default') {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] animate-bounce">
        <button
          onClick={requestPermission}
          className="bg-[#D4A853] text-[#0D0D0D] font-bold px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-[#E5BE7D] transition-colors border-2 border-white/20"
        >
          <Bell className="w-5 h-5" />
          Ativar Notificações
        </button>
      </div>
    );
  }

  return null;
}
