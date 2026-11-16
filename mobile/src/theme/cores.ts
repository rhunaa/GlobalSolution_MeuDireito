/** Cores do Meu Direito no app (mesmos valores de web/src/theme/tokens.css). */
export const cores = {
  fundo: '#F2F4FB',
  superficie: '#FFFFFF',
  superficie2: '#ECEFF9',
  texto: '#1A2328',
  suave: '#4F5D63',
  borda: '#E1E6F2',
  marca: '#1B2A4A',
  sobreMarca: '#FFFFFF',
  ouro: '#C9973F',
  foco: '#1F4FD1',
  sucesso: '#1E6B3A',
  perigo: '#A3201B',
  destaqueNovo: '#FFF3C4',
  servico: {
    ubs: { forte: '#1C7445', suave: '#E1F1E7' },
    cras: { forte: '#A1431A', suave: '#FBE8DD' },
    creche: { forte: '#A3305F', suave: '#F9E3EC' },
  },
  tom: {
    aguardando: { forte: '#7A4A00', suave: '#FCEFD6' },
    chamada: { forte: '#1E4FBF', suave: '#E3EAFB' },
    atendimento: { forte: '#5B3FA0', suave: '#EEE8F8' },
    concluida: { forte: '#1E6B3A', suave: '#E2F2E6' },
    falta: { forte: '#A13C0E', suave: '#FBE6DA' },
    negado: { forte: '#A3201B', suave: '#F9E0DE' },
    neutro: { forte: '#4F5D63', suave: '#ECEAE5' },
  },
} as const

export type Servico = keyof typeof cores.servico
export type Tom = keyof typeof cores.tom

export const raio = { pequeno: 6, medio: 10, grande: 12, pilula: 8 }

/** Sem sombra: só uma linha fina de borda, mais sóbrio. */
export const sombra = { borderWidth: 1, borderColor: '#DDE3F0' } as const

export type Peso = 300 | 400 | 500 | 600 | 700 | 800
export const FAMILIA: Record<Peso, string> = {
  300: 'Montserrat_300Light',
  400: 'Montserrat_400Regular',
  500: 'Montserrat_500Medium',
  600: 'Montserrat_600SemiBold',
  700: 'Montserrat_700Bold',
  800: 'Montserrat_800ExtraBold',
}
