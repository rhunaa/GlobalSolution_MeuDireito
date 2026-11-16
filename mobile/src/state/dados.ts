import { useCallback, useEffect, useRef, useState } from 'react'
import { backend } from '../services/fonteDados'
import type { TabelaAssinavel } from '../services/backend'
import type {
  AgendamentoDetalhado,
  Cidadao,
  Direito,
  DireitoCidadao,
  ItemListaCrecheDetalhado,
  MovimentoUnidade,
  Senha,
  Unidade,
} from '../types'

export { backend }

/** Carrega dados e recarrega quando alguma tabela muda (tempo real). */
export function useAoVivo<T>(carregar: () => Promise<T>, tabelas: TabelaAssinavel[], deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const ref = useRef(carregar)
  ref.current = carregar
  const tempo = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const recarregar = useCallback(async () => {
    try {
      setDados(await ref.current())
      setErro(null)
    } catch (e) {
      setErro((e as Error).message)
    }
  }, [])

  const chave = tabelas.join(',')
  useEffect(() => {
    void recarregar()
    const aoMudar = () => {
      clearTimeout(tempo.current)
      tempo.current = setTimeout(() => void recarregar(), 250)
    }
    const cancelar = chave.split(',').filter(Boolean).map((t) => backend.assinar(t as TabelaAssinavel, undefined, aoMudar))
    return () => {
      clearTimeout(tempo.current)
      cancelar.forEach((c) => c())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, recarregar, ...deps])

  return { dados, erro, recarregar }
}

export interface Jornada {
  unidades: Unidade[]
  direitos: Direito[]
  meusDireitos: DireitoCidadao[]
  minhasSenhas: (Senha & { naFrente: number })[]
  meusAgendamentos: AgendamentoDetalhado[]
  minhaCreche: ItemListaCrecheDetalhado[]
  movimento: MovimentoUnidade[]
}

/** Tudo do cidadão numa carga só, sempre atualizado. */
export function useJornada(cidadaoId: string) {
  return useAoVivo<Jornada>(
    async () => {
      const [unidades, direitos, meusDireitos, movimento] = await Promise.all([
        backend.listarUnidades(),
        backend.listarDireitos(),
        backend.listarDireitosDoCidadao(cidadaoId),
        backend.movimentoUnidades(),
      ])
      const ubs = unidades.filter((u) => u.tipo === 'ubs')
      const cras = unidades.filter((u) => u.tipo === 'cras')
      const creches = unidades.filter((u) => u.tipo === 'creche')
      const [senhasPorUbs, agenda, lista] = await Promise.all([
        Promise.all(ubs.map((u) => backend.listarSenhasDoDia(u.id))),
        Promise.all(cras.map((u) => backend.listarAgendamentosDoDia(u.id))),
        Promise.all(creches.map((u) => backend.listarCreche(u.id))),
      ])
      const minhasSenhas = senhasPorUbs.flatMap((todas) => {
        const aguardando = todas
          .filter((s) => s.status === 'aguardando')
          .sort((a, b) => Number(b.prioridade) - Number(a.prioridade) || a.created_at.localeCompare(b.created_at))
        return todas
          .filter((s) => s.cidadao_id === cidadaoId)
          .map((s) => ({ ...s, naFrente: s.status === 'aguardando' ? aguardando.findIndex((x) => x.id === s.id) : 0 }))
      })
      return {
        unidades,
        direitos,
        meusDireitos,
        minhasSenhas: minhasSenhas.sort((a, b) => b.created_at.localeCompare(a.created_at)),
        meusAgendamentos: agenda.flat().filter((a) => a.cidadao_id === cidadaoId).sort((a, b) => a.data_hora.localeCompare(b.data_hora)),
        minhaCreche: lista.flat().filter((i) => i.cidadao_id === cidadaoId),
        movimento,
      }
    },
    ['senhas', 'agendamentos', 'lista_creche', 'direitos_cidadao'],
    [cidadaoId],
  )
}

export function useCidadaos() {
  const [lista, setLista] = useState<Cidadao[] | null>(null)
  useEffect(() => {
    void backend.listarCidadaos().then(setLista)
  }, [])
  return lista
}
