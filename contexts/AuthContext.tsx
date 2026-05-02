'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, Session } from '@/types/index'

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
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
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession as Session)

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()

        if (profile) {
          setUser(profile)
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

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signOut }}>
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
