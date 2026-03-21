import { useEffect } from 'react'
import { AppShell } from './components/Layout/AppShell'
import { LoginScreen } from './components/Login/LoginScreen'
import { useCarreraStore } from './store/useCarreraStore'

function App() {
  const email = useCarreraStore((s) => s.email)
  const loading = useCarreraStore((s) => s.loading)
  const login = useCarreraStore((s) => s.login)

  useEffect(() => {
    const savedEmail = localStorage.getItem('carrera-email')
    if (savedEmail && !email) {
      login(savedEmail)
    }
  }, [])

  if (!email) {
    return <LoginScreen onLogin={login} loading={loading} />
  }

  return <AppShell />
}

export default App
