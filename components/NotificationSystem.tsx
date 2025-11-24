'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { solicitarPermissaoNotificacao, ouvirMensagensEmPrimeiroPlano } from '../lib/fcm';
import toast from 'react-hot-toast';

export function NotificationSystem() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Escutar mensagens quando o site está ABERTO (Foreground)
    ouvirMensagensEmPrimeiroPlano((payload) => {
      // Tocar som
      const audio = new Audio('https://res.cloudinary.com/dxhlvrach/video/upload/v1763934033/notificacao_umami_buejiy.mp3');
      audio.play().catch(() => {});

      // Mostrar Toast
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#1A1A1A] shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-[#D4A853]`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img className="h-10 w-10 rounded-full" src={payload.notification?.icon || "https://cdn-icons-png.flaticon.com/512/1000/1000627.png"} alt="" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{payload.notification?.title}</p>
                <p className="mt-1 text-sm text-gray-400">{payload.notification?.body}</p>
              </div>
            </div>
          </div>
        </div>
      ));
    });
  }, []);

  const ativarNotificacoes = async () => {
    const tokenGerado = await solicitarPermissaoNotificacao();
    if (tokenGerado) {
      setToken(tokenGerado);
      setPermission('granted');
      toast.success("Notificações Nativas Ativadas!");
    } else {
      toast.error("Erro ao ativar ou permissão negada.");
    }
  };

  if (permission === 'granted') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <button
        onClick={ativarNotificacoes}
        className="bg-[#D4A853] hover:bg-[#E5BE7D] text-[#0D0D0D] font-bold px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20 transition-all transform hover:scale-105"
      >
        <Bell className="w-6 h-6 fill-current" />
        <div>
          <p className="text-sm leading-none">Ativar Notificações</p>
          <p className="text-[10px] font-normal opacity-80">Receba avisos mesmo fechado</p>
        </div>
      </button>
    </div>
  );
}