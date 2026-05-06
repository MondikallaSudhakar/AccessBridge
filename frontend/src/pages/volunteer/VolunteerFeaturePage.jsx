import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VOLUNTEER_FEATURES } from './volunteerData'
import VolunteerApplicationsPage from './VolunteerApplicationsPage'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const TEAL = '#0d9488'

function Card({ item, onApply, applied, config, primaryLabel, onDetails, detailsLabel }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.place || item.type || item.category || 'Opportunity'}</p>
          <h4 className="mt-1 text-base font-bold text-slate-900">{item.title || item.name}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">{item.org || item.organizationName || 'Organization'}</p>
        </div>
        {applied && (
          <span className="rounded-full border border-teal-300 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">Interested</span>
        )}
      </div>
      <p className="mt-3 text-sm text-slate-600">{item.summary || item.description || 'Opportunity details available.'}</p>
      {item.date && (
        <p className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          {new Date(item.date).toLocaleDateString()}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApply}
          disabled={applied}
          className="rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: applied ? '#cbd5e1' : TEAL }}
        >
          {applied ? 'Already Interested' : primaryLabel || 'Show Interest'}
        </button>
        {onDetails && (
          <button
            type="button"
            onClick={onDetails}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-teal-300 hover:text-teal-700"
          >
            {detailsLabel || 'View Profile'}
          </button>
        )}
      </div>
    </article>
  )
}

