import type {
  AgendamentoDetalhado,
  AtendimentosPorDia,
  DireitoMaisProcurado,
  DireitoPorBairro,
  EsperaPorUnidade,
  FaltasPorUnidade,
  ItemListaCrecheDetalhado,
  MovimentoUnidade,
} from '../types'
import { hojeSP, limitesDoDiaSP, somarDias } from '../utils/datas'
import type { Backend, EventoMudanca, FiltroRealtime, TabelaAssinavel } from './backend'
import { armazenamento } from './armazenamento'
import { informarEstadoCanal, removerCanal } from './conexao'
import { Motor, type BancoMock } from './mock/motor'
import { criarBancoInicial, VERSAO_BANCO_MOCK } from './mock/seedMock'

/**
 * Backend de demonstração sem Supabase.
 * • Guarda o banco no localStorage (sobrevive a recarregar a página).
 * • Sincroniza abas do mesmo navegador por BroadcastChannel, então o
 *   simulador numa aba atualiza a fila e o telão em outras abas.
 */

const CHAVE = 'meu-direito:mock:v1'
const CANAL = 'meu-direito:mock'

const esperar = <T>(v: T): Promise<T> => Promise.resolve(structuredClone(v))

function carregar(): BancoMock {
  try {
    const bruto = armazenamento.get(CHAVE)
    if (bruto) {
      const b = JSON.parse(bruto) as BancoMock
      // Banco de outro dia ou de versão antiga: recria (senhas "de hoje" precisam ser de hoje)
      if (b.versao === VERSAO_BANCO_MOCK && b.dia === hojeSP()) return b
    }
  } catch {
    /* ignora e recria */
  }
  const novo = criarBancoInicial()
  salvar(novo)
  return novo
}

function salvar(b: BancoMock) {
  try {
    armazenamento.set(CHAVE, JSON.stringify(b))
  } catch {
    /* armazenamento cheio ou bloqueado: segue só em memória */
  }
}

