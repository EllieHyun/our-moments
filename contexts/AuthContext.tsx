'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signIn as serverSignIn } from '@/app/actions/auth'
import type { UserProfile, Session } from '@/types/index'

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // 현재 세션 가져오기
    const getSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (currentSession) {
          setSession(currentSession as Session)

          // 사용자 정보 가져오기
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentSession.user.id)
            .single()

          if (profileError) {
            console.error('프로필 조회 오류:', profileError)
            setError(profileError.message)
          } else {
            setUser(profile)
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // 인증 상태 변경 구독
    const {
      data: { subscription },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = supabase.auth.onAuthStateChange(async (_event: any, currentSession: any) => {
      if (currentSession) {
        setSession(currentSession as Session)

        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentSession.user.id)
            .single()

          if (profileError) {
            console.error('프로필 조회 오류:', profileError)
            // 프로필이 없으면 자동 생성
            const { error: insertError } = await supabase.from('users').insert({
              id: currentSession.user.id,
              email: currentSession.user.email,
              nickname: currentSession.user.user_metadata?.nickname || 'User',
              avatar_url: null,
              created_at: new Date().toISOString(),
            })

            if (insertError) {
              console.error('프로필 자동 생성 실패:', insertError)
              return
            }

            // 프로필 재조회
            const { data: newProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', currentSession.user.id)
              .single()

            if (newProfile) {
              setUser(newProfile)
            }
          } else if (profile) {
            console.log('로그인 프로필:', JSON.stringify(profile))
            setUser(profile)
          }
        } catch (err) {
          console.error('프로필 처리 예외:', err)
        }
      } else {
        setSession(null)
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    console.log('signIn 시작:', email)

    try {
      // 서버 액션으로 로그인 + 프로필 조회 수행
      const result = await serverSignIn(email, password)

      if (result.error) {
        console.error('signIn 오류:', result.error)
        return { error: result.error }
      }

      console.log('signIn 성공')

      // 서버에서 받은 session과 profile 설정
      const currentSession = result.data?.session
      const profile = result.profile

      if (!currentSession) {
        return { error: '로그인 실패' }
      }

      setSession(currentSession as Session)

      if (profile) {
        console.log('프로필 설정 완료')
        setUser(profile)
      }

      return {}
    } catch (err) {
      console.error('signIn 예외:', err)
      return { error: err instanceof Error ? err.message : '알 수 없는 오류' }
    }
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서만 사용할 수 있습니다.')
  }
  return context
}
