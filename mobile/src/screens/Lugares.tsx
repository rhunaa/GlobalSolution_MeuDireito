import { Accessibility, Clock, MapPin } from 'lucide-react-native'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { BolinhaServico, Chip } from '../components/Pecas'
import { Aparece, Botao, Cabecalho, Cartao, Texto } from '../components/ui'
import { cores } from '../theme/cores'
import { PLURAL_SERVICO } from '../theme/rotulos'
import type { TipoUnidade } from '../types'
import { duracaoPorExtenso, formatarDuracao } from '../utils/datas'
import type { Contexto } from './tipos'

export default function Lugares({ c }: { c: Contexto }) {
  const [filtro, setFiltro] = useState<'todos' | TipoUnidade>('todos')
  const { unidades, movimento } = c.jornada
  const lista = unidades.filter((u) => filtro === 'todos' || u.tipo === filtro)

  return (
    <View style={{ gap: 14 }}>
      <Cabecalho titulo="Lugares" sub="UBS, CRAS e creches e como está o movimento agora." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip rotulo="Todos" ativo={filtro === 'todos'} aoPressionar={() => setFiltro('todos')} />
        {(['ubs', 'cras', 'creche'] as TipoUnidade[]).map((t) => (
          <Chip key={t} rotulo={PLURAL_SERVICO[t]} ativo={filtro === t} aoPressionar={() => setFiltro(t)} />
        ))}
      </ScrollView>
      {lista.map((u, k) => {
        const m = movimento.find((x) => x.unidade_id === u.id)
        const n = m?.aguardando ?? 0
        const texto =
          u.tipo === 'ubs'
            ? `${n} ${n === 1 ? 'pessoa aguardando' : 'pessoas aguardando'}${m?.tempo_estimado_min != null ? ` · espera de cerca de ${formatarDuracao(m.tempo_estimado_min)}` : ''}`
            : u.tipo === 'cras'
              ? `${n} ${n === 1 ? 'atendimento agendado hoje' : 'atendimentos agendados hoje'}`
              : `${n} ${n === 1 ? 'família na lista' : 'famílias na lista'}`
        const falado = u.tipo === 'ubs' && m?.tempo_estimado_min != null ? texto.replace(formatarDuracao(m.tempo_estimado_min), duracaoPorExtenso(m.tempo_estimado_min)) : texto
        return (
          <Aparece key={u.id} atraso={Math.min(k, 6) * 50} y={10}>
            <Cartao style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <BolinhaServico tipo={u.tipo} />
                <View style={{ flex: 1 }}>
                  <Texto peso={800}>{u.nome}</Texto>
                  <Texto tamanho={13} cor={cores.suave}>
                    {u.bairro}
                  </Texto>
                </View>
              </View>
              <Texto accessibilityLabel={falado} peso={700} cor={cores.servico[u.tipo].forte}>
                {texto}
              </Texto>
              <View style={{ gap: 6 }}>
                <Linha Icone={MapPin} texto={u.endereco} />
                <Linha Icone={Clock} texto={u.horario} />
                <Linha
                  Icone={Accessibility}
                  texto={[u.acessibilidade.rampa && 'Rampa', u.acessibilidade.banheiro_adaptado && 'Banheiro adaptado', u.acessibilidade.libras && 'Libras'].filter(Boolean).join(' · ') || 'Sem recursos de acessibilidade informados'}
                />
              </View>
              {u.tipo === 'ubs' && <Botao variante="suave" rotulo="Pegar senha aqui" aoPressionar={() => c.ir({ nome: 'pegarSenha', unidadeId: u.id })} />}
              {u.tipo === 'cras' && <Botao variante="suave" rotulo="Agendar aqui" aoPressionar={() => c.ir({ nome: 'agendar' })} />}
            </Cartao>
          </Aparece>
        )
      })}
    </View>
  )
}

function Linha({ Icone, texto }: { Icone: typeof MapPin; texto: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <Icone size={16} color={cores.suave} style={{ marginTop: 3 }} />
      <Texto tamanho={14} cor={cores.suave} style={{ flex: 1 }}>
        {texto}
      </Texto>
    </View>
  )
}
