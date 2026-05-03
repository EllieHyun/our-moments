'use client'

import { createContext, useContext, useState } from 'react'
import type { TravelRecord } from '@/types/index'

type ActiveTab = 'map' | 'memories'
type ModalType = 'record' | 'couple' | 'pinDetail' | null

interface UIContextType {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  openModal: ModalType
  openRecordModal: (record?: TravelRecord) => void
  openCoupleModal: () => void
  openPinDetail: (recordId: string) => void
  closeModal: () => void
  activeRecordId: string | null
  editingRecord: TravelRecord | null
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<TravelRecord | null>(null)

  const openRecordModal = (record?: TravelRecord) => {
    setEditingRecord(record ?? null)
    setOpenModal('record')
  }
  const openCoupleModal = () => setOpenModal('couple')
  const openPinDetail = (recordId: string) => {
    setActiveRecordId(recordId)
    setOpenModal('pinDetail')
  }
  const closeModal = () => {
    setOpenModal(null)
    setActiveRecordId(null)
    setEditingRecord(null)
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
        activeRecordId,
        editingRecord,
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
