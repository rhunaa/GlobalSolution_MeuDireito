/** Armazenamento simples: localStorage na versão web do Expo; só memória no celular (os dados de demonstração recomeçam a cada abertura). */
const memoria = new Map<string, string>()

export const armazenamento = {
  get(chave: string): string | null {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(chave)
    } catch {
      /* ignora */
    }
    return memoria.get(chave) ?? null
  },
  set(chave: string, valor: string) {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.setItem(chave, valor)
    } catch {
      /* ignora */
    }
    memoria.set(chave, valor)
  },
}
