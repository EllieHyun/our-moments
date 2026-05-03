'use client'

import { useUI } from '@/contexts/UIContext'
import type { TravelRecord } from '@/types/index'
import styles from '@/styles/memories.module.css'

interface PlaceViewProps {
  records: TravelRecord[]
}

function extractCity(placeTag: string): string {
  if (!placeTag) return '기타'
  const m = placeTag.match(/[가-힣]+(특별시|광역시|특별자치시|시)/)
  return m ? m[0] : '기타'
}

export default function PlaceView({ records }: PlaceViewProps) {
  const { openPinDetail } = useUI()

  const cityGroups = new Map<string, TravelRecord[]>()
  records.forEach((record) => {
    const primaryPlace = record.stops[0]?.placeTag || ''
    const city = extractCity(primaryPlace)
    if (!cityGroups.has(city)) cityGroups.set(city, [])
    cityGroups.get(city)!.push(record)
  })

  const sortedCities = Array.from(cityGroups.entries()).sort(([a], [b]) => {
    if (a === '기타') return 1
    if (b === '기타') return -1
    return a.localeCompare(b, 'ko')
  })

  if (sortedCities.length === 0) {
    return <p className={styles.memoriesEmptyHint}>방문한 장소가 없습니다.</p>
  }

  return (
    <div className={styles.memoriesTimeline}>
      {sortedCities.map(([city, cityRecords]) => (
        <div key={city} className={styles.memoriesTimelineGroup}>
          <div className={styles.memoriesTimelineDate}>
            <span className={styles.memoriesTimelineDateLabel}>{city}</span>
            <div className={styles.memoriesTimelineDateLine} />
          </div>
          <div className={styles.memoriesTimelineItems}>
            {cityRecords.map((record) => {
              const firstStop = record.stops[0]
              const thumb = firstStop?.photoDataUrl
              const label = record.title || firstStop?.placeTag || '기록'
              const desc = firstStop?.memo || ''
              return (
                <div
                  key={record.id}
                  className={styles.memoriesTimelineItem}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openPinDetail(record.id)}
                >
                  {thumb ? (
                    <img
                      className={styles.memoriesTimelineItemThumb}
                      src={thumb}
                      alt="기록 사진"
                    />
                  ) : (
                    <div className={styles.memoriesTimelineItemThumbEmpty}>📍</div>
                  )}
                  <div className={styles.memoriesTimelineItemBody}>
                    <div className={styles.memoriesTimelineItemPlace}>{label}</div>
                    <div className={styles.memoriesTimelineItemMemo}>
                      {record.date}{desc ? ` · ${desc}` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
