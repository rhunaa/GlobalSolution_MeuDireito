/** Utilitários de data/hora no fuso de São Paulo (sem horário de verão desde 2019). */

const FUSO = 'America/Sao_Paulo'

/** 'AAAA-MM-DD' de hoje em São Paulo. */
export function hojeSP(base: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(base)
}

/** Soma dias a uma data 'AAAA-MM-DD'. */
export function somarDias(dia: string, dias: number): string {
  const d = new Date(`${dia}T12:00:00-03:00`)
  d.setUTCDate(d.getUTCDate() + dias)
  return hojeSP(d)
}

/** Instante (ISO) do início e do fim do dia em São Paulo. */
export function limitesDoDiaSP(dia: string = hojeSP()): { inicio: string; fim: string } {
  const inicio = new Date(`${dia}T00:00:00-03:00`)
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000)
  return { inicio: inicio.toISOString(), fim: fim.toISOString() }
}

/** Monta um ISO a partir de dia 'AAAA-MM-DD' e hora 'HH:MM' em São Paulo. */
export function isoEmSP(dia: string, hora: string): string {
  return new Date(`${dia}T${hora}:00-03:00`).toISOString()
}

export function minutosEntre(inicioIso: string, fimIso: string | Date = new Date()): number {
  const fim = typeof fimIso === 'string' ? new Date(fimIso) : fimIso
  return Math.max(0, Math.round((fim.getTime() - new Date(inicioIso).getTime()) / 60000))
}

/** "agora", "5 min", "1 h 20 min" */
export function formatarDuracao(minutos: number): string {
  if (minutos < 1) return 'menos de 1 min'
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

/** Versão por extenso para leitores de tela. */
export function duracaoPorExtenso(minutos: number): string {
  if (minutos < 1) return 'menos de um minuto'
  if (minutos < 60) return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  const horas = `${h} ${h === 1 ? 'hora' : 'horas'}`
  return m ? `${horas} e ${m} ${m === 1 ? 'minuto' : 'minutos'}` : horas
}

export function formatarHora(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatarData(dia: string): string {
  const [a, m, d] = dia.split('-')
  return `${d}/${m}/${a}`
}

export function formatarDataLonga(base: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'long', day: 'numeric', month: 'long' }).format(base)
}

/** Idade em anos e meses (útil para crianças da creche). */
export function idadeDescrita(dataNascimento: string, base: Date = new Date()): string {
  const nasc = new Date(`${dataNascimento}T12:00:00-03:00`)
  let meses = (base.getFullYear() - nasc.getFullYear()) * 12 + (base.getMonth() - nasc.getMonth())
  if (base.getDate() < nasc.getDate()) meses -= 1
  meses = Math.max(0, meses)
  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  if (anos === 0) return `${resto} ${resto === 1 ? 'mês' : 'meses'}`
  const a = `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  return resto ? `${a} e ${resto} ${resto === 1 ? 'mês' : 'meses'}` : a
}

export function idadeEmAnos(dataNascimento: string, base: Date = new Date()): number {
  const nasc = new Date(`${dataNascimento}T12:00:00-03:00`)
  let anos = base.getFullYear() - nasc.getFullYear()
  const m = base.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && base.getDate() < nasc.getDate())) anos -= 1
  return anos
}

/** "seg 03/11" a partir de 'AAAA-MM-DD'. */
export function diaCurto(dia: string): string {
  const d = new Date(`${dia}T12:00:00-03:00`)
  const sem = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'short' }).format(d).replace('.', '')
  const [, m, di] = dia.split('-')
  return `${sem} ${di}/${m}`
}
