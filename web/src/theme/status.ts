import {
  CalendarClock,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock,
  FileWarning,
  Hourglass,
  Megaphone,
  Search,
  Send,
  UserRound,
  UserX,
  type LucideIcon,
} from 'lucide-react'
import type { StatusAgendamento, StatusCreche, StatusDireito, StatusSenha, TipoUnidade } from '../types'

/**
 * Tons de status padronizados. Cada tom tem uma cor forte e um fundo
 * suave (ver tokens.css). Status NUNCA aparece só por cor: sempre
 * cor + ícone + texto.
 */
export type TomStatus =
  | 'aguardando'
  | 'chamada'
  | 'em-atendimento'
  | 'concluida'
  | 'falta-documento'
  | 'nao-compareceu'
  | 'neutro'

export interface VisualStatus {
  rotulo: string
  tom: TomStatus
  Icone: LucideIcon
}

export const STATUS_SENHA: Record<StatusSenha, VisualStatus> = {
  aguardando: { rotulo: 'Aguardando', tom: 'aguardando', Icone: Clock },
  chamada: { rotulo: 'Chamada', tom: 'chamada', Icone: Megaphone },
  em_atendimento: { rotulo: 'Em atendimento', tom: 'em-atendimento', Icone: UserRound },
  concluida: { rotulo: 'Concluída', tom: 'concluida', Icone: CircleCheck },
  nao_compareceu: { rotulo: 'Não compareceu', tom: 'nao-compareceu', Icone: UserX },
}

export const STATUS_AGENDAMENTO: Record<StatusAgendamento, VisualStatus> = {
  agendado: { rotulo: 'Agendado', tom: 'aguardando', Icone: CalendarClock },
  atendido: { rotulo: 'Atendido', tom: 'concluida', Icone: CircleCheck },
  falta_documento: { rotulo: 'Falta documento', tom: 'falta-documento', Icone: FileWarning },
  encaminhado: { rotulo: 'Encaminhado', tom: 'em-atendimento', Icone: Send },
  nao_compareceu: { rotulo: 'Não compareceu', tom: 'nao-compareceu', Icone: UserX },
}

export const STATUS_CRECHE: Record<StatusCreche, VisualStatus> = {
  aguardando: { rotulo: 'Aguardando vaga', tom: 'aguardando', Icone: Clock },
  convocada: { rotulo: 'Convocada', tom: 'chamada', Icone: Megaphone },
  aceitou: { rotulo: 'Aceitou a vaga', tom: 'concluida', Icone: CircleCheck },
  recusou: { rotulo: 'Recusou a vaga', tom: 'nao-compareceu', Icone: CircleX },
  expirou: { rotulo: 'Prazo expirou', tom: 'neutro', Icone: Hourglass },
}

export const STATUS_DIREITO: Record<StatusDireito, VisualStatus> = {
  provavel: { rotulo: 'Provável direito', tom: 'neutro', Icone: CircleHelp },
  agendado: { rotulo: 'Agendado', tom: 'aguardando', Icone: CalendarClock },
  em_analise: { rotulo: 'Em análise', tom: 'em-atendimento', Icone: Search },
  concedido: { rotulo: 'Concedido', tom: 'concluida', Icone: CircleCheck },
  negado: { rotulo: 'Negado', tom: 'nao-compareceu', Icone: CircleX },
}

/** Classes utilitárias por tom (usam as variáveis de tokens.css). */
export const CLASSES_TOM: Record<TomStatus, string> = {
  aguardando: 'text-[var(--status-aguardando)] bg-[var(--status-aguardando-suave)] border-[var(--status-aguardando)]',
  chamada: 'text-[var(--status-chamada)] bg-[var(--status-chamada-suave)] border-[var(--status-chamada)]',
  'em-atendimento':
    'text-[var(--status-em-atendimento)] bg-[var(--status-em-atendimento-suave)] border-[var(--status-em-atendimento)]',
  concluida: 'text-[var(--status-concluida)] bg-[var(--status-concluida-suave)] border-[var(--status-concluida)]',
  'falta-documento':
    'text-[var(--status-falta-documento)] bg-[var(--status-falta-documento-suave)] border-[var(--status-falta-documento)]',
  'nao-compareceu':
    'text-[var(--status-nao-compareceu)] bg-[var(--status-nao-compareceu-suave)] border-[var(--status-nao-compareceu)]',
  neutro: 'text-[var(--status-neutro)] bg-[var(--status-neutro-suave)] border-[var(--status-neutro)]',
}

export const NOME_SERVICO: Record<TipoUnidade, string> = {
  ubs: 'UBS',
  cras: 'CRAS',
  creche: 'Creche',
}

export const CLASSES_SERVICO: Record<TipoUnidade, { texto: string; fundo: string; borda: string }> = {
  ubs: { texto: 'text-servico-ubs', fundo: 'bg-servico-ubs-suave', borda: 'border-servico-ubs' },
  cras: { texto: 'text-servico-cras', fundo: 'bg-servico-cras-suave', borda: 'border-servico-cras' },
  creche: { texto: 'text-servico-creche', fundo: 'bg-servico-creche-suave', borda: 'border-servico-creche' },
}
