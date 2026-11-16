import type { Jornada } from '../state/dados'
import type { Cidadao } from '../types'

export type Tela =
  | { nome: 'pegarSenha'; unidadeId?: string }
  | { nome: 'agendar'; direitoId?: string }
  | { nome: 'direito'; id: string }

export type Aba = 'inicio' | 'direitos' | 'lugares' | 'perfil'

export interface Contexto {
  cidadao: Cidadao
  jornada: Jornada
  ir: (t: Tela) => void
  irParaAba: (a: Aba) => void
  avisar: (mensagem: string) => void
}
