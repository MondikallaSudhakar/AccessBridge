import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getRoleLandingPath } from '../../data/userTypes'
import { USER_TYPE_GUIDES } from '../../data/userTypes'

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

const COLORS = {
  primary: '#0197B2',
  primarySoft: '#e6f8fc',
  primaryBorder: '#a8dce8',
  accent: '#5BCB2B',
  accentSoft: '#ecfbe3',
  accentBorder: '#c9eeb5',
}

export default function Register() {
  const [step, setStep] = useState(1) // 1 = basic info, 2 = role-specific info
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', phone: '' })
  const [orgData, setOrgData] = useState({})
  const [specialData, setSpecialData] = useState({})
  const [guardianData, setGuardianData] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const selectedRole = ROLES.find(r => r.role === formData.role)
  const isSpecial = formData.role === 'SPECIAL_ABLED_PERSON'
  const isGuardian = formData.role === 'GUARDIAN_CAREGIVER'
  const isOrg = ['SCHOOL_ADMIN', 'NGO_ADMIN', 'STARTUP_ADMIN'].includes(formData.role)
  const requiresExtraStep = isOrg || isSpecial || isGuardian
  const orgFields = ORG_FIELDS[formData.role] || []
  const extraFields = isSpecial ? SPECIAL_FIELDS : isGuardian ? GUARDIAN_FIELDS : orgFields

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleOrgChange = (e) => setOrgData({ ...orgData, [e.target.name]: e.target.value })
  const handleSpecialChange = (e) => setSpecialData({ ...specialData, [e.target.name]: e.target.value })
  const handleGuardianChange = (e) => setGuardianData({ ...guardianData, [e.target.name]: e.target.value })

  const handleBasicSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!formData.role) {
      setError('Please select a role')
      return
    }
    if (requiresExtraStep) {
      setStep(2)
    } else {
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const extraPayload = isOrg ? orgData : isSpecial ? specialData : guardianData
      const payload = { ...formData, ...extraPayload }
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

  const totalSteps = requiresExtraStep ? 2 : 1

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 md:py-14" style={{ background: '#f3fbff' }}>
      <div className="pointer-events-none absolute -left-16 top-8 h-52 w-52 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: COLORS.primary }} />
      <div className="pointer-events-none absolute -right-20 bottom-4 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: COLORS.accent }} />

      <div className="mx-auto w-full max-w-xl">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0197B2] text-sm font-black text-white">
            IC
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-900">Inclusive Connect</span>
        </div>

        {/* Progress Bar */}
        {totalSteps > 1 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: COLORS.primaryBorder }}>
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{ width: `${(step / totalSteps) * 100}%`, backgroundColor: COLORS.accent }}
              ></div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border bg-white shadow-xl" style={{ borderColor: COLORS.primaryBorder }}>

          {/* ── Step 1: Basic Account Info ─────────── */}
          {step === 1 && (
            <form onSubmit={handleBasicSubmit}>
              <div className="border-b px-8 py-6" style={{ borderColor: COLORS.primaryBorder }}>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Create your account</h2>
                  <p className="text-xs text-slate-500">Simple details to get started.</p>
                </div>
              </div>

              <div className="px-8 py-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-lg">{error}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2"
                      style={{ borderColor: COLORS.primaryBorder, backgroundColor: COLORS.primarySoft }}
                    >
                      <option value="">Select your role</option>
                      {ROLES.map((role) => (
                        <option key={role.role} value={role.role}>{role.label}</option>
                      ))}
                    </select>
                  </div>
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
                  <div className="rounded-xl border p-4 text-sm" style={{ borderColor: COLORS.accentBorder, backgroundColor: COLORS.accentSoft }}>
                    <p className="font-semibold text-slate-900">Role summary</p>
                    <p className="mt-1 text-xs text-slate-600">{selectedRole.loginPurpose}</p>
                  </div>
                )}
              </div>

              <div className="px-8 pb-8">
                <button type="submit"
                  className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                    style={{ backgroundColor: COLORS.accent }}
                >
                  {isSpecial || isGuardian ? 'Continue to profile details ->' : isOrg ? 'Continue to organization details ->' : 'Create account'}
                </button>
                <p className="mt-4 text-center text-sm text-slate-600">
                  Already have an account?{' '}
                  <a href="/login" className="font-semibold hover:opacity-80" style={{ color: COLORS.primary }}>Sign in</a>
                </p>
              </div>
            </form>
          )}

          {/* ── Step 2: Role-Specific Info ────────── */}
          {step === 2 && requiresExtraStep && (
            <form onSubmit={handleFinalSubmit}>
              <div className="border-b px-8 py-6" style={{ borderColor: COLORS.primaryBorder }}>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStep(1)} className="text-slate-400 transition-colors hover:text-slate-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedRole?.label} details</h2>
                    <p className="text-xs text-slate-500">Add a few extra details to complete registration.</p>
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
                      <textarea name={field.name} value={(isSpecial ? specialData[field.name] : isGuardian ? guardianData[field.name] : orgData[field.name]) || ''} onChange={isSpecial ? handleSpecialChange : isGuardian ? handleGuardianChange : handleOrgChange}
                        placeholder={field.placeholder} rows={3}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 resize-none"
                      />
                    ) : (
                      <input type="text" name={field.name} value={(isSpecial ? specialData[field.name] : isGuardian ? guardianData[field.name] : orgData[field.name]) || ''} onChange={isSpecial ? handleSpecialChange : isGuardian ? handleGuardianChange : handleOrgChange}
                        required={field.required} placeholder={field.placeholder}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                      />
                    )}
                  </div>
                ))}

                {isSpecial ? (
                  <p className="rounded-lg p-3 text-xs leading-relaxed text-slate-600" style={{ backgroundColor: COLORS.primarySoft }}>
                    Your account is approved automatically. You can start exploring opportunities right away.
                  </p>
                ) : isGuardian ? (
                  <p className="rounded-lg p-3 text-xs leading-relaxed text-slate-600" style={{ backgroundColor: COLORS.primarySoft }}>
                    Your account is approved automatically. You can start supporting your dependent immediately.
                  </p>
                ) : (
                  <p className="rounded-lg p-3 text-xs leading-relaxed text-slate-600" style={{ backgroundColor: COLORS.primarySoft }}>
                    After submission, your account will be reviewed by admin. You can sign in once approved.
                  </p>
                )}
              </div>

              <div className="px-8 pb-8">
                <button type="submit" disabled={loading}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  {loading ? 'Submitting...' : isSpecial ? 'Create specially abled profile' : isGuardian ? 'Create guardian profile' : 'Submit for approval'}
                </button>
              </div>
            </form>
          )}

        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
