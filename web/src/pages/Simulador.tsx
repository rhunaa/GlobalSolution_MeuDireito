import { Alert, Button } from 'antd'
import { RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { CampoSelecao } from '../components/CampoSelecao'
import { Cartao } from '../components/Cartao'
import { LinhaDoTempo } from '../components/LinhaDoTempo'
import { SeloStatus } from '../components/SeloStatus'
import { useRealtimeLista } from '../hooks/useRealtimeLista'
import { useReferencias } from '../hooks/useReferencias'
import { useUnidades } from '../hooks/useUnidades'
import { agendamentosService } from '../services/agendamentosService'
import { modoDados } from '../services/fonteDados'
import { historicoService } from '../services/historicoService'
import { restaurarDemo } from '../services/realtime'
import { STATUS_DIREITO } from '../theme/status'
import type { DireitoCidadao, Historico } from '../types'
import { formatarHora } from '../utils/datas'
import { CartaoAgendar } from './simulador/CartaoAgendar'
import { CartaoCreche } from './simulador/CartaoCreche'
import { CartaoPegarSenha } from './simulador/CartaoPegarSenha'

interface Registro {
  id: number
  hora: string
  texto: string
}

/**
 * Simulador do app mobile: ferramenta de teste para a demonstração.
 * Faz o que o cidadão faria no app, usando o mesmo banco da plataforma.
 */
export default function Simulador() {
  const { unidades } = useUnidades()
  const { cidadaos, direitos } = useReferencias()
  const [cidadaoId, setCidadaoId] = useState<string | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [restaurando, setRestaurando] = useState(false)

  const ubs = useMemo(() => unidades.filter((u) => u.tipo === 'ubs'), [unidades])
  const cras = useMemo(() => unidades.filter((u) => u.tipo === 'cras'), [unidades])
  const creches = useMemo(() => unidades.filter((u) => u.tipo === 'creche'), [unidades])

  const cidadao = cidadaos.find((c) => c.id === cidadaoId) ?? null

  const registrar = (texto: string) =>
    setRegistros((r) => [{ id: Date.now(), hora: formatarHora(new Date().toISOString()), texto }, ...r].slice(0, 8))

  const historico = useRealtimeLista<Historico>({
    tabelas: cidadaoId ? [{ tabela: 'historico', filtro: { coluna: 'cidadao_id', valor: cidadaoId } }] : [],
    carregar: () => (cidadaoId ? historicoService.doCidadao(cidadaoId) : Promise.resolve([])),
    dependencias: [cidadaoId],
  })
  const direitosCidadao = useRealtimeLista<DireitoCidadao>({
    tabelas: cidadaoId ? [{ tabela: 'direitos_cidadao', filtro: { coluna: 'cidadao_id', valor: cidadaoId } }] : [],
    carregar: () => (cidadaoId ? agendamentosService.listarDireitosDoCidadao(cidadaoId) : Promise.resolve([])),
    dependencias: [cidadaoId],
  })

  async function restaurar() {
    setRestaurando(true)
    await restaurarDemo()
    setRegistros([])
    setRestaurando(false)
    registrar('Dados de demonstração restaurados.')
  }

  return (
    <>
      <CabecalhoPagina
        aoVivo
        titulo="Simulador do app"
        descricao="Faça aqui o que o cidadão faria no celular e veja o resultado nas telas da plataforma, em tempo real."
        acoes={
          modoDados === 'mock' ? (
            <Button loading={restaurando} onClick={restaurar} icon={<RotateCcw aria-hidden="true" size={16} />}>
              Restaurar dados de exemplo
            </Button>
          ) : undefined
        }
      />

      <Alert
        type="info"
        showIcon
        className="mb-6"
        title="Ferramenta de teste, não faz parte do atendimento"
        description="Serve para testar e gravar a demonstração antes de o app existir. Deixe a fila, o telão ou a agenda abertos em outra aba ou janela para ver tudo chegar sozinho."
      />

      <section aria-labelledby="titulo-quem" className="mb-6 max-w-xl">
        <h2 id="titulo-quem" className="sr-only">
          Quem está usando o app
        </h2>
        <CampoSelecao
          rotulo="Quem está usando o app?"
          descricao="Pessoa fictícia de exemplo."
          placeholder="Escolha um cidadão"
          opcoes={cidadaos.map((c) => ({ id: c.id, texto: `${c.nome} – ${c.bairro}` }))}
          valor={cidadaoId}
          aoMudar={setCidadaoId}
        />
      </section>

      <p role="status" aria-live="polite" className={registros[0] ? 'mb-4 rounded-lg bg-[var(--status-concluida-suave)] px-4 py-2 font-semibold text-[var(--status-concluida)]' : 'so-leitor'}>
        {registros[0]?.texto}
      </p>

      <div className="grid gap-6 xl:grid-cols-3">
        <CartaoPegarSenha cidadaoId={cidadaoId} ubs={ubs} aoConcluir={registrar} />
        <CartaoAgendar cidadaoId={cidadaoId} cras={cras} direitos={direitos} aoConcluir={registrar} />
        <CartaoCreche creches={creches} aoConcluir={registrar} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="titulo-acompanhar">
          <h2 id="titulo-acompanhar" className="mb-3 text-xl font-semibold">
            O que {cidadao ? cidadao.nome.split(' ')[0] : 'o cidadão'} vê no app
          </h2>
          {!cidadao ? (
            <p className="text-muted">Escolha um cidadão para acompanhar os direitos e o histórico.</p>
          ) : (
            <Cartao>
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="mb-2 font-semibold">Meus direitos</h3>
                  {direitosCidadao.itens.length === 0 ? (
                    <p className="text-muted">Nenhum direito identificado ainda.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {direitosCidadao.itens.map((d) => (
                        <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">{direitos.find((x) => x.id === d.direito_id)?.nome}</span>
                          <SeloStatus status={STATUS_DIREITO[d.status]} tamanho="sm" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Linha do tempo</h3>
                  <LinhaDoTempo itens={[...historico.itens].reverse().slice(0, 10)} />
                </div>
              </div>
            </Cartao>
          )}
        </section>

        <section aria-labelledby="titulo-registro">
          <h2 id="titulo-registro" className="mb-3 text-xl font-semibold">
            Ações feitas neste simulador
          </h2>
          {registros.length === 0 ? (
            <p className="text-muted">Nada feito ainda.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {registros.map((r) => (
                <li key={r.id} className="rounded-lg bg-[var(--surface)] px-4 py-3 border border-[var(--border)]">
                  <span className="me-2 font-bold tabular-nums">{r.hora}</span>
                  {r.texto}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}
