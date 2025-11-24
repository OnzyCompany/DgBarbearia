
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { MessageSquare, Users, Send, Bell, Radio, Volume2, AlertTriangle, Loader2 } from 'lucide-react';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

const TEMPLATES = [
  { 
    titulo: "Lembrete de Corte", 
    texto: "Olá! Tudo bem? Já faz um tempo desde seu último corte. Que tal agendar um horário para esta semana? ✂️💈" 
  },
  { 
    titulo: "Promoção Dia do Amigo", 
    texto: "Fala parceiro! Traga um amigo essa semana e ganhe 20% de desconto no seu corte! 🤝🔥" 
  },
  { 
    titulo: "Horários Disponíveis", 
    texto: "Ainda temos horários disponíveis para hoje! Garanta seu visual para o fim de semana. 📅" 
  }
];

export default function AdminNotificacoesPage() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'push'>('whatsapp');
  const [clientes, setClientes] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [tituloPush, setTituloPush] = useState('');
  const [somAtivo, setSomAtivo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  useEffect(() => {
    const fetchClientes = async () => {
        try {
            if(!db) return;
            const q = query(collection(db, 'clientes'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setClientes(data);
        } catch(e) { console.error(e); }
    };
    fetchClientes();
    
    if ('Notification' in window && Notification.permission === 'granted') {
        setSomAtivo(true);
    }
  }, []);

  const handleEnviarWhatsApp = (cliente: any) => {
      if(!mensagem) { toast.error("Escreva uma mensagem"); return; }
      if(!cliente.telefone) { toast.error("Cliente sem telefone"); return; }
      const num = cliente.telefone.replace(/\D/g, '');
      window.open(`https://api.whatsapp.com/send?phone=55${num}&text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const handleEnviarPush = async () => {
      if(!tituloPush || !mensagem) {
          toast.error("Preencha título e mensagem");
          return;
      }
      
      setEnviando(true);
      const toastId = toast.loading("Enviando notificação...");

      try {
          // 1. Salvar histórico no banco (para registro)
          await addDoc(collection(db, 'notificacoes_push'), {
              titulo: tituloPush,
              mensagem: mensagem,
              criadoEm: new Date(),
              url: window.location.origin 
          });

          // 2. Chamar API Serverless da Vercel
          const response = await fetch('/api/send-push', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  title: tituloPush,
                  body: mensagem,
                  url: window.location.origin,
                  icon: "https://cdn-icons-png.flaticon.com/512/1000/1000627.png"
              })
          });

          const data = await response.json();

          if (response.ok) {
              toast.success(data.message || "Enviado para todos!", { id: toastId });
              setTituloPush('');
              setMensagem('');
          } else {
              console.error(data);
              throw new Error(data.error || "Erro na API");
          }

      } catch (error: any) {
          console.error(error);
          toast.error(`Erro: ${error.message}`, { id: toastId });
      } finally {
          setEnviando(false);
      }
  };

  const ativarSom = () => {
      // @ts-ignore
      if (window.enableAppAudio) {
          // @ts-ignore
          window.enableAppAudio((success) => {
              setSomAtivo(success);
          });
      } else {
          toast.error("Sistema de notificação não carregado.");
      }
  };

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Central de Notificações</h2>
            <p className="text-gray-400">Comunique-se com seus clientes</p>
          </div>
          
          <button 
             onClick={ativarSom}
             className={`text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold border ${
                 somAtivo 
                 ? 'bg-green-900/20 text-green-500 border-green-500/50 cursor-default' 
                 : 'bg-red-900/20 text-red-500 border-red-500/50 hover:bg-red-900/30 animate-pulse cursor-pointer'
             }`}
          >
              {somAtivo ? <Volume2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {somAtivo ? 'Sistema Ativo e Pronto' : 'ATIVAR SOM E ALERTAS'}
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#252525] pb-1">
            <button 
                onClick={() => setActiveTab('whatsapp')}
                className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === 'whatsapp' ? 'border-[#D4A853] text-[#D4A853]' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
                <MessageSquare className="w-4 h-4" /> WhatsApp Individual
            </button>
            <button 
                onClick={() => setActiveTab('push')}
                className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === 'push' ? 'border-[#D4A853] text-[#D4A853]' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
                <Bell className="w-4 h-4" /> Push Site (Alerta Geral)
            </button>
        </div>

        {activeTab === 'whatsapp' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525]">
                        <h3 className="text-white font-bold mb-4">Escrever Mensagem</h3>
                        <textarea 
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                            placeholder="Digite sua mensagem aqui..."
                            className="w-full h-32 bg-[#0D0D0D] border border-[#333] rounded-xl p-4 text-white focus:border-[#D4A853] outline-none mb-4"
                        />
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500 uppercase font-bold">Templates</p>
                            <div className="flex flex-wrap gap-2">
                                {TEMPLATES.map((t, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setMensagem(t.texto)}
                                        className="text-xs bg-[#252525] hover:bg-[#333] text-gray-300 px-3 py-2 rounded-lg border border-[#333] transition-colors"
                                    >
                                        {t.titulo}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] flex flex-col h-[500px]">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#D4A853]" />
                        Enviar para ({clientes.length})
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {clientes.length === 0 ? <p className="text-gray-500 text-center mt-10">Sem clientes.</p> : clientes.map(cliente => (
                            <div key={cliente.id} className="flex items-center justify-between p-3 bg-[#252525] rounded-xl">
                                <div>
                                    <p className="text-white text-sm font-medium">{cliente.nome}</p>
                                    <p className="text-xs text-gray-500">{cliente.telefone}</p>
                                </div>
                                <button 
                                    onClick={() => handleEnviarWhatsApp(cliente)}
                                    className="p-2 bg-[#25D366] text-black rounded-lg hover:bg-[#128C7E]"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="max-w-2xl mx-auto">
                <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#252525] text-center">
                    <div className="w-16 h-16 bg-[#D4A853]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell className="w-8 h-8 text-[#D4A853]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Notificação Push Global</h3>
                    <div className="bg-[#252525] p-3 rounded-lg text-xs text-gray-400 mb-6 text-left border border-white/5">
                        <strong className="text-gold block mb-1">Como funciona?</strong>
                        1. Clique no botão "ATIVAR SOM E ALERTAS" no topo da página.<br/>
                        2. Autorize as notificações quando o navegador pedir.<br/>
                        3. Ao enviar aqui, um alerta aparecerá na tela de todos os clientes conectados.
                    </div>

                    <div className="space-y-4 text-left">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Título do Alerta</label>
                            <input 
                                type="text"
                                value={tituloPush}
                                onChange={e => setTituloPush(e.target.value)}
                                placeholder="Ex: Estamos Abertos no Feriado!"
                                className="w-full bg-[#0D0D0D] border border-[#333] rounded-xl p-3 text-white focus:border-[#D4A853] outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Mensagem</label>
                            <textarea 
                                value={mensagem}
                                onChange={e => setMensagem(e.target.value)}
                                placeholder="Digite o conteúdo da notificação..."
                                className="w-full h-24 bg-[#0D0D0D] border border-[#333] rounded-xl p-3 text-white focus:border-[#D4A853] outline-none"
                            />
                        </div>

                        <button 
                            onClick={handleEnviarPush}
                            disabled={enviando}
                            className="w-full py-4 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl hover:bg-[#E5BE7D] transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {enviando ? "Enviando..." : "Disparar Notificação para Todos"}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}