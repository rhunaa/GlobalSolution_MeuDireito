import type { LucideIcon } from 'lucide-react'

export interface ItemResumo {
  rotulo: string
  valor: string
  Icone: LucideIcon
  detalhe?: string
}

const PASTEIS = [
  { fundo: '#e3eafb', cor: '#1e4fbf' },
  { fundo: '#fcefd6', cor: '#7a4a00' },
  { fundo: '#e1f1e7', cor: '#1c7445' },
  { fundo: '#f9e3ec', cor: '#a3305f' },
]

/** Faixa de números do topo dos painéis: cartões macios com ícone em círculo pastel. */
export function ResumoNumeros({ itens, titulo }: { itens: ItemResumo[]; titulo: string }) {
  return (
    <section aria-label={titulo} className="mb-8">
      <div className={`grid gap-4 sm:grid-cols-2 ${itens.length >= 4 ? 'lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
        {itens.map(({ rotulo, valor, Icone, detalhe }, i) => {
          const { fundo, cor } = PASTEIS[i % PASTEIS.length]
          return (
            <div key={rotulo} className="cartao-fofo flex items-start gap-4 p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md" style={{ background: fundo, color: cor }} aria-hidden="true">
                <Icone size={22} />
              </span>
              <dl className="min-w-0">
                <dt className="text-sm font-semibold text-muted">{rotulo}</dt>
                <dd className="mt-0.5 text-3xl font-semibold tabular-nums">{valor}</dd>
                {detalhe && <dd className="text-sm text-muted">{detalhe}</dd>}
              </dl>
            </div>
          )
        })}
      </div>
    </section>
  )
}
