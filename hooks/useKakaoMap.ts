'use client'

import { useEffect, useRef, useState } from 'react'
import { KAKAO_MAP_KEY } from '@/lib/kakao'

export function useKakaoMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const mapRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (isLoaded) return

    // 카카오 맵 스크립트 로드
    const script = document.createElement('script')
    script.async = true
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!containerRef.current) return

          try {
            const map = new window.kakao.maps.Map(containerRef.current, {
              center: new window.kakao.maps.LatLng(37.5665, 126.978),
              level: 3,
              draggable: true,
              scrollwheel: true,
            })

            mapRef.current = map

            // 초기 위치 - 지오로케이션
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const lat = position.coords.latitude
                  const lng = position.coords.longitude
                  const center = new window.kakao.maps.LatLng(lat, lng)
                  map.setCenter(center)
                },
                () => {
                  // 기본값 사용 (서울)
                }
              )
            }

            setIsLoaded(true)
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '지도 초기화 실패'
            setError(errorMessage)
          }
        })
      }
    }

    script.onerror = () => {
      setError('카카오 맵 스크립트 로드 실패')
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [containerRef, isLoaded])

  return { mapRef, isLoaded, error }
}
