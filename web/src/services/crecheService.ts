import { backend } from './fonteDados'

export const crecheService = {
  listar: (unidadeId: string) => backend.listarCreche(unidadeId),
  abrirVaga: (unidadeId: string) => backend.abrirVaga(unidadeId),
  responder: (itemId: string, aceita: boolean) => backend.responderConvocacao(itemId, aceita),
}
