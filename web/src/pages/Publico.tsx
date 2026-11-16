import { Select } from 'antd'
import { Baby, CalendarClock, Stethoscope } from 'lucide-react'
import { MotionConfig, motion } from 'motion/react'
import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Logo } from '../components/Logo'
import { BarrasHorizontais } from '../components/graficos/BarrasHorizontais'
import { IndicadorConexao } from '../components/IndicadorConexao'
import { useDadosAoVivo } from '../hooks/useDadosAoVivo'
import { carregarPublico } from '../services/publicoService'
import { ELENCO, Personagem } from './capa/Personagens'
import { CLASSES_SERVICO } from '../theme/status'
import type { MovimentoUnidade, TipoUnidade } from '../types'
import { formatarDuracao, duracaoPorExtenso } from '../utils/datas'

const SERVICOS: { tipo: TipoUnidade; titulo: string; Icone: typeof Stethoscope; explicacao: string }[] = [
  { tipo: 'ubs', titulo: 'UBS perto de você', Icone: Stethoscope, explicacao: 'Pessoas aguardando na fila agora.' },
  { tipo: 'cras', titulo: 'CRAS perto de você', Icone: CalendarClock, explicacao: 'Atendimentos agendados que ainda vão acontecer hoje.' },
  { tipo: 'creche', titulo: 'Creches perto de você', Icone: Baby, explicacao: 'Famílias na lista de espera.' },
]

function textoMovimento(m: MovimentoUnidade): { principal: string; extra?: string; falado: string } {
  const n = m.aguardando
  if (m.tipo === 'ubs') {
    const pessoas = `${n} ${n === 1 ? 'pessoa aguardando' : 'pessoas aguardando'}`
    return {
      principal: pessoas,
      extra: m.tempo_estimado_min !== null ? `Espera estimada: cerca de ${formatarDuracao(m.tempo_estimado_min)}` : undefined,
      falado: `${pessoas}${m.tempo_estimado_min !== null ? `. Espera estimada de cerca de ${duracaoPorExtenso(m.tempo_estimado_min)}` : ''}`,
    }
  }
  if (m.tipo === 'cras') {
    const t = `${n} ${n === 1 ? 'atendimento agendado hoje' : 'atendimentos agendados hoje'}`
    return { principal: t, falado: t }
  }
  const t = `${n} ${n === 1 ? 'família na lista' : 'famílias na lista'}`
  return { principal: t, falado: t }
}

const POSICOES = [
  { indice: 0, classe: 'left-[5%] top-[14%] w-32 xl:w-36' },
  { indice: 1, classe: 'right-[5%] top-[12%] w-32 xl:w-36' },
  { indice: 4, classe: 'left-[9%] bottom-[8%] w-24' },
  { indice: 3, classe: 'right-[8%] bottom-[8%] w-28' },
]

