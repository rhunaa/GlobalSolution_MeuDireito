import { CircleCheck, X } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, Switch, View } from 'react-native'
import { Caixa, Chip, Opcao } from '../components/Pecas'
import { Aparece, Botao, Cartao, Texto, Titulo } from '../components/ui'
import { backend } from '../state/dados'
import { useLocalizacao } from '../state/localizacao'
import { distanciaKm, LIMITE_KM_SENHA, textoDistancia } from '../utils/distancia'
import { cores } from '../theme/cores'
import { MOTIVOS } from '../theme/rotulos'
import type { MotivoSenha } from '../types'
import { hojeSP, isoEmSP } from '../utils/datas'
import type { Contexto } from './tipos'

function Moldura({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: React.ReactNode }) {
  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Titulo tamanho={26} style={{ flex: 1 }}>
          {titulo}
        </Titulo>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={aoFechar} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center' }}>
          <X size={22} color={cores.marca} />
        </Pressable>
      </View>
      {children}
    </View>
  )
}

function Pronto({ titulo, grande, texto, aoFechar }: { titulo: string; grande?: string; texto: string; aoFechar: () => void }) {
  return (
    <Aparece>
      <Cartao style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
        <CircleCheck size={48} color={cores.sucesso} />
        <Texto peso={800} tamanho={20} cor={cores.marca}>
          {titulo}
        </Texto>
        {grande && (
          <Texto accessibilityLabel={`Senha ${grande}`} peso={800} tamanho={56} cor={cores.servico.ubs.forte} style={{ lineHeight: 64 }}>
            {grande}
          </Texto>
        )}
        <Texto cor={cores.suave} style={{ textAlign: 'center' }}>
          {texto}
        </Texto>
        <Botao rotulo="Acompanhar no início" aoPressionar={aoFechar} style={{ marginTop: 8 }} />
      </Cartao>
    </Aparece>
  )
}

