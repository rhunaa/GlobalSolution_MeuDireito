import { Card } from 'antd'
import type { ReactNode } from 'react'

interface Props {
  titulo?: ReactNode
  /** Nível do título, para manter a ordem h1 → h2 → h3 correta na página. */
  nivel?: 'h2' | 'h3'
  descricao?: ReactNode
  icone?: ReactNode
  className?: string
  children: ReactNode
}

/** Cartão do Ant Design com título semântico (h2/h3) e descrição. */
export function Cartao({ titulo, nivel = 'h2', descricao, icone, className, children }: Props) {
  const Titulo = nivel
  return (
    <Card variant="borderless" className={`cartao-fofo ${className ?? ''}`}>
      {titulo && (
        <div className="mb-4">
          <Titulo className="flex items-center gap-2 text-xl font-bold">
            {icone}
            {titulo}
          </Titulo>
          {descricao && <p className="mt-1 text-sm text-muted">{descricao}</p>}
        </div>
      )}
      {children}
    </Card>
  )
}
