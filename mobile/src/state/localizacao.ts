import * as Location from 'expo-location'
import { useCallback, useEffect, useState } from 'react'

export type EstadoLocal =
  | { estado: 'procurando' }
  | { estado: 'ok'; latitude: number; longitude: number }
  | { estado: 'negado' }
  | { estado: 'erro' }

/** Pede permissão e lê a posição atual (GPS no celular, localização do navegador na web). */
export function useLocalizacao() {
  const [local, setLocal] = useState<EstadoLocal>({ estado: 'procurando' })

  const buscar = useCallback(async () => {
    setLocal({ estado: 'procurando' })
    try {
      const perm = await Location.requestForegroundPermissionsAsync()
      if (perm.status !== 'granted') return setLocal({ estado: 'negado' })
      const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setLocal({ estado: 'ok', latitude: p.coords.latitude, longitude: p.coords.longitude })
    } catch {
      setLocal({ estado: 'erro' })
    }
  }, [])

  useEffect(() => {
    void buscar()
  }, [buscar])

  return { local, buscar }
}
