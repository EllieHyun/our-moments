'use client'

import { useMap } from '@/contexts/MapContext'
import { useUI } from '@/contexts/UIContext'
import { getWeatherInfo } from '@/lib/weather'
import styles from '@/styles/modals.module.css'

export default function PinDetailModal() {
  const { pins } = useMap()
  const { openModal, activePinId, closeModal, openRecordModal } = useUI()

  if (openModal !== 'pinDetail' || !activePinId) {
    return null
  }

  const pin = pins.find((p) => p.id === activePinId)

  if (!pin) {
    return null
  }

  // TODO: weather 정보 가져오기
  const weatherInfo = { emoji: '❓', description: '날씨 정보 없음' }

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{pin.title}</h2>
          <button className={styles.modalClose} onClick={closeModal}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.pinDetailDate}>{pin.date}</div>

          <div className={styles.pinDetailWeather}>
            <span className={styles.weatherEmoji}>{weatherInfo.emoji}</span>
            <span className={styles.weatherDesc}>{weatherInfo.description}</span>
          </div>

          {/* TODO: stops 타임라인 렌더링 */}

          <div className={styles.modalActions}>
            <button
              className={styles.modalBtn}
              onClick={() => {
                openRecordModal()
                closeModal()
              }}
            >
              수정
            </button>
            <button
              className={`${styles.modalBtn} ${styles.modalBtnDanger}`}
              onClick={() => {
                // TODO: deleteRecord
                closeModal()
              }}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
