export interface SerieColunas {
  rotulo: string
  cor: string
  valores: number[]
}

interface Props {
  categorias: string[]
  series: SerieColunas[]
  /** Texto da dica de cada barra (também aparece ao passar o mouse). */
  dica?: (categoria: string, serie: string, valor: number) => string
}

function passoBonito(max: number): number {
  const brutos = [1, 2, 5, 10, 20, 25, 50, 100]
  return brutos.find((p) => max / p <= 5) ?? 100
}

/** Colunas agrupadas em SVG: 2px de espaço entre colunas, topo arredondado, eixo discreto. */
export function ColunasAgrupadas({ categorias, series, dica }: Props) {
  const L = 640
  const A = 260
  const margem = { e: 36, d: 8, t: 22, b: 30 }
  const maxDado = Math.max(1, ...series.flatMap((s) => s.valores))
  const passo = passoBonito(maxDado)
  const topo = Math.ceil(maxDado / passo) * passo
  const ticks = Array.from({ length: topo / passo + 1 }, (_, i) => i * passo)
  const w = L - margem.e - margem.d
  const h = A - margem.t - margem.b
  const faixa = w / categorias.length
  const largura = Math.min(24, (faixa * 0.7) / series.length - 2)
  const grupo = series.length * (largura + 2) - 2
  const y = (v: number) => margem.t + h - (v / topo) * h

  // Rótulo direto só na maior coluna (nunca um número em cada ponto)
  let maiorS = 0
  let maiorC = 0
  series.forEach((s, si) => s.valores.forEach((v, ci) => v > series[maiorS].valores[maiorC] && ((maiorS = si), (maiorC = ci))))

  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="h-auto w-full" focusable="false">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={margem.e} x2={L - margem.d} y1={y(t)} y2={y(t)} stroke="var(--grafico-trilho)" strokeWidth={1} />
          <text x={margem.e - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--muted)">
            {t}
          </text>
        </g>
      ))}
      {categorias.map((c, ci) => {
        const x0 = margem.e + faixa * ci + (faixa - grupo) / 2
        return (
          <g key={c}>
            {series.map((s, si) => {
              const v = s.valores[ci]
              const x = x0 + si * (largura + 2)
              const alt = Math.max(0, (v / topo) * h)
              return (
                <g key={s.rotulo}>
                  <title>{dica ? dica(c, s.rotulo, v) : `${c} – ${s.rotulo}: ${v}`}</title>
                  {alt > 0 && (
                    <path
                      d={`M${x},${y(0)} V${y(v) + 4} Q${x},${y(v)} ${x + 4},${y(v)} H${x + largura - 4} Q${x + largura},${y(v)} ${x + largura},${y(v) + 4} V${y(0)} Z`}
                      fill={s.cor}
                    />
                  )}
                  {ci === maiorC && si === maiorS && (
                    <text x={x + largura / 2} y={y(v) - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--foreground)">
                      {v}
                    </text>
                  )}
                </g>
              )
            })}
            <text x={margem.e + faixa * ci + faixa / 2} y={A - 8} textAnchor="middle" fontSize={11} fill="var(--muted)">
              {c}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