/** Página pública: movimento das unidades e direitos mais procurados. Sem login, sem dados pessoais. */
export default function Publico() {
  const { dados, erro, carregando, atualizadoEm } = useDadosAoVivo(carregarPublico, ['senhas', 'agendamentos', 'lista_creche', 'direitos_cidadao'])
  const [lugar, setLugar] = useState('todos')
  const idSelect = useId()

  // Opções do seletor: todos, cada tipo de lugar e cada unidade
  const opcoes = useMemo(
    () => [
      { value: 'todos', label: 'Todos os lugares' },
      ...SERVICOS.map(({ tipo, titulo }) => ({
        label: titulo,
        options: [
          { value: `tipo:${tipo}`, label: `Todos: ${titulo}` },
          ...(dados?.movimento.filter((m) => m.tipo === tipo).map((m) => ({ value: m.unidade_id, label: m.nome })) ?? []),
        ],
      })),
    ],
    [dados],
  )
  const visivel = (m: MovimentoUnidade) => lugar === 'todos' || lugar === `tipo:${m.tipo}` || lugar === m.unidade_id
  const totalVisivel = dados ? dados.movimento.filter(visivel).length : 0

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[var(--capa-fundo)] text-foreground">
        <a href="#conteudo" className="pular-conteudo">
          Pular para o conteúdo
        </a>

        <header className="sticky top-0 z-20 bg-[var(--capa-fundo)]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 py-3 sm:px-8">
            <Link to="/">
              <Logo />
            </Link>
            <nav aria-label="Seções da página" className="order-3 flex w-full flex-wrap gap-x-6 gap-y-1 text-sm font-semibold md:order-none md:w-auto">
              <Link to="/" className="py-1 text-foreground/80 underline-offset-8 hover:text-foreground hover:underline">
                Meu Direito
              </Link>
              {[
                ['#movimento', 'Movimento agora'],
                ['#direitos', 'Direitos mais procurados'],
              ].map(([href, rotulo]) => (
                <a key={href} href={href} className="py-1 text-foreground/80 underline-offset-8 hover:text-foreground hover:underline">
                  {rotulo}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <IndicadorConexao />
              <Link
                to="/entrar"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-5 py-1.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Entrar
              </Link>
            </div>
          </div>
        </header>

        <main id="conteudo" tabIndex={-1}>
          {/* ---------- Primeira tela ---------- */}
          <section aria-labelledby="titulo-publico" className="relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden px-5 py-14 lg:min-h-[26rem]">
            {POSICOES.map(({ indice, classe }, k) => (
              <motion.div
                key={indice}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.08 * k }}
                className={`absolute hidden lg:block ${classe}`}
              >
                <Personagem {...ELENCO[indice]} className="h-auto w-full drop-shadow-sm" />
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="relative z-10 mx-auto max-w-2xl text-center">
              <h1 id="titulo-publico" className="text-[clamp(1.9rem,4.2vw,3.25rem)] font-semibold leading-[1.12] tracking-tight">
                Veja como está o atendimento{' '}
                <span className="inline-block -rotate-1 rounded-lg bg-accent px-3 py-0.5 text-accent-foreground sm:px-4">agora</span>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base text-muted sm:text-lg">Números gerais das unidades. Nenhum dado pessoal é mostrado.</p>
            </motion.div>

            <div aria-hidden="true" className="relative z-10 mt-8 flex flex-wrap justify-center gap-3 lg:hidden">
              {[0, 1, 4, 3].map((i) => (
                <Personagem key={i} {...ELENCO[i]} className="h-auto w-[4.5rem] sm:w-24" />
              ))}
            </div>
          </section>

          {/* ---------- Movimento ---------- */}
          <section id="movimento" aria-labelledby="titulo-movimento" className="px-5 pb-14 pt-10 sm:px-8">
            <div className="mx-auto max-w-5xl">
              <h2 id="titulo-movimento" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Movimento agora
              </h2>
              <p className="mb-6 mt-2 text-muted">
                Os números se atualizam sozinhos
                {atualizadoEm && ` (última atualização às ${atualizadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`}.
              </p>

              {erro && (
                <p role="alert" className="font-semibold text-danger">
                  {erro}
                </p>
              )}
              {carregando && <p className="text-muted">Carregando…</p>}

              {dados && (
                <>
                  <div className="mb-6 max-w-md">
                    <label htmlFor={idSelect} className="mb-1 block font-semibold">
                      Escolha o lugar
                    </label>
                    <Select
                      getPopupContainer={(no) => no.parentElement ?? document.body}
                      id={idSelect}
                      size="large"
                      className="w-full"
                      value={lugar}
                      onChange={(v) => setLugar(v as string)}
                      options={opcoes}
                      showSearch={{ optionFilterProp: 'label' }}
                    />
                    <p role="status" aria-live="polite" className="mt-2 text-sm text-muted">
                      Mostrando {totalVisivel} {totalVisivel === 1 ? 'lugar' : 'lugares'}.
                    </p>
                  </div>

                  {SERVICOS.map(({ tipo, titulo, Icone, explicacao }) => {
                    const unidades = dados.movimento.filter((m) => m.tipo === tipo && visivel(m))
                    if (unidades.length === 0) return null
                    const cls = CLASSES_SERVICO[tipo]
                    return (
                      <div key={tipo} className="mb-8">
                        <h3 className={`mb-1 flex items-center gap-2 text-xl font-semibold ${cls.texto}`}>
                          <Icone aria-hidden="true" size={22} />
                          {titulo}
                        </h3>
                        <p className="mb-3 text-sm text-muted">{explicacao}</p>
                        <ul className="flex flex-col gap-2">
                          {unidades.map((u) => {
                            const t = textoMovimento(u)
                            return (
                              <li
                                key={u.unidade_id}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-[var(--surface)] px-4 py-3 border border-[var(--border)]"
                              >
                                <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${cls.fundo} ${cls.texto}`} aria-hidden="true">
                                  <Icone size={18} />
                                </span>
                                <div className="min-w-0 flex-1 basis-40">
                                  <p className="font-bold leading-tight">{u.nome}</p>
                                  <p className="text-sm text-muted">{u.bairro}</p>
                                </div>
                                <div className="text-start sm:text-end">
                                  <p aria-label={t.falado} className="font-semibold leading-tight">
                                    {t.principal}
                                  </p>
                                  {t.extra && <p className="text-sm text-muted">{t.extra}</p>}
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </section>

          {/* ---------- Direitos mais procurados ---------- */}
          {dados && (
            <section id="direitos" aria-labelledby="titulo-direitos" className="px-5 pb-14 sm:px-8">
              <div className="mx-auto max-w-5xl">
                <h2 id="titulo-direitos" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Direitos mais procurados
                </h2>
                <p className="mb-6 mt-2 text-muted">Quantas pessoas estão buscando cada direito pelo Meu Direito.</p>
                <div className="cartao-fofo p-7">
                  <BarrasHorizontais itens={dados.direitos.map((d) => ({ rotulo: d.nome, valor: d.total, texto: `${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}` }))} />
                </div>
              </div>
            </section>
          )}
        </main>

        <footer className="px-5 py-8 text-center text-sm text-muted">
          <Logo comLema tamanho={40} className="mx-auto" />
          <p className="mt-3">Esta página mostra apenas números gerais. Nenhum dado pessoal é exibido.</p>
          <p>Projeto acadêmico – Global Solution FIAP (CitizenTech).</p>
        </footer>
      </div>
    </MotionConfig>
  )
}
