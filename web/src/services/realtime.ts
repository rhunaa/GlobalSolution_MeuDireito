import type { FiltroRealtime, TabelaAssinavel, EventoMudanca } from './backend'
import { backend } from './fonteDados'

/** Assina mudanças de uma tabela. Devolve a função de cancelar. */
export function assinarTabela(
  tabela: TabelaAssinavel,
  filtro: FiltroRealtime | undefined,
  aoMudar: (e: EventoMudanca) => void,
) {
  return backend.assinar(tabela, filtro, aoMudar)
}

export const restaurarDemo = () => backend.restaurarDemo?.() ?? Promise.resolve()
