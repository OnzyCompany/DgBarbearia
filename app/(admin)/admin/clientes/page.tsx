
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Users, Search, Star, MessageCircle } from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  totalVisitas?: number;
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !db.app) return;
    
    // Sort by total visits to show loyalty first
    const q = query(collection(db, 'clientes'), orderBy('totalVisitas', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[];
      setClientes(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-white">Clientes Fidelizados</h2>
          <p className="text-gray-400">Ranking dos seus melhores clientes</p>
        </header>

        <div className="space-y-3">
            {clientes.map((cliente, i) => (
                <div key={cliente.id} className="bg-[#1A1A1A] p-4 rounded-xl border border-[#252525] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-dark ${i < 3 ? 'bg-gold' : 'bg-gray-700 text-gray-300'}`}>
                            {i + 1}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{cliente.nome}</h3>
                            <p className="text-sm text-gray-500">{cliente.telefone}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <span className="block text-xl font-bold text-white">{cliente.totalVisitas || 0}</span>
                            <span className="text-[10px] text-gray-500 uppercase">Cortes</span>
                        </div>
                        <div className="text-center">
                            <div className="flex gap-1">
                                {[...Array(Math.min(5, Math.floor((cliente.totalVisitas || 0) / 3)))].map((_, k) => (
                                    <Star key={k} className="w-4 h-4 text-gold fill-gold" />
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                const num = cliente.telefone.replace(/\D/g, '');
                                window.open(`https://api.whatsapp.com/send?phone=55${num}`, '_blank');
                            }}
                            className="p-2 bg-[#252525] hover:bg-[#333] rounded-lg text-green-500"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {clientes.length === 0 && (
           <div className="text-center py-20 bg-[#1A1A1A] rounded-2xl border border-[#252525] border-dashed">
             <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
             <p className="text-gray-500">Nenhum cliente registrado ainda.</p>
             <p className="text-xs text-gray-600 mt-2">Clientes serão criados automaticamente ao agendar.</p>
           </div>
        )}
      </main>
    </div>
  );
}
