'use client'

import { useMap } from '@/contexts/MapContext'
import { useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import { deleteRecord } from '@/app/actions/records'
import styles from '@/styles/modals.module.css'

export default function PinDetailModal() {
  const { records, loadPins } = useMap()
  const { openModal, activeRecordId, closeModal, openRecordModal } = useUI()
  const { user } = useAuth()

  if (openModal !== 'pinDetail' || !activeRecordId) return null

  const record = records.find((r) => r.id === activeRecordId)
  if (!record) return null

  const firstStopWithPhoto = record.stops.find((s) => s.photoDataUrl)

  const handleDelete = async () => {
    if (!confirm('이 기록을 삭제할까요?')) return
    const { error } = await deleteRecord(record.id)
    if (!error && user) {
      await loadPins(user.id)
    }
    closeModal()
  }

  const handleEdit = () => {
    openRecordModal(record)
  }

  return (
    <div className={styles.pinDetailModal} onClick={closeModal}>
      <div className={styles.pinDetailModalBackdrop} />
      <div className={styles.pinDetailModalContent} onClick={(e) => e.stopPropagation()}>
        {firstStopWithPhoto ? (
          <img
            className={styles.pinDetailModalPhoto}
            src={firstStopWithPhoto.photoDataUrl}
            alt="기록 사진"
          />
        ) : (
          <div className={styles.pinDetailModalPhotoEmpty}>📍</div>
        )}

        <div className={styles.pinDetailModalBody}>
          <div className={styles.pinDetailModalHeader}>
            <div style={{ minWidth: 0 }}>
              <h2 className={styles.pinDetailModalPlace}>
                {record.title || record.stops[0]?.placeTag || '기록'}
              </h2>
              <span className={styles.pinDetailModalDate}>{record.date}</span>
            </div>
            <button className={styles.pinDetailModalClose} onClick={closeModal}>
              ✕
            </button>
          </div>

          {record.weather && (
            <div className={styles.weatherBadge}>
              <span className={styles.weatherBadgeIcon}>{record.weather.emoji}</span>
              {record.weather.description}
            </div>
          )}

          <div className={styles.pinDetailStops}>
            {record.stops.map((stop) => (
              <div key={stop.id} className={styles.pinDetailStop}>
                <div className={styles.pinDetailStopTime}>{stop.time || ''}</div>
                <div className={styles.pinDetailStopBody}>
                  <div className={styles.pinDetailStopPlace}>
                    {stop.placeTag || '장소 미지정'}
                  </div>
                  {stop.memo && (
                    <div className={styles.pinDetailStopMemo}>{stop.memo}</div>
                  )}
                  {stop.photoDataUrl && (
                    <img
                      className={styles.pinDetailStopPhoto}
                      src={stop.photoDataUrl}
                      alt="사진"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.memoryCardActions}>
            <button className={styles.btnEditRecord} onClick={handleEdit}>
              수정
            </button>
            <button className={styles.btnDeleteRecord} onClick={handleDelete}>
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
