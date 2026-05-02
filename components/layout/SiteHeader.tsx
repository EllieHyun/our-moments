'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import styles from '@/styles/layout.module.css'
import TabNav from './TabNav'

export default function SiteHeader() {
  const { user, signOut } = useAuth()
  const { openCoupleModal } = useUI()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className={styles.siteHeader}>
      <div className={styles.topBar}>
        <div className={styles.topBarBrand}>
          <h1 className={styles.siteTagline}>Our-Moment</h1>
        </div>

        <TabNav />

        <div className={styles.topBarActions}>
          {user && (
            <>
              <button
                className={`${styles.btnHeader} ${styles.btnHeaderGhost}`}
                onClick={openCoupleModal}
                title="파트너와 연결"
              >
                연결
              </button>
              <span className={styles.profileNickname}>{user.nickname}</span>
              <button
                className={`${styles.btnHeader} ${styles.btnHeaderGhost}`}
                onClick={handleLogout}
                title="로그아웃"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
