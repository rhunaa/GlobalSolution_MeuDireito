import { ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Atalho } from '../components/Pecas'
import { BolinhaServico } from '../components/Pecas'
import { ELENCO, Personagem } from '../components/Personagem'
import { Aparece, Botao, Cartao, Selo, Texto, Titulo } from '../components/ui'
import { backend } from '../state/dados'
import { cores } from '../theme/cores'
import { STATUS_AGENDAMENTO, STATUS_CRECHE, STATUS_DIREITO, STATUS_SENHA, MOTIVOS } from '../theme/rotulos'
import { formatarDataLonga, formatarDataHora, formatarHora } from '../utils/datas'
import type { Contexto } from './tipos'

const primeiraMaiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

function nomeUnidade(c: Contexto, id: string) {
  return c.jornada.unidades.find((u) => u.id === id)?.nome ?? ''
}

export default function Inicio({ c, indice }: { c: Contexto; indice: number }) {
  const { cidadao, jornada } = c
  const [ocupado, setOcupado] = useState<string | null>(null)
  const primeiroNome = cidadao.nome.split(' ')[0]

  const senha = jornada.minhasSenhas.find((s) => ['aguardando', 'chamada', 'em_atendimento'].includes(s.status))
  const agendamento = jornada.meusAgendamentos.find((a) => a.status === 'agendado') ?? jornada.meusAgendamentos[0]
  const creche = jornada.minhaCreche.find((i) => i.status === 'convocada') ?? jornada.minhaCreche.find((i) => i.status === 'aguardando')
  const algumaCoisa = senha || agendamento || creche

  async function responder(id: string, aceita: boolean) {
    setOcupado(id)
    try {
      await backend.responderConvocacao(id, aceita)
      c.avisar(aceita ? 'Vaga aceita! A creche vai entrar em contato.' : 'Vaga recusada.')
    } catch (e) {
      c.avisar((e as Error).message)
    } finally {
      setOcupado(null)
    }
  }

  const direitos = jornada.direitos
    .map((d) => ({ d, status: jornada.meusDireitos.find((x) => x.direito_id === d.id)?.status ?? null }))
    .filter((x) => x.status)
    .slice(0, 3)

  return (
    <View style={{ gap: 22 }}>
      <Aparece style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Personagem {...ELENCO[indice]} largura={64} />
        <View style={{ flex: 1 }}>
          <Titulo tamanho={26}>Olá, {primeiroNome}!</Titulo>
          <Texto tamanho={14} cor={cores.suave}>
            {primeiraMaiuscula(formatarDataLonga())}
          </Texto>
        </View>
      </Aparece>

      <View style={{ gap: 12 }}>
        <Texto peso={700} tamanho={17} cor={cores.marca}>
          Agora
        </Texto>

        {senha && (
          <Aparece>
            <Cartao style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <BolinhaServico tipo="ubs" />
                <View style={{ flex: 1 }}>
                  <Texto peso={600}>{nomeUnidade(c, senha.unidade_id)}</Texto>
                  <Texto tamanho={13} cor={cores.suave}>
                    {MOTIVOS[senha.motivo].rotulo}
                  </Texto>
                </View>
                <Texto accessibilityLabel={`Senha ${senha.codigo}`} peso={800} tamanho={34} cor={cores.servico.ubs.forte}>
                  {senha.codigo}
                </Texto>
              </View>
              <View accessibilityLiveRegion="polite" style={{ gap: 8 }}>
                <Selo rotulo={STATUS_SENHA[senha.status].rotulo} tom={STATUS_SENHA[senha.status].tom} />
                {senha.status === 'aguardando' && (
                  <Texto peso={600} cor={cores.suave}>
                    {senha.naFrente === 0 ? 'Você é o próximo a ser chamado.' : `${senha.naFrente} ${senha.naFrente === 1 ? 'pessoa' : 'pessoas'} na sua frente.`}
                  </Texto>
                )}
                {senha.status === 'chamada' && senha.guiche && (
                  <Texto peso={800} tamanho={18} cor={cores.tom.chamada.forte}>
                    Vá ao guichê {senha.guiche}
                  </Texto>
                )}
              </View>
            </Cartao>
          </Aparece>
        )}

        {agendamento && (
          <Aparece atraso={80}>
            <Cartao style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <BolinhaServico tipo="cras" />
                <View style={{ flex: 1 }}>
                  <Texto peso={600}>{agendamento.direito?.nome ?? agendamento.motivo}</Texto>
                  <Texto tamanho={13} cor={cores.suave}>
                    {nomeUnidade(c, agendamento.unidade_id)}
                  </Texto>
                </View>
              </View>
              <Texto peso={800} tamanho={20} cor={cores.servico.cras.forte}>
                Hoje, às {formatarHora(agendamento.data_hora)}
              </Texto>
              <View accessibilityLiveRegion="polite">
                <Selo rotulo={STATUS_AGENDAMENTO[agendamento.status].rotulo} tom={STATUS_AGENDAMENTO[agendamento.status].tom} />
              </View>
              {agendamento.status === 'falta_documento' && agendamento.documentos_faltando.length > 0 && (
                <Texto tamanho={14} cor={cores.tom.falta.forte}>
                  Leve: {agendamento.documentos_faltando.join('; ')}.
                </Texto>
              )}
            </Cartao>
          </Aparece>
        )}

        {creche && (
          <Aparece atraso={160}>
            <Cartao style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <BolinhaServico tipo="creche" />
                <View style={{ flex: 1 }}>
                  <Texto peso={600}>Vaga para {creche.nome_crianca}</Texto>
                  <Texto tamanho={13} cor={cores.suave}>
                    {nomeUnidade(c, creche.unidade_id)}
                  </Texto>
                </View>
              </View>
              <View accessibilityLiveRegion="polite" style={{ gap: 8 }}>
                <Selo rotulo={STATUS_CRECHE[creche.status].rotulo} tom={STATUS_CRECHE[creche.status].tom} />
                {creche.status === 'aguardando' && (
                  <Texto peso={600} cor={cores.suave}>
                    Você é o {creche.posicao}º da lista de espera.
                  </Texto>
                )}
                {creche.status === 'convocada' && creche.prazo_resposta && (
                  <Texto peso={600} cor={cores.suave}>
                    Responda até {formatarDataHora(creche.prazo_resposta)}.
                  </Texto>
                )}
              </View>
              {creche.status === 'convocada' && (
                <View style={{ gap: 8 }}>
                  <Botao rotulo="Aceitar a vaga" carregando={ocupado === creche.id} aoPressionar={() => responder(creche.id, true)} />
                  <Botao variante="contorno" rotulo="Recusar" desabilitado={ocupado === creche.id} aoPressionar={() => responder(creche.id, false)} />
                </View>
              )}
            </Cartao>
          </Aparece>
        )}

        {!algumaCoisa && (
          <Cartao style={{ alignItems: 'center', gap: 8, paddingVertical: 22 }}>
            <Personagem {...ELENCO[4]} largura={96} />
            <Texto peso={700} style={{ textAlign: 'center' }}>
              Nada em andamento por enquanto.
            </Texto>
            <Texto tamanho={14} cor={cores.suave} style={{ textAlign: 'center' }}>
              Pegue uma senha ou agende um atendimento e acompanhe aqui.
            </Texto>
          </Cartao>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <Texto peso={700} tamanho={17} cor={cores.marca}>
          O que você quer fazer?
        </Texto>
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Atalho tipo="ubs" titulo="Pegar senha" texto="Na UBS, sem fila" aoPressionar={() => c.ir({ nome: 'pegarSenha' })} />
          <Atalho tipo="cras" titulo="Agendar" texto="Atendimento no CRAS" aoPressionar={() => c.ir({ nome: 'agendar' })} />
        </View>
      </View>

      {direitos.length > 0 && (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Texto peso={700} tamanho={17} cor={cores.marca}>
              Seus direitos
            </Texto>
            <Pressable accessibilityRole="button" onPress={() => c.irParaAba('direitos')} hitSlop={10}>
              <Texto peso={700} cor={cores.marca}>
                Ver todos
              </Texto>
            </Pressable>
          </View>
          {direitos.map(({ d, status }) => (
            <Pressable key={d.id} accessibilityRole="button" accessibilityLabel={`${d.nome}. ${STATUS_DIREITO[status!].rotulo}`} onPress={() => c.ir({ nome: 'direito', id: d.id })}>
              <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <BolinhaServico tipo={d.tipo_unidade} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Texto peso={600}>{d.nome}</Texto>
                  <Selo rotulo={STATUS_DIREITO[status!].rotulo} tom={STATUS_DIREITO[status!].tom} />
                </View>
                <ChevronRight size={20} color={cores.suave} />
              </Cartao>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}