export function PegarSenha({ c, unidadeId, aoFechar }: { c: Contexto; unidadeId?: string; aoFechar: () => void }) {
  const ubs = c.jornada.unidades.filter((u) => u.tipo === 'ubs')
  const [un, setUn] = useState(unidadeId ?? ubs[0]?.id)
  const [motivo, setMotivo] = useState<MotivoSenha>('consulta')
  const [prioridade, setPrioridade] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [codigo, setCodigo] = useState<string | null>(null)
  const { local, buscar } = useLocalizacao()
  const km = (u: { latitude: number; longitude: number }) => (local.estado === 'ok' ? distanciaKm(local, u) : null)
  const unidadeEscolhida = ubs.find((u) => u.id === un)
  const kmEscolhida = unidadeEscolhida ? km(unidadeEscolhida) : null
  const longe = kmEscolhida !== null && kmEscolhida > LIMITE_KM_SENHA
  const semLocal = local.estado !== 'ok'

  async function enviar() {
    if (!un || semLocal || longe) return
    setEnviando(true)
    setErro(null)
    try {
      const s = await backend.emitirSenha({ unidadeId: un, motivo, prioridade, origem: 'app', cidadaoId: c.cidadao.id })
      setCodigo(s.codigo)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Moldura titulo="Pegar senha" aoFechar={aoFechar}>
      {codigo ? (
        <Pronto titulo="Senha emitida!" grande={codigo} texto="Sua senha já está na fila da UBS. Acompanhe na tela inicial e espere ser chamado." aoFechar={aoFechar} />
      ) : (
        <>
          <View style={{ gap: 8 }} accessibilityRole="radiogroup">
            <Texto peso={800} cor={cores.marca}>
              Em qual UBS?
            </Texto>
            {ubs.map((u) => {
              const n = c.jornada.movimento.find((m) => m.unidade_id === u.id)?.aguardando ?? 0
              const d = km(u)
              const fora = d !== null && d > LIMITE_KM_SENHA
              return (
                <Opcao
                  key={u.id}
                  rotulo={u.nome}
                  descricao={`${n} ${n === 1 ? 'pessoa aguardando' : 'pessoas aguardando'} agora${d !== null ? ` · a ${textoDistancia(d)} de você${fora ? ' (longe demais)' : ''}` : ''}`}
                  ativo={un === u.id}
                  desabilitado={fora}
                  aoPressionar={() => setUn(u.id)}
                />
              )
            })}
          </View>
          <View style={{ gap: 8 }} accessibilityRole="radiogroup">
            <Texto peso={800} cor={cores.marca}>
              Motivo
            </Texto>
            {(Object.keys(MOTIVOS) as MotivoSenha[]).map((m) => (
              <Opcao key={m} rotulo={MOTIVOS[m].rotulo} descricao={MOTIVOS[m].descricao} ativo={motivo === m} aoPressionar={() => setMotivo(m)} />
            ))}
          </View>
          <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <View style={{ flex: 1 }}>
              <Texto peso={600}>Atendimento prioritário</Texto>
              <Texto tamanho={13} cor={cores.suave}>
                Idosos, gestantes, pessoas com deficiência e com crianças de colo.
              </Texto>
            </View>
            <Switch accessibilityLabel="Atendimento prioritário" value={prioridade} onValueChange={setPrioridade} trackColor={{ true: cores.marca, false: '#C9D2EA' }} />
          </Cartao>
          <Cartao style={{ gap: 6, backgroundColor: longe || local.estado === 'negado' || local.estado === 'erro' ? cores.tom.falta.suave : cores.tom.chamada.suave }}>
            <View accessibilityLiveRegion="polite" style={{ gap: 6 }}>
              <Texto peso={700} cor={longe || local.estado === 'negado' || local.estado === 'erro' ? cores.tom.falta.forte : cores.tom.chamada.forte}>
                {local.estado === 'procurando' && 'Procurando sua localização…'}
                {local.estado === 'ok' && !longe && `Você está perto da unidade (limite de ${LIMITE_KM_SENHA} km).`}
                {local.estado === 'ok' && longe && 'Você está longe demais para pegar senha.'}
                {local.estado === 'negado' && 'Precisamos da sua localização.'}
                {local.estado === 'erro' && 'Não conseguimos achar sua localização.'}
              </Texto>
              <Texto tamanho={14} cor={cores.suave}>
                {local.estado === 'ok' && longe
                  ? `A senha pelo app só vale para quem está a até ${LIMITE_KM_SENHA} km da UBS. Assim a fila fica justa para quem está chegando. Escolha outra unidade ou vá até o local.`
                  : local.estado === 'negado' || local.estado === 'erro'
                    ? `Para pegar senha pelo app, confirmamos que você está a até ${LIMITE_KM_SENHA} km da UBS. Permita a localização e tente de novo.`
                    : `A senha pelo app só vale para quem está a até ${LIMITE_KM_SENHA} km da UBS.`}
              </Texto>
            </View>
            {(local.estado === 'negado' || local.estado === 'erro') && <Botao variante="suave" rotulo="Tentar de novo" aoPressionar={buscar} />}
          </Cartao>
          {erro && (
            <Texto accessibilityRole="alert" peso={700} cor={cores.perigo}>
              {erro}
            </Texto>
          )}
          <Botao rotulo="Pegar senha" carregando={enviando} desabilitado={semLocal || longe} aoPressionar={enviar} />
        </>
      )}
    </Moldura>
  )
}

const HORARIOS = Array.from({ length: 17 }, (_, i) => {
  const min = 8 * 60 + i * 30
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
})

export function Agendar({ c, direitoId, aoFechar }: { c: Contexto; direitoId?: string; aoFechar: () => void }) {
  const cras = c.jornada.unidades.filter((u) => u.tipo === 'cras')
  const direitos = c.jornada.direitos.filter((d) => d.tipo_unidade === 'cras')
  const [un, setUn] = useState(cras[0]?.id)
  const [dir, setDir] = useState(direitos.find((d) => d.id === direitoId)?.id ?? direitos[0]?.id)
  const [hora, setHora] = useState('14:00')
  const [docs, setDocs] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pronto, setPronto] = useState<string | null>(null)
  const direito = direitos.find((d) => d.id === dir)

  async function enviar() {
    if (!un || !direito) return
    setEnviando(true)
    setErro(null)
    try {
      await backend.criarAgendamento({ unidadeId: un, cidadaoId: c.cidadao.id, direitoId: direito.id, dataHora: isoEmSP(hojeSP(), hora), motivo: direito.nome, documentosConfirmados: docs })
      setPronto(`Hoje, às ${hora}: ${direito.nome} no ${cras.find((u) => u.id === un)?.nome}.`)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Moldura titulo="Agendar no CRAS" aoFechar={aoFechar}>
      {pronto ? (
        <Pronto titulo="Agendado!" texto={pronto} aoFechar={aoFechar} />
      ) : (
        <>
          <View style={{ gap: 8 }} accessibilityRole="radiogroup">
            <Texto peso={800} cor={cores.marca}>
              Qual direito?
            </Texto>
            {direitos.map((d) => (
              <Opcao key={d.id} rotulo={d.nome} ativo={dir === d.id} aoPressionar={() => { setDir(d.id); setDocs([]) }} />
            ))}
          </View>
          <View style={{ gap: 8 }} accessibilityRole="radiogroup">
            <Texto peso={800} cor={cores.marca}>
              Em qual CRAS?
            </Texto>
            {cras.map((u) => (
              <Opcao key={u.id} rotulo={u.nome} descricao={u.bairro} ativo={un === u.id} aoPressionar={() => setUn(u.id)} />
            ))}
          </View>
          <View style={{ gap: 8 }}>
            <Texto peso={800} cor={cores.marca}>
              Horário (hoje)
            </Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {HORARIOS.map((h) => (
                <Chip key={h} rotulo={h} ativo={hora === h} aoPressionar={() => setHora(h)} />
              ))}
            </View>
          </View>
          {direito && (
            <Cartao style={{ gap: 2 }}>
              <Texto peso={800} cor={cores.marca}>
                Documentos que você já tem
              </Texto>
              <Texto tamanho={13} cor={cores.suave}>
                A assistente social vê esta lista.
              </Texto>
              {direito.documentos.map((d) => (
                <Caixa key={d} rotulo={d} marcado={docs.includes(d)} aoMudar={(v) => setDocs(v ? [...docs, d] : docs.filter((x) => x !== d))} />
              ))}
            </Cartao>
          )}
          {erro && (
            <Texto accessibilityRole="alert" peso={700} cor={cores.perigo}>
              {erro}
            </Texto>
          )}
          <Botao rotulo="Agendar atendimento" carregando={enviando} aoPressionar={enviar} />
        </>
      )}
    </Moldura>
  )
}
