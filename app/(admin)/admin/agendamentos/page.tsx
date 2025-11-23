'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Scissors } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

interface Agendamento {
  id: string;
  clienteNome: string;
  servicoNome: string;
  barbeiroNome: string;
  data: string;
  horario: string;
  preco: number;
  status: string;
}

export default function AdminAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // Listen to real-time updates
    const q = query(collection(db, 'agendamentos'), orderBy('data', 'desc'), orderBy('horario', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Agendamento[];
      setAgendamentos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
              className="bg-[#1A1A1A] p-4 rounded-xl border border-[#252525] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#252525] rounded-xl text-[#D4A853]">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{agendamento.servicoNome}</h3>
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

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                <div className="flex items-center gap-2 text-[#D4A853] font-medium bg-[#D4A853]/10 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4" />
                  {agendamento.data} às {agendamento.horario}
                </div>
                <span className="font-bold text-white">R$ {agendamento.preco}</span>
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