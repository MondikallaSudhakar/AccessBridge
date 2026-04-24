import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'

const STORAGE_KEY = 'guardian_bookmarks'

const OPPORTUNITIES = {
  jobs: [
    { id: 'g-job-1', title: 'Flexible Office Assistant', org: 'CareBridge Services', place: 'Remote / Part-time', summary: 'Suitable jobs for a dependent person with support scheduling.' },
    { id: 'g-job-2', title: 'Supported Retail Associate', org: 'Helping Hands NGO', place: 'Nearby outlet', summary: 'Mentor-backed role for dependents with guided onboarding.' },
  ],
  schools: [
    { id: 'g-school-1', title: 'Special School Admission', org: 'Bright Future School', place: 'Enrollment open', summary: 'Special schools and training programs with accessible transport.' },
    { id: 'g-school-2', title: 'Therapy Center Intake', org: 'Calm Step Therapy', place: 'Assessment required', summary: 'Speech, occupational, and behavioral therapy support.' },
  ],
  ngos: [
    { id: 'g-ngo-1', title: 'Request NGO Support', org: 'Hope Access NGO', place: 'Care services', summary: 'Transportation aid, documentation help, and community care.' },
    { id: 'g-ngo-2', title: 'Support Services Desk', org: 'Unity Support Trust', place: 'Local network', summary: 'Support services for day-to-day dependent care needs.' },
  ],
  learning: [
    { id: 'g-learn-1', title: 'Learning Resource Library', org: 'SkillPath', place: 'Self-paced', summary: 'Structured learning resources for the dependent person.' },
    { id: 'g-learn-2', title: 'Adaptive Learning Program', org: 'Open Access Academy', place: 'Online + local', summary: 'Guided training for school, work, and daily life skills.' },
  ],
  events: [
    { id: 'g-event-1', title: 'Awareness Program', org: 'Community Inclusion Forum', place: 'This month', summary: 'Events and awareness programs for families and caregivers.' },
    { id: 'g-event-2', title: 'Caregiver Support Meetup', org: 'Neighbourhood Alliance', place: 'Weekly meetup', summary: 'Exchange ideas, resources, and care strategies.' },
  ],
  therapy: [
    { id: 'g-therapy-1', title: 'Book Therapy Session', org: 'Hope Therapy Center', place: 'Available slots', summary: 'Book therapy or training for the dependent person.' },
    { id: 'g-therapy-2', title: 'Training Appointment', org: 'SkillCare Studio', place: 'Flexible times', summary: 'Book practical training sessions and follow-up care.' },
  ],
}

function readBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeBookmarks(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function Card({ item, onPrimary, onBookmark, saved, primaryLabel, secondaryLabel }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.place}</p>
          <h4 className="mt-1 text-base font-bold text-slate-900">{item.title}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">{item.org}</p>
        </div>
        <button type="button" onClick={onBookmark} className="rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: saved ? '#5BCB2B' : '#cbd5e1', color: saved ? '#5BCB2B' : '#64748b' }}>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onPrimary} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">{primaryLabel}</button>
        <button type="button" onClick={onBookmark} className="rounded-lg border border-emerald-500 px-3 py-2 text-xs font-bold text-emerald-600">{secondaryLabel}</button>
      </div>
    </article>
  )
}

