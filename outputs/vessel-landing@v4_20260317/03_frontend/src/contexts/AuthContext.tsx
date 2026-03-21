import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  /** 打开登录弹窗 */
  openAuthModal: () => void
  /** 关闭登录弹窗 */
  closeAuthModal: () => void
  authModalOpen: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    // 初始化：拿当前 session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // 监听 auth 状态变化（登录/登出/token 刷新）
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      // 登录成功后自动关闭弹窗
      if (newSession?.user) setAuthModalOpen(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const openAuthModal = useCallback(() => setAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, session, loading, openAuthModal, closeAuthModal, authModalOpen, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
