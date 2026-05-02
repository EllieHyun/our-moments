'use client'

import { createContext, useContext, useState } from 'react'

type ActiveTab = 'map' | 'memories'
type ModalType = 'record' | 'couple' | 'pinDetail' | null

interface UIContextType {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  openModal: ModalType
  openRecordModal: () => void
  openCoupleModal: () => void
  openPinDetail: (pinId: string) => void
  closeModal: () => void
  activePinId: string | null
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const [activePinId, setActivePinId] = useState<string | null>(null)

  const openRecordModal = () => setOpenModal('record')
  const openCoupleModal = () => setOpenModal('couple')
  const openPinDetail = (pinId: string) => {
    setActivePinId(pinId)
    setOpenModal('pinDetail')
  }
  const closeModal = () => {
    setOpenModal(null)
    setActivePinId(null)
  }

  return (
    <UIContext.Provider
      value={{
        activeTab,
        setActiveTab,
        openModal,
        openRecordModal,
        openCoupleModal,
        openPinDetail,
        closeModal,
        activePinId,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI는 UIProvider 내에서만 사용할 수 있습니다.')
  }
  return context
}
