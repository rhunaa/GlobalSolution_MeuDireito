import { Button } from 'antd'
import { Table2, ChartColumn } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { RegiaoRolavel } from '../RegiaoRolavel'

interface Props {
  titulo: string
  /** Frase que resume o que o gráfico mostra (lida por leitores de tela). */
  resumo: string
  grafico: ReactNode
  tabela: ReactNode
  legenda?: ReactNode
}

/**
 * Cartão de gráfico acessível: o desenho é só visual (escondido de leitores
 * de tela) e a tabela com os mesmos números fica sempre disponível para eles.
 * Quem enxerga pode alternar entre gráfico e tabela.
 */
export function GraficoAcessivel({ titulo, resumo, grafico, tabela, legenda }: Props) {
  const [verTabela, setVerTabela] = useState(false)
  const idTitulo = useId()
  const idResumo = useId()
  return (
    <section aria-labelledby={idTitulo} aria-describedby={idResumo} className="cartao-fofo p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={idTitulo} className="text-xl font-semibold">
            {titulo}
          </h2>
          <p id={idResumo} className="text-sm text-muted">
            {resumo}
          </p>
        </div>
        <Button
          aria-pressed={verTabela}
          onClick={() => setVerTabela((v) => !v)}
          icon={verTabela ? <ChartColumn aria-hidden="true" size={16} /> : <Table2 aria-hidden="true" size={16} />}
        >
          {verTabela ? 'Ver gráfico' : 'Ver em tabela'}
        </Button>
      </div>
      {legenda && !verTabela && <div className="mb-3">{legenda}</div>}
      {verTabela ? (
        <RegiaoRolavel rotulo={`Tabela: ${titulo}`}>{tabela}</RegiaoRolavel>
      ) : (
        <>
          <div aria-hidden="true">{grafico}</div>
          <div className="so-leitor">{tabela}</div>
        </>
      )}
    </section>
  )
}

export function Legenda({ itens }: { itens: { rotulo: string; cor: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {itens.map((i) => (
        <li key={i.rotulo} className="flex items-center gap-2">
          <span aria-hidden="true" className="size-3 rounded-sm" style={{ background: i.cor }} />
          {i.rotulo}
        </li>
      ))}
    </ul>
  )
}

/** Tabela simples e semântica usada como alternativa aos gráficos. */
export function TabelaDados({ legenda, colunas, linhas }: { legenda: string; colunas: string[]; linhas: (string | number)[][] }) {
  return (
    <table className="w-full min-w-[20rem] border-separate text-left [border-spacing:0_0.4rem]">
      <caption className="so-leitor">{legenda}</caption>
      <thead>
        <tr className="text-sm text-muted">
          {colunas.map((c) => (
            <th key={c} scope="col" className="px-3 py-2 font-semibold">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((l, i) => (
          <tr key={i} className="[&>*]:bg-[var(--surface-secondary)] [&>:first-child]:rounded-s-lg [&>:last-child]:rounded-e-lg">
            {l.map((c, j) =>
              j === 0 ? (
                <th key={j} scope="row" className="px-3 py-2 font-semibold">
                  {c}
                </th>
              ) : (
                <td key={j} className="px-3 py-2 tabular-nums">
                  {c}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
