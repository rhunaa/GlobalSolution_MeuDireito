export interface BarraItem {
  rotulo: string
  valor: number
  /** Texto do valor na ponta (ex.: "28 min"). */
  texto: string
  /** Texto extra, em cinza, abaixo do rótulo. */
  detalhe?: string
}

/** Barras horizontais simples: marca fina (até 24px), ponta arredondada, valor na ponta. */
export function BarrasHorizontais({ itens, cor = 'var(--grafico-1)', maximo }: { itens: BarraItem[]; cor?: string; maximo?: number }) {
  const max = Math.max(maximo ?? 0, ...itens.map((i) => i.valor), 1)
  return (
    <ul className="flex flex-col gap-4">
      {itens.map((i) => (
        <li key={i.rotulo} title={`${i.rotulo}: ${i.texto}`}>
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-semibold">{i.rotulo}</span>
            {i.detalhe && <span className="text-sm text-muted">{i.detalhe}</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 flex-1 rounded-sm bg-grafico-trilho">
              <div
                className="h-5 rounded-e-[4px]"
                style={{ width: `${Math.max((i.valor / max) * 100, i.valor > 0 ? 2 : 0)}%`, background: cor, minWidth: i.valor > 0 ? 6 : 0 }}
              />
            </div>
            <span className="w-20 shrink-0 text-end font-bold tabular-nums">{i.texto}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
