import { indicadoresService } from './indicadoresService'

/** Carrega todos os indicadores de uma vez (tela de gestores). */
export async function carregarIndicadores() {
  const [movimento, espera, porDia, faltas, porBairro, direitos] = await Promise.all([
    indicadoresService.movimento(),
    indicadoresService.espera(),
    indicadoresService.atendimentosPorDia(),
    indicadoresService.faltas(),
    indicadoresService.direitosPorBairro(),
    indicadoresService.direitosMaisProcurados(),
  ])
  return { movimento, espera, porDia, faltas, porBairro, direitos }
}
