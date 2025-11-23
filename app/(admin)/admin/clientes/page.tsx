
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/admin/Sidebar';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Users, Search } from 'lucide-react';

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
    
    // In a real app, clients are usually created on booking
    // For now we listen to 'clientes' collection if you decide to sync it
    const q = query(collection(db, 'clientes'), orderBy('nome'));
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
          <h2 className="text-2xl font-bold text-white">Clientes</h2>
          <p className="text-gray-400">Base de clientes fidelizados</p>
        </header>

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
