export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
  categoria: 'corte' | 'barba' | 'combo' | 'tratamento';
  icone?: string;
}

export interface Barbeiro {
  id: string;
  nome: string;
  foto?: string;
  especialidades: string[];
}

export interface Agendamento {
  servicoId: string;
  servicoNome: string;
  barbeiroId: string;
  barbeiroNome: string;
  data: string;
  horario: string;
  preco: number;
  clienteNome?: string;
  clienteTelefone?: string;
}

export type ConsultMode = 'fast' | 'deep';