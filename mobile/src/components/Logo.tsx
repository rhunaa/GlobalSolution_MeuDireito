import { View } from 'react-native'
import Svg, { Circle, G, Path, Rect } from 'react-native-svg'
import { cores } from '../theme/cores'
import { Texto } from './ui'

interface Props {
  tamanho?: number
  soIcone?: boolean
  comLema?: boolean
}

/** Balança da justiça (símbolo da logo). */
export function Simbolo({ tamanho = 40 }: { tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="26" fill={cores.marca} />
      <G fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M50 26v50" />
        <Path d="M36 78h28" />
        <Path d="M20 38h60" />
        <Path d="M24 38 15 60M24 38l9 22" />
        <Path d="M76 38l-9 22M76 38l9 22" />
      </G>
      <Circle cx="50" cy="20" r="5.5" fill="#fff" />
      <Path d="M12 60a12.5 12.5 0 0 0 25 0Z" fill={cores.ouro} />
      <Path d="M63 60a12.5 12.5 0 0 0 25 0Z" fill={cores.ouro} />
    </Svg>
  )
}

export function Logo({ tamanho = 40, soIcone = false, comLema = false }: Props) {
  if (soIcone) return <Simbolo tamanho={tamanho} />
  return (
    <View accessible accessibilityLabel="Meu Direito" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Simbolo tamanho={tamanho} />
      <View>
        <Texto style={{ fontSize: tamanho * 0.58, lineHeight: tamanho * 0.7, color: cores.marca }}>
          <Texto peso={300} style={{ fontSize: tamanho * 0.58, color: cores.marca }}>Meu</Texto>
          <Texto peso={700} style={{ fontSize: tamanho * 0.58, color: cores.marca }}>Direito</Texto>
        </Texto>
        {comLema && (
          <Texto peso={600} style={{ fontSize: 9, letterSpacing: 2, color: '#4A5878', textTransform: 'uppercase', marginTop: 2 }}>
            Seus direitos, simples
          </Texto>
        )}
      </View>
    </View>
  )
}
