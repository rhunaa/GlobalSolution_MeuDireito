import { useEffect, useState } from 'react'
import { unidadesService } from '../services/unidadesService'
import type { Unidade } from '../types'

let cache: Unidade[] | null = null

/** Lista de unidades (muda raramente, então fica em cache na sessão). */
export function useUnidades() {
  const [unidades, setUnidades] = useState<Unidade[]>(cache ?? [])
  const [carregando, setCarregando] = useState(!cache)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (cache) return
    let ativo = true
    unidadesService
      .listar()
      .then((u) => {
        cache = u
        if (ativo) setUnidades(u)
      })
      .catch((e: Error) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [])

  return { unidades, carregando, erro }
}
