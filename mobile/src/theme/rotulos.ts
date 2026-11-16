import type { MotivoSenha, StatusAgendamento, StatusCreche, StatusDireito, StatusSenha, TipoUnidade } from '../types'
import type { Tom } from './cores'

export const MOTIVOS: Record<MotivoSenha, { rotulo: string; descricao: string }> = {
  consulta: { rotulo: 'Consulta', descricao: 'Médico ou enfermeiro' },
  vacina: { rotulo: 'Vacina', descricao: 'Vacinas e carteira' },
  remedio: { rotulo: 'Retirar remédio', descricao: 'Farmácia da unidade' },
}

export const NOME_SERVICO: Record<TipoUnidade, string> = { ubs: 'UBS', cras: 'CRAS', creche: 'Creche' }
export const PLURAL_SERVICO: Record<TipoUnidade, string> = { ubs: 'UBS', cras: 'CRAS', creche: 'Creches' }

interface Visual {
  rotulo: string
  tom: Tom
}
export const STATUS_SENHA: Record<StatusSenha, Visual> = {
  aguardando: { rotulo: 'Aguardando', tom: 'aguardando' },
  chamada: { rotulo: 'Sua vez! Vá ao guichê', tom: 'chamada' },
  em_atendimento: { rotulo: 'Em atendimento', tom: 'atendimento' },
  concluida: { rotulo: 'Concluída', tom: 'concluida' },
  nao_compareceu: { rotulo: 'Não compareceu', tom: 'negado' },
}
export const STATUS_AGENDAMENTO: Record<StatusAgendamento, Visual> = {
  agendado: { rotulo: 'Agendado', tom: 'aguardando' },
  atendido: { rotulo: 'Atendido', tom: 'concluida' },
  falta_documento: { rotulo: 'Falta documento', tom: 'falta' },
  encaminhado: { rotulo: 'Encaminhado', tom: 'atendimento' },
  nao_compareceu: { rotulo: 'Não compareceu', tom: 'negado' },
}
export const STATUS_CRECHE: Record<StatusCreche, Visual> = {
  aguardando: { rotulo: 'Aguardando vaga', tom: 'aguardando' },
  convocada: { rotulo: 'Vaga disponível!', tom: 'chamada' },
  aceitou: { rotulo: 'Vaga aceita', tom: 'concluida' },
  recusou: { rotulo: 'Vaga recusada', tom: 'negado' },
  expirou: { rotulo: 'Prazo expirou', tom: 'neutro' },
}
export const STATUS_DIREITO: Record<StatusDireito, Visual> = {
  provavel: { rotulo: 'Você pode ter', tom: 'neutro' },
  agendado: { rotulo: 'Agendado', tom: 'aguardando' },
  em_analise: { rotulo: 'Em análise', tom: 'atendimento' },
  concedido: { rotulo: 'Concedido', tom: 'concluida' },
  negado: { rotulo: 'Negado', tom: 'negado' },
}
