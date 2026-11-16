import type { TipoUnidade } from './entidades'

/** Movimento atual de uma unidade – sem nenhum dado pessoal (página pública). */
export interface MovimentoUnidade {
  unidade_id: string
  nome: string
  tipo: TipoUnidade
  bairro: string
  aguardando: number
  /** Minutos estimados para quem chega agora (só UBS). */
  tempo_estimado_min: number | null
}

export interface EsperaPorUnidade {
  unidade_id: string
  nome: string
  tempo_medio_espera_min: number
  atendidos: number
}

export interface AtendimentosPorDia {
  dia: string
  ubs: number
  cras: number
}

export interface FaltasPorUnidade {
  unidade_id: string
  nome: string
  tipo: TipoUnidade
  faltas: number
  total: number
}

export interface DireitoPorBairro {
  bairro: string
  direito: string
  total: number
}

export interface DireitoMaisProcurado {
  direito_id: string
  nome: string
  total: number
}
