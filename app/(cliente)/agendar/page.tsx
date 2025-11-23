
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '../../../stores/bookingStore';
import { BookingSuccessAnimation } from '../../../components/cliente/BookingSuccessAnimation';
import { ArrowLeft, Check, Scissors, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import toast from 'react-hot-toast';

const ETAPAS = [
  { id: 1, nome: 'Serviço' },
  { id: 2, nome: 'Barbeiro' },
  { id: 3, nome: 'Data' },
  { id: 4, nome: 'Confirmação' },
];

export default function AgendarPage() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [sucesso, setSucesso] = useState(false);
  const { dadosAgendamento, setServico, setBarbeiro, setDataHorario, limparDados } = useBookingStore();
  
  // Data from Firebase
  const [servicos, setServicos] = useState<any[]>([]);
  const [barbeiros, setBarbeiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!db) return;
        
        // Fetch Serviços
        const servicosRef = collection(db, 'servicos');
        const qServicos = query(servicosRef, orderBy('nome'));
        const servicosSnap = await getDocs(qServicos);
        const servicosData = servicosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServicos(servicosData);

        // Fetch Barbeiros
        const barbeirosRef = collection(db, 'barbeiros');
        const qBarbeiros = query(barbeirosRef, orderBy('nome'));
        const barbeirosSnap = await getDocs(qBarbeiros);
        const barbeirosData = barbeirosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBarbeiros(barbeirosData);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados da barbearia");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const avancar = () => setEtapaAtual((e) => Math.min(e + 1, 4));
  const voltar = () => setEtapaAtual((e) => Math.max(e - 1, 1));
  
  const navigateHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button 
            onClick={() => {
              if (etapaAtual > 1) {
                voltar();
              } else {
                navigateHome();
              }
            }}
            className="p-2 rounded-full bg-dark-card text-white border border-white/10 hover:bg-dark-card/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Agendar Horário</h1>
        </div>

        {/* Progress Steps */}
        <div className="max-w-lg mx-auto mt-6">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-gold -z-10 transition-all duration-300"
              style={{ width: `${((etapaAtual - 1) / (ETAPAS.length - 1)) * 100}%` }}
            />

            {ETAPAS.map((etapa) => (
              <div key={etapa.id} className="flex flex-col items-center gap-2 bg-dark px-2">
                <motion.div
                  animate={{
                    backgroundColor: etapaAtual >= etapa.id ? '#D4A853' : '#1A1A1A',
                    borderColor: etapaAtual >= etapa.id ? '#D4A853' : '#333',
                    scale: etapaAtual === etapa.id ? 1.1 : 1,
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors"
                >
                  {etapaAtual > etapa.id ? (
                    <Check className="w-4 h-4 text-dark" />
                  ) : (
                    <span className={etapaAtual >= etapa.id ? 'text-dark' : 'text-gray-500'}>
                      {etapa.id}
                    </span>
                  )}
                </motion.div>
                <span className={`text-[10px] uppercase tracking-wider font-medium ${etapaAtual >= etapa.id ? 'text-gold' : 'text-gray-600'}`}>
                  {etapa.nome}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {etapaAtual === 1 && (
            <motion.div
              key="servico"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-4"
            >
              <h2 className="text-2xl font-bold mb-4">Escolha o Serviço</h2>
              {servicos.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhum serviço disponível no momento.</p>
              ) : (
                servicos.map((servico) => (
                  <motion.button
                    key={servico.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setServico(servico.id, servico.nome, servico.preco);
                      avancar();
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                      dadosAgendamento.servicoId === servico.id
                        ? 'bg-gold/10 border-gold'
                        : 'bg-dark-card border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-dark flex items-center justify-center text-gold">
                        <Scissors className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-white">{servico.nome}</h3>
                        <p className="text-gray-500 text-sm">{servico.duracao} min</p>
                      </div>
                    </div>
                    <span className="font-bold text-gold">R$ {servico.preco}</span>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {etapaAtual === 2 && (
            <motion.div
              key="barbeiro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-4"
            >
              <h2 className="text-2xl font-bold mb-4">Escolha o Profissional</h2>
              {barbeiros.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhum profissional disponível.</p>
              ) : (
                barbeiros.map((barbeiro) => (
                  <motion.button
                    key={barbeiro.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setBarbeiro(barbeiro.id, barbeiro.nome);
                      avancar();
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-colors ${
                      dadosAgendamento.barbeiroId === barbeiro.id
                        ? 'bg-gold/10 border-gold'
                        : 'bg-dark-card border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-700 border-2 border-gold/50 flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-white">{barbeiro.nome}</h3>
                      <p className="text-gray-500 text-sm">{barbeiro.especialidade || 'Barbeiro'}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {etapaAtual === 3 && (
            <motion.div
              key="data"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-6"
            >
              <h2 className="text-2xl font-bold">Escolha o Horário</h2>
              
              {/* Mock Date Picker (In real app, generate from working hours) */}
              <div className="flex gap-2 overflow-x-auto pb-4">
                {[...Array(7)].map((_, i) => (
                  <button key={i} className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border ${i === 0 ? 'bg-gold text-dark border-gold' : 'bg-dark-card border-white/5 text-gray-400'}`}>
                    <span className="text-xs font-bold uppercase">HOJE</span>
                    <span className="text-xl font-bold">{new Date().getDate() + i}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setDataHorario(new Date().toISOString().split('T')[0], time);
                      avancar();
                    }}
                    className="py-3 rounded-lg bg-dark-card border border-white/5 hover:border-gold/50 hover:text-gold transition-colors text-sm font-medium"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {etapaAtual === 4 && (
            <motion.div
              key="resumo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">Resumo do Agendamento</h2>
              
              <div className="bg-dark-card rounded-2xl p-6 border border-white/10 space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-gray-400">Serviço</span>
                  <span className="font-medium text-white">{dadosAgendamento.servicoNome}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-gray-400">Profissional</span>
                  <span className="font-medium text-white">{dadosAgendamento.barbeiroNome}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-gray-400">Data & Hora</span>
                  <span className="font-medium text-white">{dadosAgendamento.data} às {dadosAgendamento.horario}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-400">Total</span>
                  <span className="text-xl font-bold text-gold">R$ {dadosAgendamento.preco},00</span>
                </div>
              </div>

              <button
                onClick={() => setSucesso(true)}
                className="w-full py-4 bg-gold text-dark font-bold rounded-xl text-lg shadow-lg shadow-gold/20 hover:bg-gold-light transition-colors"
              >
                Confirmar Agendamento
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {sucesso && (
          <BookingSuccessAnimation 
            dados={dadosAgendamento}
            onComplete={() => {
              limparDados();
              navigateHome();
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
