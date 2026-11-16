import type { MotivoSenha, OrigemSenha, Senha, StatusAgendamento, StatusDireito, StatusSenha } from '../../types'
import { hojeSP, isoEmSP, somarDias } from '../../utils/datas'
import { CIDADAOS, DIREITOS, IDS, UNIDADES } from './dadosBase'
import { Motor, novoId, type BancoMock } from './motor'

export const VERSAO_BANCO_MOCK = 1

const minAtras = (min: number, base = Date.now()) => new Date(base - min * 60_000).toISOString()
const horasAFrente = (h: number) => new Date(Date.now() + h * 3600_000).toISOString()
const diasAtras = (dias: number) => somarDias(hojeSP(), -dias)

type LinhaSenha = [
  unidade: string,
  cidadao: number | null,
  codigo: string,
  motivo: MotivoSenha,
  status: StatusSenha,
  guiche: number | null,
  origem: OrigemSenha,
  prioridade: boolean,
  criadaHa: number,
  chamadaHa: number | null,
  iniciadaHa: number | null,
  concluidaHa: number | null,
]

/** Cria o banco inicial do modo mock – espelha supabase/seed.sql. */
export function criarBancoInicial(): BancoMock {
  const banco: BancoMock = {
    versao: VERSAO_BANCO_MOCK,
    dia: hojeSP(),
    unidades: structuredClone(UNIDADES),
    cidadaos: structuredClone(CIDADAOS),
    direitos: structuredClone(DIREITOS),
    direitos_cidadao: [],
    senhas: [],
    agendamentos: [],
    lista_creche: [],
    historico: [],
  }
  const motor = new Motor(banco, () => {})
  const c = IDS.cidadao

  // ---------- Senhas de hoje ----------
  const senhasHoje: LinhaSenha[] = [
    [IDS.ubsCapao, 1, 'C001', 'consulta', 'concluida', 1, 'app', true, 150, 138, 136, 120],
    [IDS.ubsCapao, null, 'V001', 'vacina', 'concluida', 2, 'balcao', false, 140, 118, 117, 110],
    [IDS.ubsCapao, 8, 'C002', 'consulta', 'concluida', 1, 'app', false, 130, 105, 104, 85],
    [IDS.ubsCapao, null, 'R001', 'remedio', 'nao_compareceu', 2, 'balcao', false, 115, 90, null, 86],
    [IDS.ubsCapao, 10, 'R002', 'remedio', 'concluida', 2, 'app', true, 100, 80, 79, 70],
    [IDS.ubsCapao, 14, 'C003', 'consulta', 'em_atendimento', 1, 'app', false, 70, 30, 28, null],
    [IDS.ubsCapao, null, 'V002', 'vacina', 'chamada', 2, 'balcao', false, 55, 3, null, null],
    [IDS.ubsCapao, 19, 'C004', 'consulta', 'aguardando', null, 'app', false, 40, null, null, null],
    [IDS.ubsCapao, null, 'R003', 'remedio', 'aguardando', null, 'balcao', true, 32, null, null, null],
    [IDS.ubsCapao, 2, 'C005', 'consulta', 'aguardando', null, 'app', true, 25, null, null, null],
    [IDS.ubsCapao, null, 'V003', 'vacina', 'aguardando', null, 'balcao', false, 18, null, null, null],
    [IDS.ubsCapao, 3, 'C006', 'consulta', 'aguardando', null, 'app', false, 9, null, null, null],
    [IDS.ubsBrasilandia, 5, 'C001', 'consulta', 'concluida', 1, 'app', true, 90, 80, 79, 60],
    [IDS.ubsBrasilandia, null, 'R001', 'remedio', 'chamada', 1, 'balcao', false, 35, 5, null, null],
    [IDS.ubsBrasilandia, 9, 'V001', 'vacina', 'aguardando', null, 'app', false, 20, null, null, null],
    [IDS.ubsBrasilandia, 18, 'C002', 'consulta', 'aguardando', null, 'app', false, 12, null, null, null],
  ]
  for (const [u, cid, codigo, motivo, status, guiche, origem, prioridade, criada, chamada, iniciada, concluida] of senhasHoje) {
    motor.inserirSenha({
      id: novoId(),
      unidade_id: u,
      cidadao_id: cid ? c(cid) : null,
      codigo,
      motivo,
      status,
      guiche,
      origem,
      prioridade,
      dia: hojeSP(),
      created_at: minAtras(criada),
      chamada_em: chamada !== null ? minAtras(chamada) : null,
      atendimento_iniciado_em: iniciada !== null ? minAtras(iniciada) : null,
      concluida_em: concluida !== null ? minAtras(concluida) : null,
    })
  }

  // ---------- Senhas dos últimos 6 dias (indicadores) ----------
  for (const u of [IDS.ubsCapao, IDS.ubsBrasilandia]) {
    for (let d = 1; d <= 6; d++) {
      const base = Date.now() - d * 86_400_000
      const total = 14 + ((d * 3) % 8) - (u === IDS.ubsBrasilandia ? 5 : 0)
      for (let n = 1; n <= total; n++) {
        const criada = 300 - n * 10
        const espera = 10 + ((n * 7) % 25)
        const s: Senha = {
          id: novoId(),
          unidade_id: u,
          cidadao_id: null,
          codigo: 'C' + String(n).padStart(3, '0'),
          motivo: 'consulta',
          status: n % 9 === 0 ? 'nao_compareceu' : 'concluida',
          guiche: 1 + (n % 2),
          origem: n % 3 === 0 ? 'balcao' : 'app',
          prioridade: n % 5 === 0,
          dia: diasAtras(d),
          created_at: minAtras(criada, base),
          chamada_em: minAtras(criada - espera, base),
          atendimento_iniciado_em: minAtras(criada - espera - 2, base),
          concluida_em: minAtras(criada - espera - 15, base),
        }
        motor.inserirSenha(s)
      }
    }
  }

  // ---------- Agendamentos de hoje ----------
  const hoje = hojeSP()
  const ag = (
    unidade: string,
    cidadao: number,
    direito: string,
    hora: string,
    motivo: string,
    docs: string[],
    status: StatusAgendamento,
    observacao: string | null = null,
    faltando: string[] = [],
  ) =>
    motor.inserirAgendamento({
      id: novoId(),
      unidade_id: unidade,
      cidadao_id: c(cidadao),
      direito_id: direito,
      data_hora: isoEmSP(hoje, hora),
      motivo,
      documentos_confirmados: docs,
      documentos_faltando: faltando,
      status,
      observacao,
      created_at: minAtras(60 * 24 * 3),
    })

  ag(IDS.crasCapao, 10, IDS.bpc, '08:00', 'Pedido de BPC para pessoa idosa', ['CPF de todas as pessoas da casa', 'Documento com foto', 'Cadastro Único atualizado'], 'atendido', 'Pedido encaminhado ao INSS.')
  ag(IDS.crasCapao, 14, IDS.cadUnico, '08:45', 'Atualizar Cadastro Único', ['CPF ou título de eleitor de quem responde pela família', 'Comprovante de endereço'], 'atendido')
  ag(IDS.crasCapao, 8, IDS.cadUnico, '09:30', 'Primeira inscrição no Cadastro Único', ['CPF ou título de eleitor de quem responde pela família'], 'agendado')
  ag(IDS.crasCapao, 1, IDS.tarifaSocial, '10:15', 'Tarifa Social de energia', ['Número do NIS (do Cadastro Único)', 'CPF de quem está na conta de luz', 'Conta de luz recente'], 'agendado')
  ag(IDS.crasCapao, 2, IDS.bpc, '11:00', 'Informações sobre BPC', ['Documento com foto'], 'agendado')
  ag(IDS.crasCapao, 19, IDS.cadUnico, '13:30', 'Inscrição no Cadastro Único', ['CPF ou título de eleitor de quem responde pela família', 'Documento de todas as pessoas da casa (certidão de nascimento ou CPF)', 'Comprovante de endereço'], 'agendado')
  ag(IDS.crasCapao, 3, IDS.tarifaSocial, '15:00', 'Tarifa Social de energia', ['Conta de luz recente'], 'agendado')
  ag(IDS.crasItaquera, 7, IDS.bpc, '09:00', 'Pedido de BPC para pessoa idosa', ['Documento com foto'], 'falta_documento', 'Trazer CPF de todas as pessoas da casa.', ['CPF de todas as pessoas da casa'])
  ag(IDS.crasItaquera, 16, IDS.cadUnico, '10:30', 'Atualizar Cadastro Único', ['CPF ou título de eleitor de quem responde pela família', 'Comprovante de endereço'], 'agendado')
  ag(IDS.crasItaquera, 15, IDS.tarifaSocial, '14:00', 'Tarifa Social de energia', ['CPF de quem está na conta de luz'], 'agendado')

  // ---------- Agendamentos dos últimos 6 dias (indicadores) ----------
  const nomesOrdenados = [...banco.cidadaos].sort((a, b) => a.nome.localeCompare(b.nome))
  const direitosCras = [IDS.cadUnico, IDS.tarifaSocial, IDS.bpc]
  for (const u of [IDS.crasCapao, IDS.crasItaquera]) {
    for (let d = 1; d <= 6; d++) {
      for (let n = 1; n <= 5 + (d % 3); n++) {
        const status: StatusAgendamento = n % 4 === 0 ? 'nao_compareceu' : n % 5 === 0 ? 'falta_documento' : 'atendido'
        motor.inserirAgendamento({
          id: novoId(),
          unidade_id: u,
          cidadao_id: nomesOrdenados[(d * 3 + n) % 20].id,
          direito_id: direitosCras[(d + n) % 3],
          data_hora: isoEmSP(diasAtras(d), `${String(8 + n).padStart(2, '0')}:00`),
          motivo: 'Atendimento',
          documentos_confirmados: [],
          documentos_faltando: [],
          status,
          observacao: null,
          created_at: minAtras(60 * 24 * (d + 5)),
        })
      }
    }
  }

  // ---------- Direitos dos cidadãos ----------
  const direitos: [number, string, StatusDireito][] = [
    [10, IDS.bpc, 'em_analise'], [14, IDS.cadUnico, 'concedido'], [4, IDS.creche, 'agendado'],
    [4, IDS.cadUnico, 'concedido'], [4, IDS.tarifaSocial, 'provavel'], [5, IDS.bpc, 'provavel'],
    [5, IDS.remedios, 'concedido'], [13, IDS.bpc, 'em_analise'], [13, IDS.tarifaSocial, 'concedido'],
    [1, IDS.remedios, 'concedido'], [6, IDS.creche, 'agendado'], [6, IDS.cadUnico, 'provavel'],
    [12, IDS.cadUnico, 'concedido'], [12, IDS.tarifaSocial, 'provavel'], [18, IDS.tarifaSocial, 'em_analise'],
    [20, IDS.remedios, 'concedido'], [3, IDS.creche, 'agendado'], [8, IDS.creche, 'agendado'],
    [11, IDS.creche, 'agendado'], [16, IDS.creche, 'agendado'], [17, IDS.creche, 'agendado'],
  ]
  for (const [cid, dir, st] of direitos) motor.upsertDireitoCidadao(c(cid), dir, st)

  // ---------- Lista de espera das creches ----------
  const item = (
    unidade: string,
    cidadao: number,
    crianca: string,
    diasDeVida: number,
    posicao: number,
    pendentes: string[] = [],
    extra: Partial<BancoMock['lista_creche'][number]> = {},
  ) =>
    motor.inserirItemCreche({
      id: novoId(),
      unidade_id: unidade,
      cidadao_id: c(cidadao),
      nome_crianca: crianca,
      data_nascimento_crianca: diasAtras(diasDeVida),
      posicao,
      documentos_pendentes: pendentes,
      status: 'aguardando',
      convocada_em: null,
      prazo_resposta: null,
      respondida_em: null,
      created_at: minAtras(60 * 24 * 30),
      ...extra,
    })

  item(IDS.cheiSaoLuis, 3, 'Helena Oliveira', 420, 1, [], { status: 'convocada', convocada_em: minAtras(8 * 60), prazo_resposta: horasAFrente(40) })
  item(IDS.cheiSaoLuis, 17, 'Miguel Teixeira', 610, 2)
  item(IDS.cheiSaoLuis, 8, 'Laura Rodrigues', 300, 3, ['Carteira de vacinação da criança'])
  item(IDS.cheiSaoLuis, 12, 'Davi Barbosa', 820, 4)
  item(IDS.cheiSaoLuis, 14, 'Alice Nascimento', 200, 5, ['Comprovante de endereço'])
  item(IDS.cheiBrasilandia, 4, 'Arthur Lima', 500, 1, [], { status: 'aceitou', convocada_em: minAtras(48 * 60), prazo_resposta: minAtras(24 * 60), respondida_em: minAtras(30 * 60) })
  item(IDS.cheiBrasilandia, 13, 'Valentina Ribeiro', 380, 2)
  item(IDS.cheiBrasilandia, 9, 'Heitor Costa', 150, 3, ['Certidão de nascimento da criança'])
  item(IDS.cheiBrasilandia, 18, 'Sophia Moreira', 700, 4)
  item(IDS.cheiItaquera, 6, 'Bernardo Souza', 450, 1)
  item(IDS.cheiItaquera, 16, 'Manuela Carvalho', 260, 2, ['CPF de quem é responsável'])
  item(IDS.cheiItaquera, 11, 'Théo Martins', 900, 3)

  return banco
}
