'use client'

import { useUI } from '@/contexts/UIContext'
import { useMap } from '@/contexts/MapContext'
import styles from '@/styles/tabs.module.css'

export default function TabNav() {
  const { activeTab, setActiveTab } = useUI()
  const { mapRef } = useMap()

  const handleTabChange = (tab: 'map' | 'memories') => {
    setActiveTab(tab)
    // 지도 탭으로 돌아올 때 relayout
    if (tab === 'map' && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.relayout?.()
      }, 0)
    }
  }

  return (
    <nav className={styles.pageTabs}>
      <button
        className={`${styles.pageTabsButton} ${activeTab === 'map' ? styles.pageTabsButtonActive : ''}`}
        onClick={() => handleTabChange('map')}
      >
        지도
      </button>
      <button
        className={`${styles.pageTabsButton} ${activeTab === 'memories' ? styles.pageTabsButtonActive : ''}`}
        onClick={() => handleTabChange('memories')}
      >
        추억
      </button>
    </nav>
  )
}
