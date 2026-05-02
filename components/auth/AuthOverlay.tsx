'use client'

import { useState } from 'react'
import { signUp, signIn } from '@/app/actions/auth'
import { useAuth } from '@/contexts/AuthContext'
import styles from '@/styles/auth.module.css'

type AuthMode = 'login' | 'signup'

interface AuthOverlayProps {
  hidden?: boolean
}

export function AuthOverlay({ hidden = false }: AuthOverlayProps) {
  const { user } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
  })

  if (!hidden && user) {
    return null // 로그인된 경우 오버레이 표시 안함
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const result = await signIn(formData.email, formData.password)
        if (result.error) {
          setError(result.error)
        }
      } else {
        const result = await signUp(formData.email, formData.password, formData.nickname)
        if (result.error) {
          setError(result.error)
        } else {
          setError('이메일 인증 링크가 발송되었습니다.')
          setFormData({ email: '', password: '', nickname: '' })
          setMode('login')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authOverlay} hidden={hidden && !user}>
      <div className={styles.authOverlayBackdrop}></div>

      <div className={styles.authCard}>
        <div className={styles.authBrand}>
          <h2 className={styles.authBrandTitle}>Our-Moment</h2>
          <p className={styles.authBrandSub}>커플 추억 지도</p>
        </div>

        <div className={styles.authTabs}>
          <button
            className={`${styles.authTab} ${mode === 'login' ? styles.authTabActive : ''}`}
            onClick={() => {
              setMode('login')
              setError(null)
            }}
          >
            로그인
          </button>
          <button
            className={`${styles.authTab} ${mode === 'signup' ? styles.authTabActive : ''}`}
            onClick={() => {
              setMode('signup')
              setError(null)
            }}
          >
            회원가입
          </button>
        </div>

        {error && <div className={styles.authError}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.recordFormField}>
            <label className={styles.recordFormLabel} htmlFor="email">
              이메일
            </label>
            <input
              className={styles.recordFormInput}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@example.com"
              required
              disabled={loading}
            />
          </div>

          {mode === 'signup' && (
            <div className={styles.recordFormField}>
              <label className={styles.recordFormLabel} htmlFor="nickname">
                닉네임
              </label>
              <input
                className={styles.recordFormInput}
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="파트너와 공유할 이름"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className={styles.recordFormField}>
            <label className={styles.recordFormLabel} htmlFor="password">
              비밀번호
            </label>
            <input
              className={styles.recordFormInput}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.recordFormActions}>
            <button
              type="submit"
              className={styles.recordFormBtnPrimary}
              disabled={loading}
            >
              {loading
                ? '처리 중...'
                : mode === 'login'
                  ? '로그인'
                  : '회원가입'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
