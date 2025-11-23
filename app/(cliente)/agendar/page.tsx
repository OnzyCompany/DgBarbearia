
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '../../../stores/bookingStore';
import { BookingSuccessAnimation } from '../../../components/cliente/BookingSuccessAnimation';
import { ArrowLeft, Check, Scissors, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, addDoc, doc, getDoc, where, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  
  // Data State
  const [servicos, setServicos] = useState<any[]>([]);
  const [barbeiros, setBarbeiros] = useState<any[]>([]);
  const [horariosConfig, setHorariosConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Client Data
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');

  // Date Logic
  const [datasDisponiveis, setDatasDisponiveis] = useState<any[]>([]);
  const [horariosGerados, setHorariosGerados] = useState<string[]>([]);
  const [dataSelecionadaObj, setDataSelecionadaObj] = useState<Date>(new Date());

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!db) return;
        
        // 1. Config Horários
        try {
            const configRef = doc(db, 'configuracoes', 'horarios');
            const configSnap = await getDoc(configRef);
            if (configSnap.exists()) {
                setHorariosConfig(configSnap.data());
            }
        } catch(e) { console.error("Erro config horarios", e); }

        // 2. Fetch Serviços
        try {
            const servicosRef = collection(db, 'servicos');
            const qServicos = query(servicosRef, orderBy('nome'));
            const servicosSnap = await getDocs(qServicos);
            const servicosData = servicosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (servicosData.length > 0) setServicos(servicosData);
        } catch (err: any) { console.warn("Erro ao buscar serviços:", err); }

        // 3. Fetch Barbeiros
        try {
            const barbeirosRef = collection(db, 'barbeiros');
            const qBarbeiros = query(barbeirosRef, orderBy('nome'));
            const barbeirosSnap = await getDocs(qBarbeiros);
            const barbeirosData = barbeirosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (barbeirosData.length > 0) setBarbeiros(barbeirosData);
        } catch (err) { console.warn("Erro ao buscar barbeiros:", err); }

      } catch (error: any) {
        console.error("Erro fatal ao carregar dados:", error);
        // Fallback demo data
        if (error.code === 'permission-denied') {
            toast.error("Modo Offline: Configuração do Banco Pendente");
            setServicos([{ id: 'demo1', nome: 'Corte Degradê (Demo)', preco: 50, duracao: 45 }]);
            setBarbeiros([{ id: 'demo1', nome: 'Barbeiro Principal', especialidade: 'Visagismo' }]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gera datas sempre que a config carrega
  useEffect(() => {
      gerarDatas();
  }, [horariosConfig]);

  const gerarDatas = () => {
      const datas = [];
      const hoje = new Date();
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

      for (let i = 0; i < 7; i++) {
          const data = new Date(hoje);
          data.setDate(hoje.getDate() + i);
          
          let label = '';
          if (i === 0) label = 'HOJE';
          else if (i === 1) label = 'AMANHÃ';
          else label = diasSemana[data.getDay()];

          datas.push({
              dateObj: data,
              dia: data.getDate(),
              label: label,
              fullDate: dateToLocalString(data),
              diaSemanaNome: diasSemana[data.getDay()]
          });
      }
      setDatasDisponiveis(datas);
      
      // Seleciona hoje por padrão se não tiver
      if (datas.length > 0) {
        setDataSelecionadaObj(datas[0].dateObj);
      }
  };

  const dateToLocalString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const gerarHorarios = (data: Date) => {
      // Configurações padrão caso falhe o load
      const cfg = horariosConfig || {};
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const diaNome = diasSemana[data.getDay()];
      
      // Configuração do dia específico
      const configDia = cfg?.dias?.[diaNome];
      const intervalo = Number(cfg?.intervalo || 60);

      if (configDia && !configDia.ativo) {
          setHorariosGerados([]); // Dia fechado
          return;
      }

      const inicioStr = configDia?.inicio || '09:00';
      const fimStr = configDia?.fim || '20:00';

      const [inicioHora, inicioMin] = inicioStr.split(':').map(Number);
      const [fimHora, fimMin] = fimStr.split(':').map(Number);

      const inicioMinutos = inicioHora * 60 + inicioMin;
      const fimMinutos = fimHora * 60 + fimMin;

      const slots = [];
      let atual = inicioMinutos;

      // Se for HOJE, filtrar horários passados
      const hoje = new Date();
      const ehHoje = data.getDate() === hoje.getDate() && data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
      const minutosAgora = hoje.getHours() * 60 + hoje.getMinutes();

      while (atual < fimMinutos) {
          // Se for hoje e o horário já passou, pula
          if (ehHoje && atual <= minutosAgora) {
              atual += intervalo;
              continue; 
          }

          const h = Math.floor(atual / 60);
          const m = atual % 60;
          const timeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          
          slots.push(timeLabel);
          atual += intervalo;
      }

      setHorariosGerados(slots);
  };

  useEffect(() => {
      if(dataSelecionadaObj) {
          gerarHorarios(dataSelecionadaObj);
      }
  }, [dataSelecionadaObj, horariosConfig]);

  const handleConfirmarAgendamento = async () => {
      if (!clienteNome || !clienteTelefone) {
          toast.error("Por favor, informe seu nome e telefone");
          return;
      }
      
      try {
          const dateStr = dateToLocalString(dataSelecionadaObj);
          
          // 1. Verificar se o cliente já existe pelo telefone
          let clienteId = null;
          const cleanPhone = clienteTelefone.replace(/\D/g, '');
          
          try {
            const clientesRef = collection(db, 'clientes');
            // Busca apenas pelo telefone
            const qCliente = query(clientesRef, where('telefone', '==', clienteTelefone)); 
            const clienteSnap = await getDocs(qCliente);

            if (!clienteSnap.empty) {
                // Cliente existe, atualiza nome e data
                const docCliente = clienteSnap.docs[0];
                clienteId = docCliente.id;
                await updateDoc(doc(db, 'clientes', clienteId), {
                    nome: clienteNome, // Atualiza nome caso tenha mudado
                    ultimoAgendamento: serverTimestamp(),
                    totalVisitas: (docCliente.data().totalVisitas || 0) + 1
                });
            } else {
                // Cliente novo
                const novoCliente = await addDoc(collection(db, 'clientes'), {
                    nome: clienteNome,
                    telefone: clienteTelefone,
                    criadoEm: serverTimestamp(),
                    ultimoAgendamento: serverTimestamp(),
                    totalVisitas: 1
                });
                clienteId = novoCliente.id;
            }
          } catch(e) {
              console.error("Erro ao gerenciar cliente:", e);
              // Segue o fluxo mesmo se der erro no cliente para não travar o agendamento
          }

          // 2. Criar Agendamento
          const novoAgendamento = {
              ...dadosAgendamento,
              clienteNome,
              clienteTelefone,
              clienteId,
              status: 'pendente',
              criadoEm: serverTimestamp(), // Importante para ordenação
              servicoNome: dadosAgendamento.servicoNome,
              barbeiroNome: dadosAgendamento.barbeiroNome,
              preco: dadosAgendamento.preco,
              data: dadosAgendamento.data // Formato YYYY-MM-DD
          };

          await addDoc(collection(db, 'agendamentos'), novoAgendamento);

          setSucesso(true);
      } catch (error: any) {
          console.error("Erro ao agendar", error);
          if (error.code === 'permission-denied') {
              toast.error("Erro de Permissão: O banco de dados bloqueou a gravação.");
          } else {
              toast.error("Erro ao finalizar agendamento");
          }
      }
  };

  const avancar = () => setEtapaAtual((e) => Math.min(e + 1, 4));
  const voltar = () => setEtapaAtual((e) => Math.max(e - 1, 1));
  const navigateHome = () => navigate('/');

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
            <motion.div key="servico" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-4">
              <h2 className="text-2xl font-bold mb-4">Escolha o Serviço</h2>
              {servicos.length === 0 ? (
                <div className="text-center py-10"><p className="text-gray-500">Nenhum serviço disponível.</p></div>
              ) : (
                servicos.map((servico) => (
                  <motion.button
                    key={servico.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setServico(servico.id, servico.nome, servico.preco);
                      avancar();
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-colors ${dadosAgendamento.servicoId === servico.id ? 'bg-gold/10 border-gold' : 'bg-dark-card border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-dark flex items-center justify-center text-gold"><Scissors className="w-6 h-6" /></div>
                      <div className="text-left"><h3 className="font-bold text-white">{servico.nome}</h3><p className="text-gray-500 text-sm">{servico.duracao} min</p></div>
                    </div>
                    <span className="font-bold text-gold">R$ {servico.preco}</span>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {etapaAtual === 2 && (
            <motion.div key="barbeiro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-4">
              <h2 className="text-2xl font-bold mb-4">Escolha o Profissional</h2>
              {barbeiros.map((barbeiro) => (
                <motion.button
                  key={barbeiro.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setBarbeiro(barbeiro.id, barbeiro.nome);
                    avancar();
                  }}
                  className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-colors ${dadosAgendamento.barbeiroId === barbeiro.id ? 'bg-gold/10 border-gold' : 'bg-dark-card border-white/5 hover:border-white/20'}`}
                >
                  <div className="w-14 h-14 rounded-full bg-gray-700 border-2 border-gold/50 flex items-center justify-center"><Users className="w-6 h-6 text-gray-400" /></div>
                  <div className="text-left"><h3 className="font-bold text-white">{barbeiro.nome}</h3><p className="text-gray-500 text-sm">{barbeiro.especialidade || 'Barbeiro'}</p></div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {etapaAtual === 3 && (
            <motion.div key="data" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-6">
              <h2 className="text-2xl font-bold">Escolha a Data e Horário</h2>
              
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {datasDisponiveis.map((d, i) => {
                    const isSelected = dataSelecionadaObj && dataSelecionadaObj.getDate() === d.dateObj.getDate();
                    return (
                        <button 
                            key={i} 
                            onClick={() => setDataSelecionadaObj(d.dateObj)}
                            className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${
                                isSelected ? 'bg-gold text-dark border-gold scale-105' : 'bg-dark-card border-white/5 text-gray-400'
                            }`}
                        >
                            <span className="text-[10px] font-bold uppercase">{d.label}</span>
                            <span className="text-xl font-bold">{d.dia}</span>
                        </button>
                    )
                })}
              </div>

              {horariosGerados.length === 0 ? (
                  <div className="text-center py-8 bg-dark-card rounded-xl border border-white/5">
                      <p className="text-gray-500">Nenhum horário disponível para este dia.</p>
                  </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {horariosGerados.map((time) => (
                    <button
                        key={time}
                        onClick={() => {
                            // Salva a data no formato YYYY-MM-DD
                            setDataHorario(dateToLocalString(dataSelecionadaObj), time);
                            avancar();
                        }}
                        className="py-3 rounded-lg bg-dark-card border border-white/5 hover:border-gold/50 hover:text-gold transition-colors text-sm font-medium"
                    >
                        {time}
                    </button>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {etapaAtual === 4 && (
            <motion.div key="resumo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-6">Confirme seus Dados</h2>
              
              <div className="bg-dark-card rounded-2xl p-6 border border-white/10 space-y-4 mb-6">
                 {/* Inputs de Cliente */}
                 <div className="space-y-4 pb-4 border-b border-white/5">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Seu Nome</label>
                        <input 
                            type="text" 
                            value={clienteNome} 
                            onChange={e => setClienteNome(e.target.value)}
                            className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none"
                            placeholder="Ex: João Silva"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Seu Telefone / WhatsApp</label>
                        <input 
                            type="tel" 
                            value={clienteTelefone} 
                            onChange={e => setClienteTelefone(e.target.value)}
                            className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none"
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                 </div>

                <div className="flex justify-between items-center"><span className="text-gray-400">Serviço</span><span className="font-medium text-white">{dadosAgendamento.servicoNome}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400">Profissional</span><span className="font-medium text-white">{dadosAgendamento.barbeiroNome}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400">Data & Hora</span><span className="font-medium text-white">{dadosAgendamento.data} às {dadosAgendamento.horario}</span></div>
                <div className="flex justify-between items-center pt-2"><span className="text-gray-400">Total</span><span className="text-xl font-bold text-gold">R$ {dadosAgendamento.preco},00</span></div>
              </div>

              <button onClick={handleConfirmarAgendamento} className="w-full py-4 bg-gold text-dark font-bold rounded-xl text-lg shadow-lg shadow-gold/20 hover:bg-gold-light transition-colors">
                Confirmar Agendamento
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {sucesso && <BookingSuccessAnimation dados={dadosAgendamento} onComplete={() => { limparDados(); navigateHome(); }} />}
      </AnimatePresence>
    </main>
  );
}
