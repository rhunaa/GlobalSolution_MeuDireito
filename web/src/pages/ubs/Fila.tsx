import { Button, Radio } from 'antd'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCheck, Clock3, Megaphone, PlayCircle, Sparkles, UserX, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CabecalhoPagina } from '../../components/CabecalhoPagina'
import { Cartao } from '../../components/Cartao'
import { CartaoSenha } from '../../components/CartaoSenha'
import { Grupo } from '../../components/Grupo'
import { Kbd } from '../../components/Kbd'
import { RegiaoRolavel } from '../../components/RegiaoRolavel'
import { ResumoNumeros } from '../../components/ResumoNumeros'
import { SeloStatus } from '../../components/SeloStatus'
import { useAgora } from '../../hooks/useAgora'
import { useAtalhoTeclado } from '../../hooks/useAtalhoTeclado'
import { useRealtimeFila } from '../../hooks/useRealtimeFila'
import { useSessao } from '../../hooks/useSessao'
import { senhasService } from '../../services/senhasService'
import { ICONE_ATENDIDOS, ICONE_PRIORIDADE, MOTIVOS, ORIGENS } from '../../theme/rotulos'
import { STATUS_SENHA } from '../../theme/status'
import type { Senha, StatusSenha } from '../../types'
import { duracaoPorExtenso, formatarDuracao, minutosEntre } from '../../utils/datas'

const GUICHES = [1, 2, 3, 4]
const CHAVE_GUICHE = 'meu-direito:guiche'

function lerGuiche(): string {
  try {
    const v = localStorage.getItem(CHAVE_GUICHE)
    return v && GUICHES.includes(Number(v)) ? v : '1'
  } catch {
    return '1'
  }
}

