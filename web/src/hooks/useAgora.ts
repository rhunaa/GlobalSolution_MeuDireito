import { useEffect, useState } from 'react'

/** Devolve a hora atual e atualiza a cada `intervaloMs` (para tempos de espera). */
export function useAgora(intervaloMs = 30_000): Date {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), intervaloMs)
    return () => window.clearInterval(id)
  }, [intervaloMs])
  return agora
}
