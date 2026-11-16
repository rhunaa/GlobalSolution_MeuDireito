import { backend } from './fonteDados'

export const indicadoresService = {
  movimento: () => backend.movimentoUnidades(),
  espera: () => backend.esperaPorUnidade(),
  atendimentosPorDia: () => backend.atendimentosPorDia(),
  faltas: () => backend.faltasPorUnidade(),
  direitosPorBairro: () => backend.direitosPorBairro(),
  direitosMaisProcurados: () => backend.direitosMaisProcurados(),
}
