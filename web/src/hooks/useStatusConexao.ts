import { useSyncExternalStore } from 'react'
import { assinarEstadoConexao, obterEstadoConexao } from '../services/conexao'

export function useStatusConexao() {
  return useSyncExternalStore(assinarEstadoConexao, obterEstadoConexao, () => 'conectando' as const)
}
