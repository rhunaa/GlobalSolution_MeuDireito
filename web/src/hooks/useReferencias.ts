import { useEffect, useState } from 'react'
import { unidadesService } from '../services/unidadesService'
import type { Cidadao, Direito } from '../types'

let cache: { cidadaos: Cidadao[]; direitos: Direito[] } | null = null

/** Cidadãos e direitos (dados de referência, mudam raramente). */
export function useReferencias() {
  const [dados, setDados] = useState(cache)
  const [erro, setErro] = useState<string | null>(null)
  useEffect(() => {
    if (cache) return
    let ativo = true
    Promise.all([unidadesService.listarCidadaos(), unidadesService.listarDireitos()])
      .then(([cidadaos, direitos]) => {
        cache = { cidadaos, direitos }
        if (ativo) setDados(cache)
      })
      .catch((e: Error) => ativo && setErro(e.message))
    return () => {
      ativo = false
    }
  }, [])
  return { cidadaos: dados?.cidadaos ?? [], direitos: dados?.direitos ?? [], carregando: !dados && !erro, erro }
}
