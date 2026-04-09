import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function SchoolProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [school, setSchool] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect if not a school admin
  useEffect(() => {
    if (user && user.role !== 'SCHOOL_ADMIN') {
      navigate('/dashboard')
    }
  }, [user])

  // Fetch school by the logged-in user's email
  useEffect(() => {
    if (!user?.email) return
    const emailEncoded = encodeURIComponent(user.email)
    api.get(`/schools/email/${emailEncoded}`)
      .then((data) => {
        setSchool(data)
        setForm(data)
      })
      .catch(() => {
        // No school record found yet — show create form
        setSchool(null)
        setForm({ email: user.email })
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const updated = await api.put(`/schools/${school.id}`, form)
      setSchool(updated)
      setForm(updated)
      setSuccess('School profile updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update school profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)
    try {
      const created = await api.post(`/schools`, { ...form, email: user.email, verified: false })
      setSchool(created)
      setForm(created)
      setSuccess('School profile created! It will appear in the public directory.')
    } catch (err) {
      setError(err.message || 'Failed to create school profile')
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const fields = [
    { name: 'name', label: 'School Name', type: 'text', required: true, placeholder: 'e.g. Delhi Public School' },
    { name: 'phone', label: 'Phone Number', type: 'text', required: false, placeholder: '+91 98765 43210' },
    { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Full street address' },
    { name: 'city', label: 'City', type: 'text', required: false, placeholder: 'e.g. New Delhi' },
    { name: 'state', label: 'State', type: 'text', required: false, placeholder: 'e.g. Delhi' },
    { name: 'country', label: 'Country', type: 'text', required: false, placeholder: 'e.g. India' },
    { name: 'websiteUrl', label: 'Website URL', type: 'url', required: false, placeholder: 'https://yourschool.edu.in' },
    { name: 'logoUrl', label: 'Logo URL', type: 'url', required: false, placeholder: 'https://...' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </a>
            <span className="text-gray-200">|</span>
            <h1 className="text-sm font-bold text-gray-900">School Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 px-3 py-1.5 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1A8FD1' }}>School Admin</p>
            {school?.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black text-gray-900">
            {school ? 'Update School Profile' : 'Create School Profile'}
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {school
              ? 'Changes made here will be visible publicly on the landing page directory.'
              : 'Create your school profile to appear in the public community directory.'}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ─── Edit Form ───────────────────── */}
            <div className="lg:col-span-2">
              <form onSubmit={school ? handleSave : handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900">Basic Information</h3>
                  <p className="text-xs text-gray-400 mt-0.5">All fields with * are required</p>
                </div>

                <div className="px-8 py-6 space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="border text-sm p-4 rounded-lg" style={{ backgroundColor: '#EEF8E0', borderColor: '#5BBE00', color: '#3a7a00' }}>
                      {success}
                    </div>
                  )}

                  {/* Description full width */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={form.description || ''}
                      onChange={handleChange}
                      placeholder="Briefly describe your school, its mission, and what support you need..."
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                      style={{ '--tw-ring-color': '#1A8FD1' }}
                    />
                  </div>

                  {/* Grid of fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {fields.map((f) => (
                      <div key={f.name}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          {f.label} {f.required && <span className="text-red-400">*</span>}
                        </label>
                        <input
                          type={f.type}
                          name={f.name}
                          value={form[f.name] || ''}
                          onChange={handleChange}
                          required={f.required}
                          placeholder={f.placeholder}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {school ? `Last updated: School ID #${school.id}` : 'Profile will be reviewed by admin'}
                  </p>
                  <button
                    type="submit"
                    disabled={saving || creating}
                    className="text-sm font-semibold text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: '#1A8FD1' }}
                  >
                    {saving || creating ? 'Saving...' : school ? 'Save Changes' : 'Create Profile'}
                  </button>
                </div>
              </form>
            </div>

            {/* ─── Preview / Status sidebar ───── */}
            <div className="space-y-5">
              {/* Public Preview Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Public Preview</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8F4FC', color: '#1A8FD1' }}>
                      School
                    </span>
                    {school?.verified && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{form.name || 'Your School Name'}</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    {[form.city, form.state].filter(Boolean).join(', ') || 'City, State'}
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {form.description || 'Your school description will appear here.'}
                  </p>
                  <div className="mt-4 text-xs font-semibold" style={{ color: '#1A8FD1' }}>
                    Support this school →
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Profile Status</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Profile</span>
                    <span className="font-semibold" style={{ color: school ? '#5BBE00' : '#f59e0b' }}>
                      {school ? 'Created' : 'Not Created'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Verified</span>
                    <span className="font-semibold" style={{ color: school?.verified ? '#5BBE00' : '#6b7280' }}>
                      {school?.verified ? 'Yes' : 'Pending Admin'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Public Listing</span>
                    <span className="font-semibold" style={{ color: school ? '#5BBE00' : '#6b7280' }}>
                      {school ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {school && (
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full text-center text-xs font-semibold border rounded-lg py-2 block transition-colors hover:bg-gray-50"
                    style={{ color: '#1A8FD1', borderColor: '#1A8FD1' }}
                  >
                    View Public Listing
                  </a>
                )}
              </div>

              {!school && (
                <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Create your profile to appear in the public directory on the home page.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
