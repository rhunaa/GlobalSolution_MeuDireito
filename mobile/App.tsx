import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PreferenciasContext } from './src/components/ui'
import Capa from './src/screens/Capa'
import Login from './src/screens/Login'
import Passos from './src/screens/Passos'
import Principal from './src/screens/Principal'
import { armazenamento } from './src/services/armazenamento'
import { cores } from './src/theme/cores'
import type { Cidadao } from './src/types'

type Etapa = 'capa' | 'login' | 'passos' | 'app'
const CHAVE = 'meu-direito:app:cidadao'

function lerSessao(): Cidadao | null {
  try {
    const bruto = armazenamento.get(CHAVE)
    return bruto ? (JSON.parse(bruto) as Cidadao) : null
  } catch {
    return null
  }
}

export default function App() {
  const [fontesProntas] = useFonts({ Montserrat_300Light, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold })
  const [cidadao, setCidadao] = useState<Cidadao | null>(lerSessao)
  const [etapa, setEtapa] = useState<Etapa>(() => (lerSessao() ? 'app' : 'capa'))
  const [letrasGrandes, setLetrasGrandes] = useState(false)

  if (!fontesProntas) return <View style={{ flex: 1, backgroundColor: cores.fundo }} />

  return (
    <SafeAreaProvider>
      <PreferenciasContext.Provider value={{ letrasGrandes }}>
        <StatusBar style="dark" />
        {etapa === 'capa' && <Capa aoComecar={() => setEtapa('login')} />}
        {etapa === 'login' && (
          <Login
            aoVoltar={() => setEtapa('capa')}
            aoEntrar={(c) => {
              armazenamento.set(CHAVE, JSON.stringify(c))
              setCidadao(c)
              setEtapa('passos')
            }}
          />
        )}
        {etapa === 'passos' && <Passos aoTerminar={() => setEtapa('app')} />}
        {etapa === 'app' && cidadao && (
          <Principal
            cidadao={cidadao}
            letrasGrandes={letrasGrandes}
            aoMudarLetras={setLetrasGrandes}
            aoRever={() => setEtapa('passos')}
            aoSair={() => {
              armazenamento.set(CHAVE, '')
              setCidadao(null)
              setEtapa('capa')
            }}
          />
        )}
      </PreferenciasContext.Provider>
    </SafeAreaProvider>
  )
}
