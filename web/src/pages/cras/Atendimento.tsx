import { Alert, Button, Checkbox, Input, Radio } from 'antd'
import { ArrowLeft, Save } from 'lucide-react'
import { useCallback, useEffect, useId, useState } from 'react'
import { useParams } from 'react-router'
import { BotaoLink } from '../../components/BotaoLink'
import { CabecalhoPagina } from '../../components/CabecalhoPagina'
import { Cartao } from '../../components/Cartao'
import { Grupo, OpcaoComDescricao } from '../../components/Grupo'
import { LinhaDoTempo } from '../../components/LinhaDoTempo'
import { SeloStatus } from '../../components/SeloStatus'
import { useRealtimeLista } from '../../hooks/useRealtimeLista'
import { agendamentosService } from '../../services/agendamentosService'
import { STATUS_AGENDAMENTO, STATUS_DIREITO } from '../../theme/status'
import type { AgendamentoDetalhado, DireitoCidadao, Historico, StatusAgendamento, StatusDireito } from '../../types'
import { formatarHora } from '../../utils/datas'

type Resultado = Exclude<StatusAgendamento, 'agendado'>

const OPCOES: { id: Resultado; rotulo: string; descricao: string }[] = [
  { id: 'atendido', rotulo: 'Atendido', descricao: 'A pessoa foi atendida e o pedido segue para análise.' },
  { id: 'falta_documento', rotulo: 'Falta documento', descricao: 'Marque abaixo quais documentos a pessoa precisa trazer.' },
  { id: 'encaminhado', rotulo: 'Encaminhado', descricao: 'A pessoa foi encaminhada para outro serviço.' },
  { id: 'nao_compareceu', rotulo: 'Não compareceu', descricao: 'A pessoa não veio no horário marcado.' },
]

/** Mesma regra padrão da função registrar_atendimento no schema.sql. */
const DIREITO_RESULTANTE: Record<Resultado, StatusDireito> = {
  atendido: 'em_analise',
  encaminhado: 'em_analise',
  falta_documento: 'agendado',
  nao_compareceu: 'provavel',
}