export default function VolunteerFeaturePage({ type }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Handle applications section separately
  if (type === 'applications') {
    return <VolunteerApplicationsPage />
  }

  const [opportunities, setOpportunities] = useState([])
  const [ngoNeeds, setNgoNeeds] = useState([])
  const [events, setEvents] = useState([])
  const [schoolNeeds, setSchoolNeeds] = useState([])
  const [stories, setStories] = useState([])
  const [verifiedNgos, setVerifiedNgos] = useState([])
  const [verifiedSchools, setVerifiedSchools] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [applyForm, setApplyForm] = useState({ name: '', email: '', availability: '', note: '' })
  const [applyMsg, setApplyMsg] = useState('')
  const [applying, setApplying] = useState(false)

  const config = VOLUNTEER_FEATURES[type]
  const appliedSet = useMemo(() => new Set(applications.map(a => `${a.opportunityType}-${a.sourceId}`)), [applications])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [needsRes, evtRes, schRes, storRes, ngoListRes, schoolListRes] = await Promise.allSettled([
          api.get('/ngos/volunteer-needs'),
          api.get('/events/public'),
          api.get('/schools/needs'),
          api.get('/achievements'),
          api.get('/ngos/verified'),
          api.get('/schools/verified'),
        ])

        const needs = needsRes.status === 'fulfilled' ? Array.isArray(needsRes.value) ? needsRes.value.map((n, i) => ({
          id: `need-${i}`,
          sourceId: n.id,
          ngoId: n.ngoId,
          title: n.title || 'NGO Need',
          org: n.ngoName || 'NGO',
          place: n.ngoCity || 'On-site',
          summary: n.description,
          volunteersNeeded: n.volunteersNeeded,
          type: 'NGO_NEED',
        })) : [] : []

        const opps = needs.map((need) => ({
          ...need,
          id: `opp-${need.sourceId}`,
          type: 'OPPORTUNITY',
        }))

        const evt = evtRes.status === 'fulfilled' ? Array.isArray(evtRes.value) ? evtRes.value.map((e, i) => ({
          id: `evt-${i}`,
          sourceId: e.id,
          title: e.title || 'Event',
          org: e.organizationName || 'Community',
          place: e.location || 'TBD',
          summary: e.description,
          date: e.eventDate,
          type: 'EVENT',
        })) : [] : []

        const schools = schRes.status === 'fulfilled' ? Array.isArray(schRes.value) ? schRes.value.map((s, i) => ({
          id: `sch-${i}`,
          sourceId: s.id,
          title: s.title || 'Mentor Needed',
          org: s.organizationName || s.schoolName || 'School',
          place: s.location || 'School Campus',
          summary: s.description,
          type: 'SCHOOL_MENTOR',
        })) : [] : []

        const stor = storRes.status === 'fulfilled' ? Array.isArray(storRes.value) ? storRes.value.map((st, i) => ({
          id: `story-${i}`,
          sourceId: st.id,
          title: st.title || 'Impact Story',
          org: st.organizationName || st.createdBy || 'Community',
          place: 'Read More',
          summary: st.description || st.achievement,
          type: 'STORY',
        })) : [] : []

        setOpportunities(opps)
        setNgoNeeds(needs)
        setEvents(evt)
        setSchoolNeeds(schools)
        setStories(stor)
        setVerifiedNgos(ngoListRes.status === 'fulfilled' && Array.isArray(ngoListRes.value) ? ngoListRes.value : [])
        setVerifiedSchools(schoolListRes.status === 'fulfilled' && Array.isArray(schoolListRes.value) ? schoolListRes.value : [])

        if (user?.email) {
          const appsRes = await api.get(`/volunteer-applications/email/${encodeURIComponent(user.email)}`)
          setApplications(Array.isArray(appsRes) ? appsRes : [])
        }
      } catch (err) {
        setError(err.message || 'Failed to load opportunities.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.email])

  const currentItems = {
    opportunities,
    'ngo-needs': ngoNeeds,
    events,
    schools: schoolNeeds,
    stories,
  }[type] || []

  const handleApply = async (item) => {
    setSelectedOpportunity(item)
    setApplyForm({
      name: user?.name || '',
      email: user?.email || '',
      availability: '',
      note: ''
    })
    setApplyMsg('')
  }

  const submitApplication = async (event) => {
    event.preventDefault()
    if (!selectedOpportunity?.sourceId) return

    setApplying(true)
    setApplyMsg('')
    try {
      const fullName = applyForm.name?.trim() || user?.name
      const email = applyForm.email?.trim() || user?.email

      if (!fullName || !email) {
        setApplyMsg('Please provide your name and email before submitting.')
        setApplying(false)
        return
      }

      await api.post('/volunteer-applications', {
        fullName,
        email,
        ngoId: selectedOpportunity.ngoId,
        sourceId: selectedOpportunity.sourceId,
        opportunityType: selectedOpportunity.type,
        opportunityTitle: selectedOpportunity.title,
        organizationName: selectedOpportunity.org,
        interestType: 'VOLUNTEER_ROLE',
        preferredCause: selectedOpportunity.org,
        targetOrganization: selectedOpportunity.org,
        availability: applyForm.availability.trim(),
        message: applyForm.note.trim(),
      })

      setApplications((prev) => [...prev, {
        opportunityType: selectedOpportunity.type,
        sourceId: selectedOpportunity.sourceId,
        status: 'PENDING',
      }])

      setApplyMsg('Interest submitted successfully!')
      setTimeout(() => {
        setSelectedOpportunity(null)
        setApplyMsg('')
      }, 1500)
    } catch (err) {
      setApplyMsg(err.message || 'Failed to submit application.')
    } finally {
      setApplying(false)
    }
  }

  if (!config) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Invalid volunteer section.</div>
  }

  const isAlreadyApplied = (item) => appliedSet.has(`${item.type}-${item.sourceId}`)
  const getProfilePath = (item) => {
    if (item.ngoId) {
      const org = verifiedNgos.find(n => n.id === item.ngoId)
      if (org?.mentorshipEnabled) return `/ngos/${item.ngoId}`
      return null
    }
    if (item.schoolId) {
      const org = verifiedSchools.find(s => s.id === item.schoolId)
      if (org?.mentorshipEnabled) return `/schools/${item.schoolId}`
      return null
    }
    if (item.org && (type === 'schools' || item.type === 'SCHOOL_MENTOR')) {
      const matchedSchool = verifiedSchools.find((school) => school.name === item.org || school.name === item.schoolName)
      if (matchedSchool?.id && matchedSchool?.mentorshipEnabled) return `/schools/${matchedSchool.id}`
      return null
    }
    if (item.org && (type === 'ngo-needs' || type === 'opportunities')) {
      const matchedNgo = verifiedNgos.find((ngo) => ngo.name === item.org || ngo.name === item.ngoName)
      if (matchedNgo?.id && matchedNgo?.mentorshipEnabled) return `/ngos/${matchedNgo.id}`
      return null
    }
    return null
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{config.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{config.subtitle}</p>
      {loading && <p className="mt-4 text-sm text-slate-500">Loading opportunities...</p>}
      {!!error && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}
      {!loading && currentItems.length === 0 && !error && (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600">No opportunities available yet for this section.</p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {currentItems.map((item) => {
          const applied = isAlreadyApplied(item)
          const profilePath = getProfilePath(item)
          return (
            <Card
              key={item.id}
              item={item}
              applied={applied}
              primaryLabel={type === 'stories' ? 'Read Story' : 'Interest'}
              detailsLabel={profilePath ? (profilePath.startsWith('/schools/') ? 'View School Profile' : 'View NGO Profile') : undefined}
              onDetails={profilePath ? () => navigate(profilePath) : undefined}
              onApply={() => {
                if (type === 'stories') {
                  window.open(`/achievements/${item.sourceId}`, '_blank')
                } else {
                  handleApply(item)
                }
              }}
              config={config}
            />
          )
        })}
      </div>

      {selectedOpportunity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4" onClick={() => setSelectedOpportunity(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: TEAL }}>Volunteer Interest</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">{selectedOpportunity.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{selectedOpportunity.org}</p>
            <form onSubmit={submitApplication} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600" htmlFor="volunteerName">Name</label>
                <input
                  id="volunteerName"
                  type="text"
                  value={applyForm.name}
                  onChange={(event) => setApplyForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600" htmlFor="volunteerEmail">Email</label>
                <input
                  id="volunteerEmail"
                  type="email"
                  value={applyForm.email}
                  onChange={(event) => setApplyForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600" htmlFor="volunteerAvail">Availability</label>
                <input
                  id="volunteerAvail"
                  type="text"
                  value={applyForm.availability}
                  onChange={(event) => setApplyForm((current) => ({ ...current, availability: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="e.g. Weekends, 10 hours/week"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600" htmlFor="volunteerNote">Interest Note</label>
                <textarea
                  id="volunteerNote"
                  rows={3}
                  value={applyForm.note}
                  onChange={(event) => setApplyForm((current) => ({ ...current, note: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="Any short note about your availability or preferred role."
                />
              </div>
              {!!applyMsg && (
                <p className={`rounded-lg px-3 py-2 text-xs font-semibold ${applyMsg.toLowerCase().includes('success') ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
                  {applyMsg}
                </p>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedOpportunity(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Cancel</button>
                <button type="submit" disabled={applying} className="rounded-lg text-white px-3 py-2 text-xs font-bold disabled:opacity-60" style={{ backgroundColor: TEAL }}>
                  {applying ? 'Submitting...' : 'Submit Interest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
