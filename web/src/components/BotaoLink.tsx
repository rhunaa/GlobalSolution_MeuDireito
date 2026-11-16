import { Button, type ButtonProps } from 'antd'
import { useHref, useNavigate } from 'react-router'

/** Botão do Ant Design que é, de verdade, um link (<a>) e navega sem recarregar. */
export function BotaoLink({ to, children, ...props }: ButtonProps & { to: string }) {
  const navegar = useNavigate()
  const href = useHref(to)
  return (
    <Button
      {...props}
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return // deixa abrir em nova aba
        e.preventDefault()
        navegar(to)
      }}
    >
      {children}
    </Button>
  )
}
