import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { getRoleLandingPath, USER_TYPE_GUIDES } from '../../data/userTypes'

const ROLES = USER_TYPE_GUIDES.filter((item) => item.role !== 'SUPER_ADMIN')

const SPECIAL_FIELDS = [
  { name: 'disabilityType', label: 'Disability Type', placeholder: 'e.g. Visual, Hearing, Physical, Intellectual', required: true },
  { name: 'skills', label: 'Skills', placeholder: 'e.g. computer basics, teaching, tailoring, coding', required: true, textarea: true },
  { name: 'supportNeeds', label: 'Support Needs', placeholder: 'e.g. transport support, assistive tech, flexible timings', required: false, textarea: true },
]

const GUARDIAN_FIELDS = [
  { name: 'dependentName', label: 'Dependent Name', placeholder: 'Name of the person you support', required: true },
  { name: 'dependentRelation', label: 'Relationship', placeholder: 'e.g. Parent, Sibling, Spouse, Legal Guardian', required: true },
  { name: 'dependentAge', label: 'Dependent Age', placeholder: 'e.g. 12, 24, 68', required: false },
  { name: 'dependentNeeds', label: 'Dependent Needs', placeholder: 'e.g. therapy, school, transport, job support, care help', required: true, textarea: true },
]

const ORG_FIELDS = {
  SCHOOL_ADMIN: [
    { name: 'orgName', label: 'School Name', placeholder: 'e.g. Delhi Public School', required: true },
    { name: 'orgAddress', label: 'Street Address', placeholder: 'Full address', required: true },
    { name: 'orgCity', label: 'City', placeholder: 'e.g. New Delhi', required: false },
    { name: 'orgState', label: 'State', placeholder: 'e.g. Delhi', required: false },
    { name: 'orgCountry', label: 'Country', placeholder: 'India', required: false },
    { name: 'orgWebsiteUrl', label: 'Website URL', placeholder: 'https://...', required: false },
    { name: 'orgDescription', label: 'About the School', placeholder: 'Describe your school...', required: false, textarea: true },
  ],
  NGO_ADMIN: [
    { name: 'orgName', label: 'NGO Name', placeholder: 'e.g. Asha Foundation', required: true },
    { name: 'orgRegistrationNumber', label: 'Registration Number', placeholder: 'NGO Reg. No.', required: false },
    { name: 'orgAddress', label: 'Street Address', placeholder: 'Full address', required: true },
    { name: 'orgCity', label: 'City', placeholder: 'e.g. Mumbai', required: false },
    { name: 'orgState', label: 'State', placeholder: 'e.g. Maharashtra', required: false },
    { name: 'orgWebsiteUrl', label: 'Website URL', placeholder: 'https://...', required: false },
    { name: 'orgMission', label: 'Mission Statement', placeholder: 'What is your core mission?', required: false, textarea: true },
    { name: 'orgDescription', label: 'About the NGO', placeholder: 'Describe your work and impact...', required: false, textarea: true },
  ],
  STARTUP_ADMIN: [
    { name: 'orgName', label: 'Startup Name', placeholder: 'e.g. GreenLeaf Tech', required: true },
    { name: 'orgIndustry', label: 'Industry / Sector', placeholder: 'e.g. EdTech, HealthTech', required: false },
    { name: 'orgRegistrationNumber', label: 'Registration / CIN', placeholder: 'Company registration number', required: false },
    { name: 'orgAddress', label: 'Office Address', placeholder: 'Full address', required: true },
    { name: 'orgCity', label: 'City', placeholder: 'e.g. Bangalore', required: false },
    { name: 'orgState', label: 'State', placeholder: 'e.g. Karnataka', required: false },
    { name: 'orgWebsiteUrl', label: 'Website URL', placeholder: 'https://...', required: false },
    { name: 'orgDescription', label: 'About the Startup', placeholder: 'Describe your product and impact...', required: false, textarea: true },
  ],
  THERAPY_CENTER_ADMIN: [
    { name: 'orgName', label: 'Therapy Center Name', placeholder: 'e.g. Healing Hearts Therapy Center', required: true },
    { name: 'orgRegistrationNumber', label: 'Registration / License Number', placeholder: 'Medical registration number', required: false },
    { name: 'orgAddress', label: 'Center Address', placeholder: 'Full address', required: true },
    { name: 'orgCity', label: 'City', placeholder: 'e.g. Mumbai', required: false },
    { name: 'orgState', label: 'State', placeholder: 'e.g. Maharashtra', required: false },
    { name: 'orgWebsiteUrl', label: 'Website URL', placeholder: 'https://...', required: false },
    { name: 'orgIndustry', label: 'Specialization', placeholder: 'e.g. Speech Therapy, Physical Therapy', required: false },
    { name: 'orgDescription', label: 'About the Center', placeholder: 'Describe your services...', required: false, textarea: true },
  ],
}

