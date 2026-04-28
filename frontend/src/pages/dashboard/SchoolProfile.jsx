import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const BASE = 'http://localhost:8081/api'

const NEED_CATEGORIES = [
  { value: 'FUNDS', label: 'Funds / Financial Aid', icon: '₹' },
  { value: 'EQUIPMENT', label: 'Equipment / Devices', icon: '🖥' },
  { value: 'SUPPORT', label: 'Volunteer Support', icon: '🤝' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure', icon: '🏗' },
  { value: 'THERAPY', label: 'Therapy / Medical', icon: '⚕' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
]

const ACHIEVEMENT_CATEGORIES = [
  { value: 'ACADEMIC', label: 'Academic', color: '#1A8FD1', bg: '#E8F4FC' },
  { value: 'SPORTS', label: 'Sports', color: '#5BBE00', bg: '#EEF8E0' },
  { value: 'ARTS', label: 'Arts & Culture', color: '#7B1FA2', bg: '#F3E5F5' },
  { value: 'COMMUNITY', label: 'Community', color: '#e65100', bg: '#FFF3E0' },
  { value: 'AWARD', label: 'Award / Recognition', color: '#C62828', bg: '#FCE4EC' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure', color: '#00796B', bg: '#E0F2F1' },
  { value: 'OTHER', label: 'Other', color: '#616161', bg: '#F5F5F5' },
]

const DISABILITY_OPTIONS = [
  'Visual Impairment',
  'Hearing Impairment',
  'Physical / Motor Disability',
  'Intellectual / Cognitive Disability',
  'Autism Spectrum',
  'Multiple Disabilities',
  'Speech & Language',
]

const categoryColor = {
  FUNDS: { bg: '#EEF8E0', text: '#448800' },
  EQUIPMENT: { bg: '#E8F4FC', text: '#1A8FD1' },
  SUPPORT: { bg: '#FFF3E0', text: '#e65100' },
  INFRASTRUCTURE: { bg: '#F3E5F5', text: '#7B1FA2' },
  THERAPY: { bg: '#FCE4EC', text: '#C62828' },
  OTHER: { bg: '#F5F5F5', text: '#616161' },
}

const BLANK_ACHIEVEMENT = { title: '', description: '', category: 'ACADEMIC', year: new Date().getFullYear(), imageUrl: '' }

export default function SchoolProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ── School profile state ─────────────────────────────────
  const [school, setSchool] = useState(null)
  const [form, setForm] = useState({})
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // ── Needs state ──────────────────────────────────────────
  const [needs, setNeeds] = useState([])
  const [needsLoading, setNeedsLoading] = useState(false)
  const [needForm, setNeedForm] = useState({ title: '', description: '', category: 'FUNDS', targetAmount: '', urgent: false })
  const [postingNeed, setPostingNeed] = useState(false)
  const [needError, setNeedError] = useState('')
  const [showNeedForm, setShowNeedForm] = useState(false)

  // ── Achievements state ───────────────────────────────────
  const [achievements, setAchievements] = useState([])
  const [achLoading, setAchLoading] = useState(false)
  const [achForm, setAchForm] = useState(BLANK_ACHIEVEMENT)
  const [achError, setAchError] = useState('')
  const [showAchForm, setShowAchForm] = useState(false)
  const [editingAch, setEditingAch] = useState(null) // achievement being edited

  // ── Tabs ─────────────────────────────────────────────────
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    if (user && user.role !== 'SCHOOL_ADMIN') navigate('/dashboard')
  }, [user])

  useEffect(() => {
    if (!user?.email) return
    fetchSchool()
  }, [user])

  const fetchSchool = async () => {
    setProfileLoading(true)
    try {
      const encoded = encodeURIComponent(user.email)
      const data = await api.get(`/schools/email/${encoded}`)
      setSchool(data)
      setForm(data)
      fetchNeeds(data.id)
      fetchAchievements(data.id)
    } catch {
      setSchool(null)
      setForm({ email: user.email, specialSchool: false })
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchNeeds = async (schoolId) => {
    setNeedsLoading(true)
    try {
      const data = await api.get(`/schools/${schoolId}/needs`)
      setNeeds(Array.isArray(data) ? data : [])
    } catch {
      setNeeds([])
    } finally {
      setNeedsLoading(false)
    }
  }

  const fetchAchievements = async (schoolId) => {
    setAchLoading(true)
    try {
      const data = await api.get(`/schools/${schoolId}/achievements`)
      setAchievements(Array.isArray(data) ? data : [])
    } catch {
      setAchievements([])
    } finally {
      setAchLoading(false)
    }
  }

  // ── Profile handlers ─────────────────────────────────────

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleDisabilityToggle = (type) => {
    const current = (form.disabilityTypes || '').split(',').map(s => s.trim()).filter(Boolean)
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type]
    setForm({ ...form, disabilityTypes: updated.join(', ') })
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setSaving(true)
    try {
      if (school) {
        const updated = await api.put(`/schools/${school.id}`, { ...form, verified: school.verified })
        setSchool(updated)
        setForm(updated)
        setProfileSuccess('Profile saved successfully!')
      } else {
        const created = await api.post(`/schools`, { ...form, email: user.email, verified: false })
        setSchool(created)
        setForm(created)
        setProfileSuccess('School profile created!')
        fetchNeeds(created.id)
        fetchAchievements(created.id)
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // ── Needs handlers ───────────────────────────────────────

  const handleNeedFormChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setNeedForm({ ...needForm, [e.target.name]: val })
  }

  const handlePostNeed = async (e) => {
    e.preventDefault()
    if (!school) return
    setNeedError('')
    setPostingNeed(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE}/schools/${school.id}/needs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: needForm.title,
          description: needForm.description,
          category: needForm.category,
          targetAmount: needForm.targetAmount ? parseFloat(needForm.targetAmount) : 0,
          urgent: needForm.urgent,
        })
      })
      if (!res.ok) throw new Error('Failed to post requirement')
      setNeedForm({ title: '', description: '', category: 'FUNDS', targetAmount: '', urgent: false })
      setShowNeedForm(false)
      fetchNeeds(school.id)
    } catch (err) {
      setNeedError(err.message || 'Failed to post requirement')
    } finally {
      setPostingNeed(false)
    }
  }

  const handleDeleteNeed = async (needId) => {
    const token = localStorage.getItem('token')
    await fetch(`${BASE}/schools/needs/${needId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    fetchNeeds(school.id)
  }

  const handleCloseNeed = async (needId) => {
    const token = localStorage.getItem('token')
    await fetch(`${BASE}/schools/needs/${needId}/close`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } })
    fetchNeeds(school.id)
  }

  // ── Achievement handlers ──────────────────────────────────

  const handleAchFormChange = (e) => {
    setAchForm({ ...achForm, [e.target.name]: e.target.value })
  }

  const openNewAchForm = () => {
    setEditingAch(null)
    setAchForm(BLANK_ACHIEVEMENT)
    setAchError('')
    setShowAchForm(true)
  }

  const openEditAchForm = (ach) => {
    setEditingAch(ach)
    setAchForm({
      title: ach.title || '',
      description: ach.description || '',
      category: ach.category || 'ACADEMIC',
      year: ach.year || new Date().getFullYear(),
      imageUrl: ach.imageUrl || '',
    })
    setAchError('')
    setShowAchForm(true)
  }

  const handleSaveAchievement = async (e) => {
    e.preventDefault()
    if (!school) return
    setAchError('')
    const token = localStorage.getItem('token')
    try {
      const body = JSON.stringify({ ...achForm, year: achForm.year ? parseInt(achForm.year) : null })
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      let res
      if (editingAch) {
        res = await fetch(`${BASE}/schools/achievements/${editingAch.id}`, { method: 'PUT', headers, body })
      } else {
        res = await fetch(`${BASE}/schools/${school.id}/achievements`, { method: 'POST', headers, body })
      }
      if (!res.ok) throw new Error('Failed to save achievement')
      setShowAchForm(false)
      setEditingAch(null)
      setAchForm(BLANK_ACHIEVEMENT)
      fetchAchievements(school.id)
    } catch (err) {
      setAchError(err.message || 'Failed to save achievement')
    }
  }

  const handleDeleteAchievement = async (achId) => {
    if (!window.confirm('Delete this achievement?')) return
    const token = localStorage.getItem('token')
    await fetch(`${BASE}/schools/achievements/${achId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    fetchAchievements(school.id)
  }

  const selectedDisabilities = (form.disabilityTypes || '').split(',').map(s => s.trim()).filter(Boolean)
  const achCatMap = Object.fromEntries(ACHIEVEMENT_CATEGORIES.map(c => [c.value, c]))

  const activeNeedsCount = needs.filter(n => n.status === 'ACTIVE').length
  const closedNeedsCount = needs.filter(n => n.status === 'CLOSED').length
  const totalRaised = needs.reduce((sum, n) => sum + (Number(n.raisedAmount) || 0), 0)
  const totalGoal = needs.reduce((sum, n) => sum + (Number(n.targetAmount) || 0), 0)
  const goalProgress = totalGoal > 0 ? Math.min(100, Math.round((totalRaised / totalGoal) * 100)) : 0
  const achievementCount = achievements.length
  
  const recentNeeds = needs.filter(n => n.status === 'ACTIVE').slice(0, 3)
  const recentAchievements = accomplishments => achievements.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </a>
            <span className="text-gray-200 text-xs">|</span>
            <span className="text-sm font-bold text-gray-900">School Manage</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:block">{user?.email}</span>
            {school?.specialSchool && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>
                Special School
              </span>
            )}
            <button onClick={() => { logout(); navigate('/') }}
              className="text-xs font-semibold text-red-500 border border-red-100 px-3 py-1.5 rounded transition-colors hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#1A8FD1' }}>School Admin</p>
            <h1 className="text-3xl font-black text-gray-900">{school?.name || 'My School'}</h1>
            {school?.city && <p className="text-sm text-gray-400 mt-1">{[school.city, school.state].filter(Boolean).join(', ')}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {school?.verified && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>Verified</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-8 flex-wrap">
          {[
            { key: 'dashboard', label: 'Dashboard Overview' },
            { key: 'profile', label: 'School Profile' },
            { key: 'requirements', label: `Requirements${needs.length ? ` (${activeNeedsCount})` : ''}` },
            { key: 'achievements', label: `Achievements${achievementCount ? ` (${achievementCount})` : ''}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200"
              style={tab === t.key ? { backgroundColor: '#1A8FD1', color: '#fff' } : { color: '#6b7280' }}>
              {t.label}
            </button>
          ))}
        </div>

        {profileLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>)}</div>
        ) : (
          <>
            {/* ── DASHBOARD OVERVIEW TAB ──────────────────────────── */}
            {tab === 'dashboard' && (
              <div className="space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
                    <p className="text-sm font-bold text-gray-400 mb-2">Active Needs</p>
                    <h3 className="text-3xl font-black" style={{ color: activeNeedsCount > 0 ? '#1A8FD1' : '#ccc' }}>{activeNeedsCount}</h3>
                    {needs.some(n => n.urgent && n.status === 'ACTIVE') && (
                      <p className="text-xs font-semibold mt-2" style={{ color: '#C62828' }}>{needs.filter(n => n.urgent && n.status === 'ACTIVE').length} Urgent</p>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
                    <p className="text-sm font-bold text-gray-400 mb-2">Funds Raised</p>
                    <h3 className="text-3xl font-black" style={{ color: '#5BBE00' }}>₹{totalRaised.toLocaleString('en-IN')}</h3>
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${goalProgress}%`, backgroundColor: '#5BBE00' }}></div>
                      </div>
                      <p className="text-xs text-gray-400">of ₹{totalGoal.toLocaleString('en-IN')} goal</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
                    <p className="text-sm font-bold text-gray-400 mb-2">Total Achievements</p>
                    <h3 className="text-3xl font-black" style={{ color: achievementCount > 0 ? '#7B1FA2' : '#ccc' }}>{achievementCount}</h3>
                    <button onClick={() => setTab('achievements')} className="text-xs font-semibold text-gray-400 hover:text-gray-900 mt-2 text-left w-fit transition-colors">
                      View all →
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
                    <p className="text-sm font-bold text-gray-400 mb-2">Needs Fulfilled</p>
                    <h3 className="text-3xl font-black text-gray-800">{closedNeedsCount}</h3>
                    <p className="text-xs text-gray-400 mt-2">Impact created</p>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Recent Activity */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Recent Needs */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Recent Requirements</h3>
                        <button onClick={() => setTab('requirements')} className="text-xs font-semibold" style={{ color: '#1A8FD1' }}>View all details →</button>
                      </div>
                      <div className="p-6">
                        {recentNeeds.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-xs text-gray-400 mb-3">No active requirements.</p>
                            <button onClick={() => { setTab('requirements'); setShowNeedForm(true) }} className="text-sm font-semibold rounded-lg px-4 py-2 text-white" style={{ backgroundColor: '#5BBE00' }}>
                              Post your first requirement
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentNeeds.map(need => {
                              const c = categoryColor[need.category] || categoryColor.OTHER
                              return (
                                <div key={need.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.bg, color: c.text }}>
                                    {NEED_CATEGORIES.find(cat => cat.value === need.category)?.icon || '📋'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 truncate">{need.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">₹{Number(need.raisedAmount || 0).toLocaleString()} / ₹{Number(need.targetAmount || 0).toLocaleString()}</p>
                                  </div>
                                  {need.urgent && <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>URGENT</span>}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Achievements */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Recent Achievements</h3>
                        <button onClick={() => setTab('achievements')} className="text-xs font-semibold" style={{ color: '#1A8FD1' }}>Manage →</button>
                      </div>
                      <div className="p-6">
                        {achievements.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-4">No achievements documented.</p>
                        ) : (
                          <div className="space-y-4">
                            {achievements.slice(0, 3).map(ach => (
                              <div key={ach.id} className="flex items-center gap-3">
                                <span className="text-xl">🏆</span>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm text-gray-900">{ach.title}</h4>
                                  <p className="text-xs text-gray-400 mt-0.5">{achCatMap[ach.category]?.label || ach.category} • {ach.year}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quick Actions & Help */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button onClick={() => { setTab('requirements'); setShowNeedForm(true) }} className="w-full text-left text-sm font-semibold text-gray-800 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 flex justify-between items-center group">
                          <span>+ Post Requirement</span>
                          <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
                        </button>
                        <button onClick={() => { setTab('achievements'); openNewAchForm() }} className="w-full text-left text-sm font-semibold text-gray-800 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 flex justify-between items-center group">
                          <span>+ Add Achievement</span>
                          <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
                        </button>
                        <button onClick={() => setTab('profile')} className="w-full text-left text-sm font-semibold text-gray-800 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 flex justify-between items-center group">
                          <span>✎ Edit Profile</span>
                          <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-center p-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Public Listing</h3>
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed">See how your school appears to donors and NGOs on the community hub.</p>
                      <a href={`/schools/${school?.id}`} target="_blank" className="text-sm font-semibold block py-2 px-4 rounded-lg transition-colors border hover:bg-gray-50" style={{ color: '#1A8FD1', borderColor: '#1A8FD1' }}>
                        View Public Profile
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFILE TAB ─────────────────────────────────────── */}
            {tab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <form onSubmit={handleProfileSave} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-50">
                      <h2 className="font-bold text-gray-900">School Information</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Visible publicly on the community directory</p>
                    </div>
                    <div className="px-8 py-6 space-y-5">
                      {profileError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-lg">{profileError}</div>}
                      {profileSuccess && <div className="text-sm p-4 rounded-lg" style={{ backgroundColor: '#EEF8E0', color: '#3a7a00' }}>{profileSuccess}</div>}

                      {/* Special School Toggle */}
                      <div className="border rounded-xl p-5" style={{ borderColor: form.specialSchool ? '#C62828' : '#e5e7eb', backgroundColor: form.specialSchool ? '#FFF5F5' : '#fafafa' }}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" name="specialSchool"
                            checked={!!form.specialSchool}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded"
                          />
                          <div>
                            <div className="text-sm font-bold text-gray-900">Special School for Disabled Students</div>
                            <div className="text-xs text-gray-400 mt-0.5">Check this if your school specifically serves or includes students with disabilities. This adds a special badge to your listing.</div>
                          </div>
                        </label>
                        {form.specialSchool && (
                          <div className="mt-4 ml-7">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Types of disabilities supported:</p>
                            <div className="flex flex-wrap gap-2">
                              {DISABILITY_OPTIONS.map(type => (
                                <button type="button" key={type}
                                  onClick={() => handleDisabilityToggle(type)}
                                  className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                                  style={selectedDisabilities.includes(type)
                                    ? { backgroundColor: '#C62828', color: '#fff', borderColor: '#C62828' }
                                    : { backgroundColor: '#fff', color: '#666', borderColor: '#e5e7eb' }
                                  }>
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Basic fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'name', label: 'School Name', required: true, placeholder: 'e.g. Delhi Public School' },
                          { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                          { name: 'address', label: 'Address', required: true, placeholder: 'Full street address' },
                          { name: 'city', label: 'City', placeholder: 'e.g. New Delhi' },
                          { name: 'state', label: 'State', placeholder: 'e.g. Delhi' },
                          { name: 'country', label: 'Country', placeholder: 'India' },
                          { name: 'websiteUrl', label: 'Website URL', placeholder: 'https://yourschool.edu.in' },
                          { name: 'logoUrl', label: 'Logo URL', placeholder: 'https://...' },
                        ].map(f => (
                          <div key={f.name}>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}{f.required && <span className="text-red-400"> *</span>}</label>
                            <input type="text" name={f.name} value={form[f.name] || ''} onChange={handleChange}
                              required={f.required} placeholder={f.placeholder}
                              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">About the School</label>
                        <textarea name="description" rows={3} value={form.description || ''} onChange={handleChange}
                          placeholder="Describe your school, programs, and community needs..."
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 resize-none"
                        />
                      </div>
                    </div>
                    <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex justify-end">
                      <button type="submit" disabled={saving}
                        className="text-sm font-semibold text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                        style={{ backgroundColor: '#1A8FD1' }}>
                        {saving ? 'Saving...' : school ? 'Save Changes' : 'Create Profile'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Public Preview</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8F4FC', color: '#1A8FD1' }}>School</span>
                        {form.specialSchool && <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>Special School</span>}
                        {school?.verified && <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>Verified</span>}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{form.name || 'Your School Name'}</h3>
                      <p className="text-xs text-gray-400 mb-2">{[form.city, form.state].filter(Boolean).join(', ') || 'City, State'}</p>
                      {form.specialSchool && selectedDisabilities.length > 0 && (
                        <p className="text-xs text-gray-500 mb-2">Supports: {selectedDisabilities.join(' • ')}</p>
                      )}
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{form.description || 'School description...'}</p>
                      <div className="mt-4 text-xs font-semibold" style={{ color: '#1A8FD1' }}>Support this school →</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</h3>
                    <div className="space-y-2.5">
                      <button onClick={() => setTab('requirements')}
                        className="w-full text-sm font-semibold text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#5BBE00' }}>
                        Post a Requirement
                      </button>
                      <button onClick={() => setTab('achievements')}
                        className="w-full text-sm font-semibold text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#1A8FD1' }}>
                        Add Achievement
                      </button>
                      <a href="/" target="_blank"
                        className="w-full text-sm font-semibold border py-2.5 rounded-lg text-center block transition-colors hover:bg-gray-50"
                        style={{ color: '#1A8FD1', borderColor: '#1A8FD1' }}>
                        View Public Listing
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── REQUIREMENTS TAB ────────────────────────────────── */}
            {tab === 'requirements' && (
              <div>
                {!school ? (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <p className="text-gray-400 text-sm mb-4">Create your school profile first before posting requirements.</p>
                    <button onClick={() => setTab('profile')} className="text-sm font-semibold" style={{ color: '#1A8FD1' }}>Go to Profile →</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Post New Requirement */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
                        <div>
                          <h2 className="font-bold text-gray-900">Post a Requirement</h2>
                          <p className="text-xs text-gray-400 mt-0.5">Share what your school needs — donors can see and respond</p>
                        </div>
                        {!showNeedForm && (
                          <button onClick={() => setShowNeedForm(true)}
                            className="text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#5BBE00' }}>
                            + New Requirement
                          </button>
                        )}
                      </div>

                      {showNeedForm && (
                        <form onSubmit={handlePostNeed} className="px-6 py-5 space-y-4">
                          {needError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg">{needError}</div>}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Requirement Title *</label>
                              <input type="text" name="title" value={needForm.title} onChange={handleNeedFormChange}
                                required placeholder="e.g. Wheelchair-accessible ramps for 3 classrooms"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
                              <select name="category" value={needForm.category} onChange={handleNeedFormChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2">
                                {NEED_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Amount (₹)</label>
                              <input type="number" name="targetAmount" value={needForm.targetAmount} onChange={handleNeedFormChange}
                                placeholder="0 if non-monetary"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description *</label>
                              <textarea name="description" rows={3} value={needForm.description} onChange={handleNeedFormChange}
                                required placeholder="Explain the requirement in detail — why it's needed, how many students it will help..."
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 resize-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700">
                                <input type="checkbox" name="urgent" checked={needForm.urgent} onChange={handleNeedFormChange} className="w-4 h-4 rounded" />
                                Mark as <span className="text-red-600 font-semibold">URGENT</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={postingNeed}
                              className="text-sm font-semibold text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                              style={{ backgroundColor: '#5BBE00' }}>
                              {postingNeed ? 'Posting...' : 'Post Requirement'}
                            </button>
                            <button type="button" onClick={() => setShowNeedForm(false)}
                              className="text-sm font-semibold border rounded-lg px-6 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Requirements List */}
                    <div>
                      <h2 className="text-lg font-black text-gray-900 mb-4">
                        Active Requirements
                        <span className="ml-2 text-sm font-semibold text-gray-400">({needs.filter(n => n.status === 'ACTIVE').length})</span>
                      </h2>

                      {needsLoading ? (
                        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}</div>
                      ) : needs.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                          <p className="text-gray-400 text-sm">No requirements posted yet.</p>
                          <button onClick={() => setShowNeedForm(true)} className="text-xs font-semibold mt-3 inline-block" style={{ color: '#5BBE00' }}>
                            Post your first requirement →
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {needs.filter(n => n.status === 'ACTIVE').map(need => {
                            const colors = categoryColor[need.category] || categoryColor.OTHER
                            return (
                              <div key={need.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>
                                      {NEED_CATEGORIES.find(c => c.value === need.category)?.label || need.category}
                                    </span>
                                    {need.urgent && (
                                      <span className="text-xs font-bold px-2 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>
                                        URGENT
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleCloseNeed(need.id)}
                                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Close</button>
                                    <button onClick={() => handleDeleteNeed(need.id)}
                                      className="text-xs text-red-400 hover:text-red-700 transition-colors">Delete</button>
                                  </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1">{need.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{need.description}</p>
                                {need.targetAmount > 0 && (
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs text-gray-400">Target</p>
                                      <p className="text-sm font-black" style={{ color: '#1A8FD1' }}>₹{Number(need.targetAmount).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-400">Raised</p>
                                      <p className="text-sm font-black" style={{ color: '#5BBE00' }}>₹{Number(need.raisedAmount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Closed Requirements */}
                      {needs.filter(n => n.status === 'CLOSED').length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Closed / Fulfilled</h3>
                          <div className="space-y-2">
                            {needs.filter(n => n.status === 'CLOSED').map(need => (
                              <div key={need.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between opacity-60">
                                <div>
                                  <span className="text-xs font-semibold text-gray-400 mr-2">{need.category}</span>
                                  <span className="text-sm text-gray-600">{need.title}</span>
                                </div>
                                <button onClick={() => handleDeleteNeed(need.id)} className="text-xs text-red-400 hover:text-red-700">Delete</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ACHIEVEMENTS TAB ─────────────────────────────────── */}
            {tab === 'achievements' && (
              <div>
                {!school ? (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <p className="text-gray-400 text-sm mb-4">Create your school profile first before posting achievements.</p>
                    <button onClick={() => setTab('profile')} className="text-sm font-semibold" style={{ color: '#1A8FD1' }}>Go to Profile →</button>
                  </div>
                ) : (
                  <div className="space-y-6">

                    {/* Add / Edit Form */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
                        <div>
                          <h2 className="font-bold text-gray-900">{showAchForm ? (editingAch ? 'Edit Achievement' : 'New Achievement') : 'Achievements'}</h2>
                          <p className="text-xs text-gray-400 mt-0.5">Showcase your school's milestones — visible publicly on your profile page</p>
                        </div>
                        {!showAchForm && (
                          <button onClick={openNewAchForm}
                            className="text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#1A8FD1' }}>
                            + Add Achievement
                          </button>
                        )}
                      </div>

                      {showAchForm && (
                        <form onSubmit={handleSaveAchievement} className="px-6 py-5 space-y-4">
                          {achError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg">{achError}</div>}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
                              <input type="text" name="title" value={achForm.title} onChange={handleAchFormChange}
                                required placeholder="e.g. 1st Place — State Science Olympiad 2024"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
                              <select name="category" value={achForm.category} onChange={handleAchFormChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2">
                                {ACHIEVEMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year</label>
                              <input type="number" name="year" value={achForm.year} onChange={handleAchFormChange}
                                placeholder={String(new Date().getFullYear())} min="1900" max="2100"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                              <textarea name="description" rows={3} value={achForm.description} onChange={handleAchFormChange}
                                placeholder="Describe the achievement — context, impact, number of students involved..."
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 resize-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image URL (optional)</label>
                              <input type="url" name="imageUrl" value={achForm.imageUrl} onChange={handleAchFormChange}
                                placeholder="https://... (photo of trophy, certificate, etc.)"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button type="submit"
                              className="text-sm font-semibold text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#1A8FD1' }}>
                              {editingAch ? 'Save Changes' : 'Post Achievement'}
                            </button>
                            <button type="button" onClick={() => { setShowAchForm(false); setEditingAch(null) }}
                              className="text-sm font-semibold border rounded-lg px-6 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Achievement List */}
                    {achLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>)}
                      </div>
                    ) : achievements.length === 0 ? (
                      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                        <p className="text-3xl mb-3">🏆</p>
                        <p className="text-gray-400 text-sm">No achievements added yet.</p>
                        <button onClick={openNewAchForm} className="text-xs font-semibold mt-3 inline-block" style={{ color: '#1A8FD1' }}>
                          Add your first achievement →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map(ach => {
                          const cat = achCatMap[ach.category] || achCatMap.OTHER
                          return (
                            <div key={ach.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                              {ach.imageUrl && (
                                <div className="h-36 overflow-hidden">
                                  <img src={ach.imageUrl} alt={ach.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                              )}
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                      style={{ backgroundColor: cat.bg, color: cat.color }}>
                                      {cat.label}
                                    </span>
                                    {ach.year && (
                                      <span className="text-xs text-gray-400 font-medium">{ach.year}</span>
                                    )}
                                  </div>
                                  <div className="flex gap-3 flex-shrink-0">
                                    <button onClick={() => openEditAchForm(ach)}
                                      className="text-xs font-semibold transition-colors hover:opacity-70"
                                      style={{ color: '#1A8FD1' }}>Edit</button>
                                    <button onClick={() => handleDeleteAchievement(ach.id)}
                                      className="text-xs text-red-400 hover:text-red-700 transition-colors">Delete</button>
                                  </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{ach.title}</h3>
                                {ach.description && (
                                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{ach.description}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
