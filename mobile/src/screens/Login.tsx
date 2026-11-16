import { Check, ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { avatarDe, ELENCO, Personagem } from '../components/Personagem'
import { Aparece, Botao, Texto, Titulo } from '../components/ui'
import { useCidadaos } from '../state/dados'
import { cores, raio, sombra } from '../theme/cores'
import type { Cidadao } from '../types'

/** Entrada de demonstração: a pessoa escolhe quem ela é. */
export default function Login({ aoVoltar, aoEntrar }: { aoVoltar: () => void; aoEntrar: (c: Cidadao) => void }) {
  const lista = useCidadaos()
  const [escolhido, setEscolhido] = useState<string | null>(null)
  const quem = lista?.find((c) => c.id === escolhido)

  return (
    <SafeAreaView style={s.tela}>
      <View style={s.topo}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={aoVoltar} style={s.voltar}>
          <ChevronLeft size={24} color={cores.marca} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130, gap: 10 }} showsVerticalScrollIndicator={false}>
        <Aparece>
          <Titulo>Quem é você?</Titulo>
          <Texto peso={300} tamanho={16} cor={cores.suave} style={{ marginTop: 6, marginBottom: 10 }}>
            Acesso de demonstração: escolha uma pessoa para entrar no app.
          </Texto>
        </Aparece>
        {lista?.map((c, k) => {
          const ativo = c.id === escolhido
          return (
            <Aparece key={c.id} atraso={Math.min(k, 8) * 50} y={10}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: ativo }}
                accessibilityLabel={`${c.nome}, ${c.bairro}`}
                onPress={() => setEscolhido(c.id)}
                style={[s.item, ativo && { borderColor: cores.marca, backgroundColor: '#E3EAFB' }]}
              >
                <Personagem {...ELENCO[avatarDe(c)]} largura={52} />
                <View style={{ flex: 1 }}>
                  <Texto peso={600}>{c.nome}</Texto>
                  <Texto tamanho={14} cor={cores.suave}>
                    {c.bairro}
                  </Texto>
                </View>
                {ativo && (
                  <View style={s.marca}>
                    <Check size={16} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            </Aparece>
          )
        })}
      </ScrollView>
      <View style={s.rodape}>
        <Botao rotulo={quem ? `Entrar como ${quem.nome.split(' ')[0]}` : 'Escolha uma pessoa'} desabilitado={!quem} aoPressionar={() => quem && aoEntrar(quem)} />
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { paddingHorizontal: 12, paddingTop: 6, height: 52, justifyContent: 'center' },
  voltar: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...sombra },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', padding: 12, borderRadius: raio.medio, borderWidth: 1, borderColor: cores.borda },
  marca: { width: 28, height: 28, borderRadius: 6, backgroundColor: cores.marca, alignItems: 'center', justifyContent: 'center' },
  rodape: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 28, backgroundColor: 'rgba(242,244,251,0.97)' },
})
