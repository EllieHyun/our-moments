'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { AuthOverlay } from '@/components/auth/AuthOverlay'
import SiteHeader from '@/components/layout/SiteHeader'
import { UIProvider } from '@/contexts/UIContext'
import { MapProvider } from '@/contexts/MapContext'
import { useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import { useMap } from '@/contexts/MapContext'
import RecordModal from '@/components/records/RecordModal'
import PinDetailModal from '@/components/map/PinDetailModal'
import CoupleModal from '@/components/couple/CoupleModal'

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px' }}>지도 로드 중...</div>,
})

const MemoriesPanel = dynamic(() => import('@/components/records/MemoriesPanel'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px' }}>추억 로드 중...</div>,
})

function PageContent() {
  const { activeTab, openModal, editingRecord } = useUI()
  const { user } = useAuth()
  const { loadPins } = useMap()

  // 로그인하면 records 로드
  useEffect(() => {
    if (user) {
      loadPins(user.id)
    }
  }, [user, loadPins])

  if (!user) {
    return <AuthOverlay />
  }

  return (
    <>
      <SiteHeader />

      <div
        id="panel-map"
        style={{
          display: activeTab === 'map' ? 'flex' : 'none',
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <KakaoMap />
      </div>

      <div
        id="panel-memories"
        style={{
          display: activeTab === 'memories' ? 'flex' : 'none',
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <MemoriesPanel />
      </div>

      {/* 모달들 - key로 편집 대상이 바뀔 때마다 state 리셋 */}
      <RecordModal key={`${openModal}-${editingRecord?.id ?? 'new'}`} />
      <PinDetailModal />
      <CoupleModal />
    </>
  )
}

export default function Home() {
  return (
    <UIProvider>
      <MapProvider>
        <PageContent />
      </MapProvider>
    </UIProvider>
  )
}
