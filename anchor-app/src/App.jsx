import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './lib/store'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import './App.css'

function App() {
  const { user, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    initializeAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [setUser, setLoading])

  return (
    <div className="app">
      {user ? <ChatPage /> : <AuthPage />}
    </div>
  )
}

export default App
