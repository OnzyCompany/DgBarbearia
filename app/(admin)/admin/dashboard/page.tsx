
'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, TrendingUp, Loader2, Database } from 'lucide-react';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    faturamentoDia: 0,
    novosClientes: 0,
    ticketMedio: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [nextAppointments, setNextAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!db) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        // 1. Agendamentos de Hoje (Estatísticas Rápidas)
        try {
            const agendamentosRef = collection(db, 'agendamentos');
            const qHoje = query(agendamentosRef, where('data', '==', dateString));
            const snapshotHoje = await getDocs(qHoje);
            
            const countHoje = snapshotHoje.size;
            let faturamento = 0;
            const agendamentosHojeList: any[] = [];
            
            snapshotHoje.docs.forEach(doc => {
              const data = doc.data();
              if (data.status !== 'cancelado') {
                  faturamento += Number(data.preco || 0);
                  agendamentosHojeList.push(data);
              }
            });

            const ticket = countHoje > 0 ? faturamento / countHoje : 0;
            
             setStats(prev => ({
                ...prev,
                agendamentosHoje: countHoje,
                faturamentoDia: faturamento,
                ticketMedio: ticket
            }));
            
            setNextAppointments(agendamentosHojeList.slice(0, 5));

        } catch (e: any) {
            console.error("Erro dashboard:", e);
        }

        // 2. Gráfico da Semana (Últimos 7 dias)
        try {
            const last7Days = [];
            for(let i=6; i>=0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                last7Days.push(`${y}-${m}-${dd}`);
            }

            const chartPromises = last7Days.map(async (dateStr) => {
                const q = query(collection(db, 'agendamentos'), where('data', '==', dateStr));
                const snap = await getDocs(q);
                let total = 0;
                snap.docs.forEach(d => {
                    const data = d.data();
                    if(data.status !== 'cancelado') total += Number(data.preco || 0);
                });
                // Formato DD/MM
                const displayDate = dateStr.split('-').slice(1).reverse().join('/');
                return { name: displayDate, total };
            });

            const chartResults = await Promise.all(chartPromises);
            setChartData(chartResults);

        } catch(e) { console.error("Erro grafico", e); }

        // 3. Novos Clientes
        try {
            const clientesRef = collection(db, 'clientes');
            const snapshotClientes = await getDocs(clientesRef);
            setStats(prev => ({ ...prev, novosClientes: snapshotClientes.size }));
        } catch(e) { console.error(e) }

      } catch (error) {
        console.error("Erro geral:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSeedData = async () => {
    if(!window.confirm("Isso irá criar dados de exemplo no banco. Continuar?")) return;
    setLoading(true);
    try {
        const servicos = [
            { nome: 'Corte Masculino', preco: 50, duracao: 45, categoria: 'corte' },
            { nome: 'Barba', preco: 40, duracao: 30, categoria: 'barba' }
        ];
        for (const s of servicos) await addDoc(collection(db, 'servicos'), s);
        
        const barbeiros = [{ nome: 'Carlos Silva', especialidade: 'Degradê' }];
        for (const b of barbeiros) await addDoc(collection(db, 'barbeiros'), b);

        toast.success("Dados criados!");
        setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
        toast.error("Erro ao criar dados (Permissão negada?)");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <p className="text-gray-400">Visão geral em tempo real</p>
            </div>
            <div className="flex gap-4 items-center">
                <button 
                    onClick={handleSeedData}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-700"
                >
                    <Database className="w-3 h-3" />
                    Inicializar Dados
                </button>
                <div className="text-right">
                    <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
                </div>
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

            {/* Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] h-80 flex flex-col">
                    <h3 className="text-white font-bold mb-4">Faturamento Semanal</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                                <YAxis stroke="#666" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#D4A853' }}
                                />
                                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#D4A853" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                            Sem dados suficientes
                        </div>
                    )}
                </div>

                {/* Today's Appointments List */}
                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] h-80 overflow-y-auto custom-scrollbar">
                    <h3 className="text-white font-bold mb-4">Agenda de Hoje</h3>
                    {nextAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                             <p className="text-xs">Nenhum agendamento para hoje</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {nextAppointments.map((ag, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-[#252525] rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-white font-medium text-sm">{ag.clienteNome}</p>
                                        <p className="text-xs text-[#D4A853]">{ag.horario} - {ag.servicoNome}</p>
                                    </div>
                                    <span className="text-xs font-bold bg-green-900/30 text-green-500 px-2 py-1 rounded">
                                        R$ {ag.preco}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
