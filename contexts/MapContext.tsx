'use client'

import { createContext, useContext, useRef, useState, useCallback } from 'react'
import type { Pin } from '@/types/index'

interface MapContextType {
  pins: Pin[]
  setPins: (pins: Pin[]) => void
  mapRef: React.RefObject<any>
  overlaysRef: React.RefObject<Record<string, any>>
  loadPins: (userId: string) => Promise<void>
  addPinToMap: (pin: Pin) => void
  removePinFromMap: (pinId: string) => void
  loading: boolean
  error: string | null
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<any>(null)
  const overlaysRef = useRef<Record<string, any>>({})

  const loadPins = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      // TODO: Supabase에서 pins 로드
      // const { data, error } = await supabase
      //   .from('records')
      //   .select('*')
      //   .eq('user_id', userId)
      // 
      // 이를 Pin[] 형태로 변환
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '핀 로드 실패'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const addPinToMap = useCallback((pin: Pin) => {
    // TODO: 지도에 핀 추가 (CustomOverlay)
  }, [])

  const removePinFromMap = useCallback((pinId: string) => {
    // TODO: 지도에서 핀 제거
  }, [])

  return (
    <MapContext.Provider
      value={{
        pins,
        setPins,
        mapRef,
        overlaysRef,
        loadPins,
        addPinToMap,
        removePinFromMap,
        loading,
        error,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}

export function useMap() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMap은 MapProvider 내에서만 사용할 수 있습니다.')
  }
  return context
}
