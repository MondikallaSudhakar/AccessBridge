import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const BASE = 'http://localhost:8081/api'

const CATEGORY_STYLE = {
  FUNDS:          { bg: '#EEF8E0', text: '#448800', label: 'Funds / Financial Aid' },
  EQUIPMENT:      { bg: '#E8F4FC', text: '#1A8FD1', label: 'Equipment / Devices' },
  SUPPORT:        { bg: '#FFF3E0', text: '#e65100', label: 'Volunteer Support' },
  INFRASTRUCTURE: { bg: '#F3E5F5', text: '#7B1FA2', label: 'Infrastructure' },
  THERAPY:        { bg: '#FCE4EC', text: '#C62828', label: 'Therapy / Medical' },
  OTHER:          { bg: '#F5F5F5', text: '#616161', label: 'Other' },
}

const ACH_STYLE = {
  ACADEMIC:       { bg: '#E8F4FC', text: '#1A8FD1', label: 'Academic' },
  SPORTS:         { bg: '#EEF8E0', text: '#5BBE00', label: 'Sports' },
  ARTS:           { bg: '#F3E5F5', text: '#7B1FA2', label: 'Arts & Culture' },
  COMMUNITY:      { bg: '#FFF3E0', text: '#e65100', label: 'Community' },
  AWARD:          { bg: '#FCE4EC', text: '#C62828', label: 'Award / Recognition' },
  INFRASTRUCTURE: { bg: '#E0F2F1', text: '#00796B', label: 'Infrastructure' },
  OTHER:          { bg: '#F5F5F5', text: '#616161', label: 'Other' },
}

