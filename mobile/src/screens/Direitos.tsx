import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react-native'
import { useState } from 'react'
import { Linking, Pressable, View } from 'react-native'
import { BolinhaServico, Caixa } from '../components/Pecas'
import { Aparece, Botao, Cabecalho, Cartao, Selo, Texto, Titulo } from '../components/ui'
import { cores } from '../theme/cores'
import { NOME_SERVICO, STATUS_DIREITO } from '../theme/rotulos'
import type { Contexto } from './tipos'

export function Direitos({ c }: { c: Contexto }) {
  const { jornada } = c
  return (
    <View style={{ gap: 12 }}>
      <Cabecalho titulo="Seus direitos" sub="Toque em um direito para ver o que fazer, passo a passo." />
      {jornada.direitos.map((d, k) => {
        const st = jornada.meusDireitos.find((x) => x.direito_id === d.id)?.status
        return (
          <Aparece key={d.id} atraso={k * 60} y={10}>
            <Pressable accessibilityRole="button" accessibilityLabel={`${d.nome}. ${st ? STATUS_DIREITO[st].rotulo : 'Veja se você tem direito'}`} onPress={() => c.ir({ nome: 'direito', id: d.id })}>
              <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <BolinhaServico tipo={d.tipo_unidade} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Texto peso={600}>{d.nome}</Texto>
                  <Selo rotulo={st ? STATUS_DIREITO[st].rotulo : 'Veja se é seu'} tom={st ? STATUS_DIREITO[st].tom : 'neutro'} />
                </View>
                <ChevronRight size={20} color={cores.suave} />
              </Cartao>
            </Pressable>
          </Aparece>
        )
      })}
    </View>
  )
}

export function DetalheDireito({ c, id, aoFechar }: { c: Contexto; id: string; aoFechar: () => void }) {
  const d = c.jornada.direitos.find((x) => x.id === id)
  const [tenho, setTenho] = useState<string[]>([])
  if (!d) return null
  const st = c.jornada.meusDireitos.find((x) => x.direito_id === d.id)?.status
  const acao =
    d.tipo_unidade === 'ubs'
      ? { rotulo: 'Pegar senha na UBS', ir: () => c.ir({ nome: 'pegarSenha' }) }
      : d.tipo_unidade === 'cras'
        ? { rotulo: 'Agendar no CRAS', ir: () => c.ir({ nome: 'agendar', direitoId: d.id }) }
        : { rotulo: 'Ver creches perto de você', ir: () => { aoFechar(); c.irParaAba('lugares') } }
  return (
    <View style={{ gap: 18 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={aoFechar} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', minHeight: 44 }}>
        <ChevronLeft size={22} color={cores.marca} />
        <Texto peso={700} cor={cores.marca}>
          Voltar
        </Texto>
      </Pressable>
      <Aparece style={{ gap: 12 }}>
        <BolinhaServico tipo={d.tipo_unidade} tamanho={56} />
        <Titulo tamanho={26}>{d.nome}</Titulo>
        <Selo rotulo={st ? STATUS_DIREITO[st].rotulo : `Atendimento: ${NOME_SERVICO[d.tipo_unidade]}`} tom={st ? STATUS_DIREITO[st].tom : 'neutro'} />
      </Aparece>
      <Cartao style={{ gap: 6 }}>
        <Texto peso={800} cor={cores.marca}>
          O que é
        </Texto>
        <Texto>{d.descricao_simples}</Texto>
      </Cartao>
      <Cartao style={{ gap: 6 }}>
        <Texto peso={800} cor={cores.marca}>
          Quem pode
        </Texto>
        <Texto>{d.quem_pode}</Texto>
      </Cartao>
      <Cartao style={{ gap: 4 }}>
        <Texto peso={800} cor={cores.marca}>
          O que levar
        </Texto>
        <Texto tamanho={13} cor={cores.suave}>
          Marque o que você já tem.
        </Texto>
        {d.documentos.map((doc) => (
          <Caixa key={doc} rotulo={doc} marcado={tenho.includes(doc)} aoMudar={(v) => setTenho(v ? [...tenho, doc] : tenho.filter((x) => x !== doc))} />
        ))}
        <Texto peso={700} tamanho={14} cor={tenho.length === d.documentos.length ? cores.sucesso : cores.suave}>
          {tenho.length} de {d.documentos.length} documentos
        </Texto>
      </Cartao>
      <Botao rotulo={acao.rotulo} aoPressionar={acao.ir} />
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(d.fonte_oficial)} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', minHeight: 44 }}>
        <ExternalLink size={16} color={cores.suave} />
        <Texto tamanho={14} cor={cores.suave} style={{ textDecorationLine: 'underline' }}>
          Ver fonte oficial
        </Texto>
      </Pressable>
    </View>
  )
}
