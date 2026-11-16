import type { ReactNode } from 'react'
import { IndicadorConexao } from './IndicadorConexao'

interface Props {
  titulo: string
  descricao?: string
  /** Botões ou resumo à direita do título. */
  acoes?: ReactNode
  /** Mostra o indicador "Ao vivo" (telas operacionais). */
  aoVivo?: boolean
}

/** Título (h1) + descrição de cada página. */
export function CabecalhoPagina({ titulo, descricao, acoes, aoVivo = false }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold sm:text-3xl">{titulo}</h1>
        {descricao && <p className="mt-1 max-w-prose text-muted">{descricao}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {aoVivo && <IndicadorConexao />}
        {acoes}
      </div>
    </div>
  )
}
