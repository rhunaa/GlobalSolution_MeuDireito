/**
 * Tipos das entidades do banco (espelham supabase/schema.sql).
 * Datas chegam como string ISO 8601 (timestamptz) ou 'AAAA-MM-DD' (date).
 */

export type TipoUnidade = 'ubs' | 'cras' | 'creche'

export interface Acessibilidade {
  rampa: boolean
  banheiro_adaptado: boolean
  libras: boolean
}

export interface Unidade {
  id: string
  tipo: TipoUnidade
  nome: string
  endereco: string
  bairro: string
  horario: string
  latitude: number
  longitude: number
  acessibilidade: Acessibilidade
}

export interface PerfilCidadao {
  renda_familiar?: number
  pessoas_na_casa?: number
  tem_filhos_pequenos?: boolean
  pessoa_com_deficiencia?: boolean
  idade_65_mais?: boolean
  cadastro_unico?: boolean
}

export interface PreferenciasAcessibilidade {
  fonte_grande?: boolean
  alto_contraste?: boolean
  leitor_de_tela?: boolean
  libras?: boolean
}

export interface Cidadao {
  id: string
  nome: string
  data_nascimento: string
  bairro: string
  perfil: PerfilCidadao
  preferencias_acessibilidade: PreferenciasAcessibilidade
}

export interface Direito {
  id: string
  nome: string
  descricao_simples: string
  quem_pode: string
  documentos: string[]
  tipo_unidade: TipoUnidade
  fonte_oficial: string
}

export type StatusDireito = 'provavel' | 'agendado' | 'em_analise' | 'concedido' | 'negado'

export interface DireitoCidadao {
  id: string
  cidadao_id: string
  direito_id: string
  status: StatusDireito
  updated_at: string
}

// ---------- Senhas (UBS) ----------
export type MotivoSenha = 'consulta' | 'vacina' | 'remedio'
export type StatusSenha = 'aguardando' | 'chamada' | 'em_atendimento' | 'concluida' | 'nao_compareceu'
export type OrigemSenha = 'app' | 'balcao'

export interface Senha {
  id: string
  unidade_id: string
  cidadao_id: string | null
  codigo: string
  motivo: MotivoSenha
  status: StatusSenha
  guiche: number | null
  origem: OrigemSenha
  prioridade: boolean
  dia: string
  created_at: string
  chamada_em: string | null
  atendimento_iniciado_em: string | null
  concluida_em: string | null
}

// ---------- Agendamentos (CRAS) ----------
export type StatusAgendamento = 'agendado' | 'atendido' | 'falta_documento' | 'encaminhado' | 'nao_compareceu'

export interface Agendamento {
  id: string
  unidade_id: string
  cidadao_id: string
  direito_id: string
  data_hora: string
  motivo: string
  documentos_confirmados: string[]
  documentos_faltando: string[]
  status: StatusAgendamento
  observacao: string | null
  created_at: string
}

/** Agendamento com os dados relacionados que a agenda precisa mostrar. */
export interface AgendamentoDetalhado extends Agendamento {
  cidadao: Pick<Cidadao, 'id' | 'nome' | 'bairro' | 'data_nascimento'> | null
  direito: Pick<Direito, 'id' | 'nome' | 'documentos'> | null
}

// ---------- Lista da creche ----------
export type StatusCreche = 'aguardando' | 'convocada' | 'aceitou' | 'recusou' | 'expirou'

export interface ItemListaCreche {
  id: string
  unidade_id: string
  cidadao_id: string
  nome_crianca: string
  data_nascimento_crianca: string
  posicao: number
  documentos_pendentes: string[]
  status: StatusCreche
  convocada_em: string | null
  prazo_resposta: string | null
  respondida_em: string | null
  created_at: string
}

export interface ItemListaCrecheDetalhado extends ItemListaCreche {
  cidadao: Pick<Cidadao, 'id' | 'nome' | 'bairro'> | null
}

// ---------- Histórico ----------
export type EntidadeHistorico = 'senha' | 'agendamento' | 'direito' | 'creche'

export interface Historico {
  id: string
  entidade: EntidadeHistorico
  entidade_id: string
  cidadao_id: string | null
  status: string
  comentario: string | null
  created_at: string
}

// ---------- Tabelas com Realtime ----------
export type TabelaRealtime = 'senhas' | 'agendamentos' | 'lista_creche' | 'direitos_cidadao'
