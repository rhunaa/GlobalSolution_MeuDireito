import type { ReactNode } from 'react'

interface Props {
  legenda: ReactNode
  descricao?: ReactNode
  /** Mensagem de erro, ligada ao grupo por aria-describedby. */
  erro?: string | null
  idErro?: string
  className?: string
  children: ReactNode
}

/** Grupo de campos (fieldset + legend): rótulo visível e lido por leitores de tela. */
export function Grupo({ legenda, descricao, erro, idErro, className = '', children }: Props) {
  return (
    <fieldset className={`min-w-0 ${className}`} aria-describedby={erro ? idErro : undefined} aria-invalid={erro ? true : undefined}>
      <legend className="mb-1 p-0 text-base font-bold">{legenda}</legend>
      {descricao && <p className="mb-2 text-sm text-muted">{descricao}</p>}
      {children}
      {erro && (
        <p id={idErro} role="alert" className="mt-2 font-semibold text-danger">
          {erro}
        </p>
      )}
    </fieldset>
  )
}

/** Texto de uma opção com descrição curta embaixo (usado em Radio e Checkbox). */
export function OpcaoComDescricao({ rotulo, descricao }: { rotulo: ReactNode; descricao?: ReactNode }) {
  return (
    <span className="block">
      <span className="block font-semibold">{rotulo}</span>
      {descricao && <span className="block text-sm font-normal text-muted">{descricao}</span>}
    </span>
  )
}