/** Painel da recepcionista da UBS: fila em tempo real e chamada de senhas. */
export default function Fila() {
  const { sessao } = useSessao()
  const unidadeId = sessao?.unidadeId
  const { carregando, erro, novos, aguardando, emCurso, encerradas, atendidos, tempoMedioMin } = useRealtimeFila(unidadeId)
  const agora = useAgora(30_000)

  const [guiche, setGuiche] = useState(lerGuiche)
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')
  const [falha, setFalha] = useState<string | null>(null)

  const escolherGuiche = (v: string) => {
    setGuiche(v)
    try {
      localStorage.setItem(CHAVE_GUICHE, v)
    } catch {
      /* ignora */
    }
  }

  const chamarProxima = useCallback(async () => {
    if (!unidadeId || ocupado) return
    setOcupado(true)
    setFalha(null)
    try {
      const senha = await senhasService.chamarProxima(unidadeId, Number(guiche))
      setAviso(senha ? `Senha ${senha.codigo} chamada no guichê ${guiche}.` : 'Não há ninguém aguardando.')
    } catch (e) {
      setFalha((e as Error).message)
    } finally {
      setOcupado(false)
    }
  }, [unidadeId, guiche, ocupado])

  useAtalhoTeclado('n', chamarProxima, !carregando)

  async function mudarStatus(senha: Senha, status: StatusSenha, mensagem: string) {
    setFalha(null)
    try {
      await senhasService.atualizarStatus(senha.id, status)
      setAviso(`Senha ${senha.codigo}: ${mensagem}`)
    } catch (e) {
      setFalha((e as Error).message)
    }
  }

  // Avisa leitores de tela quando chega senha nova na fila (sem interromper a leitura atual)
  const [anunciada, setAnunciada] = useState<Set<string> | null>(null)
  useEffect(() => {
    if (carregando) return
    if (anunciada === null) {
      setAnunciada(new Set(aguardando.map((s) => s.id)))
      return
    }
    const nova = aguardando.find((s) => !anunciada.has(s.id))
    if (nova) {
      setAviso(`Nova senha na fila: ${nova.codigo}, ${MOTIVOS[nova.motivo].rotulo}, ${ORIGENS[nova.origem].rotulo}.`)
      setAnunciada(new Set([...anunciada, nova.id]))
    }
  }, [aguardando, carregando, anunciada])

  return (
    <>
      <CabecalhoPagina
        aoVivo
        titulo="Fila de atendimento"
        descricao="Senhas do dia. Quando alguém pega senha no app ou no balcão, ela aparece aqui sozinha."
      />

      <ResumoNumeros
        titulo="Resumo da fila"
        itens={[
          { rotulo: 'Aguardando', valor: String(aguardando.length), Icone: Users },
          {
            rotulo: 'Tempo médio de espera',
            valor: tempoMedioMin === null ? '—' : formatarDuracao(tempoMedioMin),
            Icone: Clock3,
            detalhe: tempoMedioMin === null ? 'Ninguém foi chamado ainda' : 'Entre pegar a senha e ser chamado',
          },
          { rotulo: 'Atendidos hoje', valor: String(atendidos), Icone: ICONE_ATENDIDOS },
        ]}
      />

      {/* Região de avisos: leitores de tela anunciam sem interromper (polite) */}
      <p role="status" aria-live="polite" aria-atomic="true" className={aviso ? 'mb-4 rounded-lg bg-[var(--status-concluida-suave)] px-4 py-2 font-semibold text-[var(--status-concluida)]' : 'so-leitor'}>
        {aviso}
      </p>
      {falha && (
        <p role="alert" className="mb-4 rounded-lg bg-[var(--status-nao-compareceu-suave)] px-4 py-2 font-semibold text-[var(--status-nao-compareceu)]">
          {falha}
        </p>
      )}
      {erro && !falha && (
        <p role="alert" className="mb-4 font-semibold text-danger">
          {erro}
        </p>
      )}

      <section aria-labelledby="titulo-chamar" className="mb-8">
        <Cartao>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3">
              <h2 id="titulo-chamar" className="text-xl font-semibold">
                Chamar a próxima pessoa
              </h2>
              <Grupo legenda="Você está no guichê">
                <Radio.Group value={guiche} onChange={(e) => escolherGuiche(e.target.value)} className="flex flex-wrap gap-x-5 gap-y-2">
                  {GUICHES.map((g) => (
                    <Radio key={g} value={String(g)}>
                      {g}
                    </Radio>
                  ))}
                </Radio.Group>
              </Grupo>
              <p className="text-sm text-muted">
                Atalho no teclado: tecle <Kbd>N</Kbd> para chamar a próxima. Quem tem prioridade é chamado primeiro.
              </p>
            </div>

            <Button
              type="primary"
              size="large"
              className="h-16 w-full px-6 text-lg font-bold sm:text-xl lg:w-auto lg:px-10"
              loading={ocupado}
              disabled={carregando || aguardando.length === 0}
              onClick={chamarProxima}
              icon={<Megaphone aria-hidden="true" size={24} />}
            >
              Chamar próximo
              <Kbd className="ms-1 hidden sm:inline-flex">N</Kbd>
            </Button>
          </div>
        </Cartao>
      </section>

      <section aria-labelledby="titulo-curso" className="mb-8">
        <h2 id="titulo-curso" className="mb-3 text-xl font-semibold">
          Chamadas e atendimentos em andamento
        </h2>
        {emCurso.length === 0 ? (
          <p className="text-muted">Ninguém foi chamado no momento.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {emCurso.map((s) => (
                <motion.li
                  key={s.id}
                  layout="position"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <CartaoSenha
                    senha={s}
                    destaque={novos.has(s.id)}
                    acoes={
                      s.status === 'chamada' ? (
                        <>
                          <Button type="primary" icon={<PlayCircle aria-hidden="true" size={18} />} onClick={() => mudarStatus(s, 'em_atendimento', 'atendimento iniciado.')}>
                            Iniciar atendimento
                          </Button>
                          <Button icon={<UserX aria-hidden="true" size={18} />} onClick={() => mudarStatus(s, 'nao_compareceu', 'marcada como não compareceu.')}>
                            Não compareceu
                          </Button>
                        </>
                      ) : (
                        <Button type="primary" icon={<CheckCheck aria-hidden="true" size={18} />} onClick={() => mudarStatus(s, 'concluida', 'atendimento concluído.')}>
                          Concluir
                        </Button>
                      )
                    }
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-fila" className="mb-8">
        <h2 id="titulo-fila" className="mb-3 text-xl font-semibold">
          Aguardando ({aguardando.length})
        </h2>
        {carregando ? (
          <p className="text-muted">Carregando a fila…</p>
        ) : aguardando.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-muted">
            Fila vazia. Quando alguém pegar senha, ela aparece aqui.
          </p>
        ) : (
          <RegiaoRolavel rotulo="Tabela de pessoas aguardando">
            <table className="lista-fofa w-full min-w-[40rem] text-left">
              <caption className="so-leitor">
                Pessoas aguardando, na ordem de chamada. Prioridades primeiro.
              </caption>
              <thead>
                <tr className="text-sm text-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">Ordem</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Senha</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Motivo</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Origem</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Prioridade</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Espera</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {aguardando.map((s, i) => {
                    const espera = minutosEntre(s.created_at, agora)
                    const motivo = MOTIVOS[s.motivo]
                    const origem = ORIGENS[s.origem]
                    const novo = novos.has(s.id)
                    return (
                      <motion.tr
                        key={s.id}
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={novo ? 'bg-destaque-novo' : ''}
                      >
                        <td className="px-4 py-3 tabular-nums text-muted">{i + 1}º</td>
                        <th scope="row" className="px-4 py-3 text-xl font-semibold tabular-nums">
                          {s.codigo}
                          {novo && (
                            <span className="ms-2 inline-flex items-center gap-1 rounded-md border border-accent px-2 py-0.5 align-middle text-xs font-bold text-accent">
                              <Sparkles aria-hidden="true" size={12} />
                              Nova
                            </span>
                          )}
                        </th>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            <motivo.Icone aria-hidden="true" size={16} />
                            {motivo.rotulo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            <origem.Icone aria-hidden="true" size={16} />
                            {origem.rotulo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.prioridade ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--status-chamada)]">
                              <ICONE_PRIORIDADE aria-hidden="true" size={16} />
                              Sim
                            </span>
                          ) : (
                            <span className="text-muted">Não</span>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          <span aria-hidden="true">{formatarDuracao(espera)}</span>
                          <span className="so-leitor">{duracaoPorExtenso(espera)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <SeloStatus status={STATUS_SENHA[s.status]} tamanho="sm" />
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </RegiaoRolavel>
        )}
      </section>

      {encerradas.length > 0 && (
        <section aria-labelledby="titulo-encerradas">
          <h2 id="titulo-encerradas" className="mb-3 text-xl font-semibold">
            Encerradas hoje ({encerradas.length})
          </h2>
          <ul className="flex flex-wrap gap-2">
            {encerradas.slice(0, 12).map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-md bg-[var(--surface)] py-1.5 pe-2 ps-4 border border-[var(--border)]">
                <span className="font-bold tabular-nums">{s.codigo}</span>
                <SeloStatus status={STATUS_SENHA[s.status]} tamanho="sm" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
