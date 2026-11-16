import { useEffect, useMemo, useRef, useState } from 'react'
import { crecheService } from '../services/crecheService'
import type { ItemListaCrecheDetalhado } from '../types'
import { useRealtimeLista } from './useRealtimeLista'

export interface RespostaFamilia {
  id: string
  texto: string
}

/**
 * Lista de espera de uma creche em tempo real. Além dos itens, avisa quando
 * uma família responde pelo app (aceitou, recusou ou deixou o prazo vencer).
 */
export function useRealtimeCreche(unidadeId: string | undefined) {
  const base = useRealtimeLista<ItemListaCrecheDetalhado>({
    tabelas: unidadeId ? [{ tabela: 'lista_creche', filtro: { coluna: 'unidade_id', valor: unidadeId } }] : [],
    carregar: () => (unidadeId ? crecheService.listar(unidadeId) : Promise.resolve([])),
    dependencias: [unidadeId],
  })

  // Compara o status anterior de cada item para detectar respostas novas
  const anteriores = useRef<Map<string, string> | null>(null)
  const [respondidas, setRespondidas] = useState<ReadonlySet<string>>(new Set())
  const [ultimaResposta, setUltimaResposta] = useState<RespostaFamilia | null>(null)

  useEffect(() => {
    anteriores.current = null
    setRespondidas(new Set())
    setUltimaResposta(null)
  }, [unidadeId])

  useEffect(() => {
    if (base.carregando) return
    const mapa = new Map(base.itens.map((i) => [i.id, i.status]))
    if (anteriores.current) {
      const novas: ItemListaCrecheDetalhado[] = []
      for (const i of base.itens) {
        const antes = anteriores.current.get(i.id)
        if (antes === 'convocada' && ['aceitou', 'recusou', 'expirou'].includes(i.status)) novas.push(i)
      }
      if (novas.length) {
        const n = novas[novas.length - 1]
        const verbo = n.status === 'aceitou' ? 'aceitou a vaga' : n.status === 'recusou' ? 'recusou a vaga' : 'não respondeu a tempo'
        setUltimaResposta({ id: n.id, texto: `A família de ${n.nome_crianca} ${verbo}.` })
        setRespondidas((atual) => new Set([...atual, ...novas.map((x) => x.id)]))
        window.setTimeout(
          () =>
            setRespondidas((atual) => {
              const prox = new Set(atual)
              novas.forEach((x) => prox.delete(x.id))
              return prox
            }),
          8000,
        )
      }
    }
    anteriores.current = mapa
  }, [base.itens, base.carregando])

  const resumo = useMemo(() => {
    const conta = (s: string) => base.itens.filter((i) => i.status === s).length
    return {
      aguardando: conta('aguardando'),
      convocadas: conta('convocada'),
      aceitaram: conta('aceitou'),
      proxima: base.itens.filter((i) => i.status === 'aguardando').sort((a, b) => a.posicao - b.posicao)[0] ?? null,
    }
  }, [base.itens])

  return { ...base, resumo, respondidas, ultimaResposta }
}
