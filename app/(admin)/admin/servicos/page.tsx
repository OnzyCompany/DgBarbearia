
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Scissors, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  categoria: string;
}

export default function AdminServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    duracao: '',
    categoria: 'corte'
  });

  // Real-time listener for services
  useEffect(() => {
    // Check if DB is initialized properly (not a mock object)
    if (!db || !db.app) { 
        setLoading(false);
        return; 
    }
    
    try {
        const q = query(collection(db, 'servicos'), orderBy('nome'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const servicosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Servico[];
          setServicos(servicosData);
          setLoading(false);
        }, (error) => {
            console.error("Erro ao ler serviços:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    } catch (e) {
        console.error("Erro setup listener:", e);
        setLoading(false);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco || !formData.duracao) {
        toast.error("Preencha todos os campos");
        return;
    }

    if (!db || !db.app) {
        toast.error("Banco de dados não conectado. Verifique a configuração.");
        return;
    }

    try {
      await addDoc(collection(db, 'servicos'), {
        nome: formData.nome,
        preco: Number(formData.preco), // Ensure it's a number
        duracao: Number(formData.duracao), // Ensure it's a number
        categoria: formData.categoria,
        createdAt: new Date()
      });
      
      toast.success('Serviço criado com sucesso!');
      setIsModalOpen(false);
      setFormData({ nome: '', preco: '', duracao: '', categoria: 'corte' });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error('Erro ao salvar no banco de dados. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteDoc(doc(db, 'servicos', id));
        toast.success('Serviço removido');
      } catch (error) {
        toast.error('Erro ao remover');
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Serviços</h2>
            <p className="text-gray-400">Gerencie o catálogo da barbearia</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl flex items-center gap-2 hover:bg-[#E5BE7D] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Serviço
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicos.map((servico) => (
            <motion.div
              key={servico.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#252525] hover:border-[#D4A853]/50 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#252525] rounded-xl text-[#D4A853]">
                  <Scissors className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => handleDelete(servico.id)}
                  className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-bold text-white text-lg">{servico.nome}</h3>
              <p className="text-gray-500 text-sm mb-4">{servico.duracao} min • {servico.categoria}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#252525]">
                <span className="text-xl font-bold text-[#D4A853]">R$ {servico.preco}</span>
                <span className="text-xs bg-[#252525] px-2 py-1 rounded text-gray-400 uppercase">Ativo</span>
              </div>
            </motion.div>
          ))}
        </div>

        {servicos.length === 0 && !loading && (
          <div className="text-center py-20 bg-[#1A1A1A] rounded-2xl border border-[#252525] border-dashed">
            <p className="text-gray-500">Nenhum serviço cadastrado ainda.</p>
          </div>
        )}
      </main>

      {/* Modal Criar Serviço */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A1A] w-full max-w-md rounded-2xl p-6 border border-[#252525]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Novo Serviço</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Nome do Serviço</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-[#0D0D0D] border border-[#252525] rounded-xl p-3 text-white focus:border-[#D4A853] outline-none"
                    placeholder="Ex: Corte Degradê"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      required
                      value={formData.preco}
                      onChange={e => setFormData({...formData, preco: e.target.value})}
                      className="w-full bg-[#0D0D0D] border border-[#252525] rounded-xl p-3 text-white focus:border-[#D4A853] outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Duração (min)</label>
                    <input
                      type="number"
                      required
                      value={formData.duracao}
                      onChange={e => setFormData({...formData, duracao: e.target.value})}
                      className="w-full bg-[#0D0D0D] border border-[#252525] rounded-xl p-3 text-white focus:border-[#D4A853] outline-none"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                    className="w-full bg-[#0D0D0D] border border-[#252525] rounded-xl p-3 text-white focus:border-[#D4A853] outline-none"
                  >
                    <option value="corte">Corte</option>
                    <option value="barba">Barba</option>
                    <option value="combo">Combo</option>
                    <option value="quimica">Química</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl mt-4 hover:bg-[#E5BE7D]"
                >
                  Salvar Serviço
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
