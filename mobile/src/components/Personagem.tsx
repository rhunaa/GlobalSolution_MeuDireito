import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg'

/**
 * Personagens da primeira tela: bustos planos, desenhados para o Meu Direito,
 * em formas coloridas. Retratam a diversidade de quem usa os serviços
 * (com destaque para pessoas negras). Só decoração.
 */

type Fundo = 'estrela' | 'nuvem' | 'arco' | 'trevo' | 'circulo' | 'quadrado'
type Cabelo = 'curto' | 'afro' | 'coques' | 'turbante' | 'cacheado-grisalho' | 'careca' | 'tranças' | 'bob-franja' | 'longo'

export interface PersonagemProps {
  fundo: Fundo
  corFundo: string
  pele: string
  cabelo: Cabelo
  corCabelo: string
  roupa: string
  barba?: boolean
  oculos?: boolean
  sorriso?: 'aberto' | 'suave'
  /** Olhos amendoados (pessoas de origem asiática). */
  amendoado?: boolean
  sardas?: boolean
  /** Cordão com crachá do símbolo do infinito colorido (neurodiversidade / autismo). */
  crachaAutismo?: boolean
  largura?: number
}

const ESCURO = '#1a2328'

function FormaFundo({ tipo, cor }: { tipo: Fundo; cor: string }) {
  switch (tipo) {
    case 'estrela':
      return (
        <G fill={cor}>
          <Rect x="82" y="8" width="36" height="184" rx="12" />
          <Rect x="82" y="8" width="36" height="184" rx="12" transform="rotate(60 100 100)" />
          <Rect x="82" y="8" width="36" height="184" rx="12" transform="rotate(120 100 100)" />
        </G>
      )
    case 'nuvem':
      return (
        <G fill={cor}>
          <Circle cx="100" cy="58" r="50" />
          <Circle cx="100" cy="142" r="50" />
          <Circle cx="58" cy="100" r="42" />
          <Circle cx="142" cy="100" r="42" />
          <Rect x="58" y="58" width="84" height="84" />
        </G>
      )
    case 'arco':
      return <Path d="M30 200V88a70 70 0 0 1 140 0v112Z" fill={cor} />
    case 'trevo':
      return (
        <G fill={cor}>
          <Circle cx="66" cy="66" r="48" />
          <Circle cx="134" cy="66" r="48" />
          <Circle cx="66" cy="134" r="48" />
          <Circle cx="134" cy="134" r="48" />
          <Rect x="66" y="66" width="68" height="68" />
        </G>
      )
    case 'circulo':
      return <Circle cx="100" cy="100" r="94" fill={cor} />
    default:
      return <Rect x="10" y="10" width="180" height="180" rx="38" fill={cor} />
  }
}

