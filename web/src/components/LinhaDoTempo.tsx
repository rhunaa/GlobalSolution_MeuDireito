import { formatarDataHora } from '../utils/datas'
import type { Historico } from '../types'

/** Linha do tempo do histórico (a mesma que o cidadão vê no app). */
export function LinhaDoTempo({ itens }: { itens: Historico[] }) {
  if (itens.length === 0) return <p className="text-muted">Nenhum registro ainda.</p>
  return (
    <ol className="relative space-y-4 border-s-2 border-[var(--border)] ps-5">
      {itens.map((h) => (
        <li key={h.id} className="relative">
          <span aria-hidden="true" className="absolute -start-[1.72rem] top-1.5 size-3 rounded-full bg-accent ring-4 ring-[var(--background)]" />
          <p className="font-semibold">{h.comentario ?? h.status}</p>
          <p className="text-sm text-muted">
            <time dateTime={h.created_at}>{formatarDataHora(h.created_at)}</time>
          </p>
        </li>
      ))}
    </ol>
  )
}
