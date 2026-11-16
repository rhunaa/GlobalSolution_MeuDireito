import { Switch, View } from 'react-native'
import { ELENCO, Personagem } from '../components/Personagem'
import { Aparece, Botao, Cartao, Texto, Titulo } from '../components/ui'
import { backend } from '../state/dados'
import { cores } from '../theme/cores'
import { idadeEmAnos } from '../utils/datas'
import type { Contexto } from './tipos'

export default function Perfil({ c, indice, letrasGrandes, aoMudarLetras, aoRever, aoSair }: { c: Contexto; indice: number; letrasGrandes: boolean; aoMudarLetras: (v: boolean) => void; aoRever: () => void; aoSair: () => void }) {
  const p = c.cidadao
  return (
    <View style={{ gap: 16 }}>
      <Aparece style={{ alignItems: 'center', gap: 8 }}>
        <Personagem {...ELENCO[indice]} largura={120} />
        <Titulo tamanho={24} style={{ textAlign: 'center' }}>
          {p.nome}
        </Titulo>
        <Texto cor={cores.suave}>
          {p.bairro} · {idadeEmAnos(p.data_nascimento)} anos
        </Texto>
      </Aparece>
      <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Texto peso={600}>Letras grandes</Texto>
          <Texto tamanho={13} cor={cores.suave}>
            Aumenta o tamanho dos textos no app.
          </Texto>
        </View>
        <Switch accessibilityLabel="Letras grandes" value={letrasGrandes} onValueChange={aoMudarLetras} trackColor={{ true: cores.marca, false: '#C9D2EA' }} />
      </Cartao>
      <Botao variante="suave" rotulo="Rever o passo a passo" aoPressionar={aoRever} />
      {backend.restaurarDemo && (
        <Botao
          variante="contorno"
          rotulo="Restaurar dados de exemplo"
          aoPressionar={async () => {
            await backend.restaurarDemo?.()
            c.avisar('Dados de exemplo restaurados.')
          }}
        />
      )}
      <Botao variante="perigo" rotulo="Sair" aoPressionar={aoSair} />
    </View>
  )
}
