import type {
  Agendamento,
  AgendamentoDetalhado,
  AtendimentosPorDia,
  Cidadao,
  Direito,
  DireitoCidadao,
  DireitoMaisProcurado,
  DireitoPorBairro,
  EsperaPorUnidade,
  FaltasPorUnidade,
  Historico,
  ItemListaCreche,
  ItemListaCrecheDetalhado,
  MotivoSenha,
  MovimentoUnidade,
  OrigemSenha,
  Senha,
  StatusAgendamento,
  StatusDireito,
  StatusSenha,
  TabelaRealtime,
  Unidade,
} from '../types'

/**
 * Contrato da camada de dados. Existem duas implementações:
 *  • backendSupabase – banco real com Realtime;
 *  • backendMock     – dados locais (sem variáveis de ambiente), com
 *                      "tempo real" entre abas via BroadcastChannel.
 * As páginas NUNCA usam isto direto: passam pelos services e hooks.
 */

export type TabelaAssinavel = TabelaRealtime | 'historico'

export interface EventoMudanca {
  tabela: TabelaAssinavel
  tipo: 'INSERT' | 'UPDATE' | 'DELETE'
  novo: Record<string, unknown> | null
  antigo: Record<string, unknown> | null
}

export interface FiltroRealtime {
  coluna: string
  valor: string
}

export interface NovaSenha {
  unidadeId: string
  motivo: MotivoSenha
  prioridade: boolean
  origem: OrigemSenha
  cidadaoId?: string | null
}

export interface NovoAgendamento {
  unidadeId: string
  cidadaoId: string
  direitoId: string
  dataHora: string
  motivo: string
  documentosConfirmados: string[]
}

export interface ResultadoAtendimento {
  agendamentoId: string
  status: Exclude<StatusAgendamento, 'agendado'>
  documentosFaltando: string[]
  observacao: string | null
  statusDireito?: StatusDireito | null
}

export interface Backend {
  modo: 'supabase' | 'mock'

  // ---------- Leitura ----------
  listarUnidades(): Promise<Unidade[]>
  listarDireitos(): Promise<Direito[]>
  listarCidadaos(): Promise<Cidadao[]>
  listarSenhasDoDia(unidadeId: string): Promise<Senha[]>
  listarAgendamentosDoDia(unidadeId: string): Promise<AgendamentoDetalhado[]>
  obterAgendamento(id: string): Promise<AgendamentoDetalhado | null>
  listarCreche(unidadeId: string): Promise<ItemListaCrecheDetalhado[]>
  listarDireitosDoCidadao(cidadaoId: string): Promise<DireitoCidadao[]>
  listarHistorico(filtro: { cidadaoId?: string; entidadeId?: string }): Promise<Historico[]>

  // ---------- Escrita (regras espelham as funções do schema.sql) ----------
  emitirSenha(dados: NovaSenha): Promise<Senha>
  chamarProxima(unidadeId: string, guiche: number): Promise<Senha | null>
  atualizarStatusSenha(id: string, status: StatusSenha): Promise<Senha>
  criarAgendamento(dados: NovoAgendamento): Promise<Agendamento>
  registrarAtendimento(dados: ResultadoAtendimento): Promise<Agendamento>
  abrirVaga(unidadeId: string): Promise<ItemListaCreche | null>
  responderConvocacao(itemId: string, aceita: boolean): Promise<ItemListaCreche>

  // ---------- Indicadores (agregados, sem dados pessoais) ----------
  movimentoUnidades(): Promise<MovimentoUnidade[]>
  esperaPorUnidade(): Promise<EsperaPorUnidade[]>
  atendimentosPorDia(): Promise<AtendimentosPorDia[]>
  faltasPorUnidade(): Promise<FaltasPorUnidade[]>
  direitosPorBairro(): Promise<DireitoPorBairro[]>
  direitosMaisProcurados(): Promise<DireitoMaisProcurado[]>

  // ---------- Tempo real ----------
  /** Assina mudanças numa tabela. Devolve a função para cancelar. */
  assinar(tabela: TabelaAssinavel, filtro: FiltroRealtime | undefined, aoMudar: (e: EventoMudanca) => void): () => void

  /** Só no modo mock: volta aos dados iniciais. */
  restaurarDemo?(): Promise<void>
}
