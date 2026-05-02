'use client'

import type { TravelRecord, Stop } from '@/types/index'
import styles from '@/styles/memories.module.css'

interface PlaceViewProps {
  records: TravelRecord[]
}

// 주소에서 도시 추출 (간단한 버전)
function extractCity(placeTag: string): string {
  // "서울 강남구" 형태에서 첫 번째 부분 추출
  const parts = placeTag.split(' ')
  return parts[0] || '기타'
}

export default function PlaceView({ records }: PlaceViewProps) {
  // 도시별로 stops 그룹핑
  const placeGroups = new Map<string, Stop[]>()

  records.forEach((record) => {
    record.stops.forEach((stop) => {
      const city = extractCity(stop.placeTag)
      if (!placeGroups.has(city)) {
        placeGroups.set(city, [])
      }
      placeGroups.get(city)?.push(stop)
    })
  })

  const sortedPlaces = Array.from(placeGroups.entries())
    .sort(([cityA], [cityB]) => cityA.localeCompare(cityB))

  if (sortedPlaces.length === 0) {
    return <div className={styles.placeViewEmpty}>방문한 장소가 없습니다.</div>
  }

  return (
    <div className={styles.placeViewContainer}>
      {sortedPlaces.map(([city, stops]) => (
        <div key={city} className={styles.placeGroup}>
          <h3 className={styles.placeGroupTitle}>{city}</h3>
          <ul className={styles.placeGroupList}>
            {stops.map((stop) => (
              <li key={stop.id} className={styles.placeItem}>
                <span className={styles.placeItemName}>{stop.placeTag}</span>
                <span className={styles.placeItemMemo}>{stop.memo}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
