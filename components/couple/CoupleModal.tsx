'use client'

import { useState, useEffect } from 'react'
import { useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  getPartnerInfo,
  createInviteCode,
  connectCouple,
  disconnectCouple,
} from '@/app/actions/couple'
import styles from '@/styles/couple.module.css'
import formStyles from '@/styles/forms.module.css'

export default function CoupleModal() {
  const { openModal, closeModal } = useUI()
  const { user } = useAuth()
  const [mode, setMode] = useState<'view' | 'create' | 'join'>('view')
  const [partner, setPartner] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (openModal !== 'couple' || !user) return

    const loadPartnerInfo = async () => {
      try {
        const { partner: partnerData, connected: isConnected } = await getPartnerInfo(user.id)
        setPartner(partnerData)
        setConnected(isConnected)
      } catch (err) {
        console.error('파트너 정보 조회 실패:', err)
      }
    }

    loadPartnerInfo()
  }, [openModal, user])

  if (openModal !== 'couple') {
    return null
  }

  const handleCreateInvite = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.')
        return
      }

      const { code, error: createError } = await createInviteCode(user.id)

      if (createError) {
        setError(createError)
        return
      }

      setInviteCode(code)
      setMode('view')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCouple = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.')
        return
      }

      if (!joinCode.trim()) {
        setError('초대 코드를 입력해주세요.')
        return
      }

      const { error: joinError } = await connectCouple(user.id, joinCode)

      if (joinError) {
        setError(joinError)
        return
      }

      setJoinCode('')
      setMode('view')
      // TODO: 파트너 정보 다시 로드
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('파트너 연결을 해제하시겠습니까?')) return

    setLoading(true)
    setError(null)

    try {
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.')
        return
      }

      const { error: disconnectError } = await disconnectCouple(user.id)

      if (disconnectError) {
        setError(disconnectError)
        return
      }

      setPartner(null)
      setConnected(false)
      setInviteCode(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>파트너와 연결</h2>
          <button className={styles.modalClose} onClick={closeModal}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={formStyles.formError}>{error}</div>}

          {mode === 'view' && (
            <>
              {partner && connected ? (
                <div className={styles.coupleConnected}>
                  <p>연결된 파트너</p>
                  <div className={styles.couplePartnerCard}>
                    <h3>{partner.nickname}</h3>
                    <p>{partner.email}</p>
                  </div>
                  <button
                    className={styles.coupleBtn}
                    onClick={handleDisconnect}
                    disabled={loading}
                  >
                    연결 해제
                  </button>
                </div>
              ) : (
                <div className={styles.coupleNotConnected}>
                  <p>아직 파트너와 연결되지 않았습니다.</p>
                  <div className={styles.coupledBtnGroup}>
                    <button
                      className={styles.coupleBtn}
                      onClick={() => setMode('create')}
                      disabled={loading}
                    >
                      초대 코드 생성
                    </button>
                    <button
                      className={styles.coupleBtn}
                      onClick={() => setMode('join')}
                      disabled={loading}
                    >
                      초대 코드 입력
                    </button>
                  </div>

                  {inviteCode && (
                    <div className={styles.coupleInviteCode}>
                      <p>초대 코드를 파트너에게 공유하세요:</p>
                      <code className={styles.coupleInviteCodeValue}>{inviteCode}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(inviteCode)}
                        className={styles.coupleInviteCodeCopy}
                      >
                        복사
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {mode === 'create' && (
            <div className={styles.coupleCreateForm}>
              <p>파트너와 공유할 초대 코드를 생성합니다.</p>
              <button
                className={styles.coupleBtn}
                onClick={handleCreateInvite}
                disabled={loading}
              >
                {loading ? '생성 중...' : '초대 코드 생성'}
              </button>
              <button
                className={styles.coupledBtnSecondary}
                onClick={() => setMode('view')}
                disabled={loading}
              >
                취소
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className={styles.coupleJoinForm}>
              <p>파트너로부터 받은 초대 코드를 입력하세요.</p>
              <input
                type="text"
                placeholder="COUPLE-XXXXXXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className={formStyles.formInput}
                disabled={loading}
              />
              <button
                className={styles.coupleBtn}
                onClick={handleJoinCouple}
                disabled={loading}
              >
                {loading ? '연결 중...' : '파트너 연결'}
              </button>
              <button
                className={styles.coupledBtnSecondary}
                onClick={() => setMode('view')}
                disabled={loading}
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
