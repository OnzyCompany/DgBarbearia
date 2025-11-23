
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Scissors, CheckCircle, MessageCircle, AlertCircle } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

interface Agendamento {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  servicoNome: string;
  barbeiroNome: string;
  data: string;
  horario: string;
  preco: number;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
}

export default function AdminAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // Use a simple query first to avoid "Missing Index" errors on multiple sort fields
    // Sorting by created time ensures recent ones are top
    const q = query(collection(db, 'agendamentos'), orderBy('criadoEm', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Agendamento[];
      setAgendamentos(data);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching appointments:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleConfirmar = async (agendamento: Agendamento) => {
    if (!window.confirm(`Confirmar agendamento de ${agendamento.clienteNome}?`)) return;

    try {
        await updateDoc(doc(db, 'agendamentos', agendamento.id), {
            status: 'confirmado'
        });
        toast.success("Agendamento confirmado!");

        if (agendamento.clienteTelefone) {
            const num = agendamento.clienteTelefone.replace(/\D/g, '');
            const msg = `Olá ${agendamento.clienteNome}! 👋\n\nSeu agendamento na *NextBarber* está confirmado! ✅\n\n🗓 Data: ${agendamento.data}\n⏰ Horário: ${agendamento.horario}\n✂️ Serviço: ${agendamento.servicoNome}\n\nTe esperamos lá!`;
            const url = `https://api.whatsapp.com/send?phone=55${num}&text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        }
    } catch (error) {
        console.error(error);
        toast.error("Erro ao confirmar agendamento");
    }
  };

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-white">Agendamentos</h2>
          <p className="text-gray-400">Gerencie a agenda da barbearia</p>
        </header>

        <div className="space-y-4">
          {agendamentos.map((agendamento) => (
            <motion.div
              key={agendamento.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  agendamento.status === 'pendente' 
                    ? 'bg-[#1A1A1A] border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                    : 'bg-[#1A1A1A] border-[#252525]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#252525] rounded-xl text-[#D4A853]">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-lg">{agendamento.servicoNome}</h3>
                    {agendamento.status === 'pendente' && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold uppercase border border-yellow-500/30 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Pendente
                        </span>
                    )}
                    {agendamento.status === 'confirmado' && (
                        <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase border border-green-500/30">
                            Confirmado
                        </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                    <User className="w-3 h-3" />
                    <span>{agendamento.clienteNome || 'Cliente'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Scissors className="w-3 h-3" />
                    <span>{agendamento.barbeiroNome}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                <div className="flex flex-col items-end md:items-start mr-4">
                    <div className="flex items-center gap-2 text-[#D4A853] font-medium bg-[#D4A853]/10 px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4" />
                    {agendamento.data} às {agendamento.horario}
                    </div>
                    <span className="font-bold text-white mt-1">R$ {agendamento.preco}</span>
                </div>
                
                {agendamento.status === 'pendente' && (
                    <button 
                        onClick={() => handleConfirmar(agendamento)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Confirmar
                    </button>
                )}
                 {agendamento.status === 'confirmado' && agendamento.clienteTelefone && (
                    <button 
                        onClick={() => {
                            const num = agendamento.clienteTelefone!.replace(/\D/g, '');
                            window.open(`https://api.whatsapp.com/send?phone=55${num}`, '_blank');
                        }}
                        className="px-3 py-2 bg-[#252525] hover:bg-[#333] text-gray-300 rounded-lg flex items-center gap-2 border border-[#333]"
                        title="Enviar mensagem"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </button>
                )}
              </div>
            </motion.div>
          ))}

          {agendamentos.length === 0 && !loading && (
            <div className="text-center py-20 bg-[#1A1A1A] rounded-2xl border border-[#252525] border-dashed">
              <p className="text-gray-500">Nenhum agendamento encontrado.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
