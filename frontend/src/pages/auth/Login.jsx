import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { getRoleLandingPath } from '../../data/userTypes'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userData = await login(email, password)
      navigate(getRoleLandingPath(userData.role))
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .ln-input {
          width: 100%;
          background: #eef0f6;
          border: 1.5px solid transparent;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 15px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }
        .ln-input::placeholder { color: #9ca3af; }
        .ln-input:focus { border-color: #d1d5db; background: #f0f2f8; }
        .ln-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          padding: 6px 4px;
          transition: color 0.15s;
        }
        .ln-nav-link:hover { color: #111; }
        .ln-footer-link {
          font-size: 13px;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.15s;
        }
        .ln-footer-link:hover { color: #111; }
      `}</style>

      {/* ── TOP NAVBAR ── */}
      <header style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e7eb', padding: '0 40px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        {/* Brand */}
        <span style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>KnotneX</span>

        {/* Center nav links */}
        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Product', 'Features', 'Resources', 'Support'].map((link) => (
            <a key={link} href="#" className="ln-nav-link">{link}</a>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/login" className="ln-nav-link" style={{ fontWeight: 600 }}>Log In</Link>
          <Link
            to="/register"
            style={{ background: '#6ee22a', color: '#111', fontWeight: 700, fontSize: 14, padding: '8px 20px', borderRadius: 999, textDecoration: 'none', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5bcb1e'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#6ee22a'}
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', boxShadow: '0 2px 24px rgba(0,0,0,0.06)', padding: '48px 40px 40px' }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#111', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Sign in</h1>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Welcome back.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#dc2626', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151', marginBottom: 8 }}>
                Email
              </label>
              <input
                className="ln-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="ln-input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                >
                  {showPw ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#374151' : '#111',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                padding: '15px 0',
                borderRadius: 999,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, opacity 0.15s',
                opacity: loading ? 0.75 : 1,
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#222' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#111' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider + Register link */}
          <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 32, paddingTop: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
              New here?{' '}
              <Link to="/register" style={{ fontWeight: 700, color: '#111', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#f5f5f7', borderTop: '1px solid #e5e7eb', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>KnotneX</span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
            <a key={link} href="#" className="ln-footer-link">{link}</a>
          ))}
        </div>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>© 2024 KnotneX. All rights reserved.</span>
      </footer>
    </div>
  )
}
