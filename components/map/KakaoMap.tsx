'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMap } from '@/contexts/MapContext'
import { useUI } from '@/contexts/UIContext'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import styles from '@/styles/map.module.css'

export default function KakaoMap() {
  const { user } = useAuth()
  const { mapRef, loadPins } = useMap()
  const { openPinDetail } = useUI()
  const containerRef = useRef<HTMLDivElement>(null)
  const { mapRef: newMapRef, isLoaded, error } = useKakaoMap(containerRef)

  // mapRef에 새 참조 할당
  useEffect(() => {
    if (newMapRef.current) {
      mapRef.current = newMapRef.current
    }
  }, [newMapRef, mapRef])

  // 사용자 정보가 있으면 핀 로드
  useEffect(() => {
    if (isLoaded && user) {
      loadPins(user.id)
    }
  }, [isLoaded, user, loadPins])

  return (
    <div className={styles.mapContainer}>
      <div
        ref={containerRef}
        className={styles.mapElement}
        style={{ width: '100%', height: '100%' }}
      />

      {error && (
        <div className={styles.mapError}>
          <p>지도 로드 중 오류가 발생했습니다: {error}</p>
        </div>
      )}

      {!isLoaded && (
        <div className={styles.mapLoading}>
          <p>지도 로드 중...</p>
        </div>
      )}

      {/* TODO: MapSearch, RecentRecords, PinDetailModal 추가 */}
    </div>
  )
}
