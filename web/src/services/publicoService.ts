import { indicadoresService } from './indicadoresService'

/** Só agregados: a página pública nunca recebe dados pessoais. */
export async function carregarPublico() {
  const [movimento, direitos] = await Promise.all([
    indicadoresService.movimento(),
    indicadoresService.direitosMaisProcurados(),
  ])
  return { movimento, direitos }
}
