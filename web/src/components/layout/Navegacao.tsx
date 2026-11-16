import { NavLink } from 'react-router'
import { FlaskConical } from 'lucide-react'
import { useSessao } from '../../hooks/useSessao'
import { ITEM_PUBLICO, MENU_POR_PERFIL, type ItemMenu } from '../../routes/menu'

const BASE = 'flex items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 font-semibold transition-colors'
const INATIVO = 'text-foreground hover:bg-[var(--surface-secondary)]'
const ATIVO = 'bg-accent text-accent-foreground'

function Item({ item, unidadeId, aoNavegar }: { item: ItemMenu; unidadeId: string; aoNavegar?: () => void }) {
  const caminho = item.caminho.replace(':unidadeId', unidadeId)
  const conteudo = (
    <>
      <item.Icone aria-hidden="true" size={20} className="shrink-0" />
      <span>{item.rotulo}</span>
      {item.novaAba && <span className="so-leitor"> (abre em nova aba)</span>}
    </>
  )
  if (item.novaAba) {
    return (
      <a href={caminho} target="_blank" rel="noopener noreferrer" className={`${BASE} ${INATIVO}`}>
        {conteudo}
      </a>
    )
  }
  return (
    <NavLink to={caminho} onClick={aoNavegar} className={({ isActive }) => `${BASE} ${isActive ? ATIVO : INATIVO}`}>
      {conteudo}
    </NavLink>
  )
}

/** Menu do perfil escolhido (lateral em telas largas, em gaveta nas pequenas). */
export function Navegacao({ aoNavegar }: { aoNavegar?: () => void }) {
  const { sessao } = useSessao()
  if (!sessao) return null
  const itens = MENU_POR_PERFIL[sessao.perfil]
  return (
    <nav aria-label="Menu principal" className="flex h-full flex-col gap-1">
      <ul className="flex flex-col gap-1">
        {itens.map((item) => (
          <li key={item.caminho}>
            <Item item={item} unidadeId={sessao.unidadeId} aoNavegar={aoNavegar} />
          </li>
        ))}
        <li>
          <Item item={ITEM_PUBLICO} unidadeId={sessao.unidadeId} />
        </li>
      </ul>
      <div className="mt-auto border-t border-[var(--separator)] pt-3">
        <NavLink
          to="/simulador"
          onClick={aoNavegar}
          className={({ isActive }) => `${BASE} text-sm ${isActive ? ATIVO : INATIVO}`}
        >
          <FlaskConical aria-hidden="true" size={18} className="shrink-0" />
          <span>Simulador do app</span>
        </NavLink>
      </div>
    </nav>
  )
}
