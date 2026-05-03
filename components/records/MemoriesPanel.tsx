'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMap } from '@/contexts/MapContext'
import { useUI } from '@/contexts/UIContext'
import CardView from './CardView'
import CalendarView from './CalendarView'
import PlaceView from './PlaceView'
import styles from '@/styles/memories.module.css'
import tabStyles from '@/styles/tabs.module.css'

type MemoryView = 'card' | 'calendar' | 'place'

export default function MemoriesPanel() {
  const { user } = useAuth()
  const { records, loading, error } = useMap()
  const { openRecordModal } = useUI()
  const [view, setView] = useState<MemoryView>('card')

  if (!user) {
    return <div className={styles.memoriesPanel}>로그인이 필요합니다.</div>
  }

  if (loading) {
    return <div className={styles.memoriesPanel}>로드 중...</div>
  }

  if (error) {
    return <div className={styles.memoriesPanel}>오류: {error}</div>
  }

  return (
    <div className={styles.memoriesPanel}>
      <div className={styles.memoriesPanelHeader}>
        <h2 className={styles.memoriesPanelTitle}>추억</h2>
        <button className={styles.btnNewRecord} onClick={() => openRecordModal()}>
          새 기록
        </button>
      </div>

      <nav
        className={tabStyles.pageTabs}
        style={{ width: '100%', maxWidth: 400, marginBottom: 16 }}
      >
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
        ) : view === 'card' ? (
          <CardView records={records} />
        ) : view === 'calendar' ? (
          <CalendarView records={records} />
        ) : (
          <PlaceView records={records} />
        )}
      </div>
    </div>
  )
}
