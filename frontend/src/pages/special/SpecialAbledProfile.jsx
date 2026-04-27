import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import api from '../../services/api'

const BOOKMARK_KEY = 'special_abled_bookmarks'

const DISABILITY_OPTIONS = [
  'Visual Disability',
  'Hearing Disability',
  'Physical / Motor Disability',
  'Intellectual / Cognitive Disability',
  'Speech / Communication Disability',
  'Multiple Disability',
  'Other / Not Listed',
]

const OPPORTUNITIES = {
  jobs: [
    {
      id: 'job-1',
      title: 'Customer Support Associate',
      org: 'Inclusive Care Services',
      place: 'Remote / Flexible hours',
      summary: 'Text-first support role with assistive tooling and part-time onboarding.',
    },
    {
      id: 'job-2',
      title: 'Data Entry & Admin Assistant',
      org: 'GreenBridge NGO',
      place: 'Hybrid • Delhi NCR',
      summary: 'Structured tasks, screen-reader friendly workflow, and mentor support.',
    },
  ],
  marketplace: [
    {
      id: 'market-1',
      title: 'Affordable Assistive Keyboard',
      org: 'MobilityWorks Startup',
      place: 'Buy now',
      summary: 'Ergonomic keyboard designed for easier typing and low-fatigue use.',
    },
    {
      id: 'market-2',
      title: 'Talking Calculator',
      org: 'AccessTech Startup',
      place: 'Buy now',
      summary: 'Audio feedback calculator for independent learning and daily use.',
    },
  ],
  ngos: [
    {
      id: 'ngo-1',
      title: 'Nearby NGO Services',
      org: 'HopeAbility Foundation',
      place: '2.4 km away',
      summary: 'Mobility support, counselling, and benefits guidance for families.',
    },
    {
      id: 'ngo-2',
      title: 'Assistive Device Help Desk',
      org: 'Unity Support Trust',
      place: '3.1 km away',
      summary: 'Requests for devices, documentation help, and follow-up support.',
    },
  ],
  schools: [
    {
      id: 'school-1',
      title: 'Special School & Training Program',
      org: 'Bright Path School',
      place: 'Vocational training',
      summary: 'Life skills, digital literacy, and job-readiness classes.',
    },
    {
      id: 'school-2',
      title: 'Skill Bridge Training',
      org: 'Learning for All Institute',
      place: 'Certification available',
      summary: 'Short-term accessible learning with mentoring and placement help.',
    },
  ],
  events: [
    {
      id: 'event-1',
      title: 'Accessibility Careers Meetup',
      org: 'Community Network',
      place: 'Next Saturday • Hybrid',
      summary: 'Meet employers who design inclusive hiring pipelines.',
    },
    {
      id: 'event-2',
      title: 'Assistive Tech Demo Day',
      org: 'Innovation Hub',
      place: 'This month • On-site',
      summary: 'Try tools, ask questions, and connect with support partners.',
    },
  ],
  campaigns: [
    {
      id: 'campaign-1',
      title: 'Inclusive Hiring Campaign',
      org: 'BetterWork Alliance',
      place: 'Upcoming campaign',
      summary: 'Recruiters looking specifically for accessible work placements.',
    },
    {
      id: 'campaign-2',
      title: 'Mobility Support Drive',
      org: 'Local NGOs Collective',
      place: 'Donate or volunteer',
      summary: 'Community campaign for wheelchairs, aids, and transport support.',
    },
  ],
  schemes: [
    {
      id: 'scheme-1',
      title: 'Govt Disability Benefit Guide',
      org: 'Central schemes',
      place: 'Documents & eligibility',
      summary: 'Shortlist of benefits, registration steps, and required documents.',
    },
    {
      id: 'scheme-2',
      title: 'Employment Assistance Scheme',
      org: 'Public welfare programs',
      place: 'Support and grants',
      summary: 'Job support, training assistance, and assistive aid information.',
    },
  ],
}

function saveBookmarks(bookmarks) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks))
}

function loadBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function SectionCard({ title, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{action}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function OpportunityCard({ item, bookmarked, onBookmark, onPrimary, primaryLabel, secondaryLabel }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.place}</p>
          <h4 className="mt-1 text-base font-bold text-slate-900">{item.title}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">{item.org}</p>
        </div>
        <button type="button" onClick={onBookmark} className="rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: bookmarked ? '#5BCB2B' : '#cbd5e1', color: bookmarked ? '#5BCB2B' : '#64748b' }}>
          {bookmarked ? 'Saved' : 'Save'}
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onPrimary} className="rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: '#5BCB2B' }}>
          {primaryLabel}
        </button>
        <button type="button" onClick={onBookmark} className="rounded-lg border px-3 py-2 text-xs font-bold" style={{ borderColor: '#5BCB2B', color: '#5BCB2B' }}>
          {secondaryLabel}
        </button>
      </div>
    </article>
  )
}

function CapabilityList({ title, items, tone = 'blue' }) {
  const toneStyles = tone === 'green'
    ? { border: 'border-emerald-200', bg: 'bg-emerald-50', dot: 'bg-emerald-500', heading: 'text-emerald-900' }
    : { border: 'border-sky-200', bg: 'bg-sky-50', dot: 'bg-sky-500', heading: 'text-sky-900' }

  return (
    <section className={`rounded-2xl border ${toneStyles.border} ${toneStyles.bg} p-4`}>
      <h3 className={`text-sm font-extrabold ${toneStyles.heading}`}>{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <span className={`mt-1.5 h-2 w-2 rounded-full ${toneStyles.dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function SpecialAbledProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({ name: '', phone: '', bio: '', disabilityType: '', skills: '', supportNeeds: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [bookmarks, setBookmarks] = useState(loadBookmarks())
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicationText, setApplicationText] = useState('')
  const [applicationAudioName, setApplicationAudioName] = useState('')
  const [ngos, setNgos] = useState([])
  const [submittingHelp, setSubmittingHelp] = useState(false)
  const [helpForm, setHelpForm] = useState({ ngoId: '', requestType: 'GENERAL_SUPPORT', title: '', description: '', preferredCity: '' })

  useEffect(() => {
    const load = async () => {
      if (!user?.userId && !user?.id) return
      try {
        const current = await authService.getProfile(user.userId || user.id)
        setProfile({
          name: current.name || '',
          phone: current.phone || '',
          bio: current.bio || '',
          disabilityType: current.disabilityType || '',
          skills: current.skills || '',
          supportNeeds: current.supportNeeds || '',
        })
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      }
    }

    load()
  }, [user])

  useEffect(() => {
    const loadNgos = async () => {
      try {
        const list = await api.get('/ngos')
        const normalized = Array.isArray(list) ? list : []
        setNgos(normalized)
        if (normalized.length > 0) {
          setHelpForm((current) => ({ ...current, ngoId: current.ngoId || String(normalized[0].id) }))
        }
      } catch {
        setNgos([])
      }
    }
    loadNgos()
  }, [])

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks])

  const toggleBookmark = (id) => {
    setBookmarks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      saveBookmarks(next)
      return next
    })
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const updated = await authService.updateProfile(user.userId || user.id, profile)
      setProfile({
        name: updated.name || '',
        phone: updated.phone || '',
        bio: updated.bio || '',
        disabilityType: updated.disabilityType || '',
        skills: updated.skills || '',
        supportNeeds: updated.supportNeeds || '',
      })
      setMessage('Profile saved. Your opportunities and support needs are now updated.')
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const openJobApplication = (job) => {
    setSelectedJob(job)
    setApplicationText(`Hello, I am interested in the role: ${job.title}. Please consider my profile and accessibility needs.`)
    setApplicationAudioName('')
  }

  const saveApplicationDraft = () => {
    if (!selectedJob) return
    const draft = {
      jobId: selectedJob.id,
      title: selectedJob.title,
      text: applicationText,
      audioFileName: applicationAudioName,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(`special-job-draft-${selectedJob.id}`, JSON.stringify(draft))
    setMessage('Application draft saved. You can copy it into messages or share it with the NGO later.')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const submitHelpRequest = async (event) => {
    event.preventDefault()
    if (!helpForm.ngoId) {
      setError('Please select an NGO before requesting help.')
      return
    }
    setSubmittingHelp(true)
    setError('')
    try {
      await api.post(`/ngos/${helpForm.ngoId}/support-requests`, {
        requesterName: (user?.name || profile.name || '').trim() || 'Community User',
        requesterEmail: (user?.email || '').trim(),
        requesterPhone: (profile.phone || '').trim(),
        requestType: helpForm.requestType,
        title: helpForm.title,
        description: helpForm.description,
        preferredCity: helpForm.preferredCity,
      })
      setHelpForm((current) => ({ ...current, title: '', description: '', preferredCity: '' }))
      setMessage('Help request submitted to the selected NGO.')
    } catch (err) {
      setError(err.message || 'Failed to submit help request')
    } finally {
      setSubmittingHelp(false)
    }
  }

  const statCards = [
    { label: 'Jobs', count: OPPORTUNITIES.jobs.length },
    { label: 'Marketplace', count: OPPORTUNITIES.marketplace.length },
    { label: 'Training', count: OPPORTUNITIES.schools.length },
    { label: 'Schemes', count: OPPORTUNITIES.schemes.length },
  ]

  const canViewItems = [
    'Disability-friendly job listings',
    'Marketplace to buy or sell products',
    'Nearby NGOs and support services',
    'Special schools and training programs',
    'Events and upcoming campaigns',
    'Government schemes and benefits',
  ]

  const canDoItems = [
    'Create profile with skills, needs, and disability type',
    'Apply for jobs using text or audio',
    'Request help from NGOs',
    'Enroll in training programs',
    'Register for events and campaigns',
    'Save and bookmark opportunities',
  ]

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">Specially Abled Person Workspace</p>
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Independence through jobs, learning, and support</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Open Dashboard
            </button>
            <button onClick={handleLogout} className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        <section className="lg:col-span-4 space-y-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 p-6 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">Profile first</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">Create your support-ready profile</h2>
            <p className="mt-3 text-sm text-white/80">Tell the platform about your skills, disability type, and support needs so the right jobs, training, and services surface faster.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {statCards.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-xs font-medium text-white/70">{stat.label}</p>
                  <p className="text-2xl font-black">{stat.count}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Your profile</h3>
              <p className="text-sm text-slate-500">This profile helps tailor your experience and accessibility support.</p>
            </div>

            {message && <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
            {error && <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Name</span>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone</span>
                <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Disability type</span>
                <select value={profile.disabilityType} onChange={(e) => setProfile({ ...profile, disabilityType: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500">
                  <option value="">Select one</option>
                  {DISABILITY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Skills</span>
                <textarea value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="E.g. communication, computer basics, teaching, coding" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Support needs</span>
                <textarea value={profile.supportNeeds} onChange={(e) => setProfile({ ...profile, supportNeeds: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="E.g. transport support, assistive tech, flexible hours" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">About you</span>
                <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Introduce yourself and the kind of opportunities you want." />
              </label>
            </div>

            <button type="submit" disabled={saving} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60">
              {saving ? 'Saving profile...' : 'Save Profile'}
            </button>
          </form>

          <form onSubmit={submitHelpRequest} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900">Request Help</h3>
            <p className="text-sm text-slate-500">Send a direct support request to an NGO.</p>
            <div className="mt-4 space-y-3">
              <select value={helpForm.ngoId} onChange={(e) => setHelpForm({ ...helpForm, ngoId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" required>
                <option value="">Select NGO</option>
                {ngos.map((ngo) => <option key={ngo.id} value={String(ngo.id)}>{ngo.name}</option>)}
              </select>
              <input value={helpForm.title} onChange={(e) => setHelpForm({ ...helpForm, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Help request title" required />
              <textarea value={helpForm.description} onChange={(e) => setHelpForm({ ...helpForm, description: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Describe the help you need" required />
              <input value={helpForm.preferredCity} onChange={(e) => setHelpForm({ ...helpForm, preferredCity: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Preferred city (optional)" />
            </div>
            <button type="submit" disabled={submittingHelp || !user?.email} className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
              {submittingHelp ? 'Submitting...' : 'Submit Help Request'}
            </button>
          </form>
        </section>

        <section className="lg:col-span-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <CapabilityList title="What You Can View" items={canViewItems} tone="blue" />
            <CapabilityList title="What You Can Do" items={canDoItems} tone="green" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'Jobs', desc: 'Apply with text or audio support.' },
              { title: 'Marketplace', desc: 'Buy or sell products and assistive tools.' },
              { title: 'Training', desc: 'Enroll in special schools and programs.' },
              { title: 'Support', desc: 'Request NGO help and govt benefits.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {selectedJob && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Job application</p>
                  <h3 className="text-xl font-black text-slate-900">{selectedJob.title}</h3>
                  <p className="text-sm text-slate-600">{selectedJob.org} • {selectedJob.place}</p>
                </div>
                <button type="button" onClick={() => navigate('/messages')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Open Messages</button>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">Text application</span>
                  <textarea value={applicationText} onChange={(e) => setApplicationText(e.target.value)} rows={5} className="mt-1 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-sm outline-none" />
                </label>
                <div className="space-y-3 rounded-2xl border border-emerald-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Audio note</p>
                  <input type="file" accept="audio/*" onChange={(e) => setApplicationAudioName(e.target.files?.[0]?.name || '')} className="block w-full text-sm" />
                  <p className="text-xs text-slate-500">{applicationAudioName ? `Attached: ${applicationAudioName}` : 'Attach a short audio note for your application.'}</p>
                  <button type="button" onClick={saveApplicationDraft} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Save Draft</button>
                </div>
              </div>
            </div>
          )}

          <SectionCard title="Disability-friendly job listings" action="Apply with text or audio, and bookmark roles you want to revisit.">
            <div className="grid gap-4 md:grid-cols-2">
              {OPPORTUNITIES.jobs.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  bookmarked={bookmarkSet.has(item.id)}
                  onBookmark={() => toggleBookmark(item.id)}
                  onPrimary={() => openJobApplication(item)}
                  primaryLabel="Apply with text"
                  secondaryLabel="Audio / save"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Marketplace - buy or sell products" action="Buy assistive products or list your own products in the marketplace.">
            <div className="grid gap-4 md:grid-cols-2">
              {OPPORTUNITIES.marketplace.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  bookmarked={bookmarkSet.has(item.id)}
                  onBookmark={() => toggleBookmark(item.id)}
                  onPrimary={() => navigate('/marketplace')}
                  primaryLabel="Buy product"
                  secondaryLabel="Sell / save"
                />
              ))}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="rounded-lg border px-3 py-2 text-xs font-bold"
                style={{ borderColor: '#5BCB2B', color: '#5BCB2B' }}
              >
                Sell a product
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Nearby NGOs & services" action="Request support, counselling, or accessibility help near you.">
            <div className="grid gap-4 md:grid-cols-2">
              {OPPORTUNITIES.ngos.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  bookmarked={bookmarkSet.has(item.id)}
                  onBookmark={() => toggleBookmark(item.id)}
                  onPrimary={() => navigate('/search')}
                  primaryLabel="Request NGO help"
                  secondaryLabel="Save NGO"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Special schools & training programs" action="Enroll in courses that build confidence, work skills, and independence.">
            <div className="grid gap-4 md:grid-cols-2">
              {OPPORTUNITIES.schools.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  bookmarked={bookmarkSet.has(item.id)}
                  onBookmark={() => toggleBookmark(item.id)}
                  onPrimary={() => navigate('/search')}
                  primaryLabel="Enroll in training"
                  secondaryLabel="Save program"
                />
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-3">
            <SectionCard title="Events" action="Register for community events and accessibility meetups.">
              <div className="space-y-4">
                {OPPORTUNITIES.events.map((item) => (
                  <OpportunityCard key={item.id} item={item} bookmarked={bookmarkSet.has(item.id)} onBookmark={() => toggleBookmark(item.id)} onPrimary={() => navigate('/search')} primaryLabel="Register" secondaryLabel="Save event" />
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Upcoming campaigns" action="Follow inclusion campaigns and volunteer opportunities.">
              <div className="space-y-4">
                {OPPORTUNITIES.campaigns.map((item) => (
                  <OpportunityCard key={item.id} item={item} bookmarked={bookmarkSet.has(item.id)} onBookmark={() => toggleBookmark(item.id)} onPrimary={() => navigate('/search')} primaryLabel="Join campaign" secondaryLabel="Save campaign" />
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Govt schemes & benefits" action="Track benefits, documents, and support programs.">
              <div className="space-y-4">
                {OPPORTUNITIES.schemes.map((item) => (
                  <OpportunityCard key={item.id} item={item} bookmarked={bookmarkSet.has(item.id)} onBookmark={() => toggleBookmark(item.id)} onPrimary={() => navigate('/search')} primaryLabel="Open guide" secondaryLabel="Save scheme" />
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
            Your saved opportunities are stored locally on this device. Bookmark items as you explore, then return to them from this page.
          </div>
        </section>
      </main>
    </div>
  )
}