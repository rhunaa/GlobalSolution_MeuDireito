import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router'
import { LayoutOperacional } from '../components/layout/LayoutOperacional'
import { useSessao } from '../hooks/useSessao'
import Capa from '../pages/Capa'
import EscolherPerfil from '../pages/EscolherPerfil'
import Simulador from '../pages/Simulador'
import Atendimento from '../pages/cras/Atendimento'
import Agenda from '../pages/cras/Agenda'
import Lista from '../pages/creche/Lista'
import Indicadores from '../pages/Indicadores'
import Publico from '../pages/Publico'
import Telao from '../pages/Telao'
import Balcao from '../pages/ubs/Balcao'
import Fila from '../pages/ubs/Fila'
import type { Perfil } from '../types'
import { PAGINA_INICIAL } from './menu'

/** Perfis que podem abrir cada área (o menu já mostra só as páginas do perfil). */
function Protegida({ perfis }: { perfis?: Perfil[] }) {
  const { sessao } = useSessao()
  const local = useLocation()
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: local.pathname }} />
  if (perfis && !perfis.includes(sessao.perfil)) return <Navigate to={PAGINA_INICIAL[sessao.perfil]} replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  { path: '/', element: <Capa /> },
  { path: '/entrar', element: <EscolherPerfil /> },
  {
    element: <LayoutOperacional />,
    children: [
      {
        element: <Protegida perfis={['recepcionista_ubs']} />,
        children: [
          { path: '/ubs/fila', element: <Fila /> },
          { path: '/ubs/balcao', element: <Balcao /> },
        ],
      },
      {
        element: <Protegida perfis={['assistente_cras']} />,
        children: [
          { path: '/cras/agenda', element: <Agenda /> },
          { path: '/cras/atendimento/:id', element: <Atendimento /> },
        ],
      },
      {
        element: <Protegida perfis={['gestora_creche']} />,
        children: [
          { path: '/creche/lista', element: <Lista /> },
        ],
      },
      // O simulador funciona sem escolher perfil (a demonstração pode começar por ele)
      { path: '/simulador', element: <Simulador /> },
      {
        element: <Protegida />,
        children: [
          { path: '/indicadores', element: <Indicadores /> },
        ],
      },
    ],
  },
  // Páginas sem menu (não exigem login)
  { path: '/telao/:unidadeId', element: <Telao /> },
  { path: '/publico', element: <Publico /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