function CabeloAtras({ tipo, cor }: { tipo: Cabelo; cor: string }) {
  if (tipo === 'afro') return <Circle cx="100" cy="78" r="47" fill={cor} />
  if (tipo === 'bob-franja') return <Path d="M62 86C56 128 66 140 76 140h48c10 0 20-12 14-54Z" fill={cor} />
  if (tipo === 'longo') return <Path d="M62 82C54 132 60 168 76 176h48c16-8 22-44 14-94Z" fill={cor} />
  if (tipo === 'cacheado-grisalho')
    return (
      <G fill={cor}>
        {[
          [64, 80, 20],
          [74, 56, 22],
          [100, 46, 24],
          [126, 56, 22],
          [136, 80, 20],
        ].map(([x, y, r]) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </G>
    )
  if (tipo === 'coques')
    return (
      <G fill={cor}>
        <Circle cx="64" cy="54" r="18" />
        <Circle cx="136" cy="54" r="18" />
      </G>
    )
  if (tipo === 'tranças')
    return (
      <G fill={cor}>
        <Rect x="62" y="80" width="12" height="58" rx="6" />
        <Rect x="126" y="80" width="12" height="58" rx="6" />
        <Circle cx="68" cy="140" r="7" />
        <Circle cx="132" cy="140" r="7" />
      </G>
    )
  return null
}

function CabeloFrente({ tipo, cor }: { tipo: Cabelo; cor: string }) {
  switch (tipo) {
    case 'curto':
      return <Path d="M68 86C64 52 92 44 106 46c20 2 28 20 26 40-6-14-18-22-32-22-14 0-24 8-32 22Z" fill={cor} />
    case 'afro':
    case 'cacheado-grisalho':
      return <Path d="M70 84C68 62 84 52 100 52s32 10 30 32c-8-14-18-20-30-20s-22 6-30 20Z" fill={cor} />
    case 'coques':
    case 'tranças':
      return <Path d="M68 86C66 56 86 48 100 48s34 8 32 38c-8-16-18-24-32-24S76 70 68 86Z" fill={cor} />
    case 'bob-franja':
      return <Path d="M65 86C62 48 92 40 104 42c24 4 32 26 30 44V74H66Z" fill={cor} />
    case 'longo':
      return <Path d="M66 86C62 52 86 42 102 44c22 4 34 24 32 42-8-18-20-26-32-26-14 0-26 8-36 26Z" fill={cor} />
    case 'turbante':
      return (
        <G>
          <Path d="M64 88C62 46 92 38 108 42c24 6 30 28 28 46-14-12-28-18-36-18s-22 6-36 18Z" fill={cor} />
          <Path d="M70 76c20-14 44-14 62 0M72 66c18-10 40-10 56 0" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
          <Circle cx="128" cy="46" r="11" fill={cor} />
          <Path d="M120 46h16" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
        </G>
      )
    default:
      return null
  }
}

/** Busto estilizado (cabeça e ombros) sobre uma forma colorida. */
export function Personagem({ fundo, corFundo, pele, cabelo, corCabelo, roupa, barba, oculos, sorriso = 'aberto', amendoado, sardas, crachaAutismo, largura = 120 }: PersonagemProps) {
  return (
    <Svg viewBox="0 0 200 200" width={largura} height={largura}>
      <FormaFundo tipo={fundo} cor={corFundo} />
      <CabeloAtras tipo={cabelo} cor={corCabelo} />
      {/* ombros e pescoço */}
      <Path d="M26 200c0-34 20-54 58-58h32c38 4 58 24 58 58Z" fill={roupa} />
      <Path d="M86 126h28v22q-14 10-28 0Z" fill={pele} />
      <Path d="M86 126h28v22q-14 10-28 0Z" fill="#000" fillOpacity="0.1" />
      <Path d="M84 142q16 14 32 0l8 6q-24 22-48 0Z" fill="#ffffff" fillOpacity="0.28" />
      {/* orelhas e cabeça */}
      <Circle cx="68" cy="96" r="7" fill={pele} />
      <Circle cx="132" cy="96" r="7" fill={pele} />
      <Ellipse cx="100" cy="92" rx="32" ry="38" fill={pele} />
      <CabeloFrente tipo={cabelo} cor={corCabelo} />
      {barba && <Path d="M69 100c0 28 14 40 31 40s31-12 31-40c-6 14-16 20-31 20s-25-6-31-20Z" fill={corCabelo} />}
      {/* rosto */}
      {amendoado ? (
        <G fill={ESCURO}>
          <Ellipse cx="88" cy="94" rx="4.2" ry="2" transform="rotate(-9 88 94)" />
          <Ellipse cx="112" cy="94" rx="4.2" ry="2" transform="rotate(9 112 94)" />
        </G>
      ) : (
        <G fill={ESCURO}>
          <Circle cx="88" cy="94" r="2.8" />
          <Circle cx="112" cy="94" r="2.8" />
        </G>
      )}
      {sardas && (
        <G fill="#b8683a" opacity="0.7">
          {[[80, 104], [86, 107], [92, 104], [108, 104], [114, 107], [120, 104]].map(([x, y]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r="1.5" />
          ))}
        </G>
      )}
      <Path d="M82 84q6-4 12 0M106 84q6-4 12 0" fill="none" stroke={ESCURO} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
      <Path d="M100 98q-3 8 1 10" fill="none" stroke={ESCURO} strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />
      {sorriso === 'aberto' ? (
        <Path d="M89 112q11 11 22 0Z" fill="#ffffff" stroke={ESCURO} strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <Path d="M90 113q10 7 20 0" fill="none" stroke={ESCURO} strokeWidth="2.4" strokeLinecap="round" />
      )}
      {crachaAutismo && (
        <G>
          <Defs>
            <LinearGradient id="arco-iris-neuro" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#e5484d" />
              <Stop offset="20%" stopColor="#f5a54a" />
              <Stop offset="40%" stopColor="#f0d23c" />
              <Stop offset="60%" stopColor="#3fb273" />
              <Stop offset="80%" stopColor="#3b82f6" />
              <Stop offset="100%" stopColor="#8b5cf6" />
            </LinearGradient>
          </Defs>
          {/* cordão */}
          <Path d="M82 140 92 164M118 140 108 164" stroke="#f5c065" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          {/* crachá com o infinito colorido */}
          <Rect x="76" y="162" width="48" height="38" rx="7" fill="#ffffff" stroke="#1a2328" strokeOpacity="0.3" strokeWidth="1.6" />
          <Rect x="91" y="157" width="18" height="10" rx="3.5" fill="#1a2328" fillOpacity="0.75" />
          <Path d="M84 184C84 175 94 175 100 184C106 193 116 193 116 184C116 175 106 175 100 184C94 193 84 193 84 184Z" fill="none" stroke="url(#arco-iris-neuro)" strokeWidth="4.4" strokeLinecap="round" />
        </G>
      )}
      {oculos && (
        <G fill="none" stroke={ESCURO} strokeWidth="2.6">
          <Circle cx="88" cy="94" r="11" />
          <Circle cx="112" cy="94" r="11" />
          <Path d="M99 93h2" />
        </G>
      )}
    </Svg>
  )
}

/** Conjunto usado na primeira tela (pessoas negras, brancas e amarelas). */
export const ELENCO: PersonagemProps[] = [
  // 0 homem negro, óculos e barba
  { fundo: 'estrela', corFundo: '#b25be0', pele: '#6b4430', cabelo: 'curto', corCabelo: '#1a1410', roupa: '#8db0ff', barba: true, oculos: true },
  // 1 mulher negra, turbante
  { fundo: 'nuvem', corFundo: '#8fb4f0', pele: '#7a4d34', cabelo: 'turbante', corCabelo: '#d9558c', roupa: '#ffffff', sorriso: 'suave' },
  // 2 mulher negra, coques e óculos
  { fundo: 'arco', corFundo: '#f08fa5', pele: '#5c3a28', cabelo: 'coques', corCabelo: '#1a1410', roupa: '#f5c065', oculos: true },
  // 3 homem branco ruivo, sardas, com o crachá do infinito colorido (autismo)
  { fundo: 'trevo', corFundo: '#ffab57', pele: '#f2cfb0', cabelo: 'curto', corCabelo: '#c2561f', roupa: '#3b4c70', sardas: true, sorriso: 'suave', crachaAutismo: true },
  // 4 mulher amarela (asiática), cabelo liso com franja
  { fundo: 'circulo', corFundo: '#c6b6f2', pele: '#f3d28c', cabelo: 'bob-franja', corCabelo: '#14100e', roupa: '#d9455c', amendoado: true },
  // 5 menina negra, tranças
  { fundo: 'quadrado', corFundo: '#f5c065', pele: '#5c3a28', cabelo: 'tranças', corCabelo: '#1a1410', roupa: '#a3305f' },
  // 6 mulher branca loira
  { fundo: 'circulo', corFundo: '#ff9f8a', pele: '#f6d5bd', cabelo: 'longo', corCabelo: '#e8c26a', roupa: '#1b2a4a' },
  // 7 homem amarelo (asiático), óculos e cabelo grisalho
  { fundo: 'quadrado', corFundo: '#9fd8e8', pele: '#f0cf8a', cabelo: 'curto', corCabelo: '#9aa3a8', roupa: '#1c7445', oculos: true, amendoado: true, sorriso: 'suave' },
]


const MULHERES = [1, 2, 4, 6]
const HOMENS = [0, 3, 7]

/** Escolhe um personagem coerente com o primeiro nome (demonstração). */
export function avatarDe(c: { id: string; nome: string }): number {
  const primeiro = c.nome.split(' ')[0]
  const mulher = /a$/i.test(primeiro) || primeiro === 'Edilene'
  const grupo = mulher ? MULHERES : HOMENS
  return grupo[(parseInt(c.id.slice(-3), 10) || 0) % grupo.length]
}
