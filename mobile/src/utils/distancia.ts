/** Distância máxima, em km, entre a pessoa e a UBS para pegar senha pelo app. */
export const LIMITE_KM_SENHA = 5

/** Distância em km entre dois pontos (fórmula de haversine). */
export function distanciaKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.latitude - a.latitude)
  const dLon = rad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export function textoDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 10) * 100} m`
  return `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`
}
