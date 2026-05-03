'use client'

import { useUI } from '@/contexts/UIContext'
import type { TravelRecord } from '@/types/index'
import styles from '@/styles/memories.module.css'

interface CardViewProps {
  records: TravelRecord[]
}

export default function CardView({ records }: CardViewProps) {
  const { openPinDetail } = useUI()

  if (records.length === 0) {
    return <p className={styles.memoriesEmptyHint}>기록이 없습니다.</p>
  }

  return (
    <ul className={styles.memoriesList}>
      {records.map((record) => {
        const firstStop = record.stops[0]
        const thumb = firstStop?.photoDataUrl
        const label = record.title || firstStop?.placeTag || '기록'
        const desc = firstStop?.memo || ''

        return (
          <li
            key={record.id}
            className={styles.memoriesTimelineItem}
            style={{ marginBottom: 12, cursor: 'pointer', listStyle: 'none' }}
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
              <div className={styles.memoriesTimelineItemMemo}>{record.date}</div>
              {desc && (
                <div className={styles.memoriesTimelineItemMemo}>{desc}</div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
