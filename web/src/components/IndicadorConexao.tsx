import { CloudOff, RefreshCw, Wifi } from 'lucide-react'
import { useStatusConexao } from '../hooks/useStatusConexao'

const VISUAL = {
  ao_vivo: { texto: 'Ao vivo', Icone: Wifi, classe: 'text-[var(--status-concluida)]' },
  conectando: { texto: 'Conectando…', Icone: RefreshCw, classe: 'text-[var(--status-aguardando)]' },
  reconectando: { texto: 'Reconectando…', Icone: RefreshCw, classe: 'text-[var(--status-aguardando)]' },
  offline: { texto: 'Sem internet', Icone: CloudOff, classe: 'text-[var(--status-nao-compareceu)]' },
} as const

/** Indicador discreto de conexão em tempo real: ícone + texto (nunca só cor). */
export function IndicadorConexao() {
  const estado = useStatusConexao()
  const { texto, Icone, classe } = VISUAL[estado]
  return (
    <span role="status" className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold ${classe}`}>
      <Icone aria-hidden="true" size={16} className={estado === 'reconectando' || estado === 'conectando' ? 'motion-safe:animate-spin' : ''} />
      <span>{texto}</span>
    </span>
  )
}
