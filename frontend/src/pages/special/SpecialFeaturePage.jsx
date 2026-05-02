import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const BASE = 'http://localhost:8081/api'
const G = '#16a34a'
const B = '#1A8FD1'
const NAVY = '#0f172a'
const hdr = { 'Content-Type': 'application/json' }
const authHdr = () => {
  const t = localStorage.getItem('token')
  return t ? { ...hdr, Authorization: `Bearer ${t}` } : hdr
}
const get = url => fetch(url, { headers: authHdr() }).then(r => r.ok ? r.json() : []).catch(() => [])

const normalizeProduct = (product) => ({
  ...product,
  stockQuantity: Number(product?.stockQuantity ?? 0),
  price: Number(product?.price ?? 0),
  source: String(product?.source || 'UNKNOWN').toUpperCase(),
})

/* ── tiny shared styles ── */
const card = { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const chip = (c) => ({ display: 'inline-block', fontSize: 10, fontWeight: 700, color: c, background: c + '18', padding: '2px 9px', borderRadius: 20, letterSpacing: '0.04em' })
const btn = (bg, color = '#fff') => ({ background: bg, color, border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' })
const outBtn = (c) => ({ background: 'none', border: `1px solid ${c}`, color: c, borderRadius: 9, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' })

const countEnrollmentsForCourse = (rows, courseId) => {
  return rows.filter((row) => String(row.courseId) === String(courseId)).length
}

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: `4px solid ${G}25`, borderTopColor: G, animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
      <p style={{ fontSize: 13, margin: 0 }}>Loading...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Empty({ msg = 'Nothing available yet.' }) {
  return <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}><p style={{ fontSize: 14, margin: 0 }}>{msg}</p></div>
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ ...card, marginBottom: 18 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900, color: NAVY }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{sub}</p>
    </div>
  )
}

/* ═══════════════════════════════ NGOs TAB ═══════════════════════════════ */
function NgosTab() {
  const navigate = useNavigate()
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { get(`${BASE}/ngos`).then(d => setNgos(Array.isArray(d) ? d : [])).finally(() => setLoading(false)) }, [])

  const filtered = ngos.filter(n => !search || n.name?.toLowerCase().includes(search.toLowerCase()) || n.city?.toLowerCase().includes(search.toLowerCase()))

  return (
    <section>
      <SectionHeader title="NGOs & Services" sub="Connect with NGOs providing support for specially abled persons." />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search NGOs..." style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 14px', fontSize: 13, marginBottom: 14, outline: 'none' }} />
      {loading ? <Spinner /> : filtered.length === 0 ? <Empty msg="No NGOs found." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filtered.map(n => (
            <div key={n.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{n.name}</h4>
                <span style={chip(n.verified ? G : '#f59e0b')}>{n.verified ? 'Verified' : 'Pending'}</span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b' }}>{[n.city, n.state].filter(Boolean).join(', ') || 'Location not listed'}</p>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{n.description || n.mission || 'Support services for the community.'}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btn(G)} onClick={() => navigate(`/ngos/${n.id}`)}>View NGO</button>
                <button style={outBtn(B)} onClick={() => navigate(`/ngos/${n.id}`)}>Request Help</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ TRAINING TAB ═══════════════════════════ */
function TrainingTab() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [enrollingCourse, setEnrollingCourse] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [enrollMsg, setEnrollMsg] = useState(null)
  const [enrollForm, setEnrollForm] = useState({ name: '', email: '', notes: '' })

  useEffect(() => {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) return
    try {
      const user = JSON.parse(rawUser)
      setEnrollForm((prev) => ({
        ...prev,
        name: user?.name || user?.fullName || '',
        email: user?.email || ''
      }))
    } catch {
      // no-op for invalid user payload
    }
  }, [])

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const schools = await get(`${BASE}/schools`)
        const safeSchools = Array.isArray(schools) ? schools : []
        const [courseGroups, enrollmentGroups] = await Promise.all([
          Promise.all(
            safeSchools.map(async (school) => {
              const rows = await get(`${BASE}/schools/${school.id}/courses`)
              const safeRows = Array.isArray(rows) ? rows : []
              return safeRows.map((course) => ({
                ...course,
                schoolId: school.id,
                schoolName: school.name,
                schoolCity: school.city,
                schoolState: school.state,
              }))
            })
          ),
          Promise.all(
            safeSchools.map(async (school) => {
              const rows = await get(`${BASE}/schools/${school.id}/special-enrollments`)
              return Array.isArray(rows) ? rows : []
            })
          )
        ])

        const allCourses = courseGroups
          .flat()
          .filter((course) => Boolean(course?.courseTitle))
          .sort((a, b) => (b.id || 0) - (a.id || 0))

        setCourses(allCourses)
        setEnrollments(enrollmentGroups.flat())
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const filtered = courses.filter((course) => {
    if (!search) return true
    const q = search.toLowerCase()
    return [course.courseTitle, course.schoolName, course.schoolCity, course.category]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q))
  })

  const alreadyEnrolled = (courseId, email) => {
    if (!email) return false
    return enrollments.some((item) => String(item.courseId) === String(courseId) && item.email?.toLowerCase() === email.toLowerCase())
  }

  const submitEnrollment = async (e) => {
    e.preventDefault()
    if (!enrollingCourse) return

    const email = enrollForm.email.trim()
    const name = enrollForm.name.trim()
    if (!name || !email) {
      setEnrollMsg({ type: 'err', text: 'Name and email are required.' })
      return
    }
    if (alreadyEnrolled(enrollingCourse.id, email)) {
      setEnrollMsg({ type: 'err', text: 'You already enrolled in this course.' })
      return
    }

    try {
      const response = await fetch(`${BASE}/schools/courses/${enrollingCourse.id}/special-enrollments`, {
        method: 'POST',
        headers: authHdr(),
        body: JSON.stringify({
          name,
          email,
          notes: enrollForm.notes.trim()
        })
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody?.message || 'Failed to submit enrollment')
      }

      const savedRow = await response.json()
      const next = [savedRow, ...enrollments]
      setEnrollments(next)
      setCourses((prev) => prev.map((course) => (
        String(course.id) === String(enrollingCourse.id)
          ? { ...course, enrolled: (Number(course.enrolled) || 0) + 1 }
          : course
      )))
      window.dispatchEvent(new CustomEvent('special-training-enrollments-updated'))
      setEnrollMsg({ type: 'ok', text: 'Enrollment submitted successfully.' })
      setTimeout(() => {
        setEnrollingCourse(null)
        setEnrollMsg(null)
        setEnrollForm((prev) => ({ ...prev, notes: '' }))
      }, 1200)
    } catch (error) {
      setEnrollMsg({ type: 'err', text: error.message || 'Failed to submit enrollment.' })
    }
  }

  return (
    <section>
      <SectionHeader title="Schools & Training Programs" sub="Only newly listed courses from school/training center logins are shown here." />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by course or school..." style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 14px', fontSize: 13, marginBottom: 14, outline: 'none' }} />
      {loading ? <Spinner /> : filtered.length === 0 ? <Empty msg="No new courses listed yet by any school or training center." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filtered.map(course => (
            <div key={`${course.schoolId}-${course.id}`} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{course.courseTitle}</h4>
                <span style={chip(B)}>New Course</span>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b' }}><strong style={{ color: NAVY }}>School/Center:</strong> {course.schoolName || 'Unknown'}</p>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b' }}>{[course.schoolCity, course.schoolState].filter(Boolean).join(', ') || 'Location not listed'}</p>
              {course.category && <p style={{ margin: '0 0 6px', fontSize: 11, color: G, fontWeight: 600 }}>{course.category}</p>}
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b' }}><strong style={{ color: NAVY }}>Capacity:</strong> {course.capacity || 'N/A'} | <strong style={{ color: NAVY }}>Enrolled:</strong> {course.enrolled || 0}</p>
              {(course.startDate || course.endDate) && (
                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}><strong style={{ color: NAVY }}>Dates:</strong> {course.startDate || '-'} to {course.endDate || '-'}</p>
              )}
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{course.description || 'Programs for skill development and learning.'}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={alreadyEnrolled(course.id, enrollForm.email) ? btn('#94a3b8') : btn(G)}
                  disabled={alreadyEnrolled(course.id, enrollForm.email)}
                  onClick={() => {
                    setEnrollingCourse(course)
                    setEnrollMsg(null)
                  }}
                >
                  {alreadyEnrolled(course.id, enrollForm.email) ? 'Enrolled' : 'Enroll'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {enrollingCourse && (
        <div onClick={() => setEnrollingCourse(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxWidth: 420, width: '100%', padding: 26, position: 'relative' }}>
            <button onClick={() => setEnrollingCourse(null)} style={{ position: 'absolute', top: 12, right: 14, border: 'none', background: '#f1f5f9', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>x</button>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: G, textTransform: 'uppercase' }}>Course Enrollment</p>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 900, color: NAVY }}>{enrollingCourse.courseTitle}</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>{enrollingCourse.schoolName}</p>
            <form onSubmit={submitEnrollment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['name', 'Your Name', 'text'], ['email', 'Email', 'email']].map(([f, label, type]) => (
                <div key={f}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>{label} *</label>
                  <input
                    required
                    type={type}
                    value={enrollForm[f]}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, [f]: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 14, outline: 'none' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Notes (optional)</label>
                <textarea
                  rows={3}
                  value={enrollForm.notes}
                  onChange={(e) => setEnrollForm((prev) => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 14, outline: 'none', resize: 'vertical' }}
                />
              </div>
              {enrollMsg && <div style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: enrollMsg.type === 'ok' ? '#f0fdf4' : '#fef2f2', color: enrollMsg.type === 'ok' ? G : '#dc2626' }}>{enrollMsg.text}</div>}
              <button type="submit" style={btn(G, '#fff')}>Submit Enrollment</button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ EVENTS TAB ═══════════════════════════════ */
function EventsTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(null)
  const [regMsg, setRegMsg] = useState(null)
  const [regForm, setRegForm] = useState({ notes: '' })
  const [myApplications, setMyApplications] = useState({})

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const publicEvents = await get(`${BASE}/events/public`)
        const safeEvents = Array.isArray(publicEvents) ? publicEvents : []
        
        setEvents(safeEvents)

        // Load user's application status for each event
        const user = localStorage.getItem('user')
        if (user) {
          const apps = {}
          for (const event of safeEvents) {
            try {
              const appStatus = await get(`${BASE}/events/${event.id}/my-application`)
              if (appStatus && appStatus.id) {
                apps[event.id] = appStatus
              }
            } catch {}
          }
          setMyApplications(apps)
        }
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  const handleRegister = async e => {
    e.preventDefault()
    if (!registering) return
    
    setRegMsg(null)
    const authToken = localStorage.getItem('token')
    if (!authToken) {
      setRegMsg({ type: 'err', text: 'Please login to apply for events.' })
      return
    }

    try {
      const r = await fetch(`${BASE}/events/${registering.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(regForm.notes ? { notes: regForm.notes } : {})
      })

      if (r.ok) {
        const appData = await r.json()
        setMyApplications(prev => ({ ...prev, [registering.id]: appData }))
        setRegMsg({ type: 'ok', text: 'Applied successfully!' })
        setTimeout(() => {
          setRegistering(null)
          setRegMsg(null)
          setRegForm({ notes: '' })
        }, 2000)
      } else {
        const errorText = await r.text()
        try {
          const errorJson = JSON.parse(errorText)
          setRegMsg({ type: 'err', text: errorJson.message || 'Application failed.' })
        } catch {
          setRegMsg({ type: 'err', text: errorText || 'Application failed.' })
        }
      }
    } catch {
      setRegMsg({ type: 'err', text: 'Network error.' })
    }
  }

  return (
    <section>
      <SectionHeader title="Upcoming Events" sub="Accessibility meetups, workshops, and awareness events from NGOs and organizations." />
      {loading ? <Spinner /> : events.length === 0 ? <Empty msg="No upcoming events." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {events.map(ev => {
            const myApp = myApplications[ev.id]
            return (
              <div key={ev.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{ev.title}</h4>
                  {ev.eventType && <span style={chip(B)}>{ev.eventType}</span>}
                </div>
                {ev.ngo && <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>By: {ev.ngo.name}</p>}
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b' }}>{ev.location}{ev.city ? ` • ${ev.city}` : ''}</p>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: G }}>{ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                {ev.maxParticipants && <p style={{ margin: '0 0 8px', fontSize: 11, color: '#94a3b8' }}>Capacity: {ev.registeredParticipants || 0}/{ev.maxParticipants}</p>}
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{ev.description || 'Join this event.'}</p>
                {myApp ? (
                  <div style={{ padding: 10, borderRadius: 8, background: '#f0fdf4', border: `1px solid ${G}` }}>
                    <p style={{ margin: 0, fontSize: 12, color: G, fontWeight: 700 }}>
                      Status: <span style={{ textTransform: 'capitalize' }}>{myApp.status || 'PENDING'}</span>
                    </p>
                  </div>
                ) : (
                  <button style={btn(G)} onClick={() => { setRegistering(ev); setRegMsg(null); setRegForm({ notes: '' }) }}>Apply Now</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {registering && (
        <div onClick={() => setRegistering(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxWidth: 420, width: '100%', padding: 26, position: 'relative' }}>
            <button onClick={() => setRegistering(null)} style={{ position: 'absolute', top: 12, right: 14, border: 'none', background: '#f1f5f9', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>x</button>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: G, textTransform: 'uppercase' }}>Apply for Event</p>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 900, color: NAVY }}>{registering.title}</h3>
            {registering.ngo && <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>By: {registering.ngo.name}</p>}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Additional Notes (optional)</label>
                <textarea
                  rows={3}
                  value={regForm.notes}
                  onChange={e => setRegForm(p => ({ ...p, notes: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 14, outline: 'none', resize: 'vertical' }}
                  placeholder="Tell us why you'd like to attend..."
                />
              </div>
              {regMsg && <div style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: regMsg.type === 'ok' ? '#f0fdf4' : '#fef2f2', color: regMsg.type === 'ok' ? G : '#dc2626' }}>{regMsg.text}</div>}
              <button type="submit" style={btn(G, '#fff')}>Submit Application</button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ CAMPAIGNS TAB ══════════════════════════ */
function CampaignsTab() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get(`${BASE}/ngos`).then(async ngos => {
      if (!Array.isArray(ngos)) return []
      const arrays = await Promise.all(ngos.map(n =>
        get(`${BASE}/ngos/${n.id}/campaigns`).then(c => (Array.isArray(c) ? c : []).map(camp => ({ ...camp, _ngoName: n.name, _ngoId: n.id })))
      ))
      setCampaigns(arrays.flat().filter(c => c.status !== 'COMPLETED'))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <SectionHeader title="Active Campaigns" sub="Join NGO-led inclusion and support campaigns." />
      {loading ? <Spinner /> : campaigns.length === 0 ? <Empty msg="No active campaigns right now." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {campaigns.map(c => (
            <div key={c.id} style={{ ...card, borderLeft: `4px solid ${G}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{c.title}</h4>
                <span style={chip(c.status === 'ACTIVE' ? G : '#f59e0b')}>{c.status}</span>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: B, fontWeight: 600 }}>{c._ngoName}</p>
              {(c.startDate || c.endDate) && <p style={{ margin: '0 0 4px', fontSize: 11, color: '#94a3b8' }}>{c.startDate} {c.endDate ? `→ ${c.endDate}` : ''}</p>}
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{c.objective || 'Supporting the community through this campaign.'}</p>
              {c.volunteerTarget && <p style={{ margin: '0 0 10px', fontSize: 12, color: G, fontWeight: 700 }}>Volunteers needed: {c.volunteerTarget}</p>}
              <button style={btn(G)} onClick={() => navigate(`/ngos/${c._ngoId}`)}>View NGO & Join</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ SCHEMES TAB (static info) ══════════════ */
const SCHEMES_INFO = [
  { id: 1, title: 'UDID Card (Unique Disability ID)', body: 'Official disability certificate providing access to govt benefits. Apply at swavlambancard.gov.in', link: 'https://swavlambancard.gov.in' },
  { id: 2, title: 'NHFDC Loan Scheme', body: 'Concessional loans for self-employment of persons with disabilities. Apply via state channelising agencies.', link: 'https://nhfdc.nic.in' },
  { id: 3, title: 'Scholarship for Students with Disabilities', body: 'Post-matric scholarship for students with benchmark disabilities by Ministry of Social Justice.', link: 'https://scholarships.gov.in' },
  { id: 4, title: 'ADIP Scheme (Assistive Devices)', body: 'Free/subsidised assistive devices for persons with disabilities below income threshold. Via ALIMCO.', link: 'https://alimco.in' },
]

function SchemesTab() {
  return (
    <section>
      <SectionHeader title="Govt Schemes & Benefits" sub="Key government schemes for persons with disabilities. Click to learn more." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {SCHEMES_INFO.map(s => (
          <div key={s.id} style={{ ...card, borderLeft: `4px solid ${B}` }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, color: NAVY }}>{s.title}</h4>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{s.body}</p>
            <a href={s.link} target="_blank" rel="noreferrer" style={{ ...btn(B, '#fff'), textDecoration: 'none', display: 'inline-block' }}>Open Official Site</a>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════════════ MARKETPLACE TAB ════════════════════════ */
function MarketplaceTab() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('ALL')
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [availableProducts, startups] = await Promise.all([
          get(`${BASE}/products/all-available`),
          get(`${BASE}/startups`),
        ])

        const merged = new Map()
        const addProduct = (product, sourceDetails, sourceOverride) => {
          if (!product) return
          const normalized = normalizeProduct({
            ...product,
            ...(sourceOverride ? { source: sourceOverride } : {}),
            ...(sourceDetails ? { sourceDetails } : {}),
          })
          const key = `${normalized.source || 'UNKNOWN'}-${normalized.id}`
          if (!merged.has(key)) {
            merged.set(key, normalized)
          }
        }

        const startupList = Array.isArray(startups) ? startups : []
        await Promise.all(startupList.map(async (startup) => {
          try {
            const rows = await get(`${BASE}/products/startup/${startup.id}`)
            const startupProducts = Array.isArray(rows) ? rows : []
            startupProducts.forEach((product) => addProduct(product, { id: startup.id, name: startup.name }, 'STARTUP'))
          } catch (error) {
            console.error(`Failed to load startup products for ${startup.id}`, error)
          }
        }))

        const availableList = Array.isArray(availableProducts) ? availableProducts : []
        availableList.forEach((product) => addProduct(product))

        setProducts([...merged.values()])
      } catch (error) {
        console.error('Failed to load marketplace products', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const cats = useMemo(() => ['ALL', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))], [products])
  const filtered = products.filter((p) => {
    const matchesCategory = cat === 'ALL' || p.category === cat
    if (!matchesCategory) return false

    if (!search) return true
    const q = search.toLowerCase()
    return [p.name, p.description, p.category, p.source, p.sourceDetails?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q))
  })

  return (
    <section>
      <SectionHeader title="Marketplace" sub="Assistive products listed by NGOs and startups." />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ flex: 1, minWidth: 160, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 14px', fontSize: 13, outline: 'none' }} />
        {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ border: 'none', borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: cat === c ? G : '#f1f5f9', color: cat === c ? '#fff' : '#64748b' }}>{c}</button>)}
        <button type="button" onClick={() => navigate('/special/cart')} style={{ border: 'none', borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: NAVY, color: '#fff' }}>Go to Cart</button>
      </div>
      {cartMessage && <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: '#ecfdf5', color: G, fontSize: 13, fontWeight: 600 }}>{cartMessage}</div>}
      {loading ? <Spinner /> : filtered.length === 0 ? <Empty msg={products.length === 0 ? 'No products listed yet.' : 'No products match your search.'} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {filtered.map((p) => {
            const sourceLabel = p.source === 'STARTUP' ? 'Startup' : 'NGO'
            const accent = p.source === 'STARTUP' ? B : G

            return (
              <div key={`${p.source || 'UNKNOWN'}-${p.id}`} style={{ ...card, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: 170, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 42 }}>📦</div>
                  )}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={chip(accent)}>{sourceLabel}</span>
                    {p.category && <span style={{ ...chip('#6366f1'), background: '#eef2ff', color: '#4f46e5' }}>{p.category}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: NAVY }}>{p.name}</h4>
                    <span style={{ fontSize: 14, fontWeight: 900, color: G, whiteSpace: 'nowrap' }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>By: {p.sourceDetails?.name || sourceLabel}</p>
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b', lineHeight: 1.6, flex: 1 }}>{p.description || 'No description.'}</p>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Stock: {p.stockQuantity}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: p.stockQuantity > 0 ? G : '#dc2626' }}>{p.stockQuantity > 0 ? 'Available' : 'Out of stock'}</span>
                  </div>
                  {p.stockQuantity <= 0 ? (
                    <button disabled style={{ ...btn('#94a3b8'), cursor: 'not-allowed' }}>Out of Stock</button>
                  ) : (
                    <button
                      style={btn(G)}
                      onClick={() => {
                        addToCart(p)
                        setCartMessage('Added to cart. Checkout from your cart to place the order.')
                        window.setTimeout(() => setCartMessage(''), 2200)
                      }}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ MAIN COMPONENT ═════════════════════════ */
export default function SpecialFeaturePage({ type }) {
  const components = {
    marketplace: <MarketplaceTab />,
    ngos: <NgosTab />,
    training: <TrainingTab />,
    events: <EventsTab />,
    campaigns: <CampaignsTab />,
    schemes: <SchemesTab />,
  }

  return components[type] || (
    <div style={{ padding: 20, color: '#ef4444', fontSize: 14 }}>Invalid feature route: {type}</div>
  )
}
