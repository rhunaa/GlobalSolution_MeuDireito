import { useCallback, useEffect, useState } from 'react'

interface EventoInstalar extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// O navegador dispara este evento cedo; guardamos para usar quando a pessoa clicar.
let eventoGuardado: EventoInstalar | null = null
const ouvintes = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    eventoGuardado = e as EventoInstalar
    ouvintes.forEach((o) => o())
  })
  window.addEventListener('appinstalled', () => {
    eventoGuardado = null
    ouvintes.forEach((o) => o())
  })
}

function estaInstalado(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export type Plataforma = 'ios' | 'android' | 'safari-mac' | 'firefox' | 'desktop'

export function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Firefox/.test(ua)) return 'firefox'
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) return 'safari-mac'
  return 'desktop'
}

/** "Baixar site": instala o site no aparelho (PWA) quando o navegador permite. */
export function useInstalarSite() {
  const [, forcar] = useState(0)
  useEffect(() => {
    const o = () => forcar((n) => n + 1)
    ouvintes.add(o)
    return () => {
      ouvintes.delete(o)
    }
  }, [])

  const instalar = useCallback(async (): Promise<'aceitou' | 'recusou' | 'indisponivel'> => {
    if (!eventoGuardado) return 'indisponivel'
    const evento = eventoGuardado
    await evento.prompt()
    const { outcome } = await evento.userChoice
    eventoGuardado = null
    ouvintes.forEach((o) => o())
    return outcome === 'accepted' ? 'aceitou' : 'recusou'
  }, [])

  return { instalado: estaInstalado(), podeInstalarDireto: eventoGuardado !== null, instalar }
}
