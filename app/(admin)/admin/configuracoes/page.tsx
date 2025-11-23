
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { Settings, Save } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

export default function AdminConfiguracoesPage() {
  const [config, setConfig] = useState({
    nomeEmpresa: 'NextBarber Pro',
    telefone: '(11) 99999-9999',
    endereco: 'Rua Exemplo, 123 - Centro'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracoes', 'geral');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
           // @ts-ignore
           setConfig(docSnap.data());
        }
      } catch (error) {
        console.error("Erro ao carregar configs", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'configuracoes', 'geral'), config);
      toast.success('Configurações salvas!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar configurações');
    }
  };

  if (loading) return <div className="flex h-screen bg-[#0D0D0D] items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-white">Configurações Gerais</h2>
          <p className="text-gray-400">Dados da barbearia</p>
        </header>

        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#252525] max-w-2xl">
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="text-gray-400 text-sm block mb-2">Nome da Barbearia</label>
                    <input 
                      type="text" 
                      value={config.nomeEmpresa}
                      onChange={(e) => setConfig({...config, nomeEmpresa: e.target.value})}
                      className="w-full bg-[#0D0D0D] border border-[#252525] p-3 rounded-xl text-white focus:border-[#D4A853] outline-none" 
                    />
                </div>
                <div>
                    <label className="text-gray-400 text-sm block mb-2">Telefone (WhatsApp)</label>
                    <input 
                      type="text" 
                      value={config.telefone}
                      onChange={(e) => setConfig({...config, telefone: e.target.value})}
                      className="w-full bg-[#0D0D0D] border border-[#252525] p-3 rounded-xl text-white focus:border-[#D4A853] outline-none" 
                    />
                </div>
                <div>
                    <label className="text-gray-400 text-sm block mb-2">Endereço</label>
                    <input 
                      type="text" 
                      value={config.endereco}
                      onChange={(e) => setConfig({...config, endereco: e.target.value})}
                      className="w-full bg-[#0D0D0D] border border-[#252525] p-3 rounded-xl text-white focus:border-[#D4A853] outline-none" 
                    />
                </div>
                
                <button 
                  type="submit"
                  className="mt-6 px-6 py-3 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl flex items-center gap-2 hover:bg-[#E5BE7D] transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </button>
            </form>
        </div>
      </main>
    </div>
  );
}
