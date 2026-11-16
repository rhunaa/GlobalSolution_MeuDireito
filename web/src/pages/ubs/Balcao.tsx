import { Button, Checkbox, Radio } from 'antd'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Plus, Printer, Ticket } from 'lucide-react'
import { useRef, useState } from 'react'
import { CabecalhoPagina } from '../../components/CabecalhoPagina'
import { Cartao } from '../../components/Cartao'
import { Grupo, OpcaoComDescricao } from '../../components/Grupo'
import { useRealtimeFila } from '../../hooks/useRealtimeFila'
import { useSessao } from '../../hooks/useSessao'
import { useUnidades } from '../../hooks/useUnidades'
import { senhasService } from '../../services/senhasService'
import { ICONE_PRIORIDADE, MOTIVOS } from '../../theme/rotulos'
import type { MotivoSenha, Senha } from '../../types'
import { formatarDataHora } from '../../utils/datas'

/** Emissão de senha para quem não tem celular, com impressão (window.print). */
export default function Balcao() {
  const { sessao } = useSessao()
  const { unidades } = useUnidades()
  const unidade = unidades.find((u) => u.id === sessao?.unidadeId)
  const { aguardando } = useRealtimeFila(sessao?.unidadeId)

  const [motivo, setMotivo] = useState<MotivoSenha>('consulta')
  const [prioridade, setPrioridade] = useState(false)
  const [emitindo, setEmitindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [emitida, setEmitida] = useState<Senha | null>(null)
  const [naFrente, setNaFrente] = useState(0)
  const botaoNova = useRef<HTMLButtonElement | null>(null)

  async function emitir() {
    if (!sessao) return
    setEmitindo(true)
    setErro(null)
    try {
      // Quantas pessoas estarão na frente (as prioritárias passam na frente das comuns)
      const antes = aguardando.filter((s) => (prioridade ? s.prioridade : true)).length
      const senha = await senhasService.emitirNoBalcao(sessao.unidadeId, motivo, prioridade)
      setNaFrente(antes)
      setEmitida(senha)
      window.setTimeout(() => botaoNova.current?.focus(), 350)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEmitindo(false)
    }
  }

  function novaSenha() {
    setEmitida(null)
    setPrioridade(false)
  }

  const m = emitida ? MOTIVOS[emitida.motivo] : null

  return (
    <>
      <CabecalhoPagina
        aoVivo
        titulo="Senha no balcão"
        descricao="Para quem não tem celular ou prefere pedir a senha pessoalmente. A senha entra na mesma fila do app."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Cartao className="nao-imprimir">
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault()
              void emitir()
            }}
            noValidate
          >
            <Grupo legenda={<span className="text-lg">Qual o motivo da visita?</span>}>
              <Radio.Group value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoSenha)} className="flex flex-col gap-3">
                {(Object.keys(MOTIVOS) as MotivoSenha[]).map((id) => {
                  const { rotulo, descricao, Icone } = MOTIVOS[id]
                  return (
                    <Radio key={id} value={id}>
                      <OpcaoComDescricao
                        rotulo={
                          <span className="inline-flex items-center gap-2">
                            <Icone aria-hidden="true" size={20} className="text-servico-ubs" />
                            {rotulo}
                          </span>
                        }
                        descricao={descricao}
                      />
                    </Radio>
                  )
                })}
              </Radio.Group>
            </Grupo>

            <Checkbox checked={prioridade} onChange={(e) => setPrioridade(e.target.checked)}>
              <OpcaoComDescricao
                rotulo="Atendimento prioritário"
                descricao="Pessoa idosa (60 anos ou mais), gestante, lactante, com deficiência ou com criança de colo."
              />
            </Checkbox>

            {erro && (
              <p role="alert" className="rounded-lg bg-[var(--status-nao-compareceu-suave)] px-4 py-2 font-semibold text-[var(--status-nao-compareceu)]">
                {erro}
              </p>
            )}

            <Button type="primary" htmlType="submit" size="large" className="h-14 text-lg font-bold" loading={emitindo} icon={<Ticket aria-hidden="true" size={22} />}>
              Emitir senha
            </Button>
          </form>
        </Cartao>

        <div aria-live="polite" className="min-h-48">
          <AnimatePresence mode="wait">
            {emitida && m ? (
              <motion.section
                key={emitida.id}
                aria-labelledby="titulo-senha-emitida"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-4"
              >
                <div className="nao-imprimir flex items-center gap-2 font-bold text-[var(--status-concluida)]">
                  <CheckCircle2 aria-hidden="true" size={22} />
                  <h2 id="titulo-senha-emitida" className="text-lg">
                    Senha emitida
                  </h2>
                </div>

                <div className="area-impressao rounded-xl border-4 border-accent bg-[var(--surface)] p-8 text-center">
                  <p className="text-base font-semibold text-muted">{unidade?.nome}</p>
                  <p className="mt-2 text-lg font-semibold">Sua senha</p>
                  <p className="my-2 text-[clamp(5rem,14vw,8rem)] font-semibold leading-none tabular-nums tracking-tight" aria-label={`Código ${emitida.codigo}`}>
                    {emitida.codigo}
                  </p>
                  <p className="text-xl font-bold">{m.rotulo}</p>
                  {emitida.prioridade && (
                    <p className="mt-2 inline-flex items-center gap-2 rounded-md border-2 border-current px-3 py-1 font-bold">
                      <ICONE_PRIORIDADE aria-hidden="true" size={18} />
                      Atendimento prioritário
                    </p>
                  )}
                  <p className="mt-4 text-lg">
                    {naFrente === 0 ? 'Você é a próxima pessoa.' : `Há ${naFrente} ${naFrente === 1 ? 'pessoa' : 'pessoas'} na sua frente.`}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {formatarDataHora(emitida.created_at)} · Aguarde ser chamado pelo telão.
                  </p>
                </div>

                <div className="nao-imprimir flex flex-wrap gap-3">
                  <Button icon={<Printer aria-hidden="true" size={18} />} onClick={() => window.print()}>
                    Imprimir senha
                  </Button>
                  <Button type="primary" ref={botaoNova} icon={<Plus aria-hidden="true" size={18} />} onClick={novaSenha}>
                    Emitir outra senha
                  </Button>
                </div>
              </motion.section>
            ) : (
              <motion.p
                key="vazio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="nao-imprimir rounded-xl border-2 border-dashed border-[var(--border)] p-8 text-center text-muted"
              >
                A senha vai aparecer aqui, em tamanho grande, depois que você emitir.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
