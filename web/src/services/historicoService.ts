import { backend } from './fonteDados'

export const historicoService = {
  doCidadao: (cidadaoId: string) => backend.listarHistorico({ cidadaoId }),
  daEntidade: (entidadeId: string) => backend.listarHistorico({ entidadeId }),
}
