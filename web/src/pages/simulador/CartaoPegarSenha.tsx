import { Button, Checkbox, Radio } from 'antd'
import { Smartphone } from 'lucide-react'
import { useState } from 'react'
import { CampoSelecao } from '../../components/CampoSelecao'
import { Cartao } from '../../components/Cartao'
import { Grupo } from '../../components/Grupo'
import { senhasService } from '../../services/senhasService'
import { MOTIVOS } from '../../theme/rotulos'
import type { MotivoSenha, Unidade } from '../../types'

interface Props {
  cidadaoId: string | null
  ubs: Unidade[]
  aoConcluir: (mensagem: string) => void
}

/** Simula o cidadão pegando senha pelo app. */
export function CartaoPegarSenha({ cidadaoId, ubs, aoConcluir }: Props) {
  const [unidadeId, setUnidadeId] = useState<string | null>(ubs[0]?.id ?? null)
  const [motivo, setMotivo] = useState<MotivoSenha>('consulta')
  const [prioridade, setPrioridade] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const unidade = unidadeId ?? ubs[0]?.id ?? null

  async function enviar() {
    if (!cidadaoId || !unidade) return
    setEnviando(true)
    setErro(null)
    try {
      const s = await senhasService.emitirPeloApp(unidade, motivo, prioridade, cidadaoId)
      aoConcluir(`Senha ${s.codigo} emitida pelo app na ${ubs.find((u) => u.id === unidade)?.nome}.`)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Cartao
      titulo="Pegar senha na UBS"
      icone={<Smartphone aria-hidden="true" size={22} className="text-servico-ubs" />}
      descricao="Aparece na fila da recepcionista e no telão, como se viesse do celular."
    >
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void enviar()
        }}
      >
        <CampoSelecao rotulo="Unidade" opcoes={ubs.map((u) => ({ id: u.id, texto: u.nome }))} valor={unidade} aoMudar={setUnidadeId} />
        <Grupo legenda="Motivo">
          <Radio.Group value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoSenha)} className="flex flex-col gap-2">
            {(Object.keys(MOTIVOS) as MotivoSenha[]).map((id) => (
              <Radio key={id} value={id}>
                {MOTIVOS[id].rotulo}
              </Radio>
            ))}
          </Radio.Group>
        </Grupo>
        <Checkbox checked={prioridade} onChange={(e) => setPrioridade(e.target.checked)}>
          Atendimento prioritário
        </Checkbox>
        {!cidadaoId && <p className="text-sm text-muted">Escolha o cidadão no topo da página.</p>}
        {erro && (
          <p role="alert" className="font-semibold text-danger">
            {erro}
          </p>
        )}
        <Button type="primary" htmlType="submit" loading={enviando} disabled={!cidadaoId || !unidade}>
          Pegar senha
        </Button>
      </form>
    </Cartao>
  )
}
