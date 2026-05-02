'use client'

import dynamic from 'next/dynamic'
import { AuthOverlay } from '@/components/auth/AuthOverlay'
import SiteHeader from '@/components/layout/SiteHeader'
import { UIProvider } from '@/contexts/UIContext'
import { MapProvider } from '@/contexts/MapContext'
import { useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
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
  const { activeTab } = useUI()
  const { user } = useAuth()

  if (!user) {
    return <AuthOverlay />
  }

  return (
    <>
      <SiteHeader />

      <div id="panel-map" style={{ display: activeTab === 'map' ? 'block' : 'none' }}>
        <KakaoMap />
      </div>

      <div
        id="panel-memories"
        style={{ display: activeTab === 'memories' ? 'block' : 'none' }}
      >
        <MemoriesPanel />
      </div>

      {/* 모달들 */}
      <RecordModal />
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
