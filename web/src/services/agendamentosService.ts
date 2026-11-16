import type { NovoAgendamento, ResultadoAtendimento } from './backend'
import { backend } from './fonteDados'

export const agendamentosService = {
  listarDoDia: (unidadeId: string) => backend.listarAgendamentosDoDia(unidadeId),
  obter: (id: string) => backend.obterAgendamento(id),
  criar: (dados: NovoAgendamento) => backend.criarAgendamento(dados),
  registrarResultado: (dados: ResultadoAtendimento) => backend.registrarAtendimento(dados),
  listarHistorico: (entidadeId: string) => backend.listarHistorico({ entidadeId }),
  listarDireitosDoCidadao: (cidadaoId: string) => backend.listarDireitosDoCidadao(cidadaoId),
}
