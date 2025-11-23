'use client';

import React, { useEffect, useRef, useState } from 'react';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Volume2 } from 'lucide-react';

export function NotificationSystem() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  
  // Estado para controlar a permissão visualmente
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  
  // Marca a hora que o componente montou para ignorar eventos antigos
  const [mountTime] = useState(new Date());

  useEffect(() => {
    // Verificar estado atual da permissão ao carregar
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }

    // Link do áudio solicitado pelo usuário (Cloudinary)
    audioRef.current = new Audio('https://res.cloudinary.com/dxhlvrach/video/upload/v1763934033/notificacao_umami_buejiy.mp3');
    audioRef.current.volume = 1.0;
  }, []);

  // Função para desbloquear áudio e pedir permissão (Deve ser chamada por clique do usuário)
  const requestPermission = async () => {
    if (!audioRef.current) return;

    try {
      // 1. Desbloquear AudioContext (Toca e pausa rapidinho)
      await audioRef.current.play().catch(() => {});
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // 2. Pedir Permissão Nativa
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionState(permission);
        
        if (permission === 'granted') {
          // Teste imediato
          new Notification('NextBarber Pro', {
            body: 'Notificações Ativadas com Sucesso! 🔔',
            icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
          });
          audioRef.current.play();
          toast.success("Sistema de Notificação Ativo!");
        } else {
          toast.error("Permissão negada. Não poderemos avisar sobre agendamentos.");
        }
      }
    } catch (e) {
      console.error("Erro ao solicitar permissão:", e);
    }
  };

  // Expor função global para o Admin usar no botão da página de configurações
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
      const promise = audioRef.current.play();
      if (promise !== undefined) {
          promise.catch(error => {
              console.log("Autoplay bloqueado. Necessário interação do usuário.", error);
          });
      }
    }
  };

  const showNativeNotification = (titulo: string, corpo: string, urlDestino?: string) => {
      // 1. Toast Visual (Dentro do Site)
      toast(corpo, {
        icon: '🔔',
        duration: 8000,
        style: { 
            borderRadius: '12px', 
            background: '#1A1A1A', 
            color: '#fff', 
            border: '1px solid #D4A853',
        },
      });

      // 2. Notificação do Sistema (Fora do Site - Windows/Android)
      if ('Notification' in window && Notification.permission === 'granted') {
          try {
              const notif = new Notification(titulo, {
                  body: corpo,
                  icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
                  requireInteraction: true, 
                  tag: 'nextbarber-alert'
              });

              if (urlDestino) {
                  notif.onclick = (e) => {
                      e.preventDefault();
                      window.focus();
                      navigate(urlDestino);
                      notif.close();
                  };
              }
          } catch (e) {
              console.error("Erro na notificação nativa:", e);
          }
      }
  };

  useEffect(() => {
    if (!db) return;

    // --- LISTENER 1: PUSH GLOBAL ---
    const qPush = query(collection(db, 'notificacoes_push'), orderBy('criadoEm', 'desc'), limit(5));

    const unsubscribePush = onSnapshot(qPush, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Filtro de Timestamp no Cliente
          const dataCriacao = data.criadoEm?.toDate ? data.criadoEm.toDate() : new Date(data.criadoEm);
          
          if (dataCriacao > mountTime) {
            playAlert();
            showNativeNotification(data.titulo, data.mensagem);
          }
        }
      });
    });

    // --- LISTENER 2: NOVOS AGENDAMENTOS (Admin) ---
    let unsubscribeAgendamentos = () => {};

    if (isAdmin) {
        const qAgendamentos = query(
            collection(db, 'agendamentos'), 
            orderBy('criadoEm', 'desc'), 
            limit(5)
        );

        unsubscribeAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const dataCriacao = data.criadoEm?.toDate ? data.criadoEm.toDate() : new Date(data.criadoEm);
                    
                    if (dataCriacao > mountTime && data.status === 'pendente') {
                        playAlert();
                        showNativeNotification(
                            'Novo Agendamento! ✂️', 
                            `${data.clienteNome} agendou para ${data.data} às ${data.horario}`,
                            '/admin/agendamentos'
                        );
                    }
                }
            });
        });
    }

    return () => {
        unsubscribePush();
        unsubscribeAgendamentos();
    };
  }, [isAdmin, mountTime]);

  // Renderiza botão flutuante se a permissão não foi concedida ainda
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