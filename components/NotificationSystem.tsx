'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { solicitarPermissaoNotificacao, ouvirMensagensEmPrimeiroPlano } from '../lib/fcm';
import toast from 'react-hot-toast';

export function NotificationSystem() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Escutar mensagens quando o site está ABERTO (Foreground)
    ouvirMensagensEmPrimeiroPlano((payload) => {
      // Tocar som
      const audio = new Audio('https://res.cloudinary.com/dxhlvrach/video/upload/v1763934033/notificacao_umami_buejiy.mp3');
      audio.play().catch((e) => console.log("Audio play blocked:", e));

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
      ), { duration: 5000 });
    });
  }, []);

  const handleAtivarOuAtualizar = async () => {
    setLoading(true);
    const tokenGerado = await solicitarPermissaoNotificacao();
    setLoading(false);

    if (tokenGerado) {
      setPermission('granted');
      toast.success("Notificações Sincronizadas!");
    } else {
      // Se o usuário bloqueou, avisar como desbloquear
      if (Notification.permission === 'denied') {
        toast.error("Notificações bloqueadas. Clique no cadeado 🔒 ao lado da URL para liberar.");
      } else {
        toast.error("Erro ao sincronizar notificações.");
      }
      setPermission(Notification.permission);
    }
  };

  // Renderização condicional do estilo do botão
  const isGranted = permission === 'granted';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleAtivarOuAtualizar}
        disabled={loading}
        className={`
          font-bold px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border-2 transition-all transform hover:scale-105
          ${isGranted 
            ? 'bg-green-900/80 border-green-500 text-green-400 hover:bg-green-900' 
            : 'bg-[#D4A853] border-white/20 text-[#0D0D0D] hover:bg-[#E5BE7D] animate-bounce'
          }
        `}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isGranted ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6 fill-current" />
        )}
        
        <div className="text-left">
          <p className="text-sm leading-none font-bold">
            {loading ? "Sincronizando..." : isGranted ? "Notificações Ativas" : "Ativar Notificações"}
          </p>
          <p className={`text-[10px] font-normal ${isGranted ? 'text-green-300' : 'opacity-80'}`}>
            {isGranted ? "Clique para testar conexão" : "Receba avisos mesmo fechado"}
          </p>
        </div>
      </button>
    </div>
  );
}