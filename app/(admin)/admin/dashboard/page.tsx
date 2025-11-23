
'use client';

import React from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <p className="text-gray-400">Visão geral do negócio</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
            </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
                { title: 'Agendamentos Hoje', value: '12', icon: Calendar, color: '#D4A853' },
                { title: 'Faturamento Dia', value: 'R$ 850', icon: DollarSign, color: '#22C55E' },
                { title: 'Novos Clientes', value: '5', icon: Users, color: '#3B82F6' },
                { title: 'Ticket Médio', value: 'R$ 70', icon: TrendingUp, color: '#A855F7' },
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
                        <span className="text-xs text-gray-500 font-medium">+12% vs ontem</span>
                    </div>
                    <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                </motion.div>
            ))}
        </div>

        {/* Empty State for other sections (Placeholder) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] h-64 flex items-center justify-center">
                <p className="text-gray-500">Gráfico de Faturamento (Em breve)</p>
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] h-64 flex items-center justify-center">
                <p className="text-gray-500">Próximos Agendamentos (Em breve)</p>
            </div>
        </div>
      </main>
    </div>
  );
}
