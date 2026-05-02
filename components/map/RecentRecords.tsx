'use client'

import { useMap } from '@/contexts/MapContext'
import { useUI } from '@/contexts/UIContext'
import styles from '@/styles/map.module.css'

export default function RecentRecords() {
  const { pins } = useMap()
  const { openPinDetail } = useUI()

  // 최근 3개 핀
  const recentPins = pins.slice(0, 3)

  if (recentPins.length === 0) {
    return (
      <div className={styles.recentRecords}>
        <p>최근 방문한 장소가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.recentRecords}>
      <h3 className={styles.recentRecordsTitle}>최근 방문</h3>
      <ul className={styles.recentRecordsList}>
        {recentPins.map((pin) => (
          <li key={pin.id}>
            <button
              onClick={() => openPinDetail(pin.id)}
              className={styles.recentRecordsItem}
            >
              <div className={styles.recentRecordsItemDate}>{pin.date}</div>
              <div className={styles.recentRecordsItemTitle}>{pin.title}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
