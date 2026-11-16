import { useCallback, useEffect, useRef, useState } from 'react'

/** Texto falado para uma senha. "C023" vira "Senha C, 23, guichê 2". */
export function textoDaChamada(codigo: string, guiche: number | null): string {
  const letra = codigo.charAt(0)
  const numero = Number(codigo.slice(1))
  return `Senha ${letra}, ${numero}${guiche ? `, guichê ${guiche}` : ''}`
}

/**
 * Anúncio por voz (speechSynthesis). Navegadores bloqueiam áudio sem
 * interação, então o som só liga depois de um clique em "Ativar som".
 */
export function useFalaTelao() {
  const suportado = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [somAtivo, setSomAtivo] = useState(false)
  const ativoRef = useRef(false)

  const falar = useCallback(
    (texto: string, forcar = false) => {
      if (!suportado || (!ativoRef.current && !forcar)) return
      const fala = new SpeechSynthesisUtterance(texto)
      fala.lang = 'pt-BR'
      fala.rate = 0.9
      const voz = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('pt'))
      if (voz) fala.voice = voz
      window.speechSynthesis.cancel() // não acumula chamadas antigas
      window.speechSynthesis.speak(fala)
    },
    [suportado],
  )

  const alternarSom = useCallback(() => {
    const novo = !ativoRef.current
    ativoRef.current = novo
    setSomAtivo(novo)
    if (novo) falar('Som ativado', true)
    else if (suportado) window.speechSynthesis.cancel()
  }, [falar, suportado])

  useEffect(() => () => {
    if (suportado) window.speechSynthesis.cancel()
  }, [suportado])

  return { suportado, somAtivo, alternarSom, falar }
}
