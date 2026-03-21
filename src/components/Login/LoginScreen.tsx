import { useState } from 'react'

interface LoginScreenProps {
  onLogin: (email: string) => void
  loading?: boolean
}

export function LoginScreen({ onLogin, loading }: LoginScreenProps) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (trimmed && trimmed.includes('@')) {
      onLogin(trimmed)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid">
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-4">
        <div className="bg-surface border border-border rounded-sm p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-lg font-normal tracking-tight text-text-primary">
              Ingenieria Civil
            </h1>
            <p className="text-xs text-text-tertiary tracking-wide">UTN — Plan 2023</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs text-text-secondary mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-surface placeholder:text-text-tertiary focus:outline-none focus:border-text-secondary transition-colors"
                autoFocus
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={!email.trim().includes('@') || loading}
              className="w-full py-2 text-sm bg-text-primary text-surface rounded-sm hover:bg-text-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Entrar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
