'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMap } from '@/contexts/MapContext'
import { useUI } from '@/contexts/UIContext'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import styles from '@/styles/map.module.css'

export default function KakaoMap() {
  const { user } = useAuth()
  const { mapRef, loadPins, pins, setPins } = useMap()
  const { openPinDetail } = useUI()
  const containerRef = useRef<HTMLDivElement>(null)
  const { mapRef: newMapRef, isLoaded, error } = useKakaoMap(containerRef)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const markerRef = useRef<any>(null)

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

  // 지도 클릭 이벤트 등록
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const clickListener = (mouseEvent: any) => {
      const latlng = mouseEvent.latLng
      const lat = latlng.getLat()
      const lng = latlng.getLng()

      setSelectedLocation({ lat, lng })

      // 기존 마커 제거
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      // 새 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: latlng,
        map: mapRef.current,
        title: '선택된 위치',
      })

      markerRef.current = marker

      console.log('핀 위치 선택:', { lat, lng })
      console.log('기록 생성 모달을 열어주세요!')
      // TODO: 여기서 기록 생성 모달 열기
    }

    window.kakao.maps.event.addListener(mapRef.current, 'click', clickListener)

    return () => {
      window.kakao.maps.event.removeListener(mapRef.current, 'click', clickListener)
    }
  }, [isLoaded, mapRef])

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
