import { create } from 'zustand';
import { Agendamento } from '@/types';

interface BookingState {
  dadosAgendamento: Partial<Agendamento>;
  setServico: (id: string, nome: string, preco: number) => void;
  setBarbeiro: (id: string, nome: string) => void;
  setDataHorario: (data: string, horario: string) => void;
  limparDados: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  dadosAgendamento: {},
  setServico: (id, nome, preco) => 
    set((state) => ({ 
      dadosAgendamento: { ...state.dadosAgendamento, servicoId: id, servicoNome: nome, preco } 
    })),
  setBarbeiro: (id, nome) => 
    set((state) => ({ 
      dadosAgendamento: { ...state.dadosAgendamento, barbeiroId: id, barbeiroNome: nome } 
    })),
  setDataHorario: (data, horario) => 
    set((state) => ({ 
      dadosAgendamento: { ...state.dadosAgendamento, data, horario } 
    })),
  limparDados: () => set({ dadosAgendamento: {} }),
}));