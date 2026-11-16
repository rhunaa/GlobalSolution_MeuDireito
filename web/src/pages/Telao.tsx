import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Maximize, Megaphone, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { IndicadorConexao } from '../components/IndicadorConexao'
import { useFalaTelao, textoDaChamada } from '../hooks/useFalaTelao'
import { useRealtimeFila } from '../hooks/useRealtimeFila'
import { useUnidades } from '../hooks/useUnidades'

const SEGUNDOS_DESTAQUE = 8

/**
 * Telão da sala de espera: sem menus, alto contraste (preto, branco e
 * amarelo – não muda com o tema), senha chamada em tamanho enorme e as
 * últimas 4 chamadas. Anuncia por voz cada nova chamada.
 */
export default function Telao() {
  const { unidadeId } = useParams()
  const { unidades } = useUnidades()
  const unidade = unidades.find((u) => u.id === unidadeId)
  const { carregando, chamadas } = useRealtimeFila(unidadeId)
  const { suportado, somAtivo, alternarSom, falar } = useFalaTelao()

  const atual = chamadas[0]
  const anteriores = chamadas.slice(1, 5)

  // Detecta nova chamada: mudou a senha mais recente OU a mesma foi chamada de novo
  const ultimaVista = useRef<string | null>(null)
  const [destaque, setDestaque] = useState(false)
  useEffect(() => {
    if (carregando) return
    const marca = atual ? `${atual.id}|${atual.chamada_em}|${atual.guiche}` : null
    if (ultimaVista.current === null) {
      ultimaVista.current = marca ?? ''
      return
    }
    if (marca && marca !== ultimaVista.current) {
      ultimaVista.current = marca
      falar(textoDaChamada(atual!.codigo, atual!.guiche))
      setDestaque(true)
      const t = window.setTimeout(() => setDestaque(false), SEGUNDOS_DESTAQUE * 1000)
      return () => window.clearTimeout(t)
    }
  }, [atual, carregando, falar])

  useEffect(() => {
    const prev = document.title
    document.title = `Telão – ${unidade?.nome ?? 'Meu Direito'}`
    return () => {
      document.title = prev
    }
  }, [unidade?.nome])

  const tamanhoBotao = 'inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-telao-texto px-4 py-2 text-lg font-bold text-telao-texto hover:bg-telao-texto hover:text-telao-fundo'

  return (
    <MotionConfig reducedMotion="user">
      <main
        id="conteudo"
        className="flex min-h-dvh flex-col gap-6 bg-telao-fundo p-6 text-telao-texto sm:p-10"
        style={{ colorScheme: 'dark' }}
      >
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold sm:text-4xl">{unidade?.nome ?? 'Sala de espera'}</h1>
          <div className="flex flex-wrap items-center gap-3 [&_*]:!text-telao-texto">
            <IndicadorConexao />
            {suportado && (
              <button type="button" onClick={alternarSom} aria-pressed={somAtivo} className={tamanhoBotao}>
                {somAtivo ? <Volume2 aria-hidden="true" size={24} /> : <VolumeX aria-hidden="true" size={24} />}
                {somAtivo ? 'Som ativado' : 'Ativar som'}
              </button>
            )}
            <button
              type="button"
              className={tamanhoBotao}
              onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}
            >
              <Maximize aria-hidden="true" size={24} />
              Tela cheia
            </button>
          </div>
        </header>

        {!somAtivo && suportado && (
          <p className="rounded-lg border-2 border-telao-destaque px-4 py-2 text-lg font-semibold text-telao-destaque">
            O som está desligado. Clique em “Ativar som” para ouvir as chamadas em voz alta.
          </p>
        )}

        <section aria-labelledby="titulo-agora" className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <h2 id="titulo-agora" className="text-2xl font-semibold sm:text-4xl">
            Senha chamada agora
          </h2>

          {/* Alterações aqui são anunciadas na hora (assertive) */}
          <div role="alert" aria-live="assertive" aria-atomic="true" className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {atual ? (
                <motion.div
                  key={`${atual.id}-${atual.chamada_em}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`flex flex-col items-center rounded-lg border-8 px-[4vw] py-4 transition-colors duration-500 ${
                    destaque ? 'border-telao-destaque bg-telao-destaque/15' : 'border-transparent'
                  }`}
                >
                  <p className="text-[clamp(4rem,26vw,26rem)] font-semibold leading-none tracking-tight tabular-nums text-telao-destaque">
                    {atual.codigo}
                  </p>
                  <p className="text-[clamp(2rem,9vw,9rem)] font-bold leading-tight">
                    Guichê {atual.guiche ?? '—'}
                  </p>
                  {destaque && (
                    <p className="mt-2 inline-flex items-center gap-3 text-[clamp(1.5rem,3vw,3rem)] font-bold text-telao-destaque">
                      <Megaphone aria-hidden="true" size={36} />
                      Chamando agora
                    </p>
                  )}
                </motion.div>
              ) : (
                <p key="vazio" className="text-[clamp(2rem,5vw,5rem)] font-bold">
                  {carregando ? 'Carregando…' : 'Aguarde. Ninguém foi chamado ainda.'}
                </p>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section aria-labelledby="titulo-ultimas">
          <h2 id="titulo-ultimas" className="mb-3 text-xl font-semibold sm:text-3xl">
            Últimas chamadas
          </h2>
          {anteriores.length === 0 ? (
            <p className="text-xl">Ainda não há chamadas anteriores.</p>
          ) : (
            <ol className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {anteriores.map((s) => (
                <li key={s.id} className="rounded-lg border-4 border-telao-texto px-4 py-3 text-center">
                  <p className="text-[clamp(2.5rem,6vw,6rem)] font-semibold leading-none tabular-nums">{s.codigo}</p>
                  <p className="mt-1 text-[clamp(1.25rem,2.5vw,2.5rem)] font-semibold">Guichê {s.guiche ?? '—'}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </MotionConfig>
  )
}
