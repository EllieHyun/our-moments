/**
 * 카카오 지도 SDK 타입 선언
 */

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (onLoadComplete: () => void) => void
        LatLng: new (lat: number, lng: number) => any
        Map: new (container: HTMLElement, options: any) => any
        Marker: new (options: any) => any
        CustomOverlay: new (options: any) => any
        PolyLine: new (options: any) => any
        event: {
          addListener: (target: any, event: string, callback: any) => void
          removeListener: (target: any, event: string, callback: any) => void
        }
        services: {
          Places: new () => any
          Geocoder: new () => any
        }
      }
    }
  }
}

export interface KakaoPlace {
  place_name: string
  road_address_name: string
  address_name: string
  y: string // 위도
  x: string // 경도
  place_url: string
  phone: string
  category_name: string
  category_group_code: string
  category_group_name: string
  distance?: string
}

export interface KakaoMap {
  setCenter: (latlng: any) => void
  setZoom: (level: number) => void
  relayout: () => void
  getCenter: () => any
  getZoom: () => number
  setDraggable: (draggable: boolean) => void
  setScrollwheel: (scrollwheel: boolean) => void
}

export const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || ''
