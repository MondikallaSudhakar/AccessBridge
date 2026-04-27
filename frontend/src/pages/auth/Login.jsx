// Login Page
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getRoleLandingPath } from '../../data/userTypes'

const COLORS = {
  green: '#5BCB2B',
  greenSoft: '#eaf6ef',
  greenBorder: '#c8e6d2',
  blue: '#0197B2',
  blueSoft: '#e7f7fb',
  blueBorder: '#b8e7f1',
  heroGradient: 'linear-gradient(120deg, #0197B2 0%, #5BCB2B 100%)',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const userData = await login(email, password)
      navigate(getRoleLandingPath(userData.role))
    } catch (err) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 md:py-14" style={{ background: 'linear-gradient(170deg, #f7fcff 0%, #ebf9ff 45%, #f0fbf2 100%)' }}>
      <div className="pointer-events-none absolute -left-16 top-8 h-52 w-52 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: COLORS.blue }} />
      <div className="pointer-events-none absolute -right-20 bottom-4 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: COLORS.green }} />

      <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl border bg-white shadow-xl" style={{ borderColor: COLORS.blueBorder }}>
          <div className="px-6 pb-6 pt-7 text-center sm:px-8">
            <div className="mx-auto mb-4 h-11 w-11 rounded-2xl text-sm font-black text-white grid place-items-center" style={{ background: COLORS.heroGradient }}>
              IC
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-600">Sign in to continue your community work.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6 sm:px-8 sm:pb-8">
            {error && (
              <div className="rounded-xl border p-3 text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fff1f2', color: '#b91c1c' }}>
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-500"
                style={{ borderColor: COLORS.blueBorder, backgroundColor: COLORS.blueSoft }}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-500"
                style={{ borderColor: COLORS.greenBorder, backgroundColor: COLORS.greenSoft }}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: COLORS.heroGradient }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="border-t px-6 pb-7 pt-5 text-center sm:px-8" style={{ borderColor: COLORS.blueBorder }}>
            <p className="text-sm text-slate-600">
              New here?{' '}
              <a href="/register" className="font-semibold" style={{ color: COLORS.blue }}>
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
