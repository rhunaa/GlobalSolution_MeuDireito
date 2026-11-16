import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native'
import { cores, FAMILIA, raio, sombra, type Peso, type Servico, type Tom } from '../theme/cores'

interface TextoProps extends TextProps {
  peso?: Peso
  tamanho?: number
  cor?: string
}

/** Texto com Montserrat; `peso` escolhe a variante da fonte. */
export const PreferenciasContext = createContext({ letrasGrandes: false })

export function Texto({ peso = 400, tamanho, cor, style, ...resto }: TextoProps) {
  const { letrasGrandes } = useContext(PreferenciasContext)
  const f = letrasGrandes ? 1.18 : 1
  const t = (tamanho ?? 16) * f
  const plano = StyleSheet.flatten(style) as TextStyle | undefined
  const tam = plano?.fontSize ? plano.fontSize * f : t
  return <Text {...resto} style={[{ fontFamily: FAMILIA[peso], color: cor ?? cores.texto, lineHeight: tam * 1.4 }, style, { fontSize: tam }, plano?.lineHeight ? { lineHeight: plano.lineHeight * f } : null]} />
}

/** Aparece suavemente (some o movimento se a pessoa pediu menos animação). */
export function Aparece({ children, atraso = 0, y = 16, style }: { children: React.ReactNode; atraso?: number; y?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 420, delay: atraso, useNativeDriver: false }).start()
  }, [v, atraso])
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  )
}

/** Flutua devagar para cima e para baixo. */
export function Flutua({ children, amplitude = 6, duracao = 2600, atraso = 0, style }: { children: React.ReactNode; amplitude?: number; duracao?: number; atraso?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duracao, delay: atraso, useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration: duracao, useNativeDriver: false }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [v, duracao, atraso])
  return <Animated.View style={[{ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] }) }] }, style]}>{children}</Animated.View>
}

export function Titulo({ children, tamanho = 28, style, ...r }: TextProps & { tamanho?: number }) {
  return (
    <Texto accessibilityRole="header" peso={600} tamanho={tamanho} style={[{ lineHeight: tamanho * 1.2, color: cores.marca }, style]} {...r}>
      {children}
    </Texto>
  )
}

interface BotaoProps {
  rotulo: string
  aoPressionar: () => void
  variante?: 'primario' | 'suave' | 'contorno' | 'perigo'
  carregando?: boolean
  desabilitado?: boolean
  icone?: React.ReactNode
  style?: StyleProp<ViewStyle>
  largo?: boolean
}

/** Botão grande (mínimo 52 px de altura), com leve "afundar" ao tocar. */
export function Botao({ rotulo, aoPressionar, variante = 'primario', carregando, desabilitado, icone, style, largo = true }: BotaoProps) {
  const escala = useRef(new Animated.Value(1)).current
  const mexer = (v: number) => Animated.spring(escala, { toValue: v, useNativeDriver: false, speed: 40, bounciness: 6 }).start()
  const est = {
    primario: { fundo: cores.marca, texto: '#fff', borda: cores.marca },
    suave: { fundo: '#E3EAFB', texto: cores.marca, borda: '#E3EAFB' },
    contorno: { fundo: 'transparent', texto: cores.marca, borda: cores.marca },
    perigo: { fundo: cores.tom.negado.suave, texto: cores.perigo, borda: cores.tom.negado.suave },
  }[variante]
  const [foco, setFoco] = useState(false)
  const off = desabilitado || carregando
  return (
    <Animated.View style={[{ transform: [{ scale: escala }] }, largo && { alignSelf: 'stretch' }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={rotulo}
        accessibilityState={{ disabled: !!off, busy: !!carregando }}
        disabled={off}
        onPress={aoPressionar}
        onPressIn={() => mexer(0.97)}
        onPressOut={() => mexer(1)}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        style={[
          s.botao,
          { backgroundColor: est.fundo, borderColor: est.borda, opacity: off ? 0.55 : 1 },
          foco && { borderColor: cores.foco, borderWidth: 3 },
        ]}
      >
        {icone}
        <Texto peso={700} tamanho={16} cor={est.texto}>
          {carregando ? 'Aguarde…' : rotulo}
        </Texto>
      </Pressable>
    </Animated.View>
  )
}

/** Cartão branco, bem arredondado, com sombra suave. */
export function Cartao({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.cartao, style]}>{children}</View>
}

/** Círculo pastel com ícone dentro. */
export function Bolinha({ servico, tom, tamanho = 44, children }: { servico?: Servico; tom?: Tom; tamanho?: number; children: React.ReactNode }) {
  const c = servico ? cores.servico[servico] : cores.tom[tom ?? 'neutro']
  return <View style={{ width: tamanho, height: tamanho, borderRadius: 10, backgroundColor: c.suave, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
}

/** Selo de status: cor + texto (nunca só cor). */
export function Selo({ rotulo, tom, icone }: { rotulo: string; tom: Tom; icone?: React.ReactNode }) {
  const c = cores.tom[tom]
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: c.suave, paddingHorizontal: 10, paddingVertical: 5, borderRadius: raio.pequeno }}>
      {icone}
      <Texto peso={700} tamanho={13} cor={c.forte}>
        {rotulo}
      </Texto>
    </View>
  )
}

export function Cabecalho({ titulo, sub }: { titulo: string; sub?: string }) {
  return (
    <View style={{ gap: 4, marginBottom: 16 }}>
      <Titulo tamanho={26}>{titulo}</Titulo>
      {sub && <Texto peso={300} cor={cores.suave} tamanho={16}>{sub}</Texto>}
    </View>
  )
}

export const estiloTexto: TextStyle = {}

const s = StyleSheet.create({
  botao: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: raio.pilula,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartao: { backgroundColor: cores.superficie, borderRadius: raio.grande, padding: 16, ...sombra },
})
