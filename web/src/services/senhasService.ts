import type { MotivoSenha, StatusSenha } from '../types'
import { backend } from './fonteDados'

export const senhasService = {
  listarDoDia: (unidadeId: string) => backend.listarSenhasDoDia(unidadeId),
  emitirNoBalcao: (unidadeId: string, motivo: MotivoSenha, prioridade: boolean) =>
    backend.emitirSenha({ unidadeId, motivo, prioridade, origem: 'balcao' }),
  emitirPeloApp: (unidadeId: string, motivo: MotivoSenha, prioridade: boolean, cidadaoId: string) =>
    backend.emitirSenha({ unidadeId, motivo, prioridade, origem: 'app', cidadaoId }),
  chamarProxima: (unidadeId: string, guiche: number) => backend.chamarProxima(unidadeId, guiche),
  atualizarStatus: (id: string, status: StatusSenha) => backend.atualizarStatusSenha(id, status),
}
