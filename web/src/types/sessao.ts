import type { TipoUnidade } from './entidades'

/** Perfis de quem atende. O acesso é simulado (demonstração). */
export type Perfil = 'recepcionista_ubs' | 'assistente_cras' | 'gestora_creche'

export interface Sessao {
  perfil: Perfil
  unidadeId: string
}

export const TIPO_UNIDADE_DO_PERFIL: Record<Perfil, TipoUnidade> = {
  recepcionista_ubs: 'ubs',
  assistente_cras: 'cras',
  gestora_creche: 'creche',
}

export const NOME_PERFIL: Record<Perfil, string> = {
  recepcionista_ubs: 'Recepcionista da UBS',
  assistente_cras: 'Assistente social do CRAS',
  gestora_creche: 'Gestora de vagas de creche',
}

export type EstadoConexao = 'conectando' | 'ao_vivo' | 'reconectando' | 'offline'
