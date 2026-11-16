import { Alert, Button, Radio } from 'antd'
import { Baby, ClipboardList, HandHeart, Stethoscope } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Cartao } from '../components/Cartao'
import { Logo } from '../components/Logo'
import { CampoSelecao } from '../components/CampoSelecao'
import { Grupo, OpcaoComDescricao } from '../components/Grupo'
import { useSessao } from '../hooks/useSessao'
import { useUnidades } from '../hooks/useUnidades'
import { modoDados } from '../services/fonteDados'
import { PAGINA_INICIAL } from '../routes/menu'
import { NOME_SERVICO } from '../theme/status'
import { NOME_PERFIL, TIPO_UNIDADE_DO_PERFIL, type Perfil } from '../types'

const PERFIS: { id: Perfil; descricao: string; Icone: typeof Stethoscope; classe: string }[] = [
  { id: 'recepcionista_ubs', descricao: 'Chama a fila, emite senhas no balcão e controla o telão.', Icone: Stethoscope, classe: 'text-servico-ubs' },
  { id: 'assistente_cras', descricao: 'Vê a agenda do dia e registra o resultado de cada atendimento.', Icone: HandHeart, classe: 'text-servico-cras' },
  { id: 'gestora_creche', descricao: 'Acompanha a lista de espera e abre vagas para as famílias.', Icone: Baby, classe: 'text-servico-creche' },
]

/** Tela inicial: escolher perfil e unidade (login simulado de demonstração). */
export default function EscolherPerfil() {
  const { sessao, entrar } = useSessao()
  const { unidades, carregando, erro } = useUnidades()
  const navegar = useNavigate()
  const [perfil, setPerfil] = useState<Perfil>(sessao?.perfil ?? 'recepcionista_ubs')
  const [unidadeId, setUnidadeId] = useState<string | null>(sessao?.unidadeId ?? null)

  const tipo = TIPO_UNIDADE_DO_PERFIL[perfil]
  const unidadesDoPerfil = unidades.filter((u) => u.tipo === tipo)

  // Garante uma unidade válida para o perfil escolhido
  useEffect(() => {
    if (unidadesDoPerfil.length && !unidadesDoPerfil.some((u) => u.id === unidadeId)) {
      setUnidadeId(unidadesDoPerfil[0].id)
    }
  }, [unidadesDoPerfil, unidadeId])

  function continuar() {
    if (!unidadeId) return
    entrar(perfil, unidadeId)
    navegar(PAGINA_INICIAL[perfil])
  }

  return (
    <>
      <a href="#conteudo" className="pular-conteudo">
        Pular para o conteúdo
      </a>
      <main id="conteudo" tabIndex={-1} className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4 py-10">
        <header>
          <Link to="/">
            <Logo tamanho={44} comLema />
          </Link>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Entrar na plataforma de atendimento</h1>
          <p className="mt-2 text-lg text-muted">O direito já existe. O que falta é o caminho até ele.</p>
        </header>

        <Alert
          type="warning"
          showIcon
          title="Acesso de demonstração"
          description={`Não precisa de senha. Escolha um perfil e uma unidade só para testar.${modoDados === 'mock' ? ' Os dados são de exemplo e ficam apenas neste navegador.' : ''}`}
        />

        <Cartao>
          <div className="flex flex-col gap-6">
            <Grupo legenda="Quem está usando?">
              <Radio.Group value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)} className="flex flex-col gap-3">
                {PERFIS.map(({ id, descricao, Icone, classe }) => (
                  <Radio key={id} value={id}>
                    <OpcaoComDescricao
                      rotulo={
                        <span className="inline-flex items-center gap-2">
                          <Icone aria-hidden="true" size={20} className={classe} />
                          {NOME_PERFIL[id]}
                        </span>
                      }
                      descricao={descricao}
                    />
                  </Radio>
                ))}
              </Radio.Group>
            </Grupo>

            <CampoSelecao
              rotulo="Em qual unidade?"
              placeholder={carregando ? 'Carregando unidades…' : 'Escolha a unidade'}
              descricao={`Mostrando só unidades do tipo ${NOME_SERVICO[tipo]}.`}
              valor={unidadeId}
              aoMudar={setUnidadeId}
              desabilitado={carregando || unidadesDoPerfil.length === 0}
              opcoes={unidadesDoPerfil.map((u) => ({ id: u.id, texto: `${u.nome} – ${u.bairro}` }))}
            />

            {erro && (
              <p role="alert" className="font-semibold text-danger">
                {erro}
              </p>
            )}

            <Button type="primary" size="large" block disabled={!unidadeId} onClick={continuar} icon={<ClipboardList aria-hidden="true" size={20} />}>
              Entrar no painel
            </Button>
          </div>
        </Cartao>

        <nav aria-label="Outras páginas" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <Link to="/" className="text-link underline underline-offset-4">
            Voltar para a capa
          </Link>
          <Link to="/publico" className="text-link underline underline-offset-4">
            Ver a página pública
          </Link>
          <Link to="/simulador" className="text-link underline underline-offset-4">
            Abrir o simulador do app
          </Link>
        </nav>
      </main>
    </>
  )
}
