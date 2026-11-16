import { useEffect, useRef } from 'react'

/**
 * Atalho de teclado de uma tecla só (sem Ctrl/Alt/Cmd).
 * Não dispara enquanto a pessoa digita ou usa listas e botões que usam a mesma tecla.
 */
export function useAtalhoTeclado(tecla: string, aoAcionar: () => void, ativo = true) {
  const acao = useRef(aoAcionar)
  acao.current = aoAcionar
  useEffect(() => {
    if (!ativo) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      if (e.key.toLowerCase() !== tecla.toLowerCase()) return
      const alvo = e.target as HTMLElement | null
      if (alvo && (alvo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName))) return
      e.preventDefault()
      acao.current()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [tecla, ativo])
}
