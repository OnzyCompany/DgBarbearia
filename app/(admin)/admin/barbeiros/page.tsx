
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

interface Barbeiro {
  id: string;
  nome: string;
  especialidade: string;
}

export default function AdminBarbeirosPage() {
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', especialidade: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !db.app) {
        setLoading(false);
        return;
    }
    
    const q = query(collection(db, 'barbeiros'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Barbeiro[];
      setBarbeiros(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.especialidade) return;

    try {
      await addDoc(collection(db, 'barbeiros'), {
        nome: formData.nome,
        especialidade: formData.especialidade,
        createdAt: new Date()
      });
      toast.success('Barbeiro adicionado!');
      setIsModalOpen(false);
      setFormData({ nome: '', especialidade: '' });
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remover este barbeiro?')) {
      try {
        await deleteDoc(doc(db, 'barbeiros', id));
        toast.success('Barbeiro removido');
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
            <h2 className="text-2xl font-bold text-white">Barbeiros</h2>
            <p className="text-gray-400">Gerencie sua equipe</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl flex items-center gap-2">
            <Plus className="w-5 h-5" /> Novo Profissional
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbeiros.map((barbeiro) => (
            <motion.div key={barbeiro.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#252525]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#252525] rounded-full border border-[#D4A853]/50">
                   <User className="w-6 h-6 text-[#D4A853]" />
                </div>
                <button onClick={() => handleDelete(barbeiro.id)} className="text-gray-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <h3 className="font-bold text-white text-lg">{barbeiro.nome}</h3>
              <p className="text-gray-500 text-sm">Especialidade: {barbeiro.especialidade}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#1A1A1A] w-full max-w-md rounded-2xl p-6 border border-[#252525]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Novo Barbeiro</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <input type="text" placeholder="Nome Completo" className="w-full bg-[#0D0D0D] border border-[#252525] rounded-xl p-3 text-white" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                <input type="text" placeholder="Especialidade" className="w-full bg-[#0D0D0D] border border-[#252525] rounded-xl p-3 text-white" value={formData.especialidade} onChange={e => setFormData({...formData, especialidade: e.target.value})} required />
                <button type="submit" className="w-full py-3 bg-[#D4A853] text-[#0D0D0D] font-bold rounded-xl">Salvar</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
