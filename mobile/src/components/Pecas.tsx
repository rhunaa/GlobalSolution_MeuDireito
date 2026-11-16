import { Baby, CalendarClock, Stethoscope } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { cores, raio, sombra, type Servico } from '../theme/cores'
import type { TipoUnidade } from '../types'
import { Bolinha, Texto } from './ui'

export function IconeServico({ tipo, tamanho = 22 }: { tipo: TipoUnidade; tamanho?: number }) {
  const cor = cores.servico[tipo].forte
  if (tipo === 'ubs') return <Stethoscope size={tamanho} color={cor} />
  if (tipo === 'cras') return <CalendarClock size={tamanho} color={cor} />
  return <Baby size={tamanho} color={cor} />
}

export function BolinhaServico({ tipo, tamanho = 46 }: { tipo: TipoUnidade; tamanho?: number }) {
  return (
    <Bolinha servico={tipo as Servico} tamanho={tamanho}>
      <IconeServico tipo={tipo} tamanho={tamanho * 0.48} />
    </Bolinha>
  )
}

/** Atalho quadrado (ícone, título, descrição curta). */
export function Atalho({ tipo, titulo, texto, aoPressionar }: { tipo: TipoUnidade; titulo: string; texto: string; aoPressionar: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${texto}`}
      onPress={aoPressionar}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 140,
        backgroundColor: '#fff',
        borderRadius: raio.grande,
        padding: 16,
        gap: 10,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        ...sombra,
      })}
    >
      <BolinhaServico tipo={tipo} />
      <View>
        <Texto peso={800} tamanho={16} cor={cores.marca}>
          {titulo}
        </Texto>
        <Texto tamanho={13} cor={cores.suave}>
          {texto}
        </Texto>
      </View>
    </Pressable>
  )
}

/** Opção selecionável (rádio) em forma de cartão. */
export function Opcao({ rotulo, descricao, ativo, aoPressionar, desabilitado }: { rotulo: string; descricao?: string; ativo: boolean; aoPressionar: () => void; desabilitado?: boolean }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: ativo, disabled: !!desabilitado }}
      accessibilityLabel={descricao ? `${rotulo}. ${descricao}` : rotulo}
      disabled={desabilitado}
      onPress={aoPressionar}
      style={{ opacity: desabilitado ? 0.55 : 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: raio.medio, borderWidth: 2, borderColor: ativo ? cores.marca : cores.borda, backgroundColor: ativo ? '#E3EAFB' : '#fff' }}
    >
      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: cores.marca, alignItems: 'center', justifyContent: 'center' }}>
        {ativo && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cores.marca }} />}
      </View>
      <View style={{ flex: 1 }}>
        <Texto peso={700}>{rotulo}</Texto>
        {descricao && (
          <Texto tamanho={13} cor={cores.suave}>
            {descricao}
          </Texto>
        )}
      </View>
    </Pressable>
  )
}

export function Chip({ rotulo, ativo, aoPressionar }: { rotulo: string; ativo: boolean; aoPressionar: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={aoPressionar}
      style={{ paddingHorizontal: 16, minHeight: 44, justifyContent: 'center', borderRadius: raio.pequeno, backgroundColor: ativo ? cores.marca : '#fff', borderWidth: 2, borderColor: ativo ? cores.marca : cores.borda }}
    >
      <Texto peso={700} tamanho={14} cor={ativo ? '#fff' : cores.marca}>
        {rotulo}
      </Texto>
    </Pressable>
  )
}

import { Check } from 'lucide-react-native'

export function Caixa({ rotulo, marcado, aoMudar }: { rotulo: string; marcado: boolean; aoMudar: (v: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado }}
      accessibilityLabel={rotulo}
      onPress={() => aoMudar(!marcado)}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 }}
    >
      <View style={{ width: 26, height: 26, borderRadius: 4, borderWidth: 2, borderColor: cores.marca, backgroundColor: marcado ? cores.marca : '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {marcado && <Check size={16} color="#fff" strokeWidth={3} />}
      </View>
      <Texto style={{ flex: 1 }}>{rotulo}</Texto>
    </Pressable>
  )
}
