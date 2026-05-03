'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signIn as serverSignIn, signOut as serverSignOut } from '@/app/actions/auth'
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

function toProfile(sessionUser: any): UserProfile {
  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    nickname:
      sessionUser.user_metadata?.nickname ||
      sessionUser.email?.split('@')[0] ||
      'User',
    created_at: sessionUser.created_at || new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // 콜백을 동기로 유지 — 비동기 DB 쿼리를 여기서 실행하면
    // React Strict Mode의 이중 실행 + cleanup 타이밍에 의해 auth lock 경쟁 발생
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_event: any, currentSession: any) => {
        if (currentSession) {
          setSession(currentSession as Session)
          setUser(toProfile(currentSession.user))
        } else {
          setSession(null)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const result = await serverSignIn(email, password)

      if (result.error) {
        return { error: result.error }
      }

      const currentSession = result.data?.session
      if (!currentSession) {
        return { error: '로그인 실패' }
      }

      setSession(currentSession as Session)
      setUser(result.profile ?? toProfile(currentSession.user))

      return {}
    } catch (err) {
      return { error: err instanceof Error ? err.message : '알 수 없는 오류' }
    }
  }

  const signOut = async () => {
    try {
      await serverSignOut()
    } catch (err) {
      console.error('signOut 예외:', err)
    } finally {
      setUser(null)
      setSession(null)
    }
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
