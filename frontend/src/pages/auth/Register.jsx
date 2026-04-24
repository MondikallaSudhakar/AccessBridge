import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getRoleLandingPath } from '../../data/userTypes'
import { USER_TYPE_GUIDES, getUserTypeGuide } from '../../data/userTypes'

const ROLES = USER_TYPE_GUIDES.filter((item) => item.role !== 'SUPER_ADMIN')

const SPECIAL_FIELDS = [
  { name: 'disabilityType', label: 'Disability Type', placeholder: 'e.g. Visual, Hearing, Physical, Intellectual', required: true },
  { name: 'skills', label: 'Skills', placeholder: 'e.g. computer basics, teaching, tailoring, coding', required: true, textarea: true },
  { name: 'supportNeeds', label: 'Support Needs', placeholder: 'e.g. transport support, assistive tech, flexible timings', required: false, textarea: true },
]

const ORG_FIELDS = {
  SCHOOL_ADMIN: [
    { name: 'orgName', label: 'School Name', placeholder: 'e.g. Delhi Public School', required: true },
    { name: 'orgAddress', label: 'Street Address', placeholder: 'Full address', required: true },
    { name: 'orgCity', label: 'City', placeholder: 'e.g. New Delhi', required: false },
    { name: 'orgState', label: 'State', placeholder: 'e.g. Delhi', required: false },
    { name: 'orgCountry', label: 'Country', placeholder: 'India', required: false },
    { name: 'orgWebsiteUrl', label: 'Website URL', placeholder: 'https://...', required: false },
    { name: 'orgDescription', label: 'About the School', placeholder: 'Describe your school and what support you need...', required: false, textarea: true },
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
    { name: 'orgIndustry', label: 'Industry / Sector', placeholder: 'e.g. EdTech, HealthTech, AgriTech', required: false },
    { name: 'orgRegistrationNumber', label: 'Registration / CIN', placeholder: 'Company registration number', required: false },
    { name: 'orgAddress', label: 'Office Address', placeholder: 'Full address', required: true },
    { name: 'orgCity', label: 'City', placeholder: 'e.g. Bangalore', required: false },
    { name: 'orgState', label: 'State', placeholder: 'e.g. Karnataka', required: false },
    { name: 'orgWebsiteUrl', label: 'Website URL', placeholder: 'https://...', required: false },
    { name: 'orgDescription', label: 'About the Startup', placeholder: 'Describe your product and social impact...', required: false, textarea: true },
  ],
}

export default function Register() {
  const [step, setStep] = useState(1) // 1 = role select, 2 = basic info, 3 = org info
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', phone: '' })
  const [orgData, setOrgData] = useState({})
  const [specialData, setSpecialData] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const selectedRole = ROLES.find(r => r.value === formData.role)
  const isSpecial = formData.role === 'SPECIAL_ABLED_PERSON'
  const isOrg = ['SCHOOL_ADMIN', 'NGO_ADMIN', 'STARTUP_ADMIN'].includes(formData.role)
  const requiresExtraStep = isOrg || isSpecial
  const orgFields = ORG_FIELDS[formData.role] || []
  const extraFields = isSpecial ? SPECIAL_FIELDS : orgFields

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleOrgChange = (e) => setOrgData({ ...orgData, [e.target.name]: e.target.value })
  const handleSpecialChange = (e) => setSpecialData({ ...specialData, [e.target.name]: e.target.value })

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role })
    setStep(2)
  }

  const handleBasicSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (requiresExtraStep) {
      setStep(3)
    } else {
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...formData, ...(isOrg ? orgData : specialData) }
      const result = await register(payload)
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

  const totalSteps = requiresExtraStep ? 3 : 2

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center">
            <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
            <div className="w-4 h-7 rounded-sm -ml-1" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
          </div>
          <span className="font-bold text-gray-900">Inclusive Connect</span>
        </div>

        {/* Progress Bar */}
        {step > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
              <span>Step {step - 1} of {totalSteps - 1}</span>
              <span>{Math.round(((step - 1) / (totalSteps - 1)) * 100)}%</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%`, backgroundColor: '#1A8FD1' }}
              ></div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* ── Step 1: Role Selection ─────────────── */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Create an account</h2>
              <p className="text-gray-400 text-sm mb-2">Who are you joining as?</p>
              <p className="text-gray-500 text-xs mb-8">Pick the role that matches why you are joining. The next screens will follow that path.</p>

              <div className="grid grid-cols-1 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.role}
                    onClick={() => handleRoleSelect(role.role)}
                    className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 group"
                    style={{ borderColor: '#e5e7eb' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A8FD1'; e.currentTarget.style.backgroundColor = '#F0F8FF' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{role.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{role.loginPurpose}</div>
                      </div>
                      <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                        {getUserTypeGuide(role.role)?.dashboardPath.replace('/', '')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-center text-gray-400 text-sm mt-8">
                Already have an account?{' '}
                <a href="/login" className="font-semibold hover:opacity-80" style={{ color: '#1A8FD1' }}>Sign in</a>
              </p>
            </div>
          )}

          {/* ── Step 2: Basic Account Info ─────────── */}
          {step === 2 && (
            <form onSubmit={handleBasicSubmit}>
              <div className="px-8 py-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Your account details</h2>
                    {selectedRole && (
                      <p className="text-xs text-gray-400">Registering as: <span className="font-semibold" style={{ color: '#1A8FD1' }}>{selectedRole.label}</span></p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-lg">{error}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      required placeholder="Your full name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    required placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    required placeholder="Min. 8 characters"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                  />
                </div>

                {selectedRole && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Why this role exists</p>
                    <p className="mt-1 text-xs text-gray-600">{selectedRole.loginPurpose}</p>
                  </div>
                )}
              </div>

              <div className="px-8 pb-8">
                <button type="submit"
                  className="w-full text-white font-semibold py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#1A8FD1' }}
                >
                  {isSpecial ? 'Continue to Profile Details →' : isOrg ? 'Continue to Organization Details →' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Organization Info ──────────── */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit}>
              <div className="px-8 py-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">{selectedRole?.label} details</h2>
                    <p className="text-xs text-gray-400">This information helps tailor the right experience for your role</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-lg">{error}</div>
                )}

                {extraFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    {field.textarea ? (
                      <textarea name={field.name} value={(isSpecial ? specialData[field.name] : orgData[field.name]) || ''} onChange={isSpecial ? handleSpecialChange : handleOrgChange}
                        placeholder={field.placeholder} rows={3}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 resize-none"
                      />
                    ) : (
                      <input type="text" name={field.name} value={(isSpecial ? specialData[field.name] : orgData[field.name]) || ''} onChange={isSpecial ? handleSpecialChange : handleOrgChange}
                        required={field.required} placeholder={field.placeholder}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                      />
                    )}
                  </div>
                ))}

                {isSpecial ? (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 leading-relaxed">
                    Your account will be approved automatically so you can start exploring jobs, training, support, and opportunities right away.
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 leading-relaxed">
                    After submitting, your account will be reviewed by a Super Admin. You will be able to log in once approved.
                  </p>
                )}
              </div>

              <div className="px-8 pb-8">
                <button type="submit" disabled={loading}
                  className="w-full text-white font-semibold py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#5BBE00' }}
                >
                  {loading ? 'Submitting...' : isSpecial ? 'Create Specially Abled Profile' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          )}

        </div>

        {step === 1 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        )}
      </div>
    </div>
  )
}
