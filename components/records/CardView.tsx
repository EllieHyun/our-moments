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
    return <div className={styles.cardViewEmpty}>기록이 없습니다.</div>
  }

  return (
    <div className={styles.cardViewContainer}>
      {records.map((record) => (
        <div key={record.id} className={styles.recordCard}>
          <div className={styles.recordCardHeader}>
            <h3 className={styles.recordCardTitle}>{record.title}</h3>
            <span className={styles.recordCardDate}>{record.date}</span>
          </div>

          <div className={styles.recordCardStops}>
            {record.stops.map((stop) => (
              <div key={stop.id} className={styles.recordCardStop}>
                <div className={styles.recordCardStopTime}>{stop.time}</div>
                <div className={styles.recordCardStopPlace}>{stop.placeTag}</div>
              </div>
            ))}
          </div>

          {record.weather && (
            <div className={styles.recordCardWeather}>
              <span>{record.weather.emoji}</span>
              <span>{record.weather.description}</span>
            </div>
          )}

          <button
            className={styles.recordCardBtn}
            onClick={() => {
              // TODO: 기록의 첫 번째 stop pinId로 openPinDetail 호출
            }}
          >
            보기
          </button>
        </div>
      ))}
    </div>
  )
}
