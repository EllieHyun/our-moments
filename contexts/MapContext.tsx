'use client'

import { createContext, useContext, useRef, useState, useCallback } from 'react'
import { getRecords } from '@/app/actions/records'
import type { Pin, TravelRecord } from '@/types/index'

interface MapContextType {
  pins: Pin[]
  setPins: (pins: Pin[]) => void
  records: TravelRecord[]
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
  const [records, setRecords] = useState<TravelRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<any>(null)
  const overlaysRef = useRef<Record<string, any>>({})

  const loadPins = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data: loadedRecords, error: fetchError } = await getRecords(userId)

      if (fetchError) {
        setError(fetchError)
        return
      }

      setRecords(loadedRecords)

      // stops에서 Pin 목록 생성
      const derivedPins: Pin[] = []
      for (const record of loadedRecords) {
        for (const stop of record.stops || []) {
          if (stop.lat && stop.lng) {
            derivedPins.push({
              id: stop.id,
              lat: stop.lat,
              lng: stop.lng,
              title: stop.placeTag,
              date: record.date,
              recordId: record.id,
              stopId: stop.id,
            })
          }
        }
      }
      setPins(derivedPins)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '핀 로드 실패'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const addPinToMap = useCallback((_pin: Pin) => {
    // KakaoMap 컴포넌트에서 pins 배열 변경을 감지해 처리
  }, [])

  const removePinFromMap = useCallback((_pinId: string) => {
    // KakaoMap 컴포넌트에서 pins 배열 변경을 감지해 처리
  }, [])

  return (
    <MapContext.Provider
      value={{
        pins,
        setPins,
        records,
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
