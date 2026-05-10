/**
 * US-Moment App Type Definitions
 */

// 사용자 프로필
export interface UserProfile {
  id: string
  email: string
  nickname: string
  avatar_url?: string
  created_at: string
}

// 기록의 개별 장소 정보
export interface Stop {
  id: string
  time: string // HH:MM 형식
  placeTag: string // 카카오 지도 검색 결과의 place_name
  memo: string
  lat: number
  lng: number
  photoDataUrl?: string // Base64 Data URL 또는 Storage URL
}

// 전체 기록 (여행)
export interface TravelRecord {
  id: string
  user_id: string
  couple_id?: string
  date: string // YYYY-MM-DD
  title: string
  stops: Stop[]
  weather?: {
    code: number // WMO weather code
    emoji: string
    description: string
  }
  created_at: string
  updated_at: string
}

// 핀 (지도에 표시되는 마커)
export interface Pin {
  id: string
  lat: number
  lng: number
  title: string
  date: string
  recordId: string
  stopId: string
}

// 커플 연결 정보
export interface CoupleConnection {
  id: string
  user_id_1: string
  user_id_2?: string
  invite_code: string | null
  created_at: string
  connected_at?: string
}

// 세션 정보 (Supabase Auth)
export interface Session {
  user: {
    id: string
    email?: string
    user_metadata?: {
      [key: string]: unknown
    }
  }
  access_token: string
  refresh_token?: string
}
