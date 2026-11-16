import { useCallback, useEffect, useRef, useState } from 'react'
import type { TabelaAssinavel } from '../services/backend'
import { assinarTabela } from '../services/realtime'

/**
 * Carrega um conjunto de dados agregados e o recarrega quando alguma das
 * tabelas observadas muda (com pequena espera, para juntar várias mudanças).
 */
export function useDadosAoVivo<T>(carregar: () => Promise<T>, tabelas: TabelaAssinavel[]) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null)
  const carregarRef = useRef(carregar)
  carregarRef.current = carregar
  const temporizador = useRef<number | undefined>(undefined)

  const recarregar = useCallback(async () => {
    try {
      setDados(await carregarRef.current())
      setErro(null)
      setAtualizadoEm(new Date())
    } catch (e) {
      setErro((e as Error).message)
    }
  }, [])

  const chave = tabelas.join(',')
  useEffect(() => {
    void recarregar()
    const aoMudar = () => {
      window.clearTimeout(temporizador.current)
      temporizador.current = window.setTimeout(() => void recarregar(), 400)
    }
    const cancelar = chave.split(',').filter(Boolean).map((t) => assinarTabela(t as TabelaAssinavel, undefined, aoMudar))
    return () => {
      window.clearTimeout(temporizador.current)
      cancelar.forEach((c) => c())
    }
  }, [chave, recarregar])

  return { dados, erro, carregando: dados === null && erro === null, atualizadoEm, recarregar }
}
