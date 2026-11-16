import { backend } from './fonteDados'

export const unidadesService = {
  listar: () => backend.listarUnidades(),
  listarDireitos: () => backend.listarDireitos(),
  listarCidadaos: () => backend.listarCidadaos(),
}
