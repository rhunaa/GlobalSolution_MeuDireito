import { CalendarCheck, Clock3, UserX, Users } from 'lucide-react'
import { useMemo } from 'react'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { BarrasHorizontais } from '../components/graficos/BarrasHorizontais'
import { ColunasAgrupadas } from '../components/graficos/ColunasAgrupadas'
import { GraficoAcessivel, Legenda, TabelaDados } from '../components/graficos/GraficoAcessivel'
import { RegiaoRolavel } from '../components/RegiaoRolavel'
import { ResumoNumeros } from '../components/ResumoNumeros'
import { useDadosAoVivo } from '../hooks/useDadosAoVivo'
import { carregarIndicadores } from '../services/indicadoresCompleto'
import { diaCurto, formatarDuracao } from '../utils/datas'

const TABELAS = ['senhas', 'agendamentos', 'direitos_cidadao'] as const

/** Indicadores para gestores: espera, atendimentos, faltas e direitos mais buscados. */
export default function Indicadores() {
  const { dados, erro, carregando } = useDadosAoVivo(carregarIndicadores, [...TABELAS])

  const matriz = useMemo(() => {
    if (!dados) return null
    const bairros = [...new Set(dados.porBairro.map((l) => l.bairro))].sort((a, b) => a.localeCompare(b))
    const direitos = dados.direitos.map((d) => d.nome)
    const valor = (b: string, d: string) => dados.porBairro.find((l) => l.bairro === b && l.direito === d)?.total ?? 0
    const maximo = Math.max(1, ...dados.porBairro.map((l) => l.total))
    return { bairros, direitos, valor, maximo }
  }, [dados])

  if (carregando) return <p className="text-muted">Carregando indicadores…</p>
  if (erro || !dados || !matriz) {
    return (
      <p role="alert" className="font-semibold text-danger">
        {erro ?? 'Não foi possível carregar os indicadores.'}
      </p>
    )
  }

  const { movimento, espera, porDia, faltas } = dados
  const aguardandoUbs = movimento.filter((m) => m.tipo === 'ubs').reduce((s, m) => s + m.aguardando, 0)
  const atendidosHoje = espera.reduce((s, e) => s + e.atendidos, 0)
  const comEspera = espera.filter((e) => e.tempo_medio_espera_min > 0)
  const esperaGeral = comEspera.length ? Math.round(comEspera.reduce((s, e) => s + e.tempo_medio_espera_min, 0) / comEspera.length) : 0
  const totalFaltas = faltas.reduce((s, f) => s + f.faltas, 0)
  const totalAgendados = faltas.reduce((s, f) => s + f.total, 0)

  const dias = porDia.map((d) => diaCurto(d.dia))
  const serieUbs = { rotulo: 'UBS: senhas concluídas', cor: 'var(--grafico-1)', valores: porDia.map((d) => d.ubs) }
  const serieCras = { rotulo: 'CRAS: atendimentos', cor: 'var(--grafico-2)', valores: porDia.map((d) => d.cras) }
  const hoje = porDia[porDia.length - 1]

  return (
    <>
      <CabecalhoPagina
        aoVivo
        titulo="Indicadores"
        descricao="Números do dia e da semana para acompanhar o atendimento. Cada gráfico tem uma tabela com os mesmos valores."
      />

      <ResumoNumeros
        titulo="Resumo de hoje"
        itens={[
          { rotulo: 'Aguardando nas UBS', valor: String(aguardandoUbs), Icone: Users },
          { rotulo: 'Espera média nas UBS', valor: esperaGeral ? formatarDuracao(esperaGeral) : '—', Icone: Clock3 },
          { rotulo: 'Atendidos nas UBS', valor: String(atendidosHoje), Icone: CalendarCheck },
          {
            rotulo: 'Faltas hoje',
            valor: String(totalFaltas),
            Icone: UserX,
            detalhe: totalAgendados ? `de ${totalAgendados} senhas e agendamentos` : undefined,
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <GraficoAcessivel
          titulo="Tempo médio de espera por UBS"
          resumo="Minutos entre pegar a senha e ser chamado, hoje."
          grafico={
            <BarrasHorizontais
              itens={espera.map((e) => ({
                rotulo: e.nome,
                valor: e.tempo_medio_espera_min,
                texto: e.tempo_medio_espera_min ? `${e.tempo_medio_espera_min} min` : '—',
                detalhe: `${e.atendidos} ${e.atendidos === 1 ? 'atendido' : 'atendidos'}`,
              }))}
            />
          }
          tabela={
            <TabelaDados
              legenda="Tempo médio de espera por UBS, hoje"
              colunas={['Unidade', 'Espera média (min)', 'Atendidos']}
              linhas={espera.map((e) => [e.nome, e.tempo_medio_espera_min, e.atendidos])}
            />
          }
        />

        <GraficoAcessivel
          titulo="Faltas de hoje por unidade"
          resumo="Pessoas que não compareceram: senhas não atendidas nas UBS e agendamentos perdidos nos CRAS."
          grafico={
            <BarrasHorizontais
              cor="var(--grafico-2)"
              itens={faltas.map((f) => ({
                rotulo: f.nome,
                valor: f.faltas,
                texto: String(f.faltas),
                detalhe: `de ${f.total}`,
              }))}
            />
          }
          tabela={
            <TabelaDados
              legenda="Faltas de hoje por unidade"
              colunas={['Unidade', 'Faltas', 'Total do dia']}
              linhas={faltas.map((f) => [f.nome, f.faltas, f.total])}
            />
          }
        />

        <div className="xl:col-span-2">
          <GraficoAcessivel
            titulo="Atendimentos por dia"
            resumo={`Últimos 7 dias. Hoje: ${hoje?.ubs ?? 0} senhas concluídas nas UBS e ${hoje?.cras ?? 0} atendimentos nos CRAS.`}
            legenda={
              <Legenda
                itens={[
                  { rotulo: serieUbs.rotulo, cor: serieUbs.cor },
                  { rotulo: serieCras.rotulo, cor: serieCras.cor },
                ]}
              />
            }
            grafico={<ColunasAgrupadas categorias={dias} series={[serieUbs, serieCras]} />}
            tabela={
              <TabelaDados
                legenda="Atendimentos por dia nos últimos 7 dias"
                colunas={['Dia', 'UBS: senhas concluídas', 'CRAS: atendimentos']}
                linhas={porDia.map((d) => [diaCurto(d.dia), d.ubs, d.cras])}
              />
            }
          />
        </div>
      </div>

      <section aria-labelledby="titulo-bairros" className="cartao-fofo mt-6 p-6">
        <h2 id="titulo-bairros" className="text-xl font-semibold">
          Direitos mais buscados por bairro
        </h2>
        <p className="mb-4 text-sm text-muted">Quantas pessoas de cada bairro têm cada direito em andamento. Quanto mais escura a célula, maior o número.</p>
        <RegiaoRolavel rotulo="Tabela de direitos por bairro">
          <table className="w-full min-w-[40rem] border-separate text-left [border-spacing:0.5rem]">
            <caption className="so-leitor">Número de pessoas por direito e por bairro</caption>
            <thead>
              <tr className="text-sm text-muted">
                <th scope="col" className="px-3 py-2 text-start font-semibold">Bairro</th>
                {matriz.direitos.map((d) => (
                  <th key={d} scope="col" className="px-3 py-2 font-semibold">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matriz.bairros.map((b) => (
                <tr key={b}>
                  <th scope="row" className="rounded-lg bg-[var(--surface-secondary)] px-4 py-3 font-semibold">
                    {b}
                  </th>
                  {matriz.direitos.map((d) => {
                    const v = matriz.valor(b, d)
                    return (
                      <td
                        key={d}
                        className="rounded-lg px-3 py-3 text-center text-lg font-bold tabular-nums"
                        style={{ background: v === 0 ? 'var(--surface-secondary)' : `color-mix(in oklab, #7aa2f0 ${Math.round(18 + (v / matriz.maximo) * 42)}%, white)`, color: '#1a2328' }}
                      >
                        {v}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </RegiaoRolavel>
      </section>
    </>
  )
}
