import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Perfil, Sessao } from '../types'

const CHAVE = 'meu-direito:sessao'

function lerSessao(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return null
    const s = JSON.parse(bruto) as Sessao
    return s.perfil && s.unidadeId ? s : null
  } catch {
    return null
  }
}

interface ContextoSessao {
  sessao: Sessao | null
  entrar: (perfil: Perfil, unidadeId: string) => void
  sair: () => void
}

const Contexto = createContext<ContextoSessao | null>(null)

/** Login simulado: guarda perfil e unidade só no navegador. */
export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao)

  const entrar = useCallback((perfil: Perfil, unidadeId: string) => {
    const nova = { perfil, unidadeId }
    try {
      localStorage.setItem(CHAVE, JSON.stringify(nova))
    } catch {
      /* sem armazenamento: vale só nesta aba */
    }
    setSessao(nova)
  }, [])

  const sair = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE)
    } catch {
      /* ignora */
    }
    setSessao(null)
  }, [])

  const valor = useMemo(() => ({ sessao, entrar, sair }), [sessao, entrar, sair])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSessao(): ContextoSessao {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useSessao precisa estar dentro de SessaoProvider')
  return ctx
}
