import { Accessibility, HandCoins, Smartphone, Store, Stethoscope, Syringe, Pill, type LucideIcon } from 'lucide-react'
import type { MotivoSenha, OrigemSenha } from '../types'

export const MOTIVOS: Record<MotivoSenha, { rotulo: string; descricao: string; Icone: LucideIcon }> = {
  consulta: { rotulo: 'Consulta', descricao: 'Atendimento com médico ou enfermeiro', Icone: Stethoscope },
  vacina: { rotulo: 'Vacina', descricao: 'Vacinação e carteira de vacinas', Icone: Syringe },
  remedio: { rotulo: 'Retirar remédio', descricao: 'Farmácia da unidade', Icone: Pill },
}

export const ORIGENS: Record<OrigemSenha, { rotulo: string; Icone: LucideIcon }> = {
  app: { rotulo: 'App', Icone: Smartphone },
  balcao: { rotulo: 'Balcão', Icone: Store },
}

export const ICONE_PRIORIDADE = Accessibility
export const ICONE_ATENDIDOS = HandCoins
