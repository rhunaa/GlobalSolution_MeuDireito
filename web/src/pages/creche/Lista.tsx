import { Button } from 'antd'
import { AnimatePresence, motion } from 'motion/react'
import { Baby, DoorOpen, FileWarning, Hourglass, MessageCircleReply, Sparkles, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CabecalhoPagina } from '../../components/CabecalhoPagina'
import { CampoSelecao } from '../../components/CampoSelecao'
import { RegiaoRolavel } from '../../components/RegiaoRolavel'
import { ResumoNumeros } from '../../components/ResumoNumeros'
import { SeloStatus } from '../../components/SeloStatus'
import { useAgora } from '../../hooks/useAgora'
import { useRealtimeCreche } from '../../hooks/useRealtimeCreche'
import { useSessao } from '../../hooks/useSessao'
import { useUnidades } from '../../hooks/useUnidades'
import { crecheService } from '../../services/crecheService'
import { STATUS_CRECHE } from '../../theme/status'
import { duracaoPorExtenso, formatarDataHora, formatarDuracao, idadeDescrita } from '../../utils/datas'

/** Lista de espera da creche: convocar famílias e acompanhar respostas vindas do app. */
export default function Lista() {
  const { sessao } = useSessao()
  const { unidades } = useUnidades()
  const creches = useMemo(() => unidades.filter((u) => u.tipo === 'creche'), [unidades])
  const [escolhida, setEscolhida] = useState<string | null>(null)
  const unidadeId = escolhida ?? sessao?.unidadeId
  const unidade = unidades.find((u) => u.id === unidadeId)

  const { itens, carregando, erro, novos, resumo, respondidas, ultimaResposta } = useRealtimeCreche(unidadeId)
  const agora = useAgora(60_000)

  const [abrindo, setAbrindo] = useState(false)
  const [falha, setFalha] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')

  async function abrirVaga() {
    if (!unidadeId) return
    setAbrindo(true)
    setFalha(null)
    try {
      const item = await crecheService.abrirVaga(unidadeId)
      setAviso(
        item
          ? `Vaga aberta: a família de ${item.nome_crianca} foi convocada e já vê o aviso no app.`
          : 'Não há famílias aguardando nesta creche.',
      )
    } catch (e) {
      setFalha((e as Error).message)
    } finally {
      setAbrindo(false)
    }
  }

  const proxima = resumo.proxima

  return (
    <>
      <CabecalhoPagina
        aoVivo
        titulo="Lista de espera da creche"
        descricao={`${unidade?.nome ?? 'Carregando…'}. Quando você abre uma vaga, a próxima família recebe a convocação no app e a resposta aparece aqui.`}
      />

      {creches.length > 1 && (
        <div className="mb-6 max-w-md">
          <CampoSelecao
            rotulo="Creche"
            opcoes={creches.map((c) => ({ id: c.id, texto: c.nome }))}
            valor={unidadeId ?? null}
            aoMudar={setEscolhida}
          />
        </div>
      )}

      <ResumoNumeros
        titulo="Resumo da lista"
        itens={[
          { rotulo: 'Famílias aguardando', valor: String(resumo.aguardando), Icone: Users },
          { rotulo: 'Convocadas, sem resposta', valor: String(resumo.convocadas), Icone: Hourglass },
          { rotulo: 'Vagas aceitas', valor: String(resumo.aceitaram), Icone: Baby },
        ]}
      />

      <section aria-labelledby="titulo-vaga" className="mb-6 flex flex-col gap-4 cartao-fofo p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="titulo-vaga" className="text-xl font-semibold">
            Abrir uma vaga
          </h2>
          {proxima ? (
            <p className="mt-1 max-w-prose">
              Próxima da lista: <strong>{proxima.nome_crianca}</strong> (posição {proxima.posicao}), responsável{' '}
              {proxima.cidadao?.nome}. A família terá 48 horas para responder.
              {proxima.documentos_pendentes.length > 0 && (
                <span className="mt-1 flex items-center gap-1.5 font-semibold text-[var(--status-falta-documento)]">
                  <FileWarning aria-hidden="true" size={16} />
                  Esta família ainda tem documento pendente.
                </span>
              )}
            </p>
          ) : (
            <p className="mt-1 text-muted">Não há famílias aguardando nesta creche.</p>
          )}
        </div>
        <Button
          type="primary"
          size="large"
          className="h-14 px-8 text-lg font-bold"
          loading={abrindo}
          disabled={!proxima || carregando}
          onClick={abrirVaga}
          icon={<DoorOpen aria-hidden="true" size={22} />}
        >
          Abrir vaga
        </Button>
      </section>

      <p
        role="status"
        aria-live="polite"
        className={aviso ? 'mb-4 rounded-lg bg-[var(--status-concluida-suave)] px-4 py-2 font-semibold text-[var(--status-concluida)]' : 'so-leitor'}
      >
        {aviso}
      </p>
      {/* Resposta chegando do app: destaque visível + anúncio para leitor de tela */}
      <p
        role="status"
        aria-live="polite"
        className={ultimaResposta ? 'mb-4 flex items-center gap-2 rounded-lg bg-[var(--status-chamada-suave)] px-4 py-2 font-semibold text-[var(--status-chamada)]' : 'so-leitor'}
      >
        {ultimaResposta && <MessageCircleReply aria-hidden="true" size={18} />}
        {ultimaResposta?.texto}
      </p>
      {(falha || erro) && (
        <p role="alert" className="mb-4 rounded-lg bg-[var(--status-nao-compareceu-suave)] px-4 py-2 font-semibold text-[var(--status-nao-compareceu)]">
          {falha ?? erro}
        </p>
      )}

      {carregando ? (
        <p className="text-muted">Carregando a lista…</p>
      ) : itens.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-muted">Nenhuma família na lista.</p>
      ) : (
        <RegiaoRolavel rotulo="Tabela da lista de espera">
          <table className="lista-fofa w-full min-w-[54rem] text-left">
            <caption className="so-leitor">Famílias na lista de espera, por posição.</caption>
            <thead>
              <tr className="text-sm text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">Posição</th>
                <th scope="col" className="px-4 py-3 font-semibold">Criança</th>
                <th scope="col" className="px-4 py-3 font-semibold">Responsável</th>
                <th scope="col" className="px-4 py-3 font-semibold">Documentos pendentes</th>
                <th scope="col" className="px-4 py-3 font-semibold">Situação</th>
                <th scope="col" className="px-4 py-3 font-semibold">Prazo de resposta</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {itens.map((i) => {
                  const destaque = respondidas.has(i.id) || novos.has(i.id)
                  const faltam = i.status === 'convocada' && i.prazo_resposta ? Math.round((new Date(i.prazo_resposta).getTime() - agora.getTime()) / 60000) : null
                  return (
                    <motion.tr
                      key={i.id}
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`align-top ${destaque ? 'bg-destaque-novo' : ''}`}
                    >
                      <th scope="row" className="px-4 py-3 text-xl font-semibold tabular-nums">
                        {i.posicao}º
                      </th>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{i.nome_crianca}</p>
                        <p className="text-sm text-muted">{idadeDescrita(i.data_nascimento_crianca)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{i.cidadao?.nome}</p>
                        <p className="text-sm text-muted">{i.cidadao?.bairro}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {i.documentos_pendentes.length ? (
                          <ul className="list-inside list-disc font-semibold text-[var(--status-falta-documento)]">
                            {i.documentos_pendentes.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted">Nenhum</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <SeloStatus status={STATUS_CRECHE[i.status]} tamanho="sm" />
                        {respondidas.has(i.id) && (
                          <span className="mt-1 flex w-fit items-center gap-1 rounded-md border border-accent px-2 py-0.5 text-xs font-bold text-accent">
                            <Sparkles aria-hidden="true" size={12} />
                            Respondeu agora
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {i.status === 'convocada' && i.prazo_resposta ? (
                          <>
                            <p>Até {formatarDataHora(i.prazo_resposta)}</p>
                            {faltam !== null && (
                              <p className="font-semibold">
                                {faltam > 0 ? (
                                  <>
                                    <span aria-hidden="true">Faltam {formatarDuracao(faltam)}</span>
                                    <span className="so-leitor">Faltam {duracaoPorExtenso(faltam)}</span>
                                  </>
                                ) : (
                                  'Prazo vencido'
                                )}
                              </p>
                            )}
                          </>
                        ) : i.respondida_em ? (
                          <p className="text-muted">Respondeu em {formatarDataHora(i.respondida_em)}</p>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </RegiaoRolavel>
      )}
    </>
  )
}
