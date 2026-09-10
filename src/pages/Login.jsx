import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Не вдалося увійти. Перевір e-mail і пароль.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-wine" />
          <span className="w-2.5 h-2.5 rounded-full bg-caramel" />
          <span className="w-2.5 h-2.5 rounded-full bg-sage" />
        </div>
        <h1 className="font-display text-3xl text-center mb-1">Студія</h1>
        <p className="text-inkSoft text-sm text-center mb-8">Записи, клієнтки та фінанси в одному місці</p>

        <form onSubmit={submit} className="card p-5 space-y-4">
          <div>
            <label className="field-label">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="field-label">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-wine-dark">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Входимо…' : 'Увійти'}
          </button>
        </form>
        <p className="text-xs text-inkSoft text-center mt-4">
          Акаунт створюється вручну у Firebase Console → Authentication.
        </p>
      </div>
    </div>
  )
}