/** Registro do resultado de um atendimento no CRAS. */
export default function Atendimento() {
  const { id } = useParams()
  const [ag, setAg] = useState<AgendamentoDetalhado | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [resultado, setResultado] = useState<Resultado>('atendido')
  const [faltando, setFaltando] = useState<string[]>([])
  const [observacao, setObservacao] = useState('')
  const [erroDocs, setErroDocs] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const idObservacao = useId()
  const idDescObservacao = useId()
  const idErroDocs = useId()

  const carregar = useCallback(async () => {
    if (!id) return
    try {
      const dado = await agendamentosService.obter(id)
      setAg(dado)
      if (dado && dado.status !== 'agendado') {
        setResultado(dado.status)
        setFaltando(dado.documentos_faltando)
        setObservacao(dado.observacao ?? '')
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const cidadaoId = ag?.cidadao_id
  const historico = useRealtimeLista<Historico>({
    tabelas: ag ? [{ tabela: 'historico', filtro: { coluna: 'entidade_id', valor: ag.id } }] : [],
    carregar: () => (ag ? agendamentosService.listarHistorico(ag.id) : Promise.resolve([])),
    dependencias: [ag?.id],
  })
  const direitos = useRealtimeLista<DireitoCidadao>({
    tabelas: cidadaoId ? [{ tabela: 'direitos_cidadao', filtro: { coluna: 'cidadao_id', valor: cidadaoId } }] : [],
    carregar: () => (cidadaoId ? agendamentosService.listarDireitosDoCidadao(cidadaoId) : Promise.resolve([])),
    dependencias: [cidadaoId],
  })
  const direitoAtual = direitos.itens.find((d) => d.direito_id === ag?.direito_id)

  function escolher(v: Resultado) {
    setResultado(v)
    setErroDocs(false)
    if (v === 'falta_documento' && faltando.length === 0 && ag?.direito) {
      // Sugere o que a pessoa ainda não confirmou ter
      setFaltando(ag.direito.documentos.filter((d) => !ag.documentos_confirmados.includes(d)))
    }
  }

  async function salvar() {
    if (!ag) return
    if (resultado === 'falta_documento' && faltando.length === 0) {
      setErroDocs(true)
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await agendamentosService.registrarResultado({
        agendamentoId: ag.id,
        status: resultado,
        documentosFaltando: resultado === 'falta_documento' ? faltando : [],
        observacao: observacao.trim() || null,
      })
      setSalvo(true)
      await carregar()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p className="text-muted">Carregando atendimento…</p>
  if (!ag) {
    return (
      <>
        <CabecalhoPagina titulo="Atendimento não encontrado" />
        <p className="mb-4">Não achamos este agendamento. Ele pode ter sido removido.</p>
        <BotaoLink to="/cras/agenda" type="primary">
          Voltar para a agenda
        </BotaoLink>
      </>
    )
  }

  const jaRegistrado = ag.status !== 'agendado'

  return (
    <>
      <CabecalhoPagina
        titulo="Registrar atendimento"
        descricao={`${ag.cidadao?.nome ?? 'Pessoa'} · ${formatarHora(ag.data_hora)} · ${ag.motivo}`}
        acoes={
          <BotaoLink to="/cras/agenda" icon={<ArrowLeft aria-hidden="true" size={16} />}>
            Voltar para a agenda
          </BotaoLink>
        }
      />

      {salvo && (
        <Alert
          type="success"
          showIcon
          className="mb-6"
          title="Atendimento registrado"
          description={`O direito da pessoa mudou para “${direitoAtual ? STATUS_DIREITO[direitoAtual.status].rotulo : STATUS_DIREITO[DIREITO_RESULTANTE[resultado]].rotulo}” e ela já vê isso no app.`}
        />
      )}
      {erro && (
        <p role="alert" className="mb-4 rounded-lg bg-[var(--status-nao-compareceu-suave)] px-4 py-2 font-semibold text-[var(--status-nao-compareceu)]">
          {erro}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Cartao>
          <form
            className="flex flex-col gap-6"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void salvar()
            }}
          >
            <Grupo legenda={<span className="text-lg">Como foi o atendimento?</span>}>
              <Radio.Group value={resultado} onChange={(e) => escolher(e.target.value as Resultado)} className="flex flex-col gap-3">
                {OPCOES.map((o) => (
                  <Radio key={o.id} value={o.id}>
                    <OpcaoComDescricao rotulo={o.rotulo} descricao={o.descricao} />
                  </Radio>
                ))}
              </Radio.Group>
            </Grupo>

            {resultado === 'falta_documento' && (
              <Grupo
                legenda="Quais documentos faltam?"
                descricao="A pessoa vê esta lista no app e sabe o que trazer na volta."
                erro={erroDocs ? 'Marque pelo menos um documento que falta.' : null}
                idErro={idErroDocs}
              >
                <Checkbox.Group
                  value={faltando}
                  onChange={(v) => {
                    setFaltando(v as string[])
                    if (v.length) setErroDocs(false)
                  }}
                  className="flex flex-col gap-2"
                >
                  {(ag.direito?.documentos ?? []).map((d) => (
                    <Checkbox key={d} value={d}>
                      {d}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Grupo>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor={idObservacao} className="font-bold">
                Observação (opcional)
              </label>
              <Input.TextArea
                id={idObservacao}
                aria-describedby={idDescObservacao}
                rows={4}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex.: pedido enviado ao INSS; voltar com o CPF dos filhos."
              />
              <p id={idDescObservacao} className="text-sm text-muted">
                Aparece no histórico da pessoa. Use linguagem simples.
              </p>
            </div>

            <Button type="primary" htmlType="submit" size="large" loading={salvando} className="self-start" icon={<Save aria-hidden="true" size={20} />}>
              {jaRegistrado ? 'Corrigir resultado' : 'Registrar resultado'}
            </Button>
          </form>
        </Cartao>

        <aside aria-label="Dados da pessoa" className="flex flex-col gap-6">
          <Cartao titulo={<span className="text-lg">Situação</span>}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm text-muted">Atendimento</p>
                <SeloStatus status={STATUS_AGENDAMENTO[ag.status]} />
              </div>
              <div>
                <p className="text-sm text-muted">{ag.direito?.nome}</p>
                {direitoAtual ? (
                  <SeloStatus status={STATUS_DIREITO[direitoAtual.status]} />
                ) : (
                  <p className="font-semibold">Sem registro</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted">Documentos que a pessoa confirmou ter</p>
                {ag.documentos_confirmados.length ? (
                  <ul className="list-inside list-disc text-sm">
                    {ag.documentos_confirmados.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">Nenhum confirmado.</p>
                )}
              </div>
            </div>
          </Cartao>

          <section aria-labelledby="titulo-historico">
            <h2 id="titulo-historico" className="mb-3 text-lg font-semibold">
              Histórico deste atendimento
            </h2>
            <LinhaDoTempo itens={historico.itens} />
          </section>
        </aside>
      </div>
    </>
  )
}

