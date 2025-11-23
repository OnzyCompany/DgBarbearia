
'use client';

import React from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { Settings } from 'lucide-react';

export default function AdminConfiguracoesPage() {
  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-white">Configurações Gerais</h2>
          <p className="text-gray-400">Dados da barbearia</p>
        </header>

        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] max-w-2xl">
            <div className="space-y-4">
                <div>
                    <label className="text-gray-400 text-sm block mb-2">Nome da Barbearia</label>
                    <input type="text" defaultValue="NextBarber Pro" className="w-full bg-[#0D0D0D] border border-[#252525] p-3 rounded-xl text-white" />
                </div>
                <div>
                    <label className="text-gray-400 text-sm block mb-2">Telefone (WhatsApp)</label>
                    <input type="text" defaultValue="(11) 99999-9999" className="w-full bg-[#0D0D0D] border border-[#252525] p-3 rounded-xl text-white" />
                </div>
                <div>
                    <label className="text-gray-400 text-sm block mb-2">Endereço</label>
                    <input type="text" defaultValue="Rua Exemplo, 123 - Centro" className="w-full bg-[#0D0D0D] border border-[#252525] p-3 rounded-xl text-white" />
                </div>
            </div>
            <button className="mt-6 px-6 py-3 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl">Salvar Alterações</button>
        </div>
      </main>
    </div>
  );
}
