'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getRecords } from '@/app/actions/records'
import { useUI } from '@/contexts/UIContext'
import CardView from './CardView'
import CalendarView from './CalendarView'
import PlaceView from './PlaceView'
import styles from '@/styles/memories.module.css'
import tabStyles from '@/styles/tabs.module.css'
import type { TravelRecord } from '@/types/index'

type MemoryView = 'card' | 'calendar' | 'place'

export default function MemoriesPanel() {
  const { user } = useAuth()
  const { openRecordModal } = useUI()
  const [view, setView] = useState<MemoryView>('card')
  const [records, setRecords] = useState<TravelRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadRecords = async () => {
      try {
        setLoading(true)
        const { data, error: loadError } = await getRecords(user.id)

        if (loadError) {
          setError(loadError)
        } else {
          setRecords(data)
        }
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [user])

  if (!user) {
    return <div className={styles.memoriesPanel}>로그인이 필요합니다.</div>
  }

  if (loading) {
    return <div className={styles.memoriesPanel}>로드 중...</div>
  }

  if (error) {
    return <div className={styles.memoriesPanel}>오류: {error}</div>
  }

  const renderView = () => {
    switch (view) {
      case 'card':
        return <CardView records={records} />
      case 'calendar':
        return <CalendarView records={records} />
      case 'place':
        return <PlaceView records={records} />
    }
  }

  return (
    <div className={styles.memoriesPanel}>
      <div className={styles.memoriesPanelHeader}>
        <h2 className={styles.memoriesPanelTitle}>추억</h2>
        <button
          className="btn btn-primary"
          onClick={openRecordModal}
        >
          새 기록
        </button>
      </div>

      <nav className={tabStyles.pageTabs}>
        <button
          className={`${tabStyles.pageTabsButton} ${view === 'card' ? tabStyles.pageTabsButtonActive : ''}`}
          onClick={() => setView('card')}
        >
          카드
        </button>
        <button
          className={`${tabStyles.pageTabsButton} ${view === 'calendar' ? tabStyles.pageTabsButtonActive : ''}`}
          onClick={() => setView('calendar')}
        >
          캘린더
        </button>
        <button
          className={`${tabStyles.pageTabsButton} ${view === 'place' ? tabStyles.pageTabsButtonActive : ''}`}
          onClick={() => setView('place')}
        >
          장소
        </button>
      </nav>

      <div className={styles.memoriesPanelContent}>
        {records.length === 0 ? (
          <p className={styles.memoriesPanelEmpty}>추억을 기록해보세요!</p>
        ) : (
          renderView()
        )}
      </div>
    </div>
  )
}
