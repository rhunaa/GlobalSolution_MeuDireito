import { Button, Drawer } from 'antd'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { LogOut, Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { Logo } from '../Logo'
import { useSessao } from '../../hooks/useSessao'
import { useUnidades } from '../../hooks/useUnidades'
import { NOME_PERFIL } from '../../types'
import { modoDados } from '../../services/fonteDados'
import { Navegacao } from './Navegacao'

/**
 * Estrutura das telas de quem atende: link "pular para o conteúdo",
 * cabeçalho (projeto, unidade, perfil), menu lateral e área principal.
 */
export function LayoutOperacional() {
  const { sessao, sair } = useSessao()
  const { unidades } = useUnidades()
  const navegar = useNavigate()
  const local = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  const principal = useRef<HTMLElement>(null)
  const primeira = useRef(true)

  // Ao trocar de página, leva o foco ao conteúdo (leitores de tela anunciam a nova página)
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false
      return
    }
    principal.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [local.pathname])

  const unidade = unidades.find((u) => u.id === sessao?.unidadeId)

  return (
    <MotionConfig reducedMotion="user">
      <a href="#conteudo" className="pular-conteudo">
        Pular para o conteúdo
      </a>

      <header className="nao-imprimir sticky top-0 z-30 bg-[var(--background)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 lg:px-6">
          <Button
            type="text"
            className={sessao ? 'lg:!hidden' : '!hidden'}
            aria-label="Abrir menu"
            onClick={() => setMenuAberto(true)}
            icon={<Menu aria-hidden="true" size={22} />}
          />

          <Link to="/">
            <Logo tamanho={34} />
          </Link>

          <div className="min-w-[10rem] flex-1 leading-tight">
            <p className="truncate font-semibold">{unidade?.nome ?? (sessao ? 'Carregando unidade…' : 'Nenhum perfil escolhido')}</p>
            <p className="truncate text-sm text-muted">{sessao ? NOME_PERFIL[sessao.perfil] : 'Acesso de demonstração'}</p>
          </div>

          {modoDados === 'mock' && (
            <span className="hidden rounded-md border border-[var(--border)] px-2.5 py-0.5 text-xs font-semibold text-muted sm:inline">
              Dados de demonstração
            </span>
          )}
          <span className="hidden rounded-md bg-[var(--status-aguardando-suave)] px-2.5 py-0.5 text-xs font-bold text-[var(--status-aguardando)] md:inline">
            Acesso de demonstração
          </span>
          <Button
            onClick={() => {
              sair()
              navegar('/entrar')
            }}
            icon={<LogOut aria-hidden="true" size={16} />}
          >
            {sessao ? 'Trocar perfil' : 'Escolher perfil'}
          </Button>
        </div>
      </header>

      <div className="lg:flex">
        <aside className={`nao-imprimir sticky top-[4.25rem] hidden h-[calc(100dvh-4.25rem)] w-64 shrink-0 overflow-y-auto p-4 pe-2 ${sessao ? 'lg:block' : ''}`}>
          <div className="cartao-fofo h-full p-3">
            <Navegacao />
          </div>
        </aside>

        <main
          id="conteudo"
          ref={principal}
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-6 lg:px-8"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={local.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Drawer title="Menu" placement="left" size={288} open={menuAberto} onClose={() => setMenuAberto(false)} aria-label="Menu principal">
        <Navegacao aoNavegar={() => setMenuAberto(false)} />
      </Drawer>
    </MotionConfig>
  )
}
