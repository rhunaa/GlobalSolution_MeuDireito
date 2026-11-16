import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Logo } from '../components/Logo'
import { ELENCO, Personagem } from '../components/Personagem'
import { Aparece, Botao, Flutua, Texto } from '../components/ui'
import { cores } from '../theme/cores'

/** Tela inicial: frase de impacto e as pessoas que o Meu Direito atende. */
export default function Capa({ aoComecar }: { aoComecar: () => void }) {
  const { width } = useWindowDimensions()
  const l = Math.min(width, 420) - 40
  // posição dos personagens na colagem (frações da largura)
  const colagem = [
    { i: 0, x: 0.0, y: 0.1, t: 0.33, atraso: 0 },
    { i: 1, x: 0.62, y: 0.0, t: 0.36, atraso: 150 },
    { i: 3, x: 0.33, y: 0.3, t: 0.38, atraso: 300 },
    { i: 4, x: 0.02, y: 0.58, t: 0.3, atraso: 450 },
    { i: 7, x: 0.66, y: 0.6, t: 0.31, atraso: 600 },
  ]
  return (
    <SafeAreaView style={s.tela}>
      <View style={[s.miolo, { width: l + 40 }]}>
        <Aparece>
          <Logo tamanho={40} />
        </Aparece>

        <View style={{ width: l, height: l * 0.92, alignSelf: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[s.bolha, { width: l * 0.8, height: l * 0.8, left: l * 0.1, top: l * 0.08 }]} />
          {colagem.map((c) => (
            <Aparece key={c.i} atraso={c.atraso} y={24} style={{ position: 'absolute', left: c.x * l, top: c.y * l }}>
              <Flutua atraso={c.atraso} amplitude={5 + (c.i % 3)} duracao={2200 + c.i * 250}>
                <Personagem {...ELENCO[c.i]} largura={c.t * l} />
              </Flutua>
            </Aparece>
          ))}
        </View>

        <View style={{ gap: 14 }}>
          <Aparece atraso={700}>
            <Texto accessibilityRole="header" peso={600} tamanho={32} cor={cores.marca} style={{ lineHeight: 40 }}>
              O direito já existe.
            </Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <Texto peso={600} tamanho={32} cor={cores.marca} style={{ lineHeight: 40 }}>
                O que falta é
              </Texto>
              <View style={s.chip}>
                <Texto peso={600} tamanho={32} cor="#fff" style={{ lineHeight: 40 }}>
                  o caminho
                </Texto>
              </View>
              <Texto peso={600} tamanho={32} cor={cores.marca} style={{ lineHeight: 40 }}>
                até ele.
              </Texto>
            </View>
          </Aparece>
          <Aparece atraso={900}>
            <Texto peso={300} tamanho={17} cor={cores.suave}>
              Descubra seus direitos, pegue senha e agende atendimento. Tudo no seu celular, em linguagem simples.
            </Texto>
          </Aparece>
        </View>

        <Aparece atraso={1100}>
          <Botao rotulo="Entrar" aoPressionar={aoComecar} />
        </Aparece>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center' },
  miolo: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, justifyContent: 'space-between' },
  bolha: { position: 'absolute', borderRadius: 16, backgroundColor: '#E8EDF8' },
  chip: { backgroundColor: cores.marca, borderRadius: 6, paddingHorizontal: 10 },
})
