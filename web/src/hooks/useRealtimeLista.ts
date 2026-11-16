import { useCallback, useEffect, useRef, useState } from 'react'
import type { FiltroRealtime, TabelaAssinavel } from '../services/backend'
import { assinarTabela } from '../services/realtime'

interface Opcoes<T extends { id: string }> {
  tabelas: { tabela: TabelaAssinavel; filtro?: FiltroRealtime }[]
  carregar: () => Promise<T[]>
  /** Tempo, em ms, que um item recém-chegado fica em destaque. */
  duracaoDestaque?: number
  /** Chaves que devem mudar para recarregar (ex.: unidade atual). */
  dependencias: unknown[]
}

/**
 * Base dos hooks em tempo real (useRealtimeFila, etc.): carrega a lista,
 * reassina o canal e recarrega a cada mudança. Itens que aparecem depois
 * da primeira carga entram em `novos` por alguns segundos (destaque).
 */
export function useRealtimeLista<T extends { id: string }>({
  tabelas,
  carregar,
  duracaoDestaque = 6000,
  dependencias,
}: Opcoes<T>) {
  const [itens, setItens] = useState<T[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [novos, setNovos] = useState<ReadonlySet<string>>(new Set())
  const conhecidos = useRef<Set<string> | null>(null)
  const carregarRef = useRef(carregar)
  carregarRef.current = carregar
  const tabelasRef = useRef(tabelas)
  tabelasRef.current = tabelas

  const recarregar = useCallback(async () => {
    try {
      const lista = await carregarRef.current()
      setItens(lista)
      setErro(null)
      if (conhecidos.current === null) {
        conhecidos.current = new Set(lista.map((i) => i.id))
      } else {
        const chegaram = lista.filter((i) => !conhecidos.current!.has(i.id)).map((i) => i.id)
        chegaram.forEach((id) => conhecidos.current!.add(id))
        if (chegaram.length) {
          setNovos((atual) => new Set([...atual, ...chegaram]))
          window.setTimeout(
            () =>
              setNovos((atual) => {
                const prox = new Set(atual)
                chegaram.forEach((id) => prox.delete(id))
                return prox
              }),
            duracaoDestaque,
          )
        }
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [duracaoDestaque])

  useEffect(() => {
    conhecidos.current = null
    setCarregando(true)
    void recarregar()
    const aoMudar = () => void recarregar()
    const cancelar = tabelasRef.current.map((t) => assinarTabela(t.tabela, t.filtro, aoMudar))
    // Reforço: ao voltar para a aba, confere se perdeu algo
    const aoVoltar = () => document.visibilityState === 'visible' && void recarregar()
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      cancelar.forEach((c) => c())
      document.removeEventListener('visibilitychange', aoVoltar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recarregar, ...dependencias])

  return { itens, carregando, erro, novos, recarregar }
}
