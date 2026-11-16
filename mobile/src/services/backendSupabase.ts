import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Agendamento,
  AgendamentoDetalhado,
  ItemListaCreche,
  ItemListaCrecheDetalhado,
  Senha,
} from '../types'
import { hojeSP, limitesDoDiaSP } from '../utils/datas'
import type { Backend } from './backend'
import { informarEstadoCanal, removerCanal } from './conexao'

/** Lança um erro com mensagem amigável quando o Supabase devolve erro. */
function verificar<T>(resposta: { data: T; error: { message: string } | null }, acao: string): T {
  if (resposta.error) {
    console.error(`[Supabase] ${acao}:`, resposta.error)
    throw new Error(`Não foi possível ${acao}. Tente de novo em instantes.`)
  }
  return resposta.data
}

/** Como verificar, mas para listas: nunca devolve null. */
function lista<T>(resposta: { data: T[] | null; error: { message: string } | null }, acao: string): T[] {
  return verificar(resposta, acao) ?? []
}

/** Funções que retornam um registro podem devolver um objeto vazio quando não há resultado. */
function registroOuNulo<T extends { id?: string }>(dado: T | null): T | null {
  return dado && dado.id ? dado : null
}

const SELECT_AGENDAMENTO =
  '*, cidadao:cidadaos(id, nome, bairro, data_nascimento), direito:direitos(id, nome, documentos)'
const SELECT_CRECHE = '*, cidadao:cidadaos(id, nome, bairro)'

let contadorCanais = 0

