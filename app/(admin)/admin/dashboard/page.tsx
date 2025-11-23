
'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    faturamentoDia: 0,
    novosClientes: 0,
    ticketMedio: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!db) return;

        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD for comparison

        // 1. Agendamentos de Hoje
        const agendamentosRef = collection(db, 'agendamentos');
        const qHoje = query(agendamentosRef, where('data', '==', dateString));
        const snapshotHoje = await getDocs(qHoje);
        
        const countHoje = snapshotHoje.size;
        
        // 2. Faturamento do Dia
        let faturamento = 0;
        snapshotHoje.docs.forEach(doc => {
          const data = doc.data();
          faturamento += Number(data.preco || 0);
        });

        // 3. Novos Clientes (Total por enquanto, já que não temos created_at no filtro simples)
        const clientesRef = collection(db, 'clientes');
        const snapshotClientes = await getDocs(clientesRef);
        const countClientes = snapshotClientes.size;

        // 4. Ticket Médio
        const ticket = countHoje > 0 ? faturamento / countHoje : 0;

        setStats({
          agendamentosHoje: countHoje,
          faturamentoDia: faturamento,
          novosClientes: countClientes,
          ticketMedio: ticket
        });

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <p className="text-gray-400">Visão geral em tempo real</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
            </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-[#D4A853] animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { title: 'Agendamentos Hoje', value: stats.agendamentosHoje.toString(), icon: Calendar, color: '#D4A853' },
                    { title: 'Faturamento Dia', value: `R$ ${stats.faturamentoDia.toFixed(2)}`, icon: DollarSign, color: '#22C55E' },
                    { title: 'Total Clientes', value: stats.novosClientes.toString(), icon: Users, color: '#3B82F6' },
                    { title: 'Ticket Médio', value: `R$ ${stats.ticketMedio.toFixed(2)}`, icon: TrendingUp, color: '#A855F7' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-[#252525] text-white">
                                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                        </div>
                        <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Empty State for other sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] h-64 flex flex-col items-center justify-center text-center">
                    <p className="text-gray-500 mb-2">Gráfico de Faturamento</p>
                    <p className="text-xs text-gray-600">Dados insuficientes para gerar gráfico</p>
                </div>
                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] h-64 flex flex-col items-center justify-center text-center">
                    <p className="text-gray-500 mb-2">Próximos Agendamentos</p>
                    <p className="text-xs text-gray-600">Nenhum agendamento futuro encontrado</p>
                </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
