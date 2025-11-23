
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { Clock } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function AdminHorariosPage() {
  const [horarios, setHorarios] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Load existing hours
  useEffect(() => {
    const loadHorarios = async () => {
      try {
        const docRef = doc(db, 'configuracoes', 'horarios');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setHorarios(docSnap.data());
        } else {
          // Initialize default structure
          const initial = {};
          DIAS_SEMANA.forEach(dia => {
             // @ts-ignore
             initial[dia] = { inicio: '09:00', fim: '20:00', ativo: true };
          });
          setHorarios(initial);
        }
      } catch (error) {
        console.error("Erro ao carregar horários", error);
        toast.error("Erro ao carregar horários");
      } finally {
        setLoading(false);
      }
    };
    loadHorarios();
  }, []);

  const handleChange = (dia: string, field: string, value: any) => {
    setHorarios((prev: any) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'configuracoes', 'horarios'), horarios);
      toast.success('Horários atualizados com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar horários');
    }
  };

  if (loading) return <div className="flex h-screen bg-[#0D0D0D] items-center justify-center text-white">Carregando...</div>;

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
              {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#252525] rounded-xl gap-4">
                      <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={horarios[dia]?.ativo ?? true}
                            onChange={(e) => handleChange(dia, 'ativo', e.target.checked)}
                            className="w-5 h-5 accent-[#D4A853]"
                          />
                          <span className={`font-medium ${horarios[dia]?.ativo ? 'text-white' : 'text-gray-500'}`}>{dia}</span>
                      </div>
                      
                      {horarios[dia]?.ativo && (
                        <div className="flex gap-2 items-center">
                            <Clock className="w-4 h-4 text-[#D4A853]" />
                            <input 
                              type="time" 
                              value={horarios[dia]?.inicio || '09:00'}
                              onChange={(e) => handleChange(dia, 'inicio', e.target.value)}
                              className="bg-[#1A1A1A] text-white p-2 rounded border border-[#333] focus:border-[#D4A853] outline-none" 
                            />
                            <span className="text-gray-500">até</span>
                            <input 
                              type="time" 
                              value={horarios[dia]?.fim || '20:00'}
                              onChange={(e) => handleChange(dia, 'fim', e.target.value)}
                              className="bg-[#1A1A1A] text-white p-2 rounded border border-[#333] focus:border-[#D4A853] outline-none" 
                            />
                        </div>
                      )}
                      
                      {!horarios[dia]?.ativo && (
                        <span className="text-gray-500 text-sm italic">Fechado</span>
                      )}
                  </div>
              ))}
           </div>
           <button 
             onClick={handleSave}
             className="mt-6 px-6 py-3 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl hover:bg-[#E5BE7D] transition-colors"
           >
             Salvar Horários
           </button>
        </div>
      </main>
    </div>
  );
}