export function criarBackendSupabase(db: SupabaseClient): Backend {
  return {
    modo: 'supabase',

    // ---------- Leitura ----------
    async listarUnidades() {
      return lista(await db.from('unidades').select('*').order('tipo').order('nome'), 'carregar as unidades')
    },
    async listarDireitos() {
      return lista(await db.from('direitos').select('*').order('nome'), 'carregar os direitos')
    },
    async listarCidadaos() {
      return lista(await db.from('cidadaos').select('*').order('nome'), 'carregar os cidadãos')
    },
    async listarSenhasDoDia(unidadeId) {
      return verificar(
        await db.from('senhas').select('*').eq('unidade_id', unidadeId).eq('dia', hojeSP()).order('created_at'),
        'carregar a fila',
      ) as Senha[]
    },
    async listarAgendamentosDoDia(unidadeId) {
      const { inicio, fim } = limitesDoDiaSP()
      return verificar(
        await db
          .from('agendamentos')
          .select(SELECT_AGENDAMENTO)
          .eq('unidade_id', unidadeId)
          .gte('data_hora', inicio)
          .lt('data_hora', fim)
          .order('data_hora'),
        'carregar a agenda',
      ) as unknown as AgendamentoDetalhado[]
    },
    async obterAgendamento(id) {
      return verificar(
        await db.from('agendamentos').select(SELECT_AGENDAMENTO).eq('id', id).maybeSingle(),
        'carregar o agendamento',
      ) as unknown as AgendamentoDetalhado | null
    },
    async listarCreche(unidadeId) {
      // Marca convocações vencidas antes de listar
      await db.rpc('expirar_convocacoes', { p_unidade_id: unidadeId })
      return verificar(
        await db.from('lista_creche').select(SELECT_CRECHE).eq('unidade_id', unidadeId).order('posicao'),
        'carregar a lista da creche',
      ) as unknown as ItemListaCrecheDetalhado[]
    },
    async listarDireitosDoCidadao(cidadaoId) {
      return lista(
        await db.from('direitos_cidadao').select('*').eq('cidadao_id', cidadaoId),
        'carregar os direitos do cidadão',
      )
    },
    async listarHistorico({ cidadaoId, entidadeId }) {
      let consulta = db.from('historico').select('*').order('created_at', { ascending: true })
      if (cidadaoId) consulta = consulta.eq('cidadao_id', cidadaoId)
      if (entidadeId) consulta = consulta.eq('entidade_id', entidadeId)
      return lista(await consulta.limit(200), 'carregar o histórico')
    },

    // ---------- Escrita ----------
    async emitirSenha({ unidadeId, motivo, prioridade, origem, cidadaoId }) {
      return verificar(
        await db.rpc('emitir_senha', {
          p_unidade_id: unidadeId,
          p_motivo: motivo,
          p_prioridade: prioridade,
          p_origem: origem,
          p_cidadao_id: cidadaoId ?? null,
        }),
        'emitir a senha',
      ) as Senha
    },
    async chamarProxima(unidadeId, guiche) {
      const dado = verificar(
        await db.rpc('chamar_proxima', { p_unidade_id: unidadeId, p_guiche: guiche }),
        'chamar a próxima senha',
      ) as Senha | null
      return registroOuNulo(dado)
    },
    async atualizarStatusSenha(id, status) {
      return verificar(
        await db.rpc('atualizar_status_senha', { p_senha_id: id, p_status: status }),
        'atualizar a senha',
      ) as Senha
    },
    async criarAgendamento(d) {
      return verificar(
        await db
          .from('agendamentos')
          .insert({
            unidade_id: d.unidadeId,
            cidadao_id: d.cidadaoId,
            direito_id: d.direitoId,
            data_hora: d.dataHora,
            motivo: d.motivo,
            documentos_confirmados: d.documentosConfirmados,
          })
          .select()
          .single(),
        'criar o agendamento',
      ) as Agendamento
    },
    async registrarAtendimento(d) {
      return verificar(
        await db.rpc('registrar_atendimento', {
          p_agendamento_id: d.agendamentoId,
          p_status: d.status,
          p_documentos_faltando: d.documentosFaltando,
          p_observacao: d.observacao,
          p_status_direito: d.statusDireito ?? null,
        }),
        'registrar o atendimento',
      ) as Agendamento
    },
    async abrirVaga(unidadeId) {
      const dado = verificar(
        await db.rpc('abrir_vaga', { p_unidade_id: unidadeId }),
        'abrir a vaga',
      ) as ItemListaCreche | null
      return registroOuNulo(dado)
    },
    async responderConvocacao(itemId, aceita) {
      return verificar(
        await db.rpc('responder_convocacao', { p_item_id: itemId, p_aceita: aceita }),
        'enviar a resposta',
      ) as ItemListaCreche
    },

    // ---------- Indicadores ----------
    async movimentoUnidades() {
      return lista(await db.from('vw_movimento_unidades').select('*'), 'carregar o movimento')
    },
    async esperaPorUnidade() {
      return lista(await db.from('vw_espera_por_unidade').select('*'), 'carregar o tempo de espera')
    },
    async atendimentosPorDia() {
      return lista(await db.from('vw_atendimentos_por_dia').select('*'), 'carregar os atendimentos')
    },
    async faltasPorUnidade() {
      return lista(await db.from('vw_faltas_por_unidade').select('*'), 'carregar as faltas')
    },
    async direitosPorBairro() {
      return lista(await db.from('vw_direitos_por_bairro').select('*'), 'carregar os direitos por bairro')
    },
    async direitosMaisProcurados() {
      return lista(await db.from('vw_direitos_mais_procurados').select('*'), 'carregar os direitos')
    },

    // ---------- Tempo real ----------
    assinar(tabela, filtro, aoMudar) {
      const nome = `rt-${tabela}-${filtro ? `${filtro.coluna}-${filtro.valor}` : 'todos'}-${++contadorCanais}`
      informarEstadoCanal(nome, 'conectando')
      let cancelado = false
      const canal = db
        .channel(nome)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tabela,
            ...(filtro ? { filter: `${filtro.coluna}=eq.${filtro.valor}` } : {}),
          },
          (payload) => {
            aoMudar({
              tabela,
              tipo: payload.eventType,
              novo: Object.keys(payload.new ?? {}).length ? (payload.new as Record<string, unknown>) : null,
              antigo: Object.keys(payload.old ?? {}).length ? (payload.old as Record<string, unknown>) : null,
            })
          },
        )
        .subscribe((status) => {
          if (cancelado) return // "CLOSED" ao sair da página não é falha de conexão
          if (status === 'SUBSCRIBED') informarEstadoCanal(nome, 'ao_vivo')
          else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED')
            informarEstadoCanal(nome, 'reconectando')
        })
      return () => {
        cancelado = true
        removerCanal(nome)
        void db.removeChannel(canal)
      }
    },
  }
}
