import { useMemo } from 'react'
import { agendamentosService } from '../services/agendamentosService'
import type { AgendamentoDetalhado } from '../types'
import { useRealtimeLista } from './useRealtimeLista'

/** Agenda do dia de um CRAS em tempo real (agendamentos feitos no app ou no simulador). */
export function useRealtimeAgenda(unidadeId: string | undefined) {
  const base = useRealtimeLista<AgendamentoDetalhado>({
    tabelas: unidadeId ? [{ tabela: 'agendamentos', filtro: { coluna: 'unidade_id', valor: unidadeId } }] : [],
    carregar: () => (unidadeId ? agendamentosService.listarDoDia(unidadeId) : Promise.resolve([])),
    dependencias: [unidadeId],
  })
  const resumo = useMemo(() => {
    const conta = (...st: string[]) => base.itens.filter((a) => st.includes(a.status)).length
    return {
      total: base.itens.length,
      aguardando: conta('agendado'),
      atendidos: conta('atendido', 'encaminhado'),
      pendencias: conta('falta_documento'),
    }
  }, [base.itens])
  return { ...base, resumo }
}
