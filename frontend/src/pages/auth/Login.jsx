// Login Page
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getRoleLandingPath } from '../../data/userTypes'

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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 md:py-14 bg-yc-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-yc-black mb-2">Sign in</h2>
          <p className="text-sm text-gray-500 font-sans">Welcome back.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800 font-sans">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800 font-sans">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3 text-sm font-medium text-white bg-yc-black transition-opacity hover:opacity-90 disabled:opacity-70 font-sans mt-4"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-500 font-sans">
            New here?{' '}
            <a href="/register" className="font-semibold text-yc-black hover:underline">
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
