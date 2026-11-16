import { Button } from 'antd'
import { Baby, Check, X } from 'lucide-react'
import { useState } from 'react'
import { Cartao } from '../../components/Cartao'
import { SeloStatus } from '../../components/SeloStatus'
import { useRealtimeLista } from '../../hooks/useRealtimeLista'
import { crecheService } from '../../services/crecheService'
import { STATUS_CRECHE } from '../../theme/status'
import type { ItemListaCrecheDetalhado, Unidade } from '../../types'
import { formatarDataHora } from '../../utils/datas'

interface Props {
  creches: Unidade[]
  aoConcluir: (mensagem: string) => void
}

/** Simula a família respondendo à convocação de vaga pelo app. */
export function CartaoCreche({ creches, aoConcluir }: Props) {
  const ids = creches.map((c) => c.id).join(',')
  const { itens, carregando } = useRealtimeLista<ItemListaCrecheDetalhado>({
    tabelas: [{ tabela: 'lista_creche' }],
    carregar: async () => (await Promise.all(creches.map((c) => crecheService.listar(c.id)))).flat(),
    dependencias: [ids],
  })
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const convocadas = itens.filter((i) => i.status === 'convocada')
  const nomeCreche = (id: string) => creches.find((c) => c.id === id)?.nome ?? ''

  async function responder(item: ItemListaCrecheDetalhado, aceita: boolean) {
    setOcupado(item.id)
    setErro(null)
    try {
      await crecheService.responder(item.id, aceita)
      aoConcluir(`A família de ${item.nome_crianca} ${aceita ? 'aceitou' : 'recusou'} a vaga no ${nomeCreche(item.unidade_id)}.`)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setOcupado(null)
    }
  }

  return (
    <Cartao
      titulo="Responder à vaga de creche"
      icone={<Baby aria-hidden="true" size={22} className="text-servico-creche" />}
      descricao="Quando a gestora clica em “Abrir vaga”, a família convocada aparece aqui para aceitar ou recusar."
    >
      <div className="flex flex-col gap-3">
        {carregando ? (
          <p className="text-muted">Carregando…</p>
        ) : convocadas.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-muted">
            Nenhuma família convocada agora. Abra uma vaga na lista da creche para testar.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {convocadas.map((i) => (
              <li key={i.id} className="flex flex-col gap-3 rounded-lg bg-[var(--surface-secondary)] p-4">
                <div>
                  <p className="font-bold">
                    {i.nome_crianca} <span className="font-normal text-muted">· responsável {i.cidadao?.nome}</span>
                  </p>
                  <p className="text-sm text-muted">{nomeCreche(i.unidade_id)}</p>
                  {i.prazo_resposta && <p className="text-sm">Responder até {formatarDataHora(i.prazo_resposta)}</p>}
                  <div className="mt-2">
                    <SeloStatus status={STATUS_CRECHE[i.status]} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="primary" loading={ocupado === i.id} icon={<Check aria-hidden="true" size={18} />} onClick={() => responder(i, true)}>
                    Aceitar vaga
                  </Button>
                  <Button disabled={ocupado === i.id} icon={<X aria-hidden="true" size={18} />} onClick={() => responder(i, false)}>
                    Recusar vaga
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {erro && (
          <p role="alert" className="font-semibold text-danger">
            {erro}
          </p>
        )}
      </div>
    </Cartao>
  )
}
