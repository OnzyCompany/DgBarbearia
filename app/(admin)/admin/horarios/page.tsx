
'use client';

import React from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { Clock } from 'lucide-react';

export default function AdminHorariosPage() {
  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-white">Horários de Funcionamento</h2>
          <p className="text-gray-400">Configure sua disponibilidade semanal</p>
        </header>

        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525]">
           <div className="space-y-4">
              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dia) => (
                  <div key={dia} className="flex items-center justify-between p-4 bg-[#252525] rounded-xl">
                      <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-[#D4A853]" />
                          <span className="text-white font-medium">{dia}</span>
                      </div>
                      <div className="flex gap-2">
                          <input type="time" defaultValue="09:00" className="bg-[#1A1A1A] text-white p-2 rounded border border-[#333]" />
                          <span className="text-gray-500 self-center">até</span>
                          <input type="time" defaultValue="20:00" className="bg-[#1A1A1A] text-white p-2 rounded border border-[#333]" />
                      </div>
                  </div>
              ))}
           </div>
           <button className="mt-6 px-6 py-3 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl">Salvar Horários</button>
        </div>
      </main>
    </div>
  );
}
