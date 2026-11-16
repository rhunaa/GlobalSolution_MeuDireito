import type { ReactNode } from 'react'

/**
 * Área com rolagem horizontal (tabelas largas). Recebe foco por teclado e tem
 * nome, para quem não usa mouse poder rolar com as setas.
 */
export function RegiaoRolavel({ rotulo, className = '', children }: { rotulo: string; className?: string; children: ReactNode }) {
  return (
    <div role="region" aria-label={rotulo} tabIndex={0} className={`relative overflow-x-auto ${className}`}>
      {children}
    </div>
  )
}