export default function Register() {
  const [step, setStep]             = useState(1)
  const [formData, setFormData]     = useState({ name: '', email: '', password: '', role: '', phone: '' })
  const [orgData, setOrgData]       = useState({})
  const [specialData, setSpecialData] = useState({})
  const [guardianData, setGuardianData] = useState({})
  const [showPw, setShowPw]         = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const { register } = useAuth()
  const navigate     = useNavigate()

  const selectedRole     = ROLES.find(r => r.role === formData.role)
  const isSpecial        = formData.role === 'SPECIAL_ABLED_PERSON'
  const isGuardian       = formData.role === 'GUARDIAN_CAREGIVER'
  const isOrg            = ['SCHOOL_ADMIN', 'NGO_ADMIN', 'STARTUP_ADMIN', 'THERAPY_CENTER_ADMIN'].includes(formData.role)
  const requiresExtraStep = isOrg || isSpecial || isGuardian
  const extraFields      = isSpecial ? SPECIAL_FIELDS : isGuardian ? GUARDIAN_FIELDS : (ORG_FIELDS[formData.role] || [])
  const totalSteps       = requiresExtraStep ? 2 : 1

  const handleChange        = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleOrgChange     = (e) => setOrgData({ ...orgData, [e.target.name]: e.target.value })
  const handleSpecialChange = (e) => setSpecialData({ ...specialData, [e.target.name]: e.target.value })
  const handleGuardianChange = (e) => setGuardianData({ ...guardianData, [e.target.name]: e.target.value })
  const getExtraHandler     = () => isSpecial ? handleSpecialChange : isGuardian ? handleGuardianChange : handleOrgChange
  const getExtraValue       = (name) => (isSpecial ? specialData : isGuardian ? guardianData : orgData)[name] || ''

  const handleBasicSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!formData.role) { setError('Please select a role'); return }
    if (requiresExtraStep) setStep(2)
    else handleFinalSubmit()
  }

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const extraPayload = isOrg ? orgData : isSpecial ? specialData : guardianData
      const result = await register({ ...formData, ...extraPayload })
      if (result.token) {
        navigate(getRoleLandingPath(result.role || formData.role))
      } else {
        navigate('/login', { state: { pendingMessage: result.message || 'Registration submitted. Please wait for admin approval.' } })
      }
    } catch (err) {
      setError(err.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .rg-input {
          width: 100%;
          background: #eef0f6;
          border: 1.5px solid transparent;
          border-radius: 10px;
          padding: 13px 16px;
          font-size: 14px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }
        .rg-input::placeholder { color: #9ca3af; }
        .rg-input:focus { border-color: #d1d5db; background: #f0f2f8; }
        .rg-textarea { resize: none; }
        .rg-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #374151;
          margin-bottom: 8px;
        }
        .rg-nav-link {
          font-size: 14px; font-weight: 500; color: #374151;
          text-decoration: none; padding: 6px 4px; transition: color 0.15s;
        }
        .rg-nav-link:hover { color: #111; }
        .rg-footer-link {
          font-size: 13px; color: #6b7280;
          text-decoration: none; transition: color 0.15s;
        }
        .rg-footer-link:hover { color: #111; }
        .rg-step-dot {
          width: 8px; height: 8px; border-radius: 50%;
          transition: background 0.2s;
        }
      `}</style>

      {/* ── TOP NAVBAR ── */}
      <header style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e7eb', padding: '0 40px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>KnotneX</span>
        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Product', 'Features', 'Resources', 'Support'].map((link) => (
            <a key={link} href="#" className="rg-nav-link">{link}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/login" className="rg-nav-link" style={{ fontWeight: 600 }}>Log In</Link>
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
      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px 48px' }}>
        <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', boxShadow: '0 2px 24px rgba(0,0,0,0.06)', padding: '44px 40px 36px' }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              {step === 1 ? 'Create account' : `${selectedRole?.label || 'Role'} details`}
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
              {step === 1 ? 'Join the KnotneX community.' : 'Tell us more about your organization.'}
            </p>

            {/* Step indicator */}
            {totalSteps > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {[1, 2].map((s) => (
                  <div key={s} className="rg-step-dot" style={{ background: step >= s ? '#111' : '#d1d5db' }} />
                ))}
                <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>Step {step} of {totalSteps}</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#dc2626', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleBasicSubmit}>
              {/* Role */}
              <div style={{ marginBottom: 18 }}>
                <label className="rg-label">Role *</label>
                <select
                  name="role" value={formData.role} onChange={handleChange} required
                  className="rg-input"
                  style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
                >
                  <option value="">Select your role…</option>
                  {ROLES.map((r) => <option key={r.role} value={r.role}>{r.label}</option>)}
                </select>
              </div>

              {/* Role hint */}
              {selectedRole && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  {selectedRole.loginPurpose}
                </div>
              )}

              {/* Name + Phone (2 col) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label className="rg-label">Full Name *</label>
                  <input className="rg-input" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your full name" />
                </div>
                <div>
                  <label className="rg-label">Phone</label>
                  <input className="rg-input" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label className="rg-label">Email Address *</label>
                <input className="rg-input" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" autoComplete="email" />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label className="rg-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="rg-input" type={showPw ? 'text' : 'password'}
                    name="password" value={formData.password} onChange={handleChange}
                    required placeholder="Min. 8 characters"
                    autoComplete="new-password" style={{ paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex', alignItems: 'center' }}>
                    {showPw ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit"
                style={{ width: '100%', background: '#111', color: '#fff', fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
              >
                {requiresExtraStep ? 'Continue →' : 'Create account'}
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && requiresExtraStep && (
            <form onSubmit={handleFinalSubmit}>
              {/* Back button */}
              <button type="button" onClick={() => setStep(1)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0, fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back to account info
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {extraFields.map((field) => (
                  <div key={field.name}>
                    <label className="rg-label">
                      {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    {field.textarea ? (
                      <textarea
                        className="rg-input rg-textarea" name={field.name}
                        value={getExtraValue(field.name)} onChange={getExtraHandler()}
                        placeholder={field.placeholder} rows={3}
                      />
                    ) : (
                      <input
                        className="rg-input" type="text" name={field.name}
                        value={getExtraValue(field.name)} onChange={getExtraHandler()}
                        required={field.required} placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Info note */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 24, fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
                {isSpecial || isGuardian
                  ? '✓ Your account is approved automatically. You can start right away.'
                  : '⏳ After submission, your account will be reviewed by admin before you can sign in.'}
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', background: loading ? '#374151' : '#111', color: '#fff', fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 999, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1, fontFamily: "'Inter', sans-serif", transition: 'background 0.15s' }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#222' }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#111' }}
              >
                {loading ? 'Submitting…' : isSpecial ? 'Create profile' : isGuardian ? 'Create guardian profile' : 'Submit for approval'}
              </button>
            </form>
          )}

          {/* Divider + sign-in link */}
          {step === 1 && (
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 28, paddingTop: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 10px' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: 700, color: '#111', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Sign in
                </Link>
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#f5f5f7', borderTop: '1px solid #e5e7eb', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>KnotneX</span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
            <a key={link} href="#" className="rg-footer-link">{link}</a>
          ))}
        </div>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>© 2024 KnotneX. All rights reserved.</span>
      </footer>
    </div>
  )
}
