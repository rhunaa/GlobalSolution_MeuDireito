import { Baby, BellRing, Building2, CalendarCheck, ChartNoAxesColumn, Check, ClipboardList, FileCheck2, Globe, Search, Smartphone, Ticket, Tv } from 'lucide-react'
import { MotionConfig, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { BotaoBaixarSite } from '../components/BotaoBaixarSite'
import { Logo } from '../components/Logo'
import { AtendenteNoBalcao, CidadaComCelular, MaeComCrianca, PessoaComMapa, TrilhaPontilhada } from './capa/Desenhos'
import { ELENCO, Personagem } from './capa/Personagens'

const botaoPrincipal =
  'inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-5 py-1.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90'

// ---------- Animações da abertura (cada uma termina em poucos segundos; nada fica se mexendo) ----------
const MOLA = { type: 'spring' as const, stiffness: 240, damping: 16 }
const SEQUENCIA = { hidden: {}, mostrar: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }
const PALAVRA = { hidden: { opacity: 0, y: 28 }, mostrar: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } }
const CAIXA = {
  hidden: { opacity: 0, scale: 0.5, rotate: -10 },
  mostrar: { opacity: 1, scale: 1, rotate: -1, transition: { type: 'spring' as const, stiffness: 300, damping: 14 } },
}
const INICIO = ['O', 'direito', 'já', 'existe.', 'O', 'que', 'falta', 'é']
const FIM = ['até', 'ele.']

/** Posição de cada personagem no painel (telas grandes). */
const POSICOES: { indice: number; classe: string; so?: 'xl' }[] = [
  { indice: 0, classe: 'left-[4%] top-[9%] w-36 xl:w-44' },
  { indice: 1, classe: 'right-[5%] top-[7%] w-36 xl:w-44' },
  { indice: 2, classe: 'left-[3%] bottom-[7%] w-32 xl:w-40' },
  { indice: 3, classe: 'right-[3%] bottom-[7%] w-32 xl:w-40' },
  { indice: 4, classe: 'left-[21%] bottom-[3%] w-24', so: 'xl' },
  { indice: 5, classe: 'right-[21%] bottom-[3%] w-24', so: 'xl' },
  { indice: 6, classe: 'left-[1.5%] top-[43%] w-[5.5rem]', so: 'xl' },
  { indice: 7, classe: 'right-[1.5%] top-[43%] w-[5.5rem]', so: 'xl' },
]

function Selo({ cor, fundo, children }: { cor: string; fundo: string; children: ReactNode }) {
  return (
    <span className="flex size-20 items-center justify-center rounded-md sm:size-24" style={{ background: fundo, color: cor }} aria-hidden="true">
      {children}
    </span>
  )
}