export default function GuardianProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({ name: '', phone: '', bio: '', dependentName: '', dependentRelation: '', dependentAge: '', dependentNeeds: '' })
  const [bookmarks, setBookmarks] = useState(readBookmarks())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [applicationNote, setApplicationNote] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user?.userId && !user?.id) return
      try {
        const current = await authService.getProfile(user.userId || user.id)
        setProfile({
          name: current.name || '',
          phone: current.phone || '',
          bio: current.bio || '',
          dependentName: current.dependentName || '',
          dependentRelation: current.dependentRelation || '',
          dependentAge: current.dependentAge || '',
          dependentNeeds: current.dependentNeeds || '',
        })
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      }
    }
    load()
  }, [user])

  const savedSet = useMemo(() => new Set(bookmarks), [bookmarks])

  const toggleBookmark = (id) => {
    setBookmarks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      writeBookmarks(next)
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
        dependentName: updated.dependentName || '',
        dependentRelation: updated.dependentRelation || '',
        dependentAge: updated.dependentAge || '',
        dependentNeeds: updated.dependentNeeds || '',
      })
      setMessage('Dependent profile saved.')
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const startApplication = (item) => {
    setSelectedOpportunity(item)
    setApplicationNote(`Please consider this dependent for: ${item.title}. I am applying on behalf of them.`)
  }

  const sections = [
    { title: 'Suitable jobs for dependent person', items: OPPORTUNITIES.jobs, primaryLabel: 'Apply on behalf', secondaryLabel: 'Bookmark job', onPrimary: startApplication },
    { title: 'Special schools & therapy centers', items: OPPORTUNITIES.schools, primaryLabel: 'Enroll', secondaryLabel: 'Save school', onPrimary: () => navigate('/search') },
    { title: 'NGOs & support services', items: OPPORTUNITIES.ngos, primaryLabel: 'Request support', secondaryLabel: 'Save NGO', onPrimary: () => navigate('/search') },
    { title: 'Learning resources', items: OPPORTUNITIES.learning, primaryLabel: 'Open resource', secondaryLabel: 'Save resource', onPrimary: () => navigate('/search') },
    { title: 'Events & awareness programs', items: OPPORTUNITIES.events, primaryLabel: 'Register', secondaryLabel: 'Save event', onPrimary: () => navigate('/search') },
    { title: 'Book therapy / training', items: OPPORTUNITIES.therapy, primaryLabel: 'Book now', secondaryLabel: 'Save booking', onPrimary: () => navigate('/search') },
  ]

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">Guardian / Caregiver Workspace</p>
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Support and manage opportunities for a dependent person</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Open Dashboard</button>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        <aside className="lg:col-span-4 space-y-6">
          <section className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 p-6 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">Caregiver first</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">Dependent profile + opportunity management</h2>
            <p className="mt-3 text-sm text-white/80">Keep the dependent’s information in one place, then manage jobs, schools, therapy, NGOs, and learning opportunities on their behalf.</p>
          </section>

          <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900">Create / manage dependent profile</h3>
            <p className="text-sm text-slate-500">Add the details you need for personalized support.</p>
            {message && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
            {error && <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Your name</span>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dependent name</span>
                <input value={profile.dependentName} onChange={(e) => setProfile({ ...profile, dependentName: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Relationship</span>
                <input value={profile.dependentRelation} onChange={(e) => setProfile({ ...profile, dependentRelation: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Parent, legal guardian, sibling..." />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dependent age</span>
                <input value={profile.dependentAge} onChange={(e) => setProfile({ ...profile, dependentAge: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="e.g. 8, 18, 42" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dependent needs</span>
                <textarea value={profile.dependentNeeds} onChange={(e) => setProfile({ ...profile, dependentNeeds: e.target.value })} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Therapy, training, support services, school needs, job needs..." />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">About your support context</span>
                <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
              </label>
            </div>

            <button type="submit" disabled={saving} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Dependent Profile'}</button>
          </form>

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
            <p className="font-bold text-slate-900">Progress tracking</p>
            <p className="mt-1">Future: track applications, bookings, school enrollments, and therapy follow-ups from one place.</p>
          </div>
        </aside>

        <section className="lg:col-span-8 space-y-6">
          {selectedOpportunity && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Application on behalf</p>
                  <h3 className="text-xl font-black text-slate-900">{selectedOpportunity.title}</h3>
                  <p className="text-sm text-slate-600">{selectedOpportunity.org} • {selectedOpportunity.place}</p>
                </div>
                <button type="button" onClick={() => navigate('/messages')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Open Messages</button>
              </div>
              <textarea value={applicationNote} onChange={(e) => setApplicationNote(e.target.value)} rows={4} className="mt-4 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-sm outline-none" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => toggleBookmark(selectedOpportunity.id)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Save Draft</button>
                <button type="button" onClick={() => setMessage('Draft saved. You can copy this note into the matching application or message thread.') } className="rounded-xl border border-emerald-500 px-4 py-2 text-sm font-bold text-emerald-700">Prepare submission</button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'Jobs', desc: 'Apply on behalf' },
              { title: 'Schools', desc: 'Enroll in schools / training' },
              { title: 'Support', desc: 'Request NGO support' },
              { title: 'Therapy', desc: 'Book therapy / training' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-slate-900">{section.title}</h3>
                <p className="text-xs text-slate-500">{section.title === 'Suitable jobs for dependent person' ? 'Suitable jobs for dependent persons with support-friendly employers.' : section.title}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    saved={savedSet.has(item.id)}
                    onBookmark={() => toggleBookmark(item.id)}
                    onPrimary={() => section.onPrimary(item)}
                    primaryLabel={section.primaryLabel}
                    secondaryLabel={section.secondaryLabel}
                  />
                ))}
              </div>
            </section>
          ))}
        </section>
      </main>
    </div>
  )
}