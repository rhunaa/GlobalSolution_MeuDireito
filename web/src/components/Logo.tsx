import type React from 'react'

interface Props {
  /** Só o quadrado com a balança. */
  soIcone?: boolean
  /** Mostra o lema "Seus direitos, simples" embaixo do nome. */
  comLema?: boolean
  /** Para fundos escuros fixos (ex.: painel da capa): quadrado branco e nome branco. */
  sobreEscuro?: boolean
  /** Tamanho do quadrado, em px. */
  tamanho?: number
  className?: string
}

/** Balança da justiça (símbolo da logo). Usa as variáveis --logo-* e troca de cor no modo escuro. */
function Simbolo({ tamanho }: { tamanho: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" aria-hidden="true" focusable="false" className="shrink-0">
      <rect width="100" height="100" rx="14" fill="var(--logo-tile)" />
      <g fill="none" stroke="var(--logo-glifo)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 26v50" />
        <path d="M36 78h28" />
        <path d="M20 38h60" />
        <path d="M24 38 15 60M24 38l9 22" />
        <path d="M76 38l-9 22M76 38l9 22" />
      </g>
      <circle cx="50" cy="20" r="5.5" fill="var(--logo-glifo)" />
      <path d="M12 60a12.5 12.5 0 0 0 25 0Z" fill="var(--logo-ouro)" />
      <path d="M63 60a12.5 12.5 0 0 0 25 0Z" fill="var(--logo-ouro)" />
    </svg>
  )
}

/**
 * Logo do Meu Direito: balança + nome ("Meu" leve, "Direito" em negrito).
 * O nome acessível é "Meu Direito"; o desenho é decorativo.
 */
export function Logo({ soIcone = false, comLema = false, sobreEscuro = false, tamanho = 36, className = '' }: Props) {
  const cores = sobreEscuro
    ? ({ '--logo-tile': '#ffffff', '--logo-glifo': '#1b2a4a', '--logo-ouro': '#d9a94e', '--logo-texto': '#ffffff', '--logo-lema': '#cbd5ea' } as React.CSSProperties)
    : undefined
  if (soIcone) {
    return (
      <span className={`inline-flex ${className}`} style={cores} role="img" aria-label="Meu Direito">
        <Simbolo tamanho={tamanho} />
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} style={cores}>
      <Simbolo tamanho={tamanho} />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap tracking-tight text-[var(--logo-texto)]" style={{ fontSize: tamanho * 0.62 }}>
          <span className="sr-only">Meu Direito</span>
          <span aria-hidden="true">
            <span className="font-light">Meu</span>
            <span className="font-bold">Direito</span>
          </span>
        </span>
        {comLema && (
          <span className="mt-1.5 whitespace-nowrap font-semibold uppercase text-[var(--logo-lema)]" style={{ fontSize: Math.max(9, tamanho * 0.24), letterSpacing: '0.24em' }}>
            Seus direitos, simples
          </span>
        )}
      </span>
    </span>
  )
}
