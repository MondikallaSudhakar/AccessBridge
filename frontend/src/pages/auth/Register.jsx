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
  THERAPY_CENTER_ADMIN: [
    { name: 'orgName', label: 'Therapy Center Name', placeholder: 'e.g. Healing Hearts Therapy Center', required: true },
    { name: 'orgRegistrationNumber', label: 'Registration / License Number', placeholder: 'Medical registration number', required: false },
    { name: 'orgAddress', label: 'Center Address', placeholder: 'Full address', required: true },
    { name: 'orgCity', label: 'City', placeholder: 'e.g. Mumbai', required: false },
    { name: 'orgState', label: 'State', placeholder: 'e.g. Maharashtra', required: false },
    { name: 'orgWebsiteUrl', label: 'Website URL', placeholder: 'https://...', required: false },
    { name: 'orgIndustry', label: 'Specialization', placeholder: 'e.g. Speech Therapy, Physical Therapy, Mental Health', required: false },
    { name: 'orgDescription', label: 'About the Therapy Center', placeholder: 'Describe your services and expertise...', required: false, textarea: true },
    { name: 'orgMission', label: 'Therapists Info', placeholder: 'Information about your therapy staff and qualifications', required: false, textarea: true },
  ],
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
  const isOrg = ['SCHOOL_ADMIN', 'NGO_ADMIN', 'STARTUP_ADMIN', 'THERAPY_CENTER_ADMIN'].includes(formData.role)
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 md:py-14 bg-yc-bg">
      <div className="w-full max-w-xl">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-yc-black mb-2">Create account</h2>
          {totalSteps > 1 && (
            <p className="text-sm text-gray-500 font-sans">Step {step} of {totalSteps}</p>
          )}
        </div>

        <div className="bg-white">

          {/* ── Step 1: Basic Account Info ─────────── */}
          {step === 1 && (
            <form onSubmit={handleBasicSubmit} className="space-y-6">
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 font-sans mb-2">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans"
                  >
                    <option value="">Select your role</option>
                    {ROLES.map((role) => (
                      <option key={role.role} value={role.role}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 font-sans mb-2">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    required placeholder="Your full name"
                    className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 font-sans mb-2">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 font-sans mb-2">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  required placeholder="you@example.com"
                  className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 font-sans mb-2">Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  required placeholder="Min. 8 characters"
                  className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans"
                />
              </div>

              {selectedRole && (
                <div className="rounded border border-gray-200 bg-gray-50 p-4 text-sm">
                  <p className="font-semibold text-gray-900 font-sans">Role summary</p>
                  <p className="mt-1 text-sm text-gray-600 font-sans">{selectedRole.loginPurpose}</p>
                </div>
              )}

              <div className="pt-4">
                <button type="submit"
                  className="w-full rounded-full py-3 text-sm font-medium text-white bg-yc-black transition-opacity hover:opacity-90 font-sans"
                >
                  {isSpecial || isGuardian ? 'Continue to profile details' : isOrg ? 'Continue to organization details' : 'Create account'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Role-Specific Info ────────── */}
          {step === 2 && requiresExtraStep && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <button type="button" onClick={() => setStep(1)} className="text-gray-400 transition-colors hover:text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h3 className="text-xl font-serif text-yc-black">{selectedRole?.label} details</h3>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {extraFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-800 font-sans mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.textarea ? (
                      <textarea name={field.name} value={(isSpecial ? specialData[field.name] : isGuardian ? guardianData[field.name] : orgData[field.name]) || ''} onChange={isSpecial ? handleSpecialChange : isGuardian ? handleGuardianChange : handleOrgChange}
                        placeholder={field.placeholder} rows={3}
                        className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans resize-none"
                      />
                    ) : (
                      <input type="text" name={field.name} value={(isSpecial ? specialData[field.name] : isGuardian ? guardianData[field.name] : orgData[field.name]) || ''} onChange={isSpecial ? handleSpecialChange : isGuardian ? handleGuardianChange : handleOrgChange}
                        required={field.required} placeholder={field.placeholder}
                        className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 font-sans"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded border border-gray-200 bg-gray-50 p-4 mt-6">
                {isSpecial ? (
                  <p className="text-sm leading-relaxed text-gray-600 font-sans">
                    Your account is approved automatically. You can start exploring opportunities right away.
                  </p>
                ) : isGuardian ? (
                  <p className="text-sm leading-relaxed text-gray-600 font-sans">
                    Your account is approved automatically. You can start supporting your dependent immediately.
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-gray-600 font-sans">
                    After submission, your account will be reviewed by admin. You can sign in once approved.
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading}
                  className="w-full rounded-full py-3 text-sm font-medium text-white bg-yc-black transition-opacity hover:opacity-90 disabled:opacity-70 font-sans"
                >
                  {loading ? 'Submitting...' : isSpecial ? 'Create specially abled profile' : isGuardian ? 'Create guardian profile' : 'Submit for approval'}
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-8">
          {step === 1 && (
            <p className="text-sm text-gray-500 font-sans mb-4">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-yc-black hover:underline">Sign in</a>
            </p>
          )}
          <p className="text-xs text-gray-400 font-sans">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