/** Capa do site. */
export default function Capa() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[var(--capa-fundo)] text-foreground">
        <a href="#conteudo" className="pular-conteudo">
          Pular para o conteúdo
        </a>

        {/* ---------- Cabeçalho ---------- */}
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="sticky top-0 z-20 bg-[var(--capa-fundo)]"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 py-3 sm:px-8">
            <Link to="/">
              <Logo />
            </Link>
            <nav aria-label="Seções da página" className="order-3 flex w-full flex-wrap gap-x-6 gap-y-1 text-sm font-semibold md:order-none md:w-auto">
              {[
                ['#como-funciona', 'Como funciona'],
                ['#servicos', 'Serviços'],
              ].map(([href, rotulo]) => (
                <a key={href} href={href} className="py-1 text-foreground/80 underline-offset-8 hover:text-foreground hover:underline">
                  {rotulo}
                </a>
              ))}
              <Link to="/publico" className="py-1 text-foreground/80 underline-offset-8 hover:text-foreground hover:underline">
                Página pública
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <BotaoBaixarSite />
              <Link to="/entrar" className={botaoPrincipal}>
                Entrar
              </Link>
            </div>
          </div>
        </motion.header>

        <main id="conteudo" tabIndex={-1}>
          {/* ---------- Primeira tela: frase de impacto e personagens ---------- */}
          <div>
            <section
              aria-labelledby="titulo-capa"
              className="relative flex min-h-[28rem] flex-col items-center justify-center overflow-hidden px-5 py-16 lg:min-h-[calc(100dvh-4.5rem)]"
            >
              {/* manchas de cor suaves ao fundo */}
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="pointer-events-none absolute -left-24 top-10 size-80 rounded-full bg-[#7aa2f0]/20 blur-3xl"
              />
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-[#f5a54a]/15 blur-3xl"
              />

              {/* bolinhas decorativas */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
                {[
                  ['left-[16%] top-[8%]', '#7aa2f0', 'size-3'],
                  ['left-[30%] bottom-[14%]', '#b25be0', 'size-4'],
                  ['right-[28%] top-[16%]', '#d9455c', 'size-3'],
                  ['right-[12%] top-[46%]', '#f5a54a', 'size-4'],
                  ['right-[40%] bottom-[8%]', '#f5a54a', 'size-3'],
                ].map(([pos, cor, tam], i) => (
                  <motion.span
                    key={pos}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...MOLA, delay: 0.9 + i * 0.1 }}
                    className={`absolute rounded-full ${pos} ${tam}`}
                    style={{ background: cor }}
                  />
                ))}
              </div>

              {/* personagens (telas grandes): entram com mola e reagem ao passar o mouse */}
              {POSICOES.map(({ indice, classe, so }, k) => (
                <motion.div
                  key={indice}
                  aria-hidden="true"
                  initial={{ opacity: 0, scale: 0.3, y: 40, rotate: k % 2 ? 12 : -12 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                  transition={{ ...MOLA, delay: 0.55 + 0.1 * k }}
                  whileHover={{ scale: 1.08, rotate: k % 2 ? -4 : 4 }}
                  className={`absolute ${so === 'xl' ? 'hidden xl:block' : 'hidden lg:block'} ${classe}`}
                >
                  <Personagem {...ELENCO[indice]} className="h-auto w-full drop-shadow-sm" />
                </motion.div>
              ))}

              {/* frase */}
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <div className="relative inline-block">
                  {/* cruz: gira ao entrar */}
                  <motion.svg
                    aria-hidden="true"
                    viewBox="0 0 48 48"
                    initial={{ scale: 0, rotate: -120, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ ...MOLA, delay: 1.2 }}
                    className="absolute -left-10 -top-8 hidden size-11 lg:block"
                    focusable="false"
                  >
                    <path d="M24 6v36M6 24h36" stroke="#f5a54a" strokeWidth="9" strokeLinecap="round" />
                  </motion.svg>
                  {/* avião de papel: chega voando, com a trilha pontilhada */}
                  <motion.svg
                    aria-hidden="true"
                    viewBox="0 0 120 90"
                    initial={{ opacity: 0, x: -90, y: 60 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 1.3 }}
                    className="absolute -right-28 top-1/3 hidden h-20 w-28 lg:block"
                    focusable="false"
                  >
                    <path d="M8 8 62 30 8 52 22 30Z" fill="var(--capa-fundo)" strokeWidth="2.5" strokeLinejoin="round" className="[stroke:var(--logo-texto)]" />
                    <path d="M22 30 62 30" stroke="var(--logo-texto)" strokeWidth="2.5" />
                    <path d="M70 50c24 4 40 20 34 38" fill="none" stroke="var(--logo-texto)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 7" />
                  </motion.svg>
                  {/* aro */}
                  <motion.span
                    aria-hidden="true"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...MOLA, delay: 1.45 }}
                    className="absolute -bottom-4 -right-4 hidden size-12 rounded-full border-[3px] border-[#f5a54a] lg:block"
                  />

                  <motion.h1
                    id="titulo-capa"
                    variants={SEQUENCIA}
                    initial="hidden"
                    animate="mostrar"
                    className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.12] tracking-tight"
                  >
                    {INICIO.map((w, i) => (
                      <span key={`${w}-${i}`}>
                        <motion.span variants={PALAVRA} className="inline-block">
                          {w}
                        </motion.span>{' '}
                      </span>
                    ))}
                    <motion.span variants={CAIXA} className="inline-block rounded-lg bg-accent px-3 py-0.5 text-accent-foreground sm:px-4">
                      o caminho
                    </motion.span>{' '}
                    {FIM.map((w, i) => (
                      <span key={`${w}-${i}`}>
                        <motion.span variants={PALAVRA} className="inline-block">
                          {w}
                        </motion.span>
                        {i < FIM.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </motion.h1>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 1.25 }}
                  className="mx-auto mt-6 max-w-md text-base text-muted sm:text-lg"
                >
                  No app, você descobre quais direitos tem. No site, UBS, CRAS e creches atendem você.
                </motion.p>
              </div>

              {/* personagens (celular e tablet) */}
              <div aria-hidden="true" className="relative z-10 mt-10 flex flex-wrap justify-center gap-3 lg:hidden">
                {[0, 3, 4, 5, 6, 7].map((i, k) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.3, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ ...MOLA, delay: 0.9 + 0.09 * k }}
                    whileTap={{ scale: 1.1, rotate: k % 2 ? -5 : 5 }}
                    className="w-[4.75rem] sm:w-28"
                  >
                    <Personagem {...ELENCO[i]} className="h-auto w-full" />
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* ---------- Desenhos: quem faz o quê ---------- */}
          <section id="quem-atende" aria-labelledby="titulo-quem" className="relative scroll-mt-24 overflow-hidden px-5 pb-28 pt-24 sm:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-20 text-center">
                <h2 id="titulo-quem" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Cada pessoa no seu lugar, tudo conectado
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted">O que muda de um lado aparece do outro na hora.</p>
              </div>

              <TrilhaPontilhada className="pointer-events-none absolute inset-x-0 top-[30%] hidden h-48 w-full lg:block" d="M-20 120 C 180 20, 330 40, 500 110 S 820 190, 1020 90" />

              <div className="relative flex flex-col gap-20 sm:gap-28">
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <CidadaComCelular className="mx-auto w-full max-w-[17rem]" />
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                      <Smartphone aria-hidden="true" size={24} className="text-accent" />
                      No app, a pessoa descobre seus direitos
                    </h3>
                    <p className="mt-2 text-muted">Ela responde a perguntas simples e vê quais direitos pode ter e quais documentos levar.</p>
                  </div>
                </div>

                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div className="md:order-1">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                      <ClipboardList aria-hidden="true" size={24} className="text-servico-ubs" />
                      No site, a UBS organiza a fila
                    </h3>
                    <p className="mt-2 text-muted">A recepcionista chama a próxima senha e o telão da sala de espera anuncia em voz alta.</p>
                  </div>
                  <AtendenteNoBalcao className="mx-auto w-full max-w-[22rem] md:order-2" />
                </div>

                <div className="grid items-center gap-8 md:grid-cols-2">
                  <MaeComCrianca className="mx-auto w-full max-w-[19rem]" />
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                      <Baby aria-hidden="true" size={24} className="text-servico-creche" />
                      No site, o CRAS e a creche atendem
                    </h3>
                    <p className="mt-2 text-muted">Veja a agenda e os documentos de cada pessoa. A creche abre a vaga e a família responde pelo app.</p>
                  </div>
                </div>

                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div className="md:order-1">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                      <Search aria-hidden="true" size={24} className="text-accent" />
                      O resultado
                    </h3>
                    <p className="mt-2 text-muted">A pessoa sabe aonde ir. O lugar sabe quem vem e o que falta.</p>
                  </div>
                  <PessoaComMapa className="mx-auto w-full max-w-[20rem] md:order-2" />
                </div>
              </div>
            </div>
          </section>

          {/* ---------- Como funciona ---------- */}
          <section id="como-funciona" aria-labelledby="titulo-como" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-5xl text-center">
              <h2 id="titulo-como" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Do direito ao atendimento em 3 passos
              </h2>
              <ol className="mt-12 grid gap-12 sm:mt-16 sm:grid-cols-3 sm:gap-14">
                {[
                  { fundo: '#f9e3ec', cor: '#a3305f', Icone: Search, t: 'Descubra', d: 'Veja quais direitos você pode ter e quais documentos levar.' },
                  { fundo: '#e1f1e7', cor: '#1c7445', Icone: Ticket, t: 'Peça', d: 'Pegue senha, agende ou entre na lista da creche.' },
                  { fundo: '#fcefd6', cor: '#7a4a00', Icone: BellRing, t: 'Acompanhe', d: 'Veja a fila andar e receba o aviso na hora.' },
                ].map(({ fundo, cor, Icone, t, d }) => (
                  <li key={t} className="flex flex-col items-center">
                    <Selo cor={cor} fundo={fundo}>
                      <Icone size={38} strokeWidth={1.75} />
                    </Selo>
                    <h3 className="mt-6 text-lg font-semibold">{t}</h3>
                    <p className="mt-3 max-w-[16rem] leading-relaxed text-muted">{d}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-20 sm:mt-32">
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">O app é para as pessoas. O site é para os lugares.</h3>
                <div className="mt-14 grid gap-8 text-left md:grid-cols-2">
                {[
                  {
                    Icone: Smartphone,
                    etiqueta: 'No app',
                    titulo: 'Para as pessoas',
                    cor: '#1b2a4a',
                    itens: [
                      'Descubra quais direitos você tem',
                      'Veja os documentos e aonde ir',
                      'Pegue senha, agende ou entre na lista da creche',
                      'Acompanhe tudo pelo celular',
                    ],
                  },
                  {
                    Icone: Building2,
                    etiqueta: 'No site',
                    titulo: 'Para os lugares: UBS, CRAS e creches',
                    cor: '#a1431a',
                    itens: [
                      'Organize a fila e chame as senhas',
                      'Veja a agenda e os documentos de cada pessoa',
                      'Abra vagas de creche e convoque as famílias',
                      'Acompanhe os números do atendimento',
                    ],
                  },
                ].map(({ Icone, etiqueta, titulo, cor, itens }) => (
                  <div key={etiqueta} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-9">
                    <div className="flex items-center gap-4">
                      <span className="flex size-14 items-center justify-center rounded-lg text-white" style={{ background: cor }} aria-hidden="true">
                        <Icone size={24} />
                      </span>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-muted">{etiqueta}</p>
                        <h4 className="text-lg font-bold leading-tight">{titulo}</h4>
                      </div>
                    </div>
                    <ul className="mt-8 flex flex-col gap-5">
                      {itens.map((t) => (
                        <li key={t} className="flex items-start gap-3">
                          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--status-concluida-suave)] text-[var(--status-concluida)]" aria-hidden="true">
                            <Check size={14} strokeWidth={3} />
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
</div>

            </div>
          </section>

          {/* ---------- Serviços ---------- */}
          <section id="servicos" aria-labelledby="titulo-servicos" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-4xl text-center">
              <h2 id="titulo-servicos" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                O que o site entrega para os lugares
              </h2>
              <ul className="mx-auto mt-14 grid grid-cols-2 gap-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:grid-cols-4 sm:p-14">
                {[
                  { Icone: Ticket, t: 'Senha digital', c: '#1c7445', f: '#e1f1e7' },
                  { Icone: ClipboardList, t: 'Fila em tempo real', c: '#1e4fbf', f: '#e3eafb' },
                  { Icone: Tv, t: 'Telão com voz', c: '#7a4a00', f: '#fcefd6' },
                  { Icone: CalendarCheck, t: 'Agenda do CRAS', c: '#a1431a', f: '#fbe8dd' },
                  { Icone: FileCheck2, t: 'Documentos confirmados', c: '#5b3fa0', f: '#eee8f8' },
                  { Icone: Baby, t: 'Lista da creche', c: '#a3305f', f: '#f9e3ec' },
                  { Icone: ChartNoAxesColumn, t: 'Indicadores', c: '#1d5fa8', f: '#e3eafb' },
                  { Icone: Globe, t: 'Página pública', c: '#1b2a4a', f: '#e6ebf5' },
                ].map(({ Icone, t, c, f }) => (
                  <li key={t} className="flex flex-col items-center gap-3">
                    <span className="flex size-14 items-center justify-center rounded-md" style={{ background: f, color: c }} aria-hidden="true">
                      <Icone size={26} />
                    </span>
                    <span className="text-sm font-semibold sm:text-base">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        <footer className="px-5 py-8 text-center text-sm text-muted">
          <Logo comLema tamanho={40} className="mx-auto" />
          <p className="mt-3">Projeto acadêmico – Global Solution FIAP (CitizenTech). Dados de exemplo.</p>
        </footer>
      </div>
    </MotionConfig>
  )
}
