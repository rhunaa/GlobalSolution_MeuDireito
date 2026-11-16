import { StyleProvider } from '@ant-design/cssinjs'
import { ConfigProvider } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { temaAntd } from './antd'

function useMovimentoReduzido(): boolean {
  const [reduzir, setReduzir] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = () => setReduzir(mq.matches)
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])
  return reduzir
}

/**
 * Tema do site: só o claro (sem alternância de modo escuro).
 * Configura o Ant Design e respeita prefers-reduced-motion (sem animações).
 */
export function TemaProvider({ children }: { children: ReactNode }) {
  const reduzir = useMovimentoReduzido()

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('dark')
    html.classList.add('light')
    html.setAttribute('data-theme', 'light')
  }, [])

  const config = useMemo(() => temaAntd('light', reduzir), [reduzir])

  return (
    // layer: os estilos do Ant Design ficam na camada "antd" e convivem com o Tailwind
    <StyleProvider layer>
      <ConfigProvider locale={ptBR} theme={config}>
        {children}
      </ConfigProvider>
    </StyleProvider>
  )
}
