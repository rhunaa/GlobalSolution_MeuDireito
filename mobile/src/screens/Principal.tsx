import { FileText, House, MapPin, User } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Logo } from '../components/Logo'
import { avatarDe } from '../components/Personagem'
import { Texto } from '../components/ui'
import { useJornada } from '../state/dados'
import { cores, sombra } from '../theme/cores'
import type { Cidadao } from '../types'
import { Agendar, PegarSenha } from './Acoes'
import { DetalheDireito, Direitos } from './Direitos'
import Inicio from './Inicio'
import Lugares from './Lugares'
import Perfil from './Perfil'
import type { Aba, Contexto, Tela } from './tipos'

const ABAS: { id: Aba; rotulo: string; Icone: typeof House }[] = [
  { id: 'inicio', rotulo: 'Início', Icone: House },
  { id: 'direitos', rotulo: 'Direitos', Icone: FileText },
  { id: 'lugares', rotulo: 'Lugares', Icone: MapPin },
  { id: 'perfil', rotulo: 'Perfil', Icone: User },
]

interface Props {
  cidadao: Cidadao
  letrasGrandes: boolean
  aoMudarLetras: (v: boolean) => void
  aoRever: () => void
  aoSair: () => void
}

/** App depois do login: abas, telas de ação por cima e avisos. */
export default function Principal({ cidadao, letrasGrandes, aoMudarLetras, aoRever, aoSair }: Props) {
  const { dados: jornada, erro } = useJornada(cidadao.id)
  const [aba, setAba] = useState<Aba>('inicio')
  const [pilha, setPilha] = useState<Tela[]>([])
  const [aviso, setAviso] = useState<string | null>(null)
  const [chave, setChave] = useState(0)
  const topo = pilha[pilha.length - 1]
  const slide = useRef(new Animated.Value(0)).current
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (topo) {
      slide.setValue(0)
      Animated.spring(slide, { toValue: 1, useNativeDriver: false, speed: 16, bounciness: 4 }).start()
    }
  }, [topo, slide])

  const avisar = useCallback((m: string) => {
    setAviso(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAviso(null), 3500)
  }, [])

  const ir = useCallback((t: Tela) => setPilha((p) => [...p, t]), [])
  const fechar = useCallback(() => {
    setPilha((p) => p.slice(0, -1))
    setChave((k) => k + 1)
  }, [])
  const irParaAba = useCallback((a: Aba) => {
    setPilha([])
    setAba(a)
    setChave((k) => k + 1)
  }, [])

  if (!jornada) {
    return (
      <SafeAreaView style={s.tela}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Logo tamanho={48} />
          <Texto cor={cores.suave} accessibilityLiveRegion="polite">
            {erro ?? 'Carregando…'}
          </Texto>
        </View>
      </SafeAreaView>
    )
  }

  const c: Contexto = { cidadao, jornada, ir, irParaAba, avisar }
  const indice = avatarDe(cidadao)

  return (
    <SafeAreaView style={s.tela}>
      <View style={s.topo}>
        <Logo tamanho={34} />
      </View>

      <ScrollView key={`${aba}-${chave}`} contentContainerStyle={{ padding: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {aba === 'inicio' && <Inicio c={c} indice={indice} />}
        {aba === 'direitos' && <Direitos c={c} />}
        {aba === 'lugares' && <Lugares c={c} />}
        {aba === 'perfil' && <Perfil c={c} indice={indice} letrasGrandes={letrasGrandes} aoMudarLetras={aoMudarLetras} aoRever={aoRever} aoSair={aoSair} />}
      </ScrollView>

      {/* Barra de abas */}
      <View style={s.barraFora} pointerEvents="box-none">
        <View style={s.barra} accessibilityRole="tablist">
          {ABAS.map(({ id, rotulo, Icone }) => {
            const ativa = aba === id
            return (
              <Pressable
                key={id}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativa }}
                accessibilityLabel={rotulo}
                onPress={() => irParaAba(id)}
                style={[s.aba, ativa && s.abaAtiva]}
              >
                <Icone size={22} color={ativa ? cores.marca : '#6B7785'} />
                <Texto peso={ativa ? 700 : 500} tamanho={12} cor={ativa ? cores.marca : '#6B7785'}>
                  {rotulo}
                </Texto>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* Tela de ação por cima das abas */}
      {topo && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: cores.fundo, opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
              {topo.nome === 'pegarSenha' && <PegarSenha c={c} unidadeId={topo.unidadeId} aoFechar={() => irParaAba('inicio')} />}
              {topo.nome === 'agendar' && <Agendar c={c} direitoId={topo.direitoId} aoFechar={() => irParaAba('inicio')} />}
              {topo.nome === 'direito' && <DetalheDireito c={c} id={topo.id} aoFechar={fechar} />}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      )}

      {aviso && (
        <View style={s.aviso} accessibilityLiveRegion="polite" accessibilityRole="alert">
          <Texto peso={700} cor="#fff" tamanho={14}>
            {aviso}
          </Texto>
        </View>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  barraFora: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barra: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: cores.borda, paddingBottom: 14, paddingTop: 6 },
  aba: { flex: 1, minHeight: 52, flexDirection: 'column', gap: 3, alignItems: 'center', justifyContent: 'center', borderTopWidth: 3, borderTopColor: 'transparent' },
  abaAtiva: { borderTopColor: cores.marca },
  aviso: { position: 'absolute', left: 20, right: 20, bottom: 84, backgroundColor: cores.marca, padding: 14, borderRadius: 10 },
})
