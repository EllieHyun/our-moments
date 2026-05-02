'use client'

import { useState } from 'react'
import { useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import { createRecord, updateRecord } from '@/app/actions/records'
import styles from '@/styles/modals.module.css'
import formStyles from '@/styles/forms.module.css'

interface RecordModalProps {
  existingRecord?: any // TODO: type as Record
}

export default function RecordModal({ existingRecord }: RecordModalProps) {
  const { openModal, closeModal } = useUI()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: existingRecord?.title || '',
    date: existingRecord?.date || '',
    stops: existingRecord?.stops || [],
  })

  if (openModal !== 'record') {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.')
        return
      }

      if (existingRecord) {
        // 수정
        const { error: updateError } = await updateRecord(existingRecord.id, formData)
        if (updateError) {
          setError(updateError)
          return
        }
      } else {
        // 새로 생성
        const { error: createError } = await createRecord(user.id, {
          ...formData,
          stops: [],
          weather: undefined,
        })
        if (createError) {
          setError(createError)
          return
        }
      }

      closeModal()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {existingRecord ? '기록 수정' : '새 기록 추가'}
          </h2>
          <button className={styles.modalClose} onClick={closeModal}>
            ✕
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          {error && <div className={formStyles.formError}>{error}</div>}

          <div className={formStyles.formField}>
            <label className={formStyles.formLabel} htmlFor="title">
              제목
            </label>
            <input
              className={formStyles.formInput}
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="여행 제목"
              required
              disabled={loading}
            />
          </div>

          <div className={formStyles.formField}>
            <label className={formStyles.formLabel} htmlFor="date">
              날짜
            </label>
            <input
              className={formStyles.formInput}
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          {/* TODO: stops 추가/관리 */}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalBtn}
              onClick={closeModal}
              disabled={loading}
            >
              취소
            </button>
            <button type="submit" className={styles.modalBtn} disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
