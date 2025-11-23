
'use client';

import { useEffect, useRef, useState } from 'react';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

export function NotificationSystem() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  
  // Marca a hora que o componente montou para ignorar eventos antigos
  const [mountTime] = useState(new Date());

  useEffect(() => {
    // Link do áudio solicitado pelo usuário
    audioRef.current = new Audio('https://res.cloudinary.com/dxhlvrach/video/upload/v1763934033/notificacao_umami_buejiy.mp3');
    audioRef.current.volume = 1.0;
  }, []);

  // Expor função global para ativar áudio via botão
  useEffect(() => {
     // @ts-ignore
     window.enableAppAudio = async (callback: (enabled: boolean) => void) => {
         if (audioRef.current) {
             try {
                 // Tenta desbloquear o contexto de áudio do navegador
                 await audioRef.current.play();
                 audioRef.current.pause();
                 audioRef.current.currentTime = 0;
                 
                 // Solicita permissão nativa do SO (Barra de notificação)
                 if ('Notification' in window) {
                     const permission = await Notification.requestPermission();
                     if (permission === 'granted') {
                         new Notification('NextBarber Pro', {
                             body: 'Sistema de Alerta Ativado e Pronto! 🔊',
                             icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
                             silent: true // Tocar som manualmente para garantir
                         });
                         // Toca o som real para confirmar
                         audioRef.current.play();
                     }
                 }
                 
                 toast.success("Sons e Alertas Ativados!");
                 if(callback) callback(true);
             } catch(e) { 
                 console.error("Erro ao ativar áudio:", e);
                 toast.error("Clique na página para permitir o som.");
                 if(callback) callback(false);
             }
         }
     };
  }, []);

  const playAlert = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const promise = audioRef.current.play();
      if (promise !== undefined) {
          promise.catch(error => {
              console.log("Autoplay bloqueado. O usuário precisa interagir com a página.");
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        },
      });

      // 2. Notificação do Sistema (Fora do Site - Windows/Android)
      if ('Notification' in window && Notification.permission === 'granted') {
          try {
              // Service Worker seria o ideal para background total, mas new Notification funciona
              // se a aba estiver aberta (mesmo minimizada)
              const notif = new Notification(titulo, {
                  body: corpo,
                  icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000627.png',
                  requireInteraction: true, // Mantém a notificação na tela até clicar
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

    // --- LISTENER 1: PUSH GLOBAL (Para todos os clientes) ---
    // Usamos limit(5) e ordenação simples para evitar erro de índice
    const qPush = query(collection(db, 'notificacoes_push'), orderBy('criadoEm', 'desc'), limit(5));

    const unsubscribePush = onSnapshot(qPush, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // CRUCIAL: Verificar se a notificação é NOVA (criada depois que entrei no site)
          // Isso evita receber notificações antigas ao dar F5
          const dataCriacao = data.criadoEm?.toDate ? data.criadoEm.toDate() : new Date(data.criadoEm);
          
          if (dataCriacao > mountTime) {
            playAlert();
            showNativeNotification(data.titulo, data.mensagem);
          }
        }
      });
    });

    // --- LISTENER 2: NOVOS AGENDAMENTOS (Apenas para Admin) ---
    let unsubscribeAgendamentos = () => {};

    if (isAdmin) {
        // Query simplificada para garantir funcionamento sem índices compostos
        const qAgendamentos = query(
            collection(db, 'agendamentos'), 
            orderBy('criadoEm', 'desc'), 
            limit(5)
        );

        unsubscribeAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    
                    // Validação de tempo (apenas novos agendamentos criados agora)
                    const dataCriacao = data.criadoEm?.toDate ? data.criadoEm.toDate() : new Date(data.criadoEm);
                    
                    // Verifica se é novo E se está pendente
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

  return null;
}
