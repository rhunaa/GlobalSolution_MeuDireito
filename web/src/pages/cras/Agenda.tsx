import { AnimatePresence, motion } from 'motion/react'
import { CalendarCheck, CalendarClock, FileWarning, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BotaoLink } from '../../components/BotaoLink'
import { CabecalhoPagina } from '../../components/CabecalhoPagina'
import { RegiaoRolavel } from '../../components/RegiaoRolavel'
import { ResumoNumeros } from '../../components/ResumoNumeros'
import { SeloStatus } from '../../components/SeloStatus'
import { useRealtimeAgenda } from '../../hooks/useRealtimeAgenda'
import { useSessao } from '../../hooks/useSessao'
import { STATUS_AGENDAMENTO } from '../../theme/status'
import { formatarDataLonga, formatarHora } from '../../utils/datas'

/** Agenda do dia da assistente social do CRAS. */
export default function Agenda() {
  const { sessao } = useSessao()
  const { itens, carregando, erro, novos, resumo } = useRealtimeAgenda(sessao?.unidadeId)

  // Avisa leitores de tela quando chega agendamento novo
  const [aviso, setAviso] = useState('')
  const [anunciados, setAnunciados] = useState<Set<string> | null>(null)
  useEffect(() => {
    if (carregando) return
    if (anunciados === null) {
      setAnunciados(new Set(itens.map((a) => a.id)))
      return
    }
    const novo = itens.find((a) => !anunciados.has(a.id))
    if (novo) {
      setAviso(`Novo agendamento às ${formatarHora(novo.data_hora)}: ${novo.cidadao?.nome ?? 'pessoa'}, ${novo.motivo}.`)
      setAnunciados(new Set([...anunciados, novo.id]))
    }
  }, [itens, carregando, anunciados])

  return (
    <>
      <CabecalhoPagina
        aoVivo
        titulo="Agenda do dia"
        descricao={`Atendimentos de hoje, ${formatarDataLonga()}. Agendamentos feitos no app entram aqui sozinhos.`}
      />

      <ResumoNumeros
        titulo="Resumo da agenda"
        itens={[
          { rotulo: 'Ainda a atender', valor: String(resumo.aguardando), Icone: CalendarClock },
          { rotulo: 'Atendidos', valor: String(resumo.atendidos), Icone: CalendarCheck },
          { rotulo: 'Com documento faltando', valor: String(resumo.pendencias), Icone: FileWarning },
        ]}
      />

      <p
        role="status"
        aria-live="polite"
        className={aviso ? 'mb-4 rounded-lg bg-[var(--status-chamada-suave)] px-4 py-2 font-semibold text-[var(--status-chamada)]' : 'so-leitor'}
      >
        {aviso}
      </p>
      {erro && (
        <p role="alert" className="mb-4 font-semibold text-danger">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-muted">Carregando a agenda…</p>
      ) : itens.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-muted">
          Nenhum atendimento agendado para hoje.
        </p>
      ) : (
        <RegiaoRolavel rotulo="Tabela da agenda do dia">
          <table className="lista-fofa w-full min-w-[56rem] text-left">
            <caption className="so-leitor">Atendimentos de hoje, em ordem de horário.</caption>
            <thead>
              <tr className="text-sm text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">Horário</th>
                <th scope="col" className="px-4 py-3 font-semibold">Pessoa</th>
                <th scope="col" className="px-4 py-3 font-semibold">Motivo e direito</th>
                <th scope="col" className="px-4 py-3 font-semibold">Documentos</th>
                <th scope="col" className="px-4 py-3 font-semibold">Situação</th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  <span className="so-leitor">Ação</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {itens.map((a) => {
                  const confirmados = a.documentos_confirmados
                  const faltam = (a.direito?.documentos ?? []).filter((d) => !confirmados.includes(d))
                  const novo = novos.has(a.id)
                  const encerrado = a.status !== 'agendado'
                  return (
                    <motion.tr
                      key={a.id}
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`align-top ${novo ? 'bg-destaque-novo' : ''}`}
                    >
                      <th scope="row" className="px-4 py-3 text-xl font-semibold tabular-nums">
                        {formatarHora(a.data_hora)}
                        {novo && (
                          <span className="mt-1 flex w-fit items-center gap-1 rounded-md border border-accent px-2 py-0.5 text-xs font-bold text-accent">
                            <Sparkles aria-hidden="true" size={12} />
                            Novo
                          </span>
                        )}
                      </th>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{a.cidadao?.nome ?? 'Pessoa não encontrada'}</p>
                        <p className="text-sm text-muted">{a.cidadao?.bairro}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{a.motivo}</p>
                        <p className="text-sm text-muted">{a.direito?.nome}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {confirmados.length > 0 ? (
                          <ul className="list-inside list-disc">
                            {confirmados.map((d) => (
                              <li key={d}>
                                <span className="so-leitor">Confirmado: </span>
                                {d}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">Nenhum confirmado</p>
                        )}
                        {a.status === 'agendado' && faltam.length > 0 && (
                          <p className="mt-1 font-semibold text-[var(--status-falta-documento)]">
                            Falta confirmar: {faltam.length} {faltam.length === 1 ? 'documento' : 'documentos'}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <SeloStatus status={STATUS_AGENDAMENTO[a.status]} tamanho="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <BotaoLink to={`/cras/atendimento/${a.id}`} type={encerrado ? 'default' : 'primary'} size="small">
                          {encerrado ? 'Ver atendimento' : 'Registrar atendimento'}
                          <span className="so-leitor"> de {a.cidadao?.nome}</span>
                        </BotaoLink>
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
