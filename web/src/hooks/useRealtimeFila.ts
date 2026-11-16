import { useMemo } from 'react'
import { senhasService } from '../services/senhasService'
import type { Senha } from '../types'
import { useRealtimeLista } from './useRealtimeLista'

/** Ordem de chamada: prioritárias primeiro, depois por chegada. */
export function ordenarFila(senhas: Senha[]): Senha[] {
  return [...senhas].sort((a, b) => Number(b.prioridade) - Number(a.prioridade) || a.created_at.localeCompare(b.created_at))
}

/** Fila do dia de uma unidade, em tempo real (senhas criadas no app, balcão ou simulador). */
export function useRealtimeFila(unidadeId: string | undefined) {
  const base = useRealtimeLista<Senha>({
    tabelas: unidadeId ? [{ tabela: 'senhas', filtro: { coluna: 'unidade_id', valor: unidadeId } }] : [],
    carregar: () => (unidadeId ? senhasService.listarDoDia(unidadeId) : Promise.resolve([])),
    dependencias: [unidadeId],
  })

  const derivado = useMemo(() => {
    const aguardando = ordenarFila(base.itens.filter((s) => s.status === 'aguardando'))
    const emCurso = base.itens
      .filter((s) => s.status === 'chamada' || s.status === 'em_atendimento')
      .sort((a, b) => (a.chamada_em ?? '').localeCompare(b.chamada_em ?? ''))
    const encerradas = base.itens
      .filter((s) => s.status === 'concluida' || s.status === 'nao_compareceu')
      .sort((a, b) => (b.concluida_em ?? '').localeCompare(a.concluida_em ?? ''))
    // Tudo o que já foi chamado, da mais recente para a mais antiga (usado pelo telão)
    const chamadas = base.itens.filter((s) => s.chamada_em).sort((a, b) => b.chamada_em!.localeCompare(a.chamada_em!))
    const atendidos = base.itens.filter((s) => s.status === 'concluida').length
    const esperas = base.itens
      .filter((s) => s.chamada_em)
      .map((s) => (new Date(s.chamada_em!).getTime() - new Date(s.created_at).getTime()) / 60000)
    const tempoMedioMin = esperas.length ? Math.round(esperas.reduce((a, b) => a + b, 0) / esperas.length) : null
    return { aguardando, emCurso, encerradas, chamadas, atendidos, tempoMedioMin }
  }, [base.itens])

  return { ...base, ...derivado }
}
