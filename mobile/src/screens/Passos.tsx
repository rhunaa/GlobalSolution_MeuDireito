import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ELENCO, Personagem } from '../components/Personagem'
import { Botao, Flutua, Texto } from '../components/ui'
import { cores } from '../theme/cores'

const PASSOS = [
  {
    titulo: 'Descubra seus direitos',
    texto: 'Poucas informações e o app mostra quais direitos você pode ter, em palavras simples.',
    cor: '#E3EAFB',
    personagens: [0, 1],
  },
  {
    titulo: 'Saiba o que levar',
    texto: 'Cada direito vem com a lista de documentos. Marque o que você já tem e vá tranquilo.',
    cor: '#F9E3EC',
    personagens: [4, 5],
  },
  {
    titulo: 'Pegue senha sem fila',
    texto: 'Na UBS, pegue sua senha pelo celular e acompanhe quantas pessoas estão na sua frente.',
    cor: '#E1F1E7',
    personagens: [3, 7],
  },
  {
    titulo: 'Agende e acompanhe',
    texto: 'Marque horário no CRAS e acompanhe a vaga da creche. Tudo atualiza na hora.',
    cor: '#FBE8DD',
    personagens: [2, 6],
  },
]

/** Passo a passo de boas-vindas, com os personagens. */
export default function Passos({ aoTerminar }: { aoTerminar: () => void }) {
  const [i, setI] = useState(0)
  const { width } = useWindowDimensions()
  const l = Math.min(width, 420) - 40
  const entrada = useRef(new Animated.Value(0)).current
  const p = PASSOS[i]
  const ultimo = i === PASSOS.length - 1

  useEffect(() => {
    entrada.setValue(0)
    Animated.spring(entrada, { toValue: 1, useNativeDriver: false, speed: 12, bounciness: 8 }).start()
  }, [i, entrada])

  const mover = { opacity: entrada, transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }

  return (
    <SafeAreaView style={s.tela}>
      <View style={[s.miolo, { width: l + 40 }]}>
        <View style={s.topo}>
          <Texto peso={700} tamanho={14} cor={cores.suave}>
            Passo {i + 1} de {PASSOS.length}
          </Texto>
          {!ultimo && (
            <Pressable accessibilityRole="button" accessibilityLabel="Pular o passo a passo" onPress={aoTerminar} hitSlop={12}>
              <Texto peso={700} cor={cores.marca}>
                Pular
              </Texto>
            </Pressable>
          )}
        </View>

        <Animated.View style={[{ width: l, height: l * 0.86, alignSelf: 'center' }, mover]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[s.painel, { backgroundColor: p.cor }]} />
          <Flutua style={{ position: 'absolute', left: l * 0.04, top: l * 0.12 }} amplitude={6}>
            <Personagem {...ELENCO[p.personagens[0]]} largura={l * 0.5} />
          </Flutua>
          <Flutua style={{ position: 'absolute', right: l * 0.04, top: l * 0.32 }} amplitude={7} atraso={400} duracao={2900}>
            <Personagem {...ELENCO[p.personagens[1]]} largura={l * 0.46} />
          </Flutua>
        </Animated.View>

        <Animated.View style={[{ gap: 10 }, mover]} accessibilityLiveRegion="polite">
          <Texto accessibilityRole="header" peso={600} tamanho={28} cor={cores.marca} style={{ lineHeight: 36 }}>
            {p.titulo}
          </Texto>
          <Texto peso={300} tamanho={17} cor={cores.suave}>{p.texto}</Texto>
        </Animated.View>

        <View style={{ gap: 18 }}>
          <View style={s.pontos} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {PASSOS.map((_, k) => (
              <View key={k} style={[s.ponto, k === i && s.pontoAtivo]} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {i > 0 && <Botao largo={false} variante="suave" rotulo="Voltar" aoPressionar={() => setI(i - 1)} />}
            <Botao style={{ flex: 1 }} rotulo={ultimo ? 'Começar' : 'Próximo'} aoPressionar={() => (ultimo ? aoTerminar() : setI(i + 1))} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center' },
  miolo: { flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, justifyContent: 'space-between' },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 32 },
  painel: { ...StyleSheet.absoluteFill, borderRadius: 16 },
  pontos: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  ponto: { width: 8, height: 8, borderRadius: 2, backgroundColor: '#C9D2EA' },
  pontoAtivo: { width: 28, backgroundColor: cores.marca },
})
