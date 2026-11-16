import type {
  Agendamento,
  Cidadao,
  Direito,
  DireitoCidadao,
  EntidadeHistorico,
  Historico,
  ItemListaCreche,
  Senha,
  StatusDireito,
  StatusSenha,
  Unidade,
} from '../../types'
import { hojeSP } from '../../utils/datas'
import type { EventoMudanca, NovaSenha, NovoAgendamento, ResultadoAtendimento, TabelaAssinavel } from '../backend'

/**
 * Motor do modo mock: replica, em TypeScript, as funções e triggers de
 * supabase/schema.sql (emitir_senha, chamar_proxima, histórico automático…).
 * Mantenha os dois em sincronia ao mudar uma regra.
 */

export interface BancoMock {
  versao: number
  dia: string
  unidades: Unidade[]
  cidadaos: Cidadao[]
  direitos: Direito[]
  direitos_cidadao: DireitoCidadao[]
  senhas: Senha[]
  agendamentos: Agendamento[]
  lista_creche: ItemListaCreche[]
  historico: Historico[]
}

export type Emissor = (e: EventoMudanca) => void

const novoId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`

const agoraIso = () => new Date().toISOString()

const clonar = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T

export class Motor {
  banco: BancoMock
  private emitir: Emissor

  constructor(banco: BancoMock, emitir: Emissor) {
    this.banco = banco
    this.emitir = emitir
  }

  // ---------- Infra ----------
  private aviso(tabela: TabelaAssinavel, tipo: EventoMudanca['tipo'], novo: object | null, antigo: object | null) {
    this.emitir({
      tabela,
      tipo,
      novo: novo ? (clonar(novo) as Record<string, unknown>) : null,
      antigo: antigo ? (clonar(antigo) as Record<string, unknown>) : null,
    })
  }

  // ---------- Trigger: histórico automático ----------
  private historico(entidade: EntidadeHistorico, linha: { id: string; cidadao_id: string | null; status: string }, quando?: string) {
    const comentario = comentarioHistorico(entidade, linha as never)
    const h: Historico = {
      id: novoId(),
      entidade,
      entidade_id: linha.id,
      cidadao_id: linha.cidadao_id,
      status: linha.status,
      comentario,
      created_at: quando ?? agoraIso(),
    }
    this.banco.historico.push(h)
    this.aviso('historico', 'INSERT', h, null)
  }

  // ---------- Inserções genéricas (com trigger) ----------
  inserirSenha(s: Senha) {
    this.banco.senhas.push(s)
    this.aviso('senhas', 'INSERT', s, null)
    this.historico('senha', s, s.created_at)
    return s
  }

  private atualizarSenha(id: string, mudancas: Partial<Senha>) {
    const s = this.banco.senhas.find((x) => x.id === id)
    if (!s) throw new Error('Senha não encontrada')
    const antigo = clonar(s)
    Object.assign(s, mudancas)
    this.aviso('senhas', 'UPDATE', s, antigo)
    if (antigo.status !== s.status) this.historico('senha', s)
    return clonar(s)
  }

  inserirAgendamento(a: Agendamento) {
    this.banco.agendamentos.push(a)
    this.aviso('agendamentos', 'INSERT', a, null)
    this.historico('agendamento', a, a.created_at)
    // Trigger agendamento_marca_direito
    const atual = this.buscarDireitoCidadao(a.cidadao_id, a.direito_id)
    if (!atual) this.upsertDireitoCidadao(a.cidadao_id, a.direito_id, 'agendado')
    else if (atual.status === 'provavel' || atual.status === 'negado')
      this.upsertDireitoCidadao(a.cidadao_id, a.direito_id, 'agendado')
    return a
  }

  inserirItemCreche(i: ItemListaCreche) {
    this.banco.lista_creche.push(i)
    this.aviso('lista_creche', 'INSERT', i, null)
    this.historico('creche', i, i.created_at)
    return i
  }

  private atualizarItemCreche(id: string, mudancas: Partial<ItemListaCreche>) {
    const i = this.banco.lista_creche.find((x) => x.id === id)
    if (!i) throw new Error('Item da lista não encontrado')
    const antigo = clonar(i)
    Object.assign(i, mudancas)
    this.aviso('lista_creche', 'UPDATE', i, antigo)
    if (antigo.status !== i.status) this.historico('creche', i)
    return clonar(i)
  }

  private buscarDireitoCidadao(cidadaoId: string, direitoId: string) {
    return this.banco.direitos_cidadao.find((d) => d.cidadao_id === cidadaoId && d.direito_id === direitoId)
  }

  upsertDireitoCidadao(cidadaoId: string, direitoId: string, status: StatusDireito) {
    const atual = this.buscarDireitoCidadao(cidadaoId, direitoId)
    if (!atual) {
      const novo: DireitoCidadao = {
        id: novoId(),
        cidadao_id: cidadaoId,
        direito_id: direitoId,
        status,
        updated_at: agoraIso(),
      }
      this.banco.direitos_cidadao.push(novo)
      this.aviso('direitos_cidadao', 'INSERT', novo, null)
      this.historico('direito', novo)
      return novo
    }
    if (atual.status === status) return atual
    const antigo = clonar(atual)
    atual.status = status
    atual.updated_at = agoraIso()
    this.aviso('direitos_cidadao', 'UPDATE', atual, antigo)
    this.historico('direito', atual)
    return atual
  }

  // ---------- RPCs (espelham schema.sql) ----------
  emitirSenha({ unidadeId, motivo, prioridade, origem, cidadaoId }: NovaSenha): Senha {
    const prefixo = motivo === 'consulta' ? 'C' : motivo === 'vacina' ? 'V' : 'R'
    const dia = hojeSP()
    const maior = this.banco.senhas
      .filter((s) => s.unidade_id === unidadeId && s.dia === dia && s.codigo.startsWith(prefixo))
      .reduce((m, s) => Math.max(m, Number(s.codigo.slice(1))), 0)
    return this.inserirSenha({
      id: novoId(),
      unidade_id: unidadeId,
      cidadao_id: cidadaoId ?? null,
      codigo: prefixo + String(maior + 1).padStart(3, '0'),
      motivo,
      status: 'aguardando',
      guiche: null,
      origem,
      prioridade,
      dia,
      created_at: agoraIso(),
      chamada_em: null,
      atendimento_iniciado_em: null,
      concluida_em: null,
    })
  }

  chamarProxima(unidadeId: string, guiche: number): Senha | null {
    const dia = hojeSP()
    const proxima = this.banco.senhas
      .filter((s) => s.unidade_id === unidadeId && s.dia === dia && s.status === 'aguardando')
      .sort((a, b) => Number(b.prioridade) - Number(a.prioridade) || a.created_at.localeCompare(b.created_at))[0]
    if (!proxima) return null
    return this.atualizarSenha(proxima.id, { status: 'chamada', guiche, chamada_em: agoraIso() })
  }

  atualizarStatusSenha(id: string, status: StatusSenha): Senha {
    const s = this.banco.senhas.find((x) => x.id === id)
    if (!s) throw new Error('Senha não encontrada')
    return this.atualizarSenha(id, {
      status,
      atendimento_iniciado_em: status === 'em_atendimento' ? agoraIso() : s.atendimento_iniciado_em,
      concluida_em: status === 'concluida' || status === 'nao_compareceu' ? agoraIso() : s.concluida_em,
    })
  }

  criarAgendamento(d: NovoAgendamento): Agendamento {
    return clonar(
      this.inserirAgendamento({
        id: novoId(),
        unidade_id: d.unidadeId,
        cidadao_id: d.cidadaoId,
        direito_id: d.direitoId,
        data_hora: d.dataHora,
        motivo: d.motivo,
        documentos_confirmados: d.documentosConfirmados,
        documentos_faltando: [],
        status: 'agendado',
        observacao: null,
        created_at: agoraIso(),
      }),
    )
  }

  registrarAtendimento(d: ResultadoAtendimento): Agendamento {
    const a = this.banco.agendamentos.find((x) => x.id === d.agendamentoId)
    if (!a) throw new Error('Agendamento não encontrado')
    const antigo = clonar(a)
    a.status = d.status
    a.documentos_faltando = d.documentosFaltando ?? []
    a.observacao = d.observacao
    this.aviso('agendamentos', 'UPDATE', a, antigo)
    if (antigo.status !== a.status) this.historico('agendamento', a)

    const padrao: Record<ResultadoAtendimento['status'], StatusDireito> = {
      atendido: 'em_analise',
      encaminhado: 'em_analise',
      falta_documento: 'agendado',
      nao_compareceu: 'provavel',
    }
    this.upsertDireitoCidadao(a.cidadao_id, a.direito_id, d.statusDireito ?? padrao[d.status])
    return clonar(a)
  }

  expirarConvocacoes(unidadeId?: string) {
    const agora = agoraIso()
    for (const i of this.banco.lista_creche) {
      if (
        i.status === 'convocada' &&
        i.prazo_resposta &&
        i.prazo_resposta < agora &&
        (!unidadeId || i.unidade_id === unidadeId)
      ) {
        this.atualizarItemCreche(i.id, { status: 'expirou' })
      }
    }
  }

  abrirVaga(unidadeId: string, prazoHoras = 48): ItemListaCreche | null {
    this.expirarConvocacoes(unidadeId)
    const proximo = this.banco.lista_creche
      .filter((i) => i.unidade_id === unidadeId && i.status === 'aguardando')
      .sort((a, b) => a.posicao - b.posicao)[0]
    if (!proximo) return null
    const agora = new Date()
    return this.atualizarItemCreche(proximo.id, {
      status: 'convocada',
      convocada_em: agora.toISOString(),
      prazo_resposta: new Date(agora.getTime() + prazoHoras * 3600_000).toISOString(),
    })
  }

  responderConvocacao(itemId: string, aceita: boolean): ItemListaCreche {
    const i = this.banco.lista_creche.find((x) => x.id === itemId)
    if (!i || i.status !== 'convocada' || (i.prazo_resposta && i.prazo_resposta < agoraIso())) {
      throw new Error('Esta convocação não está mais aberta para resposta.')
    }
    return this.atualizarItemCreche(itemId, { status: aceita ? 'aceitou' : 'recusou', respondida_em: agoraIso() })
  }
}

// ---------- Textos do histórico (iguais ao trigger registrar_historico) ----------
function comentarioHistorico(entidade: EntidadeHistorico, linha: Record<string, unknown>): string {
  const status = linha.status as string
  if (entidade === 'senha') {
    const s = linha as unknown as Senha
    return {
      aguardando: `Senha ${s.codigo} emitida ${s.origem === 'app' ? 'pelo app' : 'no balcão'}`,
      chamada: `Senha ${s.codigo} chamada no guichê ${s.guiche ?? '-'}`,
      em_atendimento: 'Atendimento iniciado',
      concluida: 'Atendimento concluído',
      nao_compareceu: 'Pessoa não compareceu ao ser chamada',
    }[s.status]
  }
  if (entidade === 'agendamento') {
    const a = linha as unknown as Agendamento
    const base = {
      agendado: 'Atendimento agendado',
      atendido: 'Atendimento realizado',
      falta_documento: `Faltou documento: ${a.documentos_faltando.join(', ')}`,
      encaminhado: 'Encaminhado para outro serviço',
      nao_compareceu: 'Não compareceu ao agendamento',
    }[a.status]
    return a.observacao ? `${base}. ${a.observacao}` : base
  }
  if (entidade === 'creche') {
    return (
      {
        aguardando: 'Entrou na lista de espera',
        convocada: 'Vaga aberta: família convocada',
        aceitou: 'Família aceitou a vaga',
        recusou: 'Família recusou a vaga',
        expirou: 'Prazo de resposta expirou',
      } as Record<string, string>
    )[status]
  }
  return (
    {
      provavel: 'Direito provável identificado',
      agendado: 'Atendimento agendado para este direito',
      em_analise: 'Pedido em análise',
      concedido: 'Direito concedido',
      negado: 'Pedido negado',
    } as Record<string, string>
  )[status]
}

export { novoId }