export function criarBackendMock(): Backend {
  let banco = carregar()
  const ouvintes = new Set<{ tabela: TabelaAssinavel; filtro?: FiltroRealtime; fn: (e: EventoMudanca) => void }>()
  const canal = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CANAL) : null

  const entregar = (e: EventoMudanca) => {
    for (const o of ouvintes) {
      if (o.tabela !== e.tabela) continue
      if (o.filtro) {
        const linha = e.novo ?? e.antigo
        if (!linha || String(linha[o.filtro.coluna]) !== o.filtro.valor) continue
      }
      o.fn(e)
    }
  }

  // Eventos acumulados durante uma operação: salva uma vez e avisa todos.
  let pendentes: EventoMudanca[] = []
  const motor = new Motor(banco, (e) => pendentes.push(e))

  const operar = <T>(fn: () => T): T => {
    pendentes = []
    const resultado = fn()
    const eventos = pendentes
    pendentes = []
    salvar(banco)
    // Pequeno atraso imita a rede e deixa o retorno da ação chegar antes do evento
    setTimeout(() => eventos.forEach(entregar), 30)
    canal?.postMessage({ eventos })
    return resultado
  }

  canal?.addEventListener('message', (m: MessageEvent<{ eventos?: EventoMudanca[]; reset?: boolean }>) => {
    // Outra aba mudou o banco: relê do armazenamento e repassa os eventos
    const novo = carregar()
    banco = novo
    motor.banco = novo
    if (m.data.reset) {
      for (const t of ['senhas', 'agendamentos', 'lista_creche', 'direitos_cidadao', 'historico'] as const)
        entregar({ tabela: t, tipo: 'UPDATE', novo: null, antigo: null })
      return
    }
    m.data.eventos?.forEach(entregar)
  })

  const cidadaoPorId = (id: string) => banco.cidadaos.find((c) => c.id === id)
  const direitoPorId = (id: string) => banco.direitos.find((d) => d.id === id)

  const detalharAgendamento = (a: BancoMock['agendamentos'][number]): AgendamentoDetalhado => {
    const c = cidadaoPorId(a.cidadao_id)
    const d = direitoPorId(a.direito_id)
    return {
      ...a,
      cidadao: c ? { id: c.id, nome: c.nome, bairro: c.bairro, data_nascimento: c.data_nascimento } : null,
      direito: d ? { id: d.id, nome: d.nome, documentos: d.documentos } : null,
    }
  }

  const minutosEspera = (s: { created_at: string; chamada_em: string | null }) =>
    s.chamada_em ? (new Date(s.chamada_em).getTime() - new Date(s.created_at).getTime()) / 60000 : null

  const media = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null)

  return {
    modo: 'mock',

    async listarUnidades() {
      return esperar(banco.unidades)
    },
    async listarDireitos() {
      return esperar(banco.direitos)
    },
    async listarCidadaos() {
      return esperar(banco.cidadaos)
    },
    async listarSenhasDoDia(unidadeId) {
      const dia = hojeSP()
      return esperar(
        banco.senhas.filter((s) => s.unidade_id === unidadeId && s.dia === dia).sort((a, b) => a.created_at.localeCompare(b.created_at)),
      )
    },
    async listarAgendamentosDoDia(unidadeId) {
      const { inicio, fim } = limitesDoDiaSP()
      return esperar(
        banco.agendamentos
          .filter((a) => a.unidade_id === unidadeId && a.data_hora >= inicio && a.data_hora < fim)
          .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
          .map(detalharAgendamento),
      )
    },
    async obterAgendamento(id) {
      const a = banco.agendamentos.find((x) => x.id === id)
      return esperar(a ? detalharAgendamento(a) : null)
    },
    async listarCreche(unidadeId) {
      operar(() => motor.expirarConvocacoes(unidadeId))
      const itens: ItemListaCrecheDetalhado[] = banco.lista_creche
        .filter((i) => i.unidade_id === unidadeId)
        .sort((a, b) => a.posicao - b.posicao)
        .map((i) => {
          const c = cidadaoPorId(i.cidadao_id)
          return { ...i, cidadao: c ? { id: c.id, nome: c.nome, bairro: c.bairro } : null }
        })
      return esperar(itens)
    },
    async listarDireitosDoCidadao(cidadaoId) {
      return esperar(banco.direitos_cidadao.filter((d) => d.cidadao_id === cidadaoId))
    },
    async listarHistorico({ cidadaoId, entidadeId }) {
      return esperar(
        banco.historico
          .filter((h) => (!cidadaoId || h.cidadao_id === cidadaoId) && (!entidadeId || h.entidade_id === entidadeId))
          .sort((a, b) => a.created_at.localeCompare(b.created_at)),
      )
    },

    async emitirSenha(d) {
      return esperar(operar(() => motor.emitirSenha(d)))
    },
    async chamarProxima(unidadeId, guiche) {
      return esperar(operar(() => motor.chamarProxima(unidadeId, guiche)))
    },
    async atualizarStatusSenha(id, status) {
      return esperar(operar(() => motor.atualizarStatusSenha(id, status)))
    },
    async criarAgendamento(d) {
      return esperar(operar(() => motor.criarAgendamento(d)))
    },
    async registrarAtendimento(d) {
      return esperar(operar(() => motor.registrarAtendimento(d)))
    },
    async abrirVaga(unidadeId) {
      return esperar(operar(() => motor.abrirVaga(unidadeId)))
    },
    async responderConvocacao(itemId, aceita) {
      return esperar(operar(() => motor.responderConvocacao(itemId, aceita)))
    },

    // ---------- Indicadores (mesma lógica das views do schema.sql) ----------
    async movimentoUnidades() {
      const dia = hojeSP()
      const { inicio, fim } = limitesDoDiaSP()
      const lista: MovimentoUnidade[] = banco.unidades.map((u) => {
        let aguardando = 0
        let tempo: number | null = null
        if (u.tipo === 'ubs') {
          const hoje = banco.senhas.filter((s) => s.unidade_id === u.id && s.dia === dia)
          aguardando = hoje.filter((s) => s.status === 'aguardando').length
          tempo = Math.round(media(hoje.map(minutosEspera).filter((n): n is number => n !== null)) ?? 15)
        } else if (u.tipo === 'cras') {
          aguardando = banco.agendamentos.filter(
            (a) => a.unidade_id === u.id && a.status === 'agendado' && a.data_hora >= inicio && a.data_hora < fim,
          ).length
        } else {
          aguardando = banco.lista_creche.filter((i) => i.unidade_id === u.id && i.status === 'aguardando').length
        }
        return { unidade_id: u.id, nome: u.nome, tipo: u.tipo, bairro: u.bairro, aguardando, tempo_estimado_min: tempo }
      })
      return esperar(lista)
    },
    async esperaPorUnidade() {
      const dia = hojeSP()
      const lista: EsperaPorUnidade[] = banco.unidades
        .filter((u) => u.tipo === 'ubs')
        .map((u) => {
          const hoje = banco.senhas.filter((s) => s.unidade_id === u.id && s.dia === dia && s.chamada_em)
          return {
            unidade_id: u.id,
            nome: u.nome,
            tempo_medio_espera_min: Math.round(media(hoje.map(minutosEspera).filter((n): n is number => n !== null)) ?? 0),
            atendidos: hoje.filter((s) => s.status === 'concluida').length,
          }
        })
      return esperar(lista)
    },
    async atendimentosPorDia() {
      const hoje = hojeSP()
      const lista: AtendimentosPorDia[] = []
      for (let d = 6; d >= 0; d--) {
        const dia = somarDias(hoje, -d)
        const { inicio, fim } = limitesDoDiaSP(dia)
        lista.push({
          dia,
          ubs: banco.senhas.filter((s) => s.dia === dia && s.status === 'concluida').length,
          cras: banco.agendamentos.filter(
            (a) =>
              a.data_hora >= inicio &&
              a.data_hora < fim &&
              ['atendido', 'encaminhado', 'falta_documento'].includes(a.status),
          ).length,
        })
      }
      return esperar(lista)
    },
    async faltasPorUnidade() {
      const dia = hojeSP()
      const { inicio, fim } = limitesDoDiaSP()
      const lista: FaltasPorUnidade[] = banco.unidades
        .filter((u) => u.tipo !== 'creche')
        .map((u) => {
          if (u.tipo === 'ubs') {
            const hoje = banco.senhas.filter((s) => s.unidade_id === u.id && s.dia === dia)
            return { unidade_id: u.id, nome: u.nome, tipo: u.tipo, faltas: hoje.filter((s) => s.status === 'nao_compareceu').length, total: hoje.length }
          }
          const hoje = banco.agendamentos.filter((a) => a.unidade_id === u.id && a.data_hora >= inicio && a.data_hora < fim)
          return { unidade_id: u.id, nome: u.nome, tipo: u.tipo, faltas: hoje.filter((a) => a.status === 'nao_compareceu').length, total: hoje.length }
        })
      return esperar(lista)
    },
    async direitosPorBairro() {
      const mapa = new Map<string, DireitoPorBairro>()
      for (const dc of banco.direitos_cidadao) {
        const c = cidadaoPorId(dc.cidadao_id)
        const d = direitoPorId(dc.direito_id)
        if (!c || !d) continue
        const chave = `${c.bairro}|${d.nome}`
        const atual = mapa.get(chave) ?? { bairro: c.bairro, direito: d.nome, total: 0 }
        atual.total += 1
        mapa.set(chave, atual)
      }
      return esperar([...mapa.values()].sort((a, b) => a.bairro.localeCompare(b.bairro) || b.total - a.total))
    },
    async direitosMaisProcurados() {
      const lista: DireitoMaisProcurado[] = banco.direitos
        .map((d) => ({ direito_id: d.id, nome: d.nome, total: banco.direitos_cidadao.filter((x) => x.direito_id === d.id).length }))
        .sort((a, b) => b.total - a.total)
      return esperar(lista)
    },

    assinar(tabela, filtro, aoMudar) {
      const nome = `mock-${tabela}-${Math.random().toString(36).slice(2, 7)}`
      const o = { tabela, filtro, fn: aoMudar }
      ouvintes.add(o)
      informarEstadoCanal(nome, 'ao_vivo')
      return () => {
        ouvintes.delete(o)
        removerCanal(nome)
      }
    },

    async restaurarDemo() {
      banco = criarBancoInicial()
      motor.banco = banco
      salvar(banco)
      canal?.postMessage({ reset: true })
      for (const t of ['senhas', 'agendamentos', 'lista_creche', 'direitos_cidadao', 'historico'] as const)
        entregar({ tabela: t, tipo: 'UPDATE', novo: null, antigo: null })
    },
  }
}
