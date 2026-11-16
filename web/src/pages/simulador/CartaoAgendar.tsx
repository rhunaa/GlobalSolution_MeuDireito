import { Button, Checkbox } from 'antd'
import { CalendarPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CampoSelecao } from '../../components/CampoSelecao'
import { Cartao } from '../../components/Cartao'
import { Grupo } from '../../components/Grupo'
import { agendamentosService } from '../../services/agendamentosService'
import type { Direito, Unidade } from '../../types'
import { hojeSP, isoEmSP } from '../../utils/datas'

interface Props {
  cidadaoId: string | null
  cras: Unidade[]
  direitos: Direito[]
  aoConcluir: (mensagem: string) => void
}

const HORARIOS = Array.from({ length: 17 }, (_, i) => {
  const minutos = 8 * 60 + i * 30
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
})

/** Simula o cidadão agendando atendimento no CRAS pelo app. */
export function CartaoAgendar({ cidadaoId, cras, direitos, aoConcluir }: Props) {
  const direitosCras = useMemo(() => direitos.filter((d) => d.tipo_unidade === 'cras'), [direitos])
  const [unidadeId, setUnidadeId] = useState<string | null>(null)
  const [direitoId, setDireitoId] = useState<string | null>(null)
  const [hora, setHora] = useState<string | null>('14:00')
  const [docs, setDocs] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const unidade = unidadeId ?? cras[0]?.id ?? null
  const direito = direitosCras.find((d) => d.id === (direitoId ?? direitosCras[0]?.id))

  async function enviar() {
    if (!cidadaoId || !unidade || !direito || !hora) return
    setEnviando(true)
    setErro(null)
    try {
      await agendamentosService.criar({
        unidadeId: unidade,
        cidadaoId,
        direitoId: direito.id,
        dataHora: isoEmSP(hojeSP(), hora),
        motivo: direito.nome,
        documentosConfirmados: docs,
      })
      aoConcluir(`Agendamento criado para hoje, ${hora}: ${direito.nome} no ${cras.find((u) => u.id === unidade)?.nome}.`)
      setDocs([])
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Cartao
      titulo="Agendar no CRAS"
      icone={<CalendarPlus aria-hidden="true" size={22} className="text-servico-cras" />}
      descricao="Aparece na agenda da assistente social. O direito vira “agendado” no app."
    >
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void enviar()
        }}
      >
        <CampoSelecao rotulo="Unidade" opcoes={cras.map((u) => ({ id: u.id, texto: u.nome }))} valor={unidade} aoMudar={setUnidadeId} />
        <CampoSelecao
          rotulo="Qual direito?"
          opcoes={direitosCras.map((d) => ({ id: d.id, texto: d.nome }))}
          valor={direito?.id ?? null}
          aoMudar={(v) => {
            setDireitoId(v)
            setDocs([])
          }}
        />
        <CampoSelecao rotulo="Horário (hoje)" opcoes={HORARIOS.map((h) => ({ id: h, texto: h }))} valor={hora} aoMudar={setHora} />
        {direito && (
          <Grupo legenda="Documentos que a pessoa confirmou ter" descricao="Aparecem para a assistente social na agenda.">
            <Checkbox.Group value={docs} onChange={(v) => setDocs(v as string[])} className="flex flex-col gap-2">
              {direito.documentos.map((d) => (
                <Checkbox key={d} value={d}>
                  {d}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Grupo>
        )}
        {!cidadaoId && <p className="text-sm text-muted">Escolha o cidadão no topo da página.</p>}
        {erro && (
          <p role="alert" className="font-semibold text-danger">
            {erro}
          </p>
        )}
        <Button type="primary" htmlType="submit" loading={enviando} disabled={!cidadaoId || !unidade || !direito}>
          Agendar atendimento
        </Button>
      </form>
    </Cartao>
  )
}
