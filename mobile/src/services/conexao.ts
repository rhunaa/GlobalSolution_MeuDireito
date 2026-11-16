import type { EstadoConexao } from '../types'

/**
 * Estado global da conexão em tempo real ("Ao vivo" / "Reconectando…").
 * Cada canal Realtime informa seu estado; o indicador mostra o pior deles.
 */

const estadosCanais = new Map<string, EstadoConexao>()
const ouvintes = new Set<() => void>()
let estadoAtual: EstadoConexao = 'conectando'

function recalcular() {
  let novo: EstadoConexao
  if (typeof navigator !== 'undefined' && !navigator.onLine) novo = 'offline'
  else if (estadosCanais.size === 0) novo = 'ao_vivo'
  else {
    const valores = [...estadosCanais.values()]
    if (valores.includes('reconectando')) novo = 'reconectando'
    else if (valores.includes('conectando')) novo = 'conectando'
    else novo = 'ao_vivo'
  }
  if (novo !== estadoAtual) {
    estadoAtual = novo
    ouvintes.forEach((o) => o())
  }
}

export function informarEstadoCanal(canal: string, estado: EstadoConexao) {
  estadosCanais.set(canal, estado)
  recalcular()
}

export function removerCanal(canal: string) {
  estadosCanais.delete(canal)
  recalcular()
}

export function obterEstadoConexao(): EstadoConexao {
  return estadoAtual
}

export function assinarEstadoConexao(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', recalcular)
  window.addEventListener('offline', recalcular)
  // Sem canais abertos, a página está "ao vivo" assim que carrega
  queueMicrotask(recalcular)
}
