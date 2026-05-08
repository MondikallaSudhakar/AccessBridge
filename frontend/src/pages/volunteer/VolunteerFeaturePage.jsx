import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VOLUNTEER_FEATURES } from './volunteerData'
import VolunteerApplicationsPage from './VolunteerApplicationsPage'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const TEAL = '#0d9488'

function extractSourceId(id) {
  if (id == null) return null
  if (typeof id === 'number') return id
  const raw = String(id)
  const parts = raw.split('-')
  const candidate = parts.length > 1 ? parts.slice(1).join('-') : raw
  const numeric = Number(candidate)
  return Number.isNaN(numeric) ? candidate : numeric
}

function uniqueItems(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = `${item.type}-${item.sourceId ?? item.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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
  const [publicNeedItems, setPublicNeedItems] = useState([])
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
        const [needsRes, evtRes, schoolsListRes, storRes, ngoListRes, schoolListRes, recentRes] = await Promise.allSettled([
          api.get('/ngos/volunteer-needs'),
          api.get('/events/public'),
          api.get('/schools/verified'),
          api.get('/achievements'),
          api.get('/ngos'),
          api.get('/schools/verified'),
          api.get('/public/recent'),
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
          type: 'requirements',
          href: n.ngoId ? `/ngos/${n.ngoId}` : null,
          action: 'interest',
        })) : [] : []

        const publicNeeds = recentRes.status === 'fulfilled' ? Array.isArray(recentRes.value) ? recentRes.value
          .filter((item) => item.type === 'requirements' || item.type === 'products')
          .map((item) => ({
            id: item.id,
            sourceId: extractSourceId(item.id),
            title: item.title || 'Community Post',
            org: item.meta || 'Organization',
            place: item.meta || 'Community',
            summary: item.subtitle || item.meta || 'Community post details available.',
            type: item.type,
            href: item.href || null,
            action: item.type === 'products' ? 'link' : 'interest',
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

        // Fetch schools with mentorship enabled and their volunteers
        let schools = []
        if (schoolsListRes.status === 'fulfilled' && Array.isArray(schoolsListRes.value)) {
          const mentorSchools = schoolsListRes.value.filter(s => s.mentorshipEnabled)
          const mentorPromises = mentorSchools.map(school =>
            api.get(`/schools/${school.id}/volunteers`).then(volunteers => ({
              school,
              volunteers: Array.isArray(volunteers) ? volunteers : []
            })).catch(() => ({ school, volunteers: [] }))
          )
          const results = await Promise.all(mentorPromises)
          schools = results.flatMap(({ school, volunteers }) => {
            const mentorCards = volunteers.map((v, i) => ({
              id: `sch-mentor-${school.id}-${i}`,
              sourceId: school.id,
              schoolId: school.id,
              title: `${v.volunteerName || 'Mentor'} - ${v.role || 'Guide'}`,
              org: school.name || 'School',
              place: [school.city, school.state].filter(Boolean).join(', ') || 'School Campus',
              summary: v.skills ? `Skills: ${v.skills}` : (v.bio || 'Mentor available for guidance'),
              availability: v.availability || 'Flexible',
              type: 'SCHOOL_MENTOR',
            }))
            if (mentorCards.length > 0) return mentorCards
            return [{
              id: `sch-mentor-org-${school.id}`,
              sourceId: school.id,
              schoolId: school.id,
              title: `${school.name || 'School'} - Mentorship Available`,
              org: school.name || 'School',
              place: [school.city, school.state].filter(Boolean).join(', ') || 'School Campus',
              summary: school.description || 'This school has enabled mentorship support for volunteers.',
              availability: 'Mentorship enabled',
              type: 'SCHOOL_MENTOR',
            }]
          })
        }

        // Fetch NGOs with mentorship enabled and their volunteer profiles
        let ngoMentors = []
        if (ngoListRes.status === 'fulfilled' && Array.isArray(ngoListRes.value)) {
          const mentorNgos = ngoListRes.value.filter(n => n.mentorshipEnabled)
          const ngoPromises = mentorNgos.map(ngo =>
            api.get(`/ngos/${ngo.id}/volunteers`).then(volunteers => ({
              ngo,
              volunteers: Array.isArray(volunteers) ? volunteers : []
            })).catch(() => ({ ngo, volunteers: [] }))
          )
          const ngoResults = await Promise.all(ngoPromises)
          ngoMentors = ngoResults.flatMap(({ ngo, volunteers }) => {
            const mentorCards = volunteers.map((v, i) => ({
              id: `ngo-mentor-${ngo.id}-${i}`,
              sourceId: ngo.id,
              ngoId: ngo.id,
              title: `${v.fullName || 'Mentor'} - Mentor`,
              org: ngo.name || 'NGO',
              place: [ngo.city, ngo.state].filter(Boolean).join(', ') || 'NGO Office',
              summary: v.skills ? `Skills: ${v.skills}` : (v.note || 'Mentor available for guidance'),
              availability: v.availability || 'Flexible',
              type: 'NGO_MENTOR',
            }))
            if (mentorCards.length > 0) return mentorCards
            return [{
              id: `ngo-mentor-org-${ngo.id}`,
              sourceId: ngo.id,
              ngoId: ngo.id,
              title: `${ngo.name || 'NGO'} - Mentorship Available`,
              org: ngo.name || 'NGO',
              place: [ngo.city, ngo.state].filter(Boolean).join(', ') || 'NGO Office',
              summary: ngo.description || 'This NGO has enabled mentorship support for volunteers.',
              availability: 'Mentorship enabled',
              type: 'NGO_MENTOR',
            }]
          })
        }

        // Combine school and NGO mentors
        const allMentors = [...schools, ...ngoMentors]

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
        setPublicNeedItems(publicNeeds)
        setEvents(evt)
        setSchoolNeeds(allMentors)
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
    'ngo-needs': uniqueItems([...ngoNeeds, ...publicNeedItems]),
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
    if (item.org && (type === 'schools' || item.type === 'SCHOOL_MENTOR' || item.type === 'NGO_MENTOR')) {
      const matchedSchool = verifiedSchools.find((school) => school.name === item.org || school.name === item.schoolName)
      if (matchedSchool?.id && matchedSchool?.mentorshipEnabled) return `/schools/${matchedSchool.id}`
      const matchedNgo = verifiedNgos.find((ngo) => ngo.name === item.org || ngo.name === item.ngoName)
      if (matchedNgo?.id && matchedNgo?.mentorshipEnabled) return `/ngos/${matchedNgo.id}`
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
          const detailsPath = item.type === 'products' ? profilePath : (item.href || profilePath)
          return (
            <Card
              key={item.id}
              item={item}
              applied={applied}
              primaryLabel={type === 'stories' ? 'Read Story' : (item.type === 'products' ? 'Open Product' : 'Interest')}
              detailsLabel={detailsPath ? (item.type === 'products' ? 'View Details' : profilePath ? (profilePath.startsWith('/schools/') ? 'View School Profile' : 'View NGO Profile') : 'View Details') : undefined}
              onDetails={detailsPath ? () => navigate(detailsPath) : undefined}
              onApply={() => {
                if (type === 'stories') {
                  window.open(`/achievements/${item.sourceId}`, '_blank')
                } else if (item.type === 'products' && item.href) {
                  navigate(item.href)
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
