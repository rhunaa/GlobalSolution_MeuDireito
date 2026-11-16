import { CalendarDays, ChartNoAxesColumn, ClipboardList, Baby, Ticket, Tv, Globe, type LucideIcon } from 'lucide-react'
import type { Perfil } from '../types'

export interface ItemMenu {
  rotulo: string
  caminho: string
  Icone: LucideIcon
  /** Abre em outra aba (telão e página pública não têm o menu). */
  novaAba?: boolean
}

/** Páginas visíveis para cada perfil. `:unidadeId` é trocado pela unidade atual. */
export const MENU_POR_PERFIL: Record<Perfil, ItemMenu[]> = {
  recepcionista_ubs: [
    { rotulo: 'Fila de atendimento', caminho: '/ubs/fila', Icone: ClipboardList },
    { rotulo: 'Senha no balcão', caminho: '/ubs/balcao', Icone: Ticket },
    { rotulo: 'Telão da sala de espera', caminho: '/telao/:unidadeId', Icone: Tv, novaAba: true },
    { rotulo: 'Indicadores', caminho: '/indicadores', Icone: ChartNoAxesColumn },
  ],
  assistente_cras: [
    { rotulo: 'Agenda do dia', caminho: '/cras/agenda', Icone: CalendarDays },
    { rotulo: 'Indicadores', caminho: '/indicadores', Icone: ChartNoAxesColumn },
  ],
  gestora_creche: [
    { rotulo: 'Lista de espera', caminho: '/creche/lista', Icone: Baby },
    { rotulo: 'Indicadores', caminho: '/indicadores', Icone: ChartNoAxesColumn },
  ],
}

export const ITEM_PUBLICO: ItemMenu = { rotulo: 'Página pública', caminho: '/publico', Icone: Globe, novaAba: true }

export const PAGINA_INICIAL: Record<Perfil, string> = {
  recepcionista_ubs: '/ubs/fila',
  assistente_cras: '/cras/agenda',
  gestora_creche: '/creche/lista',
}
