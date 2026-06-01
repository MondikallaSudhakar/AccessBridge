import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import './VolunteerDashboard.css'
import { openRazorpayCheckout } from '../../utils/razorpay'

const INTEREST_TYPES = [
  { value: 'VOLUNTEER_ROLE', label: 'Volunteer Role' },
  { value: 'MENTORSHIP', label: 'Mentorship' },
  { value: 'TRAINING', label: 'Training Support' },
  { value: 'EVENT_SUPPORT', label: 'Event Support' },
  { value: 'CAMPAIGN_SUPPORT', label: 'Campaign Support' },
]

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const flatten = (groups) => groups.reduce((acc, group) => acc.concat(group), [])

export default function VolunteerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [ngos, setNgos] = useState([])
  const [schools, setSchools] = useState([])
  const [events, setEvents] = useState([])
  const [applications, setApplications] = useState([])
  const [ngoNeeds, setNgoNeeds] = useState([])
  const [ngoCampaigns, setNgoCampaigns] = useState([])
  const [schoolNeeds, setSchoolNeeds] = useState([])
  const [schoolAchievements, setSchoolAchievements] = useState([])
  const [applying, setApplying] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventForm, setEventForm] = useState({ notes: '' })
  const [eventApplying, setEventApplying] = useState(false)
  const [eventMessage, setEventMessage] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: '',
    availability: '',
    interestType: 'VOLUNTEER_ROLE',
    preferredCause: '',
    preferredCity: '',
    targetOrganization: '',
    message: '',
  })

  useEffect(() => {
    if (!user) return

    if (user.role !== 'VOLUNTEER' && user.role !== 'SUPER_ADMIN') {
      navigate('/dashboard')
      return
    }

    let active = true

    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [verifiedNgos, verifiedSchools, publicEvents] = await Promise.all([
          api.get('/ngos/verified'),
          api.get('/schools/verified'),
          api.get('/events/public'),
        ])

        if (!active) return

        const safeNgos = Array.isArray(verifiedNgos) ? verifiedNgos : []
        const safeSchools = Array.isArray(verifiedSchools) ? verifiedSchools : []
        const safeEvents = Array.isArray(publicEvents) ? publicEvents : []

        setNgos(safeNgos)
        setSchools(safeSchools)
        setEvents(safeEvents)

        const [ngoNeedSets, ngoCampaignSets, schoolNeedSets, schoolStorySets, applicationList] = await Promise.all([
          Promise.all(safeNgos.slice(0, 4).map(async (ngo) => {
            try { return await api.get(`/ngos/${ngo.id}/needs`) } catch { return [] }
          })),
          Promise.all(safeNgos.slice(0, 4).map(async (ngo) => {
            try { return await api.get(`/ngos/${ngo.id}/campaigns`) } catch { return [] }
          })),
          Promise.all(safeSchools.slice(0, 4).map(async (school) => {
            try { return await api.get(`/schools/${school.id}/needs`) } catch { return [] }
          })),
          Promise.all(safeSchools.slice(0, 4).map(async (school) => {
            try { return await api.get(`/schools/${school.id}/achievements`) } catch { return [] }
          })),
          user?.email ? api.get(`/volunteer-applications/email/${encodeURIComponent(user.email)}`) : [],
        ])

        if (!active) return

        setNgoNeeds(flatten(ngoNeedSets.map((items, index) => (Array.isArray(items) ? items.map((item) => ({ ...item, ngoName: safeNgos[index]?.name })) : []))))
        setNgoCampaigns(flatten(ngoCampaignSets.map((items, index) => (Array.isArray(items) ? items.map((item) => ({ ...item, ngoName: safeNgos[index]?.name })) : []))))
        setSchoolNeeds(flatten(schoolNeedSets.map((items, index) => (Array.isArray(items) ? items.map((item) => ({ ...item, schoolName: safeSchools[index]?.name })) : []))))
        setSchoolAchievements(flatten(schoolStorySets.map((items, index) => (Array.isArray(items) ? items.map((item) => ({ ...item, schoolName: safeSchools[index]?.name })) : []))))
        setApplications(Array.isArray(applicationList) ? applicationList : [])

        if (safeNgos.length > 0) {
          setFormData((current) => ({
            ...current,
            fullName: current.fullName || user.name || '',
            email: current.email || user.email || '',
            preferredCause: current.preferredCause || safeNgos[0].name || '',
          }))
        }
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load volunteer dashboard')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [navigate, user])

  const opportunityCards = useMemo(() => {
    const ngoCards = ngoNeeds.slice(0, 8).map((need) => ({
      id: `ngo-${need.id}`,
      title: need.title,
      subtitle: need.ngoName || 'NGO Need',
      description: need.description,
      meta: need.category || 'Community support',
      badge: need.urgent ? 'Urgent' : 'Open',
      action: 'Apply as volunteer',
    }))

    const schoolCards = schoolNeeds.slice(0, 8).map((need) => ({
      id: `school-${need.id}`,
      title: need.title,
      subtitle: need.schoolName || 'School Need',
      description: need.description,
      meta: need.category || 'Mentor / support need',
      badge: need.urgent ? 'Urgent' : 'Open',
      action: 'Offer mentorship',
    }))

    return [...ngoCards, ...schoolCards]
  }, [ngoNeeds, schoolNeeds])

  const impactStories = useMemo(() => {
    const schoolStories = schoolAchievements.slice(0, 6).map((story) => ({
      id: `school-story-${story.id}`,
      source: story.schoolName || 'School',
      title: story.title,
      description: story.description,
      type: story.category || 'Impact',
    }))

    const campaignStories = ngoCampaigns.slice(0, 6).map((campaign) => ({
      id: `campaign-story-${campaign.id}`,
      source: campaign.ngoName || 'NGO',
      title: campaign.campaignName,
      description: campaign.campaignDescription,
      type: campaign.status || 'Campaign',
    }))

    return [...schoolStories, ...campaignStories]
  }, [ngoCampaigns, schoolAchievements])

  const eventCards = useMemo(() => {
    return events.slice(0, 8).map((event) => ({
      id: event.id,
      title: event.title,
      date: formatDate(event.eventDate),
      location: [event.location, event.city].filter(Boolean).join(', '),
      type: event.eventType || 'Event',
      description: event.description,
      registrationFee: event.registrationFee || 0,
    }))
  }, [events])

  const campaignCards = useMemo(() => {
    return ngoCampaigns.slice(0, 8).map((campaign) => ({
      id: `campaign-${campaign.id}`,
      title: campaign.campaignName,
      subtitle: campaign.ngoName || 'NGO Campaign',
      description: campaign.campaignDescription,
      status: campaign.status || 'Campaign',
      goal: campaign.volunteerTarget ? `${campaign.volunteerTarget} volunteers needed` : 'Community campaign',
    }))
  }, [ngoCampaigns])

  const openApplyForm = (interestType, targetOrganization = '') => {
    setActiveTab('apply')
    setFormData((current) => ({ ...current, interestType, targetOrganization }))
    setTimeout(() => {
      document.getElementById('volunteer-apply-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const openEventApplication = (event) => {
    setSelectedEvent(event)
    setEventMessage('')
    setEventForm({ notes: '' })
    setTimeout(() => {
      document.getElementById('event-application-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const closeEventApplication = () => {
    setSelectedEvent(null)
    setEventApplying(false)
    setEventMessage('')
    setEventForm({ notes: '' })
  }

  const submitEventApplication = async (e) => {
    e.preventDefault()
    if (!selectedEvent) return

    setEventApplying(true)
    setEventMessage('')
    try {
      const payload = eventForm.notes ? { notes: eventForm.notes } : {}
      const registrationFee = Number(selectedEvent.registrationFee || 0)
      if (registrationFee > 0) {
        await openRazorpayCheckout({
          order: await api.post(`/events/${selectedEvent.id}/registration/order`, {}),
          name: 'Community Event Registration',
          description: selectedEvent.title,
          themeColor: '#0d9488',
          notes: {
            eventId: String(selectedEvent.id),
            eventTitle: selectedEvent.title,
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          onSuccess: async (paymentResponse) => api.post(`/events/${selectedEvent.id}/registration/verify`, {
            ...payload,
            orderId: paymentResponse.razorpay_order_id || paymentResponse.order_id,
            paymentId: paymentResponse.razorpay_payment_id || paymentResponse.payment_id,
            signature: paymentResponse.razorpay_signature || paymentResponse.signature,
          }),
        })
        setEventMessage('Payment completed and event registration submitted.')
      } else {
        await api.post(`/events/${selectedEvent.id}/apply`, payload)
        setEventMessage('Event application submitted successfully.')
      }
      setTimeout(() => {
        closeEventApplication()
        setSuccess(registrationFee > 0 ? 'Payment completed and event registration submitted.' : 'Event application submitted successfully.')
      }, 1400)
    } catch (err) {
      setEventMessage(err.message || 'Failed to submit event application')
    } finally {
      setEventApplying(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApplying(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...formData,
        status: 'PENDING',
      }
      const result = await api.post('/volunteer-applications', payload)
      setApplications((current) => [result, ...current])
      setSuccess('Volunteer application submitted successfully.')
      setFormData((current) => ({
        ...current,
        skills: '',
        availability: '',
        message: '',
        targetOrganization: '',
      }))
      setActiveTab('overview')
    } catch (err) {
      setError(err.message || 'Failed to submit volunteer application')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="volunteer-shell volunteer-loading">Loading volunteer workspace...</div>
  }

  if (loading) {
    return (
      <div className="volunteer-shell volunteer-loading">
        <div style={{ textAlign: 'center', color: '#e5eef7' }}>
          <p>Loading your volunteer workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="volunteer-shell">
      <aside className="volunteer-sidebar">
        <div className="volunteer-brand">
          <div className="volunteer-mark">V</div>
          <div>
            <div className="volunteer-brand-title">Volunteer Hub</div>
            <div className="volunteer-brand-subtitle">Normal Public / Volunteer</div>
          </div>
        </div>

        <nav className="volunteer-nav">
          {[
            ['overview', 'Overview'],
            ['opportunities', 'Opportunities'],
            ['events', 'Events'],
            ['campaigns', 'Campaigns'],
            ['impact', 'Impact Stories'],
            ['apply', 'Apply'],
          ].map(([key, label]) => (
            <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </nav>

        <div className="volunteer-sidebar-actions">
          <button className="primary-link" onClick={() => navigate('/register')}>Register as Volunteer</button>
          <button className="secondary-link" onClick={() => navigate('/marketplace')}>Donate / Support Campaigns</button>
          <button className="logout-link" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="volunteer-main">
        <section className="volunteer-hero">
          <div>
            <p className="eyebrow">Community contribution workspace</p>
            <h1>Give time, skills, and mentoring where they are needed most.</h1>
            <p className="hero-copy">
              Discover NGO needs, volunteer opportunities, events, campaigns, schools needing mentors, and stories of impact.
            </p>
          </div>
          <div className="hero-actions">
            <button onClick={() => openApplyForm('VOLUNTEER_ROLE')}>Apply for volunteering roles</button>
            <button onClick={() => openApplyForm('MENTORSHIP')}>Offer mentorship / training</button>
            <button onClick={() => setActiveTab('events')}>Join events</button>
            <button className="ghost" onClick={() => setActiveTab('campaigns')}>Browse campaigns</button>
          </div>
        </section>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {activeTab === 'overview' && (
          <section className="content-grid">
            <article className="summary-card accent">
              <h2>What you can do</h2>
              <ul>
                <li>Register as a volunteer and keep your skills visible.</li>
                <li>Offer mentorship, tutoring, or training sessions.</li>
                <li>Join events and campaigns that need active support.</li>
                <li>Support future fundraising or community drives.</li>
              </ul>
            </article>
            <article className="summary-card">
              <h2>Quick stats</h2>
              <div className="stat-grid">
                <div><strong>{ngos.length}</strong><span>Verified NGOs</span></div>
                <div><strong>{schools.length}</strong><span>Verified schools</span></div>
                <div><strong>{events.length}</strong><span>Public events</span></div>
                <div><strong>{applications.length}</strong><span>Your applications</span></div>
              </div>
            </article>
          </section>
        )}

        {activeTab === 'opportunities' && (
          <section className="cards-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Volunteer opportunities</p>
                <h2>NGO needs, school mentor requests, and support calls</h2>
              </div>
            </div>
            <div className="cards-grid">
              {opportunityCards.length === 0 ? (
                <div className="empty-state">No public opportunities are available right now.</div>
              ) : opportunityCards.map((card) => (
                <article key={card.id} className="opportunity-card">
                  <div className="card-topline">
                    <span>{card.subtitle}</span>
                    <span className="pill">{card.badge}</span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="meta-line">{card.meta}</div>
                  <button onClick={() => openApplyForm(card.action === 'Offer mentorship' ? 'MENTORSHIP' : 'VOLUNTEER_ROLE', card.subtitle)}>
                    {card.action}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'events' && (
          <section className="cards-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Events & campaigns</p>
                <h2>Join workshops, awareness drives, and community programs</h2>
              </div>
            </div>
            <div className="cards-grid two-up">
              {eventCards.length === 0 ? (
                <div className="empty-state">No public events are scheduled yet.</div>
              ) : eventCards.map((event) => (
                <article key={event.id} className="event-card">
                  <div className="card-topline">
                    <span>{event.type}</span>
                    <span className="pill dark">{event.date}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="meta-line">{event.location}</div>
                  {Number(event.registrationFee || 0) > 0 && (
                    <div className="meta-line">Registration fee: ₹{Number(event.registrationFee).toLocaleString('en-IN')}</div>
                  )}
                  <button onClick={() => openEventApplication(event)}>Apply for event</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'campaigns' && (
          <section className="cards-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Campaigns</p>
                <h2>Support NGO-led awareness and community campaigns</h2>
              </div>
            </div>
            <div className="cards-grid two-up">
              {campaignCards.length === 0 ? (
                <div className="empty-state">No active campaigns right now.</div>
              ) : campaignCards.map((campaign) => (
                <article key={campaign.id} className="event-card">
                  <div className="card-topline">
                    <span>{campaign.subtitle}</span>
                    <span className="pill dark">{campaign.status}</span>
                  </div>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.description}</p>
                  <div className="meta-line">{campaign.goal}</div>
                  <button onClick={() => openApplyForm('CAMPAIGN_SUPPORT', campaign.subtitle)}>Support campaign</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'impact' && (
          <section className="cards-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Impact stories</p>
                <h2>See the change volunteer effort can create</h2>
              </div>
            </div>
            <div className="story-list">
              {impactStories.length === 0 ? (
                <div className="empty-state">Stories will appear once schools and NGOs publish achievements and campaigns.</div>
              ) : impactStories.map((story) => (
                <article key={story.id} className="story-card">
                  <div className="story-source">{story.source} • {story.type}</div>
                  <h3>{story.title}</h3>
                  <p>{story.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'apply' && (
          <section className="apply-panel" id="volunteer-apply-form">
            <div className="section-head">
              <div>
                <p className="eyebrow">Volunteer application</p>
                <h2>Tell us how you want to contribute</h2>
              </div>
            </div>
            <form className="apply-form" onSubmit={handleSubmit}>
              <div className="grid-2">
                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full name" required />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" required />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" />
                <input name="preferredCity" value={formData.preferredCity} onChange={handleChange} placeholder="Preferred city" />
              </div>
              <div className="grid-2">
                <input name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills you can offer" />
                <input name="availability" value={formData.availability} onChange={handleChange} placeholder="Availability (days/times)" />
              </div>
              <div className="grid-2">
                <select name="interestType" value={formData.interestType} onChange={handleChange}>
                  {INTEREST_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
                <input name="preferredCause" value={formData.preferredCause} onChange={handleChange} placeholder="Preferred cause or organization" />
              </div>
              <input name="targetOrganization" value={formData.targetOrganization} onChange={handleChange} placeholder="Target NGO / school / event" />
              <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Share your background, mentoring interests, or support offer" rows="5" />
              <button type="submit" disabled={applying}>{applying ? 'Submitting...' : 'Submit volunteer application'}</button>
            </form>

            {applications.length > 0 && (
              <div className="application-history">
                <h3>Your applications</h3>
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="application-item">
                    <strong>{application.interestType}</strong>
                    <span>{application.status}</span>
                    <p>{application.targetOrganization || application.preferredCause || 'General volunteering'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedEvent && (
          <div className="volunteer-modal-backdrop" onClick={closeEventApplication}>
            <div className="volunteer-modal" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="volunteer-modal-close" onClick={closeEventApplication}>x</button>
              <p className="eyebrow">Apply for Event</p>
              <h2>{selectedEvent.title}</h2>
              <p className="hero-copy">By: {selectedEvent.location || 'Community event'}{selectedEvent.date ? ` • ${selectedEvent.date}` : ''}</p>
              {Number(selectedEvent.registrationFee || 0) > 0 && (
                <p className="hero-copy">Registration fee: ₹{Number(selectedEvent.registrationFee).toLocaleString('en-IN')}</p>
              )}
              <form onSubmit={submitEventApplication} className="volunteer-modal-form">
                <label>
                  <span>Additional Notes (optional)</span>
                  <textarea
                    rows={4}
                    value={eventForm.notes}
                    onChange={(e) => setEventForm((current) => ({ ...current, notes: e.target.value }))}
                    placeholder="Tell us why you'd like to attend..."
                  />
                </label>
                {!!eventMessage && (
                  <div className={`alert ${eventMessage.toLowerCase().includes('failed') || eventMessage.toLowerCase().includes('please login') ? 'error' : 'success'}`}>
                    {eventMessage}
                  </div>
                )}
                <div className="volunteer-modal-actions">
                  <button type="button" className="secondary-link" onClick={closeEventApplication}>Cancel</button>
                  <button type="submit" className="primary-link" disabled={eventApplying}>{eventApplying ? 'Submitting...' : 'Submit Application'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
