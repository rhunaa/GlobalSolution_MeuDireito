import type { ReactNode } from 'react'

/** Tecla de atalho, no estilo de "teclinha". */
export function Kbd({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={`inline-flex min-w-7 items-center justify-center rounded-md border border-[var(--field-border)] bg-[var(--surface-secondary)] px-1.5 py-0.5 font-mono text-sm font-bold text-foreground ${className}`}>
      {children}
    </kbd>
  )
}