async function fetchJSON(url) {
  try {
    const r = await fetch(url)
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export default function SchoolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [school,       setSchool]       = useState(null)
  const [needs,        setNeeds]        = useState([])
  const [achievements, setAchievements] = useState([])
  const [mentors,      setMentors]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [notFound,     setNotFound]     = useState(false)
  const [tab,          setTab]          = useState('overview')

  useEffect(() => {
    Promise.all([
      fetchJSON(`${BASE}/schools/${id}`),
      fetchJSON(`${BASE}/schools/${id}/needs`),
      fetchJSON(`${BASE}/schools/${id}/achievements`),
      fetchJSON(`${BASE}/schools/${id}/volunteers`),
    ]).then(([schoolData, needsData, achData, mentorData]) => {
      if (!schoolData) { setNotFound(true); setLoading(false); return }
      setSchool(schoolData)
      setNeeds(Array.isArray(needsData) ? needsData : [])
      setAchievements(Array.isArray(achData) ? achData : [])
      setMentors(Array.isArray(mentorData) ? mentorData : [])
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#1A8FD1', borderTopColor: 'transparent' }}></div>
        <p className="text-gray-400 text-sm">Loading school details...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="text-center bg-white rounded-xl border border-gray-100 shadow-sm p-12 max-w-sm">
        <div className="text-5xl font-black text-gray-200 mb-3">404</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">School Not Found</h2>
        <p className="text-gray-400 text-sm mb-5">This school profile doesn't exist or was removed.</p>
        <button onClick={() => navigate(-1)} className="text-sm font-semibold" style={{ color: '#1A8FD1' }}>← Go back</button>
      </div>
    </div>
  )

  const activeNeeds = needs.filter(n => n.status === 'ACTIVE')
  const disabTypes  = (school.disabilityTypes || '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className="text-gray-200 text-xs">|</span>
            <a href="/" className="flex items-center gap-2">
              <div className="flex items-center">
                <div className="w-3 h-5" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
                <div className="w-3 h-5 -ml-0.5" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
              </div>
              <span className="text-xs font-bold text-gray-900">Inclusive Connect</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <a href="/dashboard" className="text-xs font-semibold text-white px-3 py-1.5 rounded transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#1A8FD1' }}>Dashboard</a>
            ) : (
              <>
                <a href="/login" className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">Sign in</a>
                <a href="/register" className="text-xs font-semibold text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#5BBE00' }}>Join</a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Band */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{ backgroundColor: '#1A8FD1' }}>
              {school.logoUrl
                ? <img src={school.logoUrl} alt={school.name} className="w-full h-full rounded-2xl object-cover" />
                : (school.name?.[0] || 'S')
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8F4FC', color: '#1A8FD1' }}>School</span>
                {school.specialSchool && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>
                    Special School for Disabled Students
                  </span>
                )}
                {school.verified && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                )}
                {activeNeeds.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFF3E0', color: '#e65100' }}>
                    {activeNeeds.length} Active Requirement{activeNeeds.length > 1 ? 's' : ''}
                  </span>
                )}
                {achievements.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8F4FC', color: '#1A8FD1' }}>
                    🏆 {achievements.length} Achievement{achievements.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{school.name}</h1>
              <p className="text-sm text-gray-400">
                {[school.city, school.state, school.country].filter(Boolean).join(', ')}
              </p>

              {disabTypes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {disabTypes.map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: '#C62828', color: '#C62828' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 hidden md:block">
              {school?.mentorshipEnabled && (
                <button onClick={() => setTab('mentors')} className="mb-3 inline-block text-sm font-semibold text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#1A8FD1' }}>Mentor Availability</button>
              )}
              {user ? (
                <a href="/dashboard" className="inline-block text-sm font-semibold text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#5BBE00' }}>Support this School</a>
              ) : (
                <a href="/register" className="inline-block text-sm font-semibold text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#5BBE00' }}>Join to Support</a>
              )}
            </div>
          </div>

          {school.websiteUrl && (
            <div className="mt-4 ml-22">
              <a href={school.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold hover:underline" style={{ color: '#1A8FD1' }}>
                🌐 {school.websiteUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-0">
            {[
              { key: 'overview',      label: 'Overview' },
              { key: 'achievements',  label: `Achievements (${achievements.length})` },
              { key: 'requirements',  label: `Requirements (${activeNeeds.length})` },
              ...(school?.mentorshipEnabled ? [{ key: 'mentors',       label: `Mentors (${mentors.length})` }] : []),
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="px-5 py-4 text-sm font-semibold border-b-2 transition-colors"
                style={tab === t.key
                  ? { color: '#1A8FD1', borderBottomColor: '#1A8FD1' }
                  : { color: '#9ca3af', borderBottomColor: 'transparent' }
                }>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main panel */}
          <div className="lg:col-span-2">

            {/* ── Overview Tab ──────────────────────── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* About */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-black text-gray-900 mb-3">About the School</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {school.description || 'No description provided yet.'}
                  </p>
                </div>

                {/* Special School info */}
                {school.specialSchool && (
                  <div className="rounded-xl border-2 p-6" style={{ borderColor: '#FCE4EC', backgroundColor: '#FFF5F5' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#C62828' }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold" style={{ color: '#C62828' }}>Special School for Disabled Students</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">This school is dedicated to providing inclusive education for students with disabilities.</p>
                    {disabTypes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Disability types supported:</p>
                        <div className="flex flex-wrap gap-2">
                          {disabTypes.map(t => (
                            <span key={t} className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Achievements preview */}
                {achievements.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-black text-gray-900">🏆 Achievements</h2>
                      <button onClick={() => setTab('achievements')} className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#1A8FD1' }}>
                        View all →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {achievements.slice(0, 3).map(ach => {
                        const cat = ACH_STYLE[ach.category] || ACH_STYLE.OTHER
                        return (
                          <div key={ach.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: cat.bg, color: cat.text }}>
                              {cat.label}
                            </span>
                            <span className="text-sm text-gray-700 font-medium truncate">{ach.title}</span>
                            {ach.year && <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{ach.year}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Requirements preview */}
                {activeNeeds.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-black text-gray-900">Current Requirements</h2>
                      <button onClick={() => setTab('requirements')} className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#1A8FD1' }}>
                        View all →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {activeNeeds.slice(0, 3).map(need => {
                        const c = CATEGORY_STYLE[need.category] || CATEGORY_STYLE.OTHER
                        return (
                          <div key={need.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: c.bg, color: c.text }}>
                              {c.label}
                            </span>
                            <span className="text-sm text-gray-700 font-medium truncate">{need.title}</span>
                            {need.urgent && <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>URGENT</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Achievements Tab ───────────────────── */}
            {tab === 'achievements' && (
              <div className="space-y-4">
                {achievements.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                    <p className="text-3xl mb-3">🏆</p>
                    <p className="text-gray-400 text-sm">No achievements posted yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map(ach => {
                      const cat = ACH_STYLE[ach.category] || ACH_STYLE.OTHER
                      return (
                        <div key={ach.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                          {ach.imageUrl && (
                            <div className="h-40 overflow-hidden">
                              <img src={ach.imageUrl} alt={ach.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                          )}
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: cat.bg, color: cat.text }}>
                                {cat.label}
                              </span>
                              {ach.year && <span className="text-xs text-gray-400 font-medium">{ach.year}</span>}
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{ach.title}</h3>
                            {ach.description && (
                              <p className="text-xs text-gray-400 leading-relaxed">{ach.description}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Requirements Tab ───────────────────── */}
            {tab === 'requirements' && (
              <div className="space-y-4">
                {activeNeeds.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                    <p className="text-gray-400 text-sm">No active requirements posted yet.</p>
                  </div>
                ) : (
                  activeNeeds.map(need => {
                    const c = CATEGORY_STYLE[need.category] || CATEGORY_STYLE.OTHER
                    const progress = need.targetAmount > 0 ? Math.min(100, Math.round((need.raisedAmount / need.targetAmount) * 100)) : 0
                    return (
                      <div key={need.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: c.bg, color: c.text }}>
                              {c.label}
                            </span>
                            {need.urgent && (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>
                                URGENT
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-2">{need.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">{need.description}</p>

                        {need.targetAmount > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                              <span>₹{Number(need.raisedAmount || 0).toLocaleString('en-IN')} raised</span>
                              <span>₹{Number(need.targetAmount).toLocaleString('en-IN')} goal</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-2 rounded-full transition-all"
                                style={{ width: `${progress}%`, backgroundColor: '#5BBE00' }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{progress}% funded</p>
                          </div>
                        )}

                        <div className="mt-4">
                          {user ? (
                            <a href="/dashboard" className="inline-block text-xs font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#5BBE00' }}>Help Fulfil This →</a>
                          ) : (
                            <a href="/register" className="inline-block text-xs font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#5BBE00' }}>Join to Support →</a>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {tab === 'mentors' && (
              <div className="space-y-4">
                {mentors.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                    <p className="text-3xl mb-3">👩‍🏫</p>
                    <p className="text-gray-400 text-sm">No mentors or volunteer guides have been posted yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentors.map(mentor => (
                      <div key={mentor.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-black text-gray-900">{mentor.volunteerName}</h3>
                            <p className="text-xs font-semibold text-gray-400 mt-1">{mentor.role || 'MENTOR'}</p>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: mentor.status === 'ACTIVE' ? '#EEF8E0' : '#F5F5F5', color: mentor.status === 'ACTIVE' ? '#5BBE00' : '#616161' }}>
                            {mentor.status || 'ACTIVE'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{mentor.bio || 'Volunteer mentor available for guidance and support.'}</p>
                        <div className="space-y-2 text-xs text-gray-600">
                          {mentor.availability && <p><strong>Availability:</strong> {mentor.availability}</p>}
                          {mentor.skills && <p><strong>Skills:</strong> {mentor.skills}</p>}
                          {mentor.volunteerEmail && <p><strong>Email:</strong> <a href={`mailto:${mentor.volunteerEmail}`} className="font-semibold" style={{ color: '#1A8FD1' }}>{mentor.volunteerEmail}</a></p>}
                          {mentor.volunteerPhone && <p><strong>Phone:</strong> <a href={`tel:${mentor.volunteerPhone}`} className="font-semibold" style={{ color: '#1A8FD1' }}>{mentor.volunteerPhone}</a></p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* School Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {school.address && (
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <p className="text-xs text-gray-600 leading-relaxed">{school.address}{school.city ? `, ${school.city}` : ''}{school.state ? `, ${school.state}` : ''}</p>
                  </div>
                )}
                {school.phone && (
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
                    </svg>
                    <p className="text-xs text-gray-600">{school.phone}</p>
                  </div>
                )}
                {school.websiteUrl && (
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
                    </svg>
                    <a href={school.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium hover:underline truncate" style={{ color: '#1A8FD1' }}>
                      {school.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Achievements</span>
                  <span className="text-sm font-black" style={{ color: '#1A8FD1' }}>{achievements.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Active Requirements</span>
                  <span className="text-sm font-black" style={{ color: activeNeeds.some(n => n.urgent) ? '#C62828' : '#1A8FD1' }}>
                    {activeNeeds.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Urgent Needs</span>
                  <span className="text-sm font-black" style={{ color: '#C62828' }}>{activeNeeds.filter(n => n.urgent).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Special School</span>
                  <span className="text-sm font-bold" style={{ color: school.specialSchool ? '#5BBE00' : '#9ca3af' }}>
                    {school.specialSchool ? 'Yes' : 'No'}
                  </span>
                </div>
                {school?.mentorshipEnabled && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Mentors</span>
                    <span className="text-sm font-black" style={{ color: '#1A8FD1' }}>{mentors.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-xl p-5 text-center" style={{ backgroundColor: '#F0F8FF', border: '1px solid #c3dff5' }}>
              <p className="text-xs font-semibold text-gray-600 mb-3 leading-relaxed">
                {user ? 'Help this school by contributing to their needs.' : 'Join the community to support this school.'}
              </p>
              {user ? (
                <a href="/dashboard" className="block text-sm font-semibold text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#5BBE00' }}>Contribute Now</a>
              ) : (
                <a href="/register" className="block text-sm font-semibold text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#5BBE00' }}>Join to Support</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
